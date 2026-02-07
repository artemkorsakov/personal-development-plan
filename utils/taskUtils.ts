import { Vault, TFile, MetadataCache } from 'obsidian';
import { KnowledgeItem, PlannedTask, TaskInProgress, IN_PROGRESS, PLANNED, KNOWLEDGE_BASE } from '../views/tabs-types';
import { PersonalDevelopmentPlanSettings, getMaterialIdByName } from '../settings/settings-types';
import { calculateTaskProgress } from './progressUtils';
import { getFilesInFolder } from './fileUtils';
import { ArticleTask, BookTask, CourseTask, PodcastTask, UserTypeTask, VideoTask, MAX_ORDER } from '../settings/task-types';

type TaskCommonFields = {
    name: string;
    type: string;
    section: string;
    order: number;
    filePath: string;
};

interface FrontmatterData {
    [key: string]: unknown;
    title?: string;
    type?: string;
    section?: string;
    order?: number;
    status?: string;
    startDate?: string;
    dueDate?: string;
    pages?: number;
    durationInMinutes?: number;
    episodes?: number;
    laborInputInHours?: number;
    authors?: string;
    name?: string;
    link?: string;
    author?: string;
    platform?: string;
}

type FileProcessor<T> = {
    filter: (frontmatter: FrontmatterData | undefined) => boolean;
    needsContent: boolean;
    transform: (file: TFile, frontmatter: FrontmatterData | undefined, content?: string) => T;
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
            const frontmatter = metadataCache.getFileCache(file)?.frontmatter as FrontmatterData | undefined;
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

function getCommonFields(file: TFile, frontmatter: FrontmatterData | undefined): TaskCommonFields {
    return {
        name: (frontmatter?.title as string) || file.basename || "???",
        type: (frontmatter?.type as string) || "???",
        section: (frontmatter?.section as string) || "???",
        order: (frontmatter?.order as number) ?? 100,
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
                       status.toLowerCase() === IN_PROGRESS;
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
                       status.toLowerCase() === PLANNED;
            },
            needsContent: false,
            transform: (file, frontmatter) => {
                const commonFields = getCommonFields(file, frontmatter);
                const task: PlannedTask = {
                    ...commonFields,
                    order: typeof frontmatter?.order === 'number' ? frontmatter.order : 0
                };

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

export async function reorderPlannedTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache,
    targetOrder: number
): Promise<void> {
    try {
        const tasks = await getPlannedTasks(vault, settings, metadataCache);
        
        const tasksToUpdate = tasks
            .filter(task => task.order >= targetOrder && task.order < MAX_ORDER)
            .sort((a, b) => b.order - a.order); // сортируем по убыванию чтобы избежать конфликтов

        // Обновляем order для каждой задачи
        for (const task of tasksToUpdate) {
            try {
                const file = vault.getAbstractFileByPath(task.filePath);

                if (!file || !(file instanceof TFile)) {
                    console.warn(`File not found for task: ${task.name}`);
                    continue;
                }

                // Читаем текущий контент файла
                const content = await vault.read(file);
                const lines = content.split('\n');
                
                // Ищем frontmatter для обновления order
                let inFrontmatter = false;
                let foundOrder = false;
                
                const updatedLines = lines.map((line, index) => {
                    // Проверяем начало frontmatter
                    if (index === 0 && line.trim() === '---') {
                        inFrontmatter = true;
                        return line;
                    }
                    
                    // Проверяем конец frontmatter
                    if (inFrontmatter && line.trim() === '---') {
                        inFrontmatter = false;
                        
                        // Если не нашли order в существующем frontmatter, добавляем перед закрытием
                        if (!foundOrder) {
                            return `order: ${task.order + 1}\n${line}`;
                        }
                        return line;
                    }
                    
                    // Находим строку с order в frontmatter
                    if (inFrontmatter && line.startsWith('order:')) {
                        foundOrder = true;
                        // Обновляем значение order на +1
                        return `order: ${task.order + 1}`;
                    }
                    
                    return line;
                });

                // Если frontmatter не был найден, но файл существует, создаем его
                let finalContent = updatedLines.join('\n');
                if (!inFrontmatter && lines[0]?.trim() !== '---') {
                    finalContent = `---\norder: ${task.order + 1}\n---\n${finalContent}`;
                }

                // Записываем обновленный контент обратно в файл
                await vault.modify(file, finalContent);                
            } catch (error) {
                console.error(`Failed to update task ${task.name}:`, error);
                // Продолжаем с другими задачами даже если одна не удалась
            }
        }        
    } catch (error) {
        console.error('Failed to reorder planned tasks:', error);
        throw error;
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
                       status.toLowerCase() === KNOWLEDGE_BASE;
            },
            needsContent: false,
            transform: (file, frontmatter) => {
                const commonFields = getCommonFields(file, frontmatter);
                const item: KnowledgeItem = {
                    ...commonFields,
                    order: typeof frontmatter?.order === 'number' ? frontmatter.order : 0
                };

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
                const frontmatter = metadataCache.getFileCache(file)?.frontmatter as FrontmatterData | undefined;
                if (!frontmatter) return;

                const status = frontmatter?.status;
                if (typeof status !== 'string' || status.toLowerCase() !== KNOWLEDGE_BASE) {
                    return;
                }

                const fileName = file.path.startsWith(settings.folderPath)
                    ? file.path.slice(settings.folderPath.length + 1)
                    : file.path;

                const commonFields = {
                    status: (frontmatter?.status as string) || "???",
                    title: (frontmatter?.title as string) || file.basename || "???",
                    type: (frontmatter?.type as string) || "???",
                    section: (frontmatter?.section as string) || "???",
                    order: (frontmatter?.order as number) ?? 100,
                    startDate: (frontmatter?.startDate as string) || "",
                    dueDate: (frontmatter?.dueDate as string) || "",
                    filePath: fileName,
                };

                const taskId = getMaterialIdByName(settings.materialTypes, commonFields.type);

                switch (taskId) {
                    case 'book': {
                        const bookTask: BookTask = {
                            ...commonFields,
                            authors: (frontmatter?.authors as string) || "???",
                            name: (frontmatter?.name as string) || "???",
                            pages: (frontmatter?.pages as number) ?? 0,
                        };
                        result.books.push(bookTask);
                        break;
                    }
                    case 'article': {
                        const articleTask: ArticleTask = {
                            ...commonFields,
                            link: (frontmatter?.link as string) || "???",
                            durationInMinutes: (frontmatter?.durationInMinutes as number) ?? 0,
                        };
                        result.articles.push(articleTask);
                        break;
                    }
                    case 'video': {
                        const videoTask: VideoTask = {
                            ...commonFields,
                            author: (frontmatter?.author as string) || "???",
                            platform: (frontmatter?.platform as string) || "???",
                            link: (frontmatter?.link as string) || "???",
                            durationInMinutes: (frontmatter?.durationInMinutes as number) ?? 0,
                        };
                        result.videos.push(videoTask);
                        break;
                    }
                    case 'podcast': {
                        const podcastTask: PodcastTask = {
                            ...commonFields,
                            platform: (frontmatter?.platform as string) || "???",
                            link: (frontmatter?.link as string) || "???",
                            episodes: (frontmatter?.episodes as number) ?? 1,
                            durationInMinutes: (frontmatter?.durationInMinutes as number) ?? 0,
                        };
                        result.podcasts.push(podcastTask);
                        break;
                    }
                    case 'course': {
                        const courseTask: CourseTask = {
                            ...commonFields,
                            platform: (frontmatter?.platform as string) || "???",
                            link: (frontmatter?.link as string) || "???",
                            durationInMinutes: (frontmatter?.durationInMinutes as number) ?? 0,
                        };
                        result.courses.push(courseTask);
                        break;
                    }
                    default: {
                        const userTypeTask: UserTypeTask = {
                            ...commonFields,
                            laborInputInHours: (frontmatter?.laborInputInHours as number) ?? 0,
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

async function processFilesWithRetry<T>(
    vault: Vault,
    files: TFile[],
    metadataCache: MetadataCache,
    processor: FileProcessor<T>,
    retries = 3,
    delay = 100
): Promise<T[]> {
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
    return [] as T[];
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
    periodic: "🔄",
    other: "📦"
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
