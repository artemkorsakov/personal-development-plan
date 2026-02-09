import { App, Notice, Vault, TFile } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { EXAMPLE_PLANS } from '../../examples/examplePlans';
import { importTasks } from '../../utils/importUtils';

export default class ExamplesTab {
    private static app: App;
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;

    static async create(
        app: App,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault
    ): Promise<HTMLElement> {
        this.app = app;
        this.settings = settings;
        this.vault = vault;

        const mainContainer = createDiv();
        mainContainer.addClass('knowledge-base-container');

        const content = mainContainer.createDiv({ cls: 'knowledge-content-container' });

        if (EXAMPLE_PLANS.length === 0) {
            const emptyMsg = content.createDiv({ cls: 'knowledge-empty-msg' });
            emptyMsg.textContent = t('noExamplePlansAvailable');
            return mainContainer;
        }

        const table = content.createEl('table', { cls: 'knowledge-items-table' });
        const headerRow = table.createEl('tr');
        headerRow.createEl('th', { text: t('planName') });
        headerRow.createEl('th', { text: t('description') });
        headerRow.createEl('th', { text: t('actions') });

        EXAMPLE_PLANS.forEach(example => {
            const row = table.createEl('tr');
            row.className = 'knowledge-item-row';

            const nameCell = row.createEl('td');
            nameCell.createEl('strong', { text: example.name });

            const descCell = row.createEl('td');
            descCell.textContent = example.description;

            const actionsCell = row.createEl('td');
            actionsCell.className = 'knowledge-item-actions';

            const importBtn = actionsCell.createEl('button', {
                cls: 'knowledge-action-btn plan-btn',
                text: t('import')
            });
            importBtn.addEventListener('click', () => this.importExamplePlan(example));
        });

        return mainContainer;
    }

    private static async importExamplePlan(example: typeof EXAMPLE_PLANS[0]) {
        try {
            const data = JSON.parse(example.data);

            const allTasks = [
                ...(data.articles || []),
                ...(data.books || []),
                ...(data.courses || []),
                ...(data.podcasts || []),
                ...(data.userTypes || []),
                ...(data.videos || [])
            ];

            await Promise.all([
                importTasks(this.vault, this.settings, data.articles || [], 'article'),
                importTasks(this.vault, this.settings, data.books || [], 'book'),
                importTasks(this.vault, this.settings, data.courses || [], 'course'),
                importTasks(this.vault, this.settings, data.podcasts || [], 'podcast'),
                importTasks(this.vault, this.settings, data.userTypes || [], 'other'),
                importTasks(this.vault, this.settings, data.videos || [], 'video')
            ]);

            new Notice(`${t('exampleImportedSuccessfully')}: ${example.name}`);
        } catch (error) {
            console.error('Error importing example:', error);
            new Notice(`${t('errorImportingExample')}: ${error.message}`);
        }
    }
}
