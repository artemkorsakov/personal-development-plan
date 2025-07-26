import { Vault, TFile, Notice, Workspace } from 'obsidian';
import { BookTask } from '../settings/task-types';
import { PersonalDevelopmentPlanSettings } from '../settings/settings-types';
import { t } from '../localization/localization';

export async function openTaskFile(path: string, vault: Vault, workspace: Workspace): Promise<void> {
    try {
        const file = vault.getAbstractFileByPath(path);

        if (!file) {
            new Notice(`File not found: ${path}`);
            return;
        }

        if (!(file instanceof TFile)) {
            new Notice(`Path is not a file: ${path}`);
            return;
        }

        // Use the provided workspace
        const leaf = workspace.getLeaf();
        await leaf.openFile(file, { active: true });
    } catch (error) {
        console.error('Error opening file:', error);
        new Notice(`Failed to open file: ${path}`);
    }
}

export async function openOrCreateSourceFile(
    filePath: string,
    vault: Vault,
    workspace: Workspace,
    content: string
): Promise<void> {
    try {
        let file = vault.getAbstractFileByPath(filePath) as TFile;

        if (!file) {
            const folderPath = filePath.split('/').slice(0, -1).join('/');
            const fileName = filePath.split('/').pop() || 'Untitled.md';

            // Create folder if it doesn't exist
            if (!vault.getAbstractFileByPath(folderPath)) {
                await vault.createFolder(folderPath).catch(err => {
                    throw new Error(`Failed to create folder: ${err.message}`);
                });
            }

            // Create file with the given content
            file = await vault.create(filePath, content).catch(err => {
                throw new Error(`Failed to create file: ${err.message}`);
            });
        }

        const leaf = workspace.getLeaf();
        await leaf.openFile(file, { active: true });

    } catch (error) {
        console.error('Error in openOrCreateSourceFile:', error);
        new Notice(`Failed to handle source file: ${error.message}`);
        throw error; // Пробрасываем ошибку для обработки выше
    }
}

export async function createTaskFile(
    task: BookTask,
    content: string,
    settings: PersonalDevelopmentPlanSettings,
    vault: Vault
): Promise<TFile> {
    const fileName = `${task.title}.md`;
    const filePath = `${settings.folderPath}/${fileName}`;

    // Деструктуризация с исключением filePath
    const { filePath: _, ...taskWithoutFilePath } = task;

    const frontmatter = `---\n${Object.entries(taskWithoutFilePath)
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
        .join('\n')}\n---\n\n${content}`;

    try {
        const file = await vault.create(filePath, frontmatter);
        new Notice(t('taskCreatedSuccessfully'));
        return file;
    } catch (error) {
        console.error('Error creating task file:', error);
        throw new Error(t('fileCreationError'));
    }
}

export function getFilesInFolder(vault: Vault, folderPath: string): TFile[] {
    return vault.getFiles().filter(file =>
        file.path.startsWith(folderPath + '/') &&
        file.extension === 'md'
    );
}

export function fileExists(vault: Vault, path: string): boolean {
    return vault.getAbstractFileByPath(path) !== null;
}
