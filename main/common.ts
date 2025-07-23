import { Notice, TFile, Vault } from 'obsidian';
import { t } from './localization';
import { MaterialType } from './../settings/settings';

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

export async function openOrCreateSourceFile(filePath: string, vault: Vault, content: string): Promise<void> {
    let file = vault.getAbstractFileByPath(filePath) as TFile;

    if (!file) {
        // Создаем новый файл, если он не существует
        const folderPath = filePath.split('/').slice(0, -1).join('/');
        const fileName = filePath.split('/').pop() || 'Untitled.md';

        // Проверяем и создаем папку, если нужно
        if (!vault.getAbstractFileByPath(folderPath)) {
            await vault.createFolder(folderPath);
        }

        // Создаем файл с базовым содержимым
        file = await vault.create(filePath, content);
    }

    // Открываем файл
    openTaskFile(filePath, vault);
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

export function getMaterialNameById(materialTypes: MaterialType[], id: string): string {
    const foundType = materialTypes.find((type: MaterialType) => type.id === id);
    return foundType?.name || `${t('unknownSection')}: ${id}`;
}

export function createHelpIcon(tabTitle: HTMLElement, tooltip: string) {
     const helpIcon = tabTitle.createEl('span', {
         cls: 'tab-help-icon',
     });

     // Создаем SVG элемент
     const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
     svg.setAttribute('width', '14');
     svg.setAttribute('height', '14');
     svg.setAttribute('viewBox', '0 0 24 24');
     svg.setAttribute('fill', 'none');
     svg.setAttribute('stroke', 'currentColor');

     // Создаем круг
     const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
     circle.setAttribute('cx', '12');
     circle.setAttribute('cy', '12');
     circle.setAttribute('r', '10');
     circle.setAttribute('stroke-width', '1.5');
     svg.appendChild(circle);

    // Создаем путь (знак вопроса)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    // Создаем точку внизу
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', '12');
    dot.setAttribute('cy', '16');
    dot.setAttribute('r', '1');
    dot.setAttribute('fill', 'currentColor');
    svg.appendChild(dot);

    // Добавляем SVG в иконку
    helpIcon.appendChild(svg);
    helpIcon.setAttribute('data-tooltip', tooltip);
}
