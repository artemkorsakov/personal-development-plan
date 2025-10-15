import { Vault, TFile, MetadataCache } from 'obsidian';
import { KnowledgeItem, PlannedTask, TaskInProgress } from '../views/tabs-types';
import { PersonalDevelopmentPlanSettings, getMaterialIdByName } from '../settings/settings-types';
import { calculateTaskProgress } from './progressUtils';
import { getFilesInFolder } from './fileUtils';
import { ArticleTask, BookTask, CourseTask, PodcastTask, UserTypeTask, VideoTask } from '../settings/task-types';

type TaskCommonFields = {
    name: string;
    type: string;
    section: string;
    order: number;
    filePath: string;
};

type FileProcessor<T> = {
    filter: (frontmatter: any) => boolean;
    needsContent: boolean;
    transform: (file: TFile, frontmatter: any, content?: string) => T;
};

async function processFiles<T>(
    vault: Vault,
    files: TFile[],
    metadataCache: MetadataCache,
    processor: FileProcessor<T>
): Promise<T[]> {
    const results: T[] = [];

    await Promise.all(files.map(async (file) => {
        try {
            const frontmatter = metadataCache.getFileCache(file)?.frontmatter;
            if (!frontmatter || !processor.filter(frontmatter)) return;

            const content = processor.needsContent
                ? await vault.cachedRead(file)
                : undefined;

            results.push(processor.transform(file, frontmatter, content));
        } catch (error) {
            console.error(`Error processing file ${file.path}:`, error);
        }
    }));

    return results;
}

function getCommonFields(file: TFile, frontmatter: any): TaskCommonFields {
    return {
        name: frontmatter?.title || file.basename || "???",
        type: frontmatter?.type || "???",
        section: frontmatter?.section || "???",
        order: frontmatter?.order ?? 100,
        filePath: file.path
    };
}

export async function getActiveTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache
): Promise<TaskInProgress[]> {
    try {
        // 1. Пауза для возможного обновления кэша
        await sleep(50);

        // 2. Получаем файлы с повторными попытками
        const files = await getFilesInFolderWithRetry(vault, settings.folderPath);

        // 3. Процессор с улучшенной проверкой данных
        const processor: FileProcessor<TaskInProgress> = {
            filter: (frontmatter) => {
                const status = frontmatter?.status;
                return typeof status === 'string' &&
                       status.toLowerCase() === 'in-progress';
            },
            needsContent: true,
            transform: (file, frontmatter, content) => {
                const commonFields = getCommonFields(file, frontmatter);
                const transformedTask: TaskInProgress = {
                    ...commonFields,
                    startDate: typeof frontmatter?.startDate === 'string' ? frontmatter.startDate : "???",
                    dueDate: typeof frontmatter?.dueDate === 'string' ? frontmatter.dueDate : "???",
                    progress: calculateTaskProgress(content || ''),
                    order: typeof frontmatter?.order === 'number' ? frontmatter.order : 0,
                };

                // Добавляем специфичные поля только если они существуют
                const taskId = getMaterialIdByName(settings.materialTypes, transformedTask.type);

                switch (taskId) {
                    case 'book':
                        if (typeof frontmatter?.pages === 'number') {
                            transformedTask.pages = frontmatter.pages;
                        }
                        break;

                    case 'article':
                    case 'video':
                    case 'course':
                        if (typeof frontmatter?.durationInMinutes === 'number') {
                            transformedTask.durationInMinutes = frontmatter.durationInMinutes;
                        }
                        break;

                    case 'podcast':
                        const duration = typeof frontmatter?.durationInMinutes === 'number' ? frontmatter.durationInMinutes : 0;
                        const episodes = typeof frontmatter?.episodes === 'number' ? frontmatter.episodes : 1;
                        transformedTask.durationInMinutes = duration * episodes;
                        break;

                    default:
                        if (typeof frontmatter?.laborInputInHours === 'number') {
                            transformedTask.laborInputInHours = frontmatter.laborInputInHours;
                        }
                        break;
                }

                return transformedTask;
            }
        };

        // 4. Обработка с повторными попытками
        const tasks = await processFilesWithRetry(vault, files, metadataCache, processor);

        // 5. Сортировка с защитой от отсутствующих order
        return tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error('Failed to get active tasks:', error);
        return []; // Возвращаем пустой массив вместо ошибки
    }
}

export async function getPlannedTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache
): Promise<PlannedTask[]> {
    try {
        await new Promise(resolve => window.setTimeout(resolve, 50));
        const files = await getFilesInFolderWithRetry(vault, settings.folderPath);

        const processor: FileProcessor<PlannedTask> = {
            filter: (frontmatter) => {
                const status = frontmatter?.status;
                return typeof status === 'string' &&
                       status.toLowerCase() === 'planned';
            },
            needsContent: false,
            transform: (file, frontmatter) => {
                const commonFields = getCommonFields(file, frontmatter);
                const task: PlannedTask = {
                    ...commonFields,
                    order: typeof frontmatter?.order === 'number' ? frontmatter.order : 0
                };

                // Добавляем специфичные поля
                const taskId = getMaterialIdByName(settings.materialTypes, task.type);

                switch (taskId) {
                    case 'book':
                        if (typeof frontmatter?.pages === 'number') {
                            task.pages = frontmatter.pages;
                        }
                        break;

                    case 'article':
                    case 'video':
                    case 'course':
                        if (typeof frontmatter?.durationInMinutes === 'number') {
                            task.durationInMinutes = frontmatter.durationInMinutes;
                        }
                        break;

                    case 'podcast':
                        const duration = typeof frontmatter?.durationInMinutes === 'number' ? frontmatter.durationInMinutes : 0;
                        const episodes = typeof frontmatter?.episodes === 'number' ? frontmatter.episodes : 1;
                        task.durationInMinutes = duration * episodes;
                        break;

                    default:
                        if (typeof frontmatter?.laborInputInHours === 'number') {
                            task.laborInputInHours = frontmatter.laborInputInHours;
                        }
                        break;
                }

                return task;
            }
        };

        return await processFilesWithRetry(vault, files, metadataCache, processor);
    } catch (error) {
        console.error('Failed to get planned tasks:', error);
        return [];
    }
}

export async function getKnowledgeItems(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache
): Promise<KnowledgeItem[]> {
    try {
        await new Promise(resolve => window.setTimeout(resolve, 50));
        const files = await getFilesInFolderWithRetry(vault, settings.folderPath);

        const processor: FileProcessor<KnowledgeItem> = {
            filter: (frontmatter) => {
                const status = frontmatter?.status;
                return typeof status === 'string' &&
                       status.toLowerCase() === 'knowledge-base';
            },
            needsContent: false,
            transform: (file, frontmatter) => {
                const commonFields = getCommonFields(file, frontmatter);
                const item: KnowledgeItem = {
                    ...commonFields,
                    order: typeof frontmatter?.order === 'number' ? frontmatter.order : 0
                };

                // Добавляем специфичные поля
                const taskId = getMaterialIdByName(settings.materialTypes, item.type);

                switch (taskId) {
                    case 'book':
                        if (typeof frontmatter?.pages === 'number') {
                            item.pages = frontmatter.pages;
                        }
                        break;

                    case 'article':
                    case 'video':
                    case 'course':
                        if (typeof frontmatter?.durationInMinutes === 'number') {
                            item.durationInMinutes = frontmatter.durationInMinutes;
                        }
                        break;

                    case 'podcast':
                        const duration = typeof frontmatter?.durationInMinutes === 'number' ? frontmatter.durationInMinutes : 0;
                        const episodes = typeof frontmatter?.episodes === 'number' ? frontmatter.episodes : 1;
                        item.durationInMinutes = duration * episodes;
                        break;

                    default:
                        if (typeof frontmatter?.laborInputInHours === 'number') {
                            item.laborInputInHours = frontmatter.laborInputInHours;
                        }
                        break;
                }

                return item;
            }
        };

        return await processFilesWithRetry(vault, files, metadataCache, processor);
    } catch (error) {
        console.error('Failed to get knowledge items:', error);
        return [];
    }
}

export async function getItems(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache
): Promise<{
    articles: ArticleTask[];
    books: BookTask[];
    courses: CourseTask[];
    podcasts: PodcastTask[];
    userTypes: UserTypeTask[];
    videos: VideoTask[];
}> {
    try {
        await new Promise(resolve => window.setTimeout(resolve, 50));
        const files = await getFilesInFolderWithRetry(vault, settings.folderPath);

        const result = {
            articles: [] as ArticleTask[],
            books: [] as BookTask[],
            courses: [] as CourseTask[],
            podcasts: [] as PodcastTask[],
            userTypes: [] as UserTypeTask[],
            videos: [] as VideoTask[],
        };

        await Promise.all(files.map(async (file) => {
            try {
                const frontmatter = metadataCache.getFileCache(file)?.frontmatter;
                if (!frontmatter) return;

                const status = frontmatter?.status;
                if (typeof status !== 'string' || status.toLowerCase() !== 'knowledge-base') {
                    return;
                }

                const fileName = file.path.startsWith(settings.folderPath)
                    ? file.path.slice(settings.folderPath.length + 1)
                    : file.path;

                const commonFields = {
                    status: frontmatter?.status || "???",
                    title: frontmatter?.title || file.basename || "???",
                    type: frontmatter?.type || "???",
                    section: frontmatter?.section || "???",
                    order: frontmatter?.order ?? 100,
                    startDate: frontmatter?.startDate || "",
                    dueDate: frontmatter?.dueDate || "",
                    filePath: fileName,
                };

                const taskId = getMaterialIdByName(settings.materialTypes, commonFields.type);

                switch (taskId) {
                    case 'book': {
                        const bookTask: BookTask = {
                            ...commonFields,
                            authors: frontmatter?.authors || "???",
                            name: frontmatter?.name || "???",
                            pages: frontmatter?.pages ?? 0,
                        };
                        result.books.push(bookTask);
                        break;
                    }
                    case 'article': {
                        const articleTask: ArticleTask = {
                            ...commonFields,
                            link: frontmatter?.link || "???",
                            durationInMinutes: frontmatter?.durationInMinutes ?? 0,
                        };
                        result.articles.push(articleTask);
                        break;
                    }
                    case 'video': {
                        const videoTask: VideoTask = {
                            ...commonFields,
                            author: frontmatter?.author || "???",
                            platform: frontmatter?.platform || "???",
                            link: frontmatter?.link || "???",
                            durationInMinutes: frontmatter?.durationInMinutes ?? 0,
                        };
                        result.videos.push(videoTask);
                        break;
                    }
                    case 'podcast': {
                        const podcastTask: PodcastTask = {
                            ...commonFields,
                            platform: frontmatter?.platform || "???",
                            link: frontmatter?.link || "???",
                            episodes: frontmatter?.episodes ?? 1,
                            durationInMinutes: frontmatter?.durationInMinutes ?? 0,
                        };
                        result.podcasts.push(podcastTask);
                        break;
                    }
                    case 'course': {
                        const courseTask: CourseTask = {
                            ...commonFields,
                            platform: frontmatter?.platform || "???",
                            link: frontmatter?.link || "???",
                            durationInMinutes: frontmatter?.durationInMinutes ?? 0,
                        };
                        result.courses.push(courseTask);
                        break;
                    }
                    default: {
                        const userTypeTask: UserTypeTask = {
                            ...commonFields,
                            laborInputInHours: frontmatter?.laborInputInHours ?? 0,
                        };
                        result.userTypes.push(userTypeTask);
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error processing file ${file.path}:`, error);
            }
        }));

        result.articles.sort((a, b) => a.order - b.order);
        result.books.sort((a, b) => a.order - b.order);
        result.courses.sort((a, b) => a.order - b.order);
        result.podcasts.sort((a, b) => a.order - b.order);
        result.userTypes.sort((a, b) => a.order - b.order);
        result.videos.sort((a, b) => a.order - b.order);

        return result;
    } catch (error) {
        console.error('Failed to get items:', error);
        return {
            articles: [],
            books: [],
            courses: [],
            podcasts: [],
            userTypes: [],
            videos: [],
        };
    }
}

async function getFilesInFolderWithRetry(
    vault: Vault,
    folderPath: string,
    retries = 3,
    delay = 100
): Promise<TFile[]> {
    for (let i = 0; i < retries; i++) {
        try {
            const files = getFilesInFolder(vault, folderPath);
            if (files.length > 0 || i === retries - 1) {
                return files;
            }
            await new Promise(resolve => window.setTimeout(resolve, delay * (i + 1)));
        } catch (error) {
            if (i === retries - 1) throw error;
        }
    }
    return [];
}

async function processFilesWithRetry(
    vault: Vault,
    files: TFile[],
    metadataCache: MetadataCache,
    processor: FileProcessor<any>,
    retries = 3,
    delay = 100
): Promise<any[]> {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await processFiles(vault, files, metadataCache, processor);
            if (result.length > 0 || i === retries - 1) {
                return result;
            }
            await new Promise(resolve => window.setTimeout(resolve, delay * (i + 1)));
        } catch (error) {
            if (i === retries - 1) throw error;
        }
    }
    return [];
}

export function isTaskOverdue(task: TaskInProgress): boolean {
    if (task.dueDate === "???") return false;

    const today = new Date();
    const dueDate = new Date(task.dueDate);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return today > dueDate && !isNaN(dueDate.getTime());
}

const TYPE_ICONS: Record<string, string> = {
	all: "🗂️",
    book: "📚",
    article: "📄",
    course: "🎓",
    video: "▶️",
    podcast: "🎧",
    periodic: "🔄"
};

export function getTaskTypeIcon(type: string): string {
    return TYPE_ICONS[type] || "✏️";
}

export function generateSafeTitle(title: string): string {
    if (!title) return 'untitled';

    // Список запрещенных символов в Windows/Linux/MacOS
    const illegalChars = /[<>:"\/\\|?*\x00-\x1F]/g;

    // Замена пробелов и специальных символов
    return title
        .replace(illegalChars, ' ')  // Заменяем запрещенные символы на пробел
        .replace(/\s+/g, ' ')        // Убираем дублирующиеся пробелы
        .replace(/^\s+|\s+$/g, '')   // Убираем пробелы в начале/конце
        .substring(0, 255);          // Ограничиваем длину
}
