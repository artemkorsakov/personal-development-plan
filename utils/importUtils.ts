import { App, Notice, TFile, Vault } from 'obsidian';
import { PersonalDevelopmentPlanSettings } from '../settings/settings-types';
import { ArticleTask, BookTask, CourseTask, PodcastTask, UserTypeTask, VideoTask } from '../settings/task-types';
import { generateTaskContent, generateEmptyTaskContent } from '../settings/settings-types';
import { generateSafeFilename } from './fileUtils';
import { t } from '../localization/localization';

interface ImportTaskType {
    status?: string;
    type: string;
    section: string;
    title?: string;
    name?: string;
    order?: number;
    startDate?: string;
    dueDate?: string;
    filePath?: string;
    authors?: string;
    author?: string;
    pages?: number;
    link?: string;
    durationInMinutes?: number;
    platform?: string;
    episodes?: number;
    laborInputInHours?: number;
}

interface ImportData {
    articles: ArticleTask[];
    books: BookTask[];
    courses: CourseTask[];
    podcasts: PodcastTask[];
    userTypes: UserTypeTask[];
    videos: VideoTask[];
    exportedAt: string;
}

export async function importFromJSON(
    app: App,
    settings: PersonalDevelopmentPlanSettings,
    file: File
): Promise<number> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const data: ImportData = JSON.parse(content);
                
                if (!data.articles || !data.books || !data.courses || !data.podcasts || !data.userTypes || !data.videos) {
                    throw new Error(t('invalidImportFile'));
                }
                
                let importedCount = 0;
                
                importedCount += await importTasks(app.vault, settings, data.articles, 'article');
                importedCount += await importTasks(app.vault, settings, data.books, 'book');
                importedCount += await importTasks(app.vault, settings, data.courses, 'course');
                importedCount += await importTasks(app.vault, settings, data.podcasts, 'podcast');
                importedCount += await importTasks(app.vault, settings, data.userTypes, 'other');
                importedCount += await importTasks(app.vault, settings, data.videos, 'video');
                
                resolve(importedCount);
                
            } catch (error) {
                console.error('Import error:', error);
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error(t('importReadError')));
        };
        
        reader.readAsText(file);
    });
}

export async function importTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    tasks: ImportTaskType[],
    taskTypeId: string
): Promise<number> {
    let importedCount = 0;
    
    await Promise.all(tasks.map(async (task) => {
        try {
            const safeFilename = generateSafeFilename(task.title || task.name || 'untitled');
            const filePath = `${settings.folderPath}/${safeFilename}.md`;
            const content = createTaskContent(settings, task, taskTypeId);

            const existingFile = vault.getAbstractFileByPath(filePath);
            if (existingFile && existingFile instanceof TFile) {
                new Notice(`${t('errorImportingExample')}: File ${filePath} already exists`);
                return;
            }

            await vault.create(filePath, content);
            importedCount++;
            
        } catch (error) {
            console.error(`Error importing task ${task.title || task.name}:`, error);
        }
    }));
    
    return importedCount;
}

function createTaskContent(
    settings: PersonalDevelopmentPlanSettings,
    task: ImportTaskType,
    taskTypeId: string
): string {
    let frontmatter = `---\n`;
    frontmatter += `status: ${task.status || 'knowledge-base'}\n`;
    frontmatter += `type: ${task.type || 'user'}\n`;
    frontmatter += `section: ${task.section || 'general'}\n`;
    frontmatter += `title: ${task.title || 'Untitled'}\n`;
    frontmatter += `order: ${task.order || 100}\n`;

    if (task.startDate) frontmatter += `startDate: ${task.startDate}\n`;
    if (task.dueDate) frontmatter += `dueDate: ${task.dueDate}\n`;

    if (task.authors && typeof task.authors === 'string') {
        frontmatter += `authors: ${task.authors}\n`;
    }
    if (task.author && typeof task.author === 'string') {
        frontmatter += `author: ${task.author}\n`;
    }
    if (task.name && typeof task.name === 'string') {
        frontmatter += `name: ${task.name}\n`;
    }
    if (task.pages && typeof task.pages === 'number') {
        frontmatter += `pages: ${task.pages}\n`;
    }
    if (task.link && typeof task.link === 'string') {
        frontmatter += `link: ${task.link}\n`;
    }
    if (task.durationInMinutes && typeof task.durationInMinutes === 'number') {
        frontmatter += `durationInMinutes: ${task.durationInMinutes}\n`;
    }
    if (task.platform && typeof task.platform === 'string') {
        frontmatter += `platform: ${task.platform}\n`;
    }
    if (task.episodes && typeof task.episodes === 'number') {
        frontmatter += `episodes: ${task.episodes}\n`;
    }
    if (task.laborInputInHours && typeof task.laborInputInHours === 'number') {
        frontmatter += `laborInputInHours: ${task.laborInputInHours}\n`;
    }

    frontmatter += `---\n\n`;

    const taskType = settings.materialTypes.find(t => t.id === taskTypeId);
    if (taskType) {
        frontmatter += generateTaskContent(taskType);
    } else {
        frontmatter += generateEmptyTaskContent();
    }

    return frontmatter;
}
