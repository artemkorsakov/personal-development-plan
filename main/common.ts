import { Notice, TFile, Vault } from 'obsidian';

export async function openTaskFile(path: string, vault: Vault): Promise<void> {
    try {
        // Получаем файл по пути
        const file = vault.getAbstractFileByPath(path);

        if (!file) {
            new Notice(`File not found: ${path}`);
            return;
        }

        if (!(file instanceof TFile)) {
            new Notice(`The following path is not a file: ${path}`);
            return;
        }

        // Получаем активный лист (вкладку)
        const leaf = this.app.workspace.getLeaf();

        // Открываем файл в новой вкладке
        await leaf.openFile(file, { active: true });

    } catch (error) {
        console.error('Error opening file:', error);
        new Notice(`Failed to open file: ${path}`);
    }
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
