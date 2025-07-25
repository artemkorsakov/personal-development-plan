import { Vault, TFile, Notice, Workspace } from 'obsidian';
import { BookTask, PersonalDevelopmentPlanSettings } from '../types';
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

        // Используем переданный workspace вместо глобального app
        const leaf = workspace.getLeaf();
        await leaf.openFile(file, { active: true });
    } catch (error) {
        console.error('Error opening file:', error);
        new Notice(`Failed to open file: ${path}`);
    }
}

/**
 * Создает или открывает файл источника
 */
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

            // Создаем папку если не существует
            if (!vault.getAbstractFileByPath(folderPath)) {
                await vault.createFolder(folderPath).catch(err => {
                    throw new Error(`Failed to create folder: ${err.message}`);
                });
            }

            // Создаем файл с заданным содержимым
            file = await vault.create(filePath, content).catch(err => {
                throw new Error(`Failed to create file: ${err.message}`);
            });
        }

        // Открываем файл с использованием переданного workspace
        const leaf = workspace.getLeaf();
        await leaf.openFile(file, { active: true });

    } catch (error) {
        console.error('Error in openOrCreateSourceFile:', error);
        new Notice(`Failed to handle source file: ${error.message}`);
        throw error; // Пробрасываем ошибку для обработки выше
    }
}

/**
 * Создает файл задачи на основе шаблона
 */
export async function createTaskFile(
    task: BookTask,
    content: string,
    settings: PersonalDevelopmentPlanSettings,
    vault: Vault
): Promise<TFile> {
    const fileName = `${task.title}.md`;
    const filePath = `${settings.folderPath}/${fileName}`;

    const frontmatter = `---\n${Object.entries(task)
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

/**
 * Получает все markdown файлы из указанной папки
 */
export function getFilesInFolder(vault: Vault, folderPath: string): TFile[] {
    return vault.getFiles().filter(file =>
        file.path.startsWith(folderPath + '/') &&
        file.extension === 'md'
    );
}

/**
 * Проверяет существует ли файл
 */
export function fileExists(vault: Vault, path: string): boolean {
    return vault.getAbstractFileByPath(path) !== null;
}

/**
 * Читает содержимое файла с обработкой ошибок
 */
export async function safeReadFile(vault: Vault, file: TFile): Promise<string> {
    try {
        return await vault.cachedRead(file);
    } catch (error) {
        console.error(`Error reading file ${file.path}:`, error);
        throw new Error(t('fileReadError'));
    }
}

/**
 * Создает стандартные файлы источников если они отсутствуют
 */
export async function initializeSourceFiles(
    settings: PersonalDevelopmentPlanSettings,
    vault: Vault
): Promise<void> {
    const sourcesFolder = `${settings.folderPath}/Sources`;
    if (!fileExists(vault, sourcesFolder)) {
        await vault.createFolder(sourcesFolder);
    }

    const sourceItems = settings.materialTypes
        .filter(material => material.enabled)
        .map(material => ({
            filePath: `${sourcesFolder}/${material.id}.md`,
            content: `# ${material.name} ${t('sources')}\n\n${t('sourcesDefaultContent')}`
        }));

    for (const { filePath, content } of sourceItems) {
        if (!fileExists(vault, filePath)) {
            await vault.create(filePath, content);
        }
    }
}
