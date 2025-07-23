import { t } from './localization';
import { openTaskFile, openOrCreateSourceFile, getTaskTypeIcon } from './common';
import { PersonalDevelopmentPlanSettings } from './../settings/settings';
import { App, TFile, Vault } from 'obsidian';

interface SourceItem {
    type: string;
    name: string;
    icon: string;
    filePath: string;
}

export async function getSourcesElement(settings: PersonalDevelopmentPlanSettings): Promise<HTMLElement> {
    // Создаем контейнер для всех источников
    const container = document.createElement('div');
    container.className = 'sources-container';

    // Создаем стандартные источники
    const sourceItems: SourceItem[] = settings.materialTypes
        .filter(material => material.enabled)
        .sort((a, b) => a.order - b.order)
        .map(material => ({
            type: material.id,
            name: material.name,
            icon: getTaskTypeIcon(material.id),
            filePath: `${settings.folderPath}/Sources/${material.id}.md`
        }));

    // Создание карточек источников
    sourceItems.forEach(source => {
        const sourceCard = document.createElement('div');
        sourceCard.className = 'source-card';

        const content = `# ${t('sourceItemsList')} "${source.name}"\n\n${t('sourceItemsExample')}`;

        sourceCard.addEventListener('click', async () => {
            await openOrCreateSourceFile(source.filePath, this.app.vault, content);
        });

        // Иконка источника
        const iconSpan = document.createElement('span');
        iconSpan.className = 'source-icon';
        iconSpan.textContent = source.icon;
        sourceCard.appendChild(iconSpan);

        // Название источника
        const nameSpan = document.createElement('span');
        nameSpan.className = 'source-name';
        nameSpan.textContent = source.name;
        sourceCard.appendChild(nameSpan);

        // Добавляем карточку в контейнер
        container.appendChild(sourceCard);
    });

    return container;
}


