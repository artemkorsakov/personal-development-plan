import { Vault, Workspace, Notice } from 'obsidian';
import { openOrCreateSourceFile } from '../../utils/fileUtils';
import { getTaskTypeIcon } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { MaterialType, PersonalDevelopmentPlanSettings } from '../../types';

export default class SourcesTab {
    private static appWorkspace: Workspace;

    static async create(
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        workspace: Workspace
    ): Promise<HTMLElement> {
        this.appWorkspace = workspace;
        const container = document.createElement('div');
        container.className = 'sources-container';

        // Создаем карточки для каждого типа материала
        await this.createSourceCards(container, settings, vault);

        return container;
    }

    private static async createSourceCards(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault
    ) {
        // Фильтруем только включенные типы материалов
        const enabledTypes = settings.materialTypes
            .filter(type => type.enabled)
            .sort((a, b) => a.order - b.order);

        for (const type of enabledTypes) {
            const sourceCard = this.createSourceCard(type, settings.folderPath);
            sourceCard.addEventListener('click', async () => {
                await this.handleSourceClick(type, settings.folderPath, vault);
            });
            container.appendChild(sourceCard);
        }
    }

    private static createSourceCard(type: MaterialType, folderPath: string): HTMLElement {
        const card = document.createElement('div');
        card.className = 'source-card';

        // Иконка типа
        const icon = card.createSpan({ cls: 'source-icon' });
        icon.textContent = getTaskTypeIcon(type.id);

        // Название типа
        const name = card.createSpan({ cls: 'source-name' });
        name.textContent = type.name;

        // Путь к файлу (скрытый атрибут)
        card.dataset.filePath = `${folderPath}/Sources/${type.id}.md`;

        return card;
    }

    private static async handleSourceClick(
        type: MaterialType,
        folderPath: string,
        vault: Vault
    ) {
        const filePath = `${folderPath}/Sources/${type.id}.md`;
        const content = this.generateSourceContent(type);

        try {
            await openOrCreateSourceFile(
                filePath,
                vault,
                this.appWorkspace,
                content
            );
        } catch (err) {
            console.error("Failed to handle source:", err);
            new Notice(`${t('openSourceError')}: ${err.message}`);
        }
    }

    private static generateSourceContent(type: MaterialType): string {
        return `# ${type.name} ${t('sources')}\n\n` +
               `${t('sourcesDefaultContent')}\n\n` +
               `## ${t('recommendedResources')}\n\n` +
               `- [ ] ${t('findAndAddResources')}\n\n` +
               `## ${t('personalNotes')}\n\n` +
               `- [ ] ${t('addYourThoughts')}`;
    }

    static async refresh(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        workspace: Workspace
    ) {
        this.appWorkspace = workspace;
        container.empty();
        await this.createSourceCards(container, settings, vault);
    }
}
