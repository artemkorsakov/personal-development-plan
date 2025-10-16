import { Vault, TFile, Notice, Workspace } from 'obsidian';
import { PersonalDevelopmentPlanSettings } from '../settings/settings-types';
import { TaskType } from '../settings/task-types';
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
        const abstractFile = vault.getAbstractFileByPath(filePath);

        if (abstractFile) {
            if (!(abstractFile instanceof TFile)) {
                throw new Error(`Path exists but is not a file: ${filePath}`);
            }

            const leaf = workspace.getLeaf();
            await leaf.openFile(abstractFile, { active: true });
            return;
        }

        const folderPath = filePath.split('/').slice(0, -1).join('/');
        const fileName = filePath.split('/').pop() || 'Untitled.md';

        if (folderPath && !vault.getAbstractFileByPath(folderPath)) {
            await vault.createFolder(folderPath).catch(err => {
                throw new Error(`Failed to create folder "${folderPath}": ${err.message}`);
            });
        }

        const newFile = await vault.create(filePath, content).catch(err => {
            throw new Error(`Failed to create file "${filePath}": ${err.message}`);
        });

        const leaf = workspace.getLeaf();
        await leaf.openFile(newFile, { active: true });

    } catch (error) {
        console.error('Error in openOrCreateSourceFile:', error);
        new Notice(`Failed to handle source file: ${error.message}`);
        throw error;
    }
}

export async function createTaskFile(
    task: TaskType,
    content: string,
    settings: PersonalDevelopmentPlanSettings,
    vault: Vault
): Promise<TFile> {
    const filePath = task.filePath;

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

/**
 * Генерирует безопасное имя файла, заменяя или удаляя запрещенные символы
 * @param title Исходное название задачи
 * @returns Безопасное имя файла
 */
export function generateSafeFilename(title: string): string {
    if (!title) return 'untitled';

    // Список запрещенных символов в Windows/Linux/MacOS
    const illegalChars = /[<>:"\/\\|?*\x00-\x1F]/g;

    // Замена пробелов и специальных символов
    return title
        .replace(illegalChars, '_')  // Заменяем запрещенные символы на подчеркивание
        .replace(/\s+/g, '_')        // Заменяем пробелы на подчеркивание
        .replace(/_+/g, '_')         // Убираем дублирующиеся подчеркивания
        .replace(/^_+|_+$/g, '')     // Убираем подчеркивания в начале/конце
        .substring(0, 255);          // Ограничиваем длину (макс. для большинства файловых систем)
}
