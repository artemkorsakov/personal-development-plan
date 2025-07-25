import { Vault, TFile } from 'obsidian';
import { PersonalDevelopmentPlanSettings } from '../types';
import { calculateTaskProgress } from './progressUtils';

export interface TaskInProgress {
    name: string;
    type: string;
    section: string;
    order: number;
    startDate: string;
    dueDate: string;
    progress: number;
    filePath: string;
}

export async function getActiveTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: any
): Promise<TaskInProgress[]> {
    const activeTasks: TaskInProgress[] = [];
    const files = vault.getFiles().filter(file =>
        file.path.startsWith(settings.folderPath + '/') &&
        file.extension === 'md'
    );

    for (const file of files) {
        try {
            const content = await vault.cachedRead(file);
            const frontmatter = metadataCache.getFileCache(file)?.frontmatter;

            if (frontmatter?.status !== 'in-progress') continue;

            activeTasks.push({
                name: frontmatter?.title || file.basename || "???",
                type: frontmatter?.type || "???",
                section: frontmatter?.section || "???",
                order: frontmatter?.order ?? 100,
                startDate: frontmatter?.startDate || "???",
                dueDate: frontmatter?.dueDate || "???",
                progress: calculateTaskProgress(content),
                filePath: file.path
            });
        } catch (error) {
            console.error(`Error reading file ${file.path}:`, error);
        }
    }

    return activeTasks.sort((a, b) => a.order - b.order);
}

export function isTaskOverdue(task: TaskInProgress): boolean {
    if (task.dueDate === "???") return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today > dueDate && !isNaN(dueDate.getTime());
}

export function getTaskTypeIcon(type: string): string {
    const icons: Record<string, string> = {
        "book": "📚",
        "article": "📄",
        "course": "🎓",
        "video": "▶️",
        "podcast": "🎧"
    };
    return icons[type] || "✏️";
}
