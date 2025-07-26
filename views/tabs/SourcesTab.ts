import { Vault, Workspace, Notice } from 'obsidian';
import { openOrCreateSourceFile } from '../../utils/fileUtils';
import { getTaskTypeIcon } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { MaterialType, PersonalDevelopmentPlanSettings } from '../../settings/settings-types';

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

        await this.createSourceCards(container, settings, vault);

        return container;
    }

    private static async createSourceCards(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault
    ) {
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

        const icon = card.createSpan({ cls: 'source-icon' });
        icon.textContent = getTaskTypeIcon(type.id);

        const name = card.createSpan({ cls: 'source-name' });
        name.textContent = type.name;

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
        return `# ${t('sources')}: ${type.name} \n\n` +
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
