import { Vault, TFile, MetadataCache } from 'obsidian';
import { KnowledgeItem, PersonalDevelopmentPlanSettings, PlannedTask, TaskInProgress } from '../types';
import { calculateTaskProgress } from './progressUtils';
import { getFilesInFolder } from './fileUtils';

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
    const files = getFilesInFolder(vault, settings.folderPath);
    const processor: FileProcessor<TaskInProgress> = {
        filter: (frontmatter) => frontmatter?.status === 'in-progress',
        needsContent: true,
        transform: (file, frontmatter, content) => ({
            ...getCommonFields(file, frontmatter),
            startDate: frontmatter?.startDate || "???",
            dueDate: frontmatter?.dueDate || "???",
            progress: calculateTaskProgress(content || ''),
        })
    };

    const tasks = await processFiles(vault, files, metadataCache, processor);
    return tasks.sort((a, b) => a.order - b.order);
}

export async function getPlannedTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache
): Promise<PlannedTask[]> {
    const files = getFilesInFolder(vault, settings.folderPath);
    const processor: FileProcessor<PlannedTask> = {
        filter: (frontmatter) => frontmatter?.status === 'planned',
        needsContent: false,
        transform: (file, frontmatter) => getCommonFields(file, frontmatter)
    };

    return processFiles(vault, files, metadataCache, processor);
}

export async function getKnowledgeItems(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: MetadataCache
): Promise<KnowledgeItem[]> {
    const files = getFilesInFolder(vault, settings.folderPath);
    const processor: FileProcessor<KnowledgeItem> = {
        filter: (frontmatter) => frontmatter?.status === 'knowledge-base',
        needsContent: false,
        transform: (file, frontmatter) => ({
            ...getCommonFields(file, frontmatter),
            order: frontmatter?.order ?? 0
        })
    };

    return processFiles(vault, files, metadataCache, processor);
}

export function isTaskOverdue(task: TaskInProgress): boolean {
    if (task.dueDate === "???") return false;

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today > dueDate && !isNaN(dueDate.getTime());
}

const TYPE_ICONS: Record<string, string> = {
    book: "📚",
    article: "📄",
    course: "🎓",
    video: "▶️",
    podcast: "🎧"
};

export function getTaskTypeIcon(type: string): string {
    return TYPE_ICONS[type] || "✏️";
}
