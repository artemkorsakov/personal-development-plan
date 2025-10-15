import { Notice, Vault, Modal, TFile } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings, generateTaskContent } from '../../settings/settings-types';
import { EXAMPLE_PLANS } from '../../examples/examplePlans';
import { ImportErrorModal } from '../modals/ImportErrorModal';

export default class ExamplesTab {
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;

    static async create(
        app: any,
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

            const missingTypes = new Set<string>();
            const missingSections = new Set<string>();

            allTasks.forEach(task => {
                const taskType = this.settings.materialTypes.find(t => t.name === task.type);
                if (!taskType) {
                    missingTypes.add(task.type);
                }

                const section = this.settings.sections.find(s => s.name === task.section);
                if (!section) {
                    missingSections.add(task.section);
                }
            });

            if (missingTypes.size > 0 || missingSections.size > 0) {
                new ImportErrorModal(
                    this.app,
                    Array.from(missingTypes),
                    Array.from(missingSections)
                ).open();
                return;
            }

            await Promise.all([
                this.importTasks(data.articles || []),
                this.importTasks(data.books || []),
                this.importTasks(data.courses || []),
                this.importTasks(data.podcasts || []),
                this.importTasks(data.userTypes || []),
                this.importTasks(data.videos || [])
            ]);

            new Notice(`${t('exampleImportedSuccessfully')}: ${example.name}`);
        } catch (error) {
            console.error('Error importing example:', error);
            new Notice(`${t('errorImportingExample')}: ${error.message}`);
        }
    }

    private static async importTasks(tasks: any[]) {
        await Promise.all(tasks.map(async task => {
            try {
                const filePath = `${this.settings.folderPath}/${task.filePath}`;
                const content = this.createTaskContent(task);

                const existingFile = this.vault.getAbstractFileByPath(filePath);
                if (existingFile && existingFile instanceof TFile) {
                    new Notice(`${t('errorImportingExample')}: File ${filePath} already exists`);
                } else {
                    await this.vault.create(filePath, content);
                }
            } catch (error) {
                console.error(`Error importing task ${task.filePath}:`, error);
            }
        }));
    }

    private static createTaskContent(task: any): string {
        let frontmatter = `---\n`;
        frontmatter += `status: ${task.status || 'knowledge-base'}\n`;
        frontmatter += `type: ${task.type || 'user'}\n`;
        frontmatter += `section: ${task.section || 'general'}\n`;
        frontmatter += `title: ${task.title || 'Untitled'}\n`;
        frontmatter += `order: ${task.order || 100}\n`;

        if (task.startDate) frontmatter += `startDate: ${task.startDate}\n`;
        if (task.dueDate) frontmatter += `dueDate: ${task.dueDate}\n`;

        if (task.authors) frontmatter += `authors: ${task.authors}\n`;
        if (task.author) frontmatter += `author: ${task.author}\n`;
        if (task.name) frontmatter += `name: ${task.name}\n`;
        if (task.pages) frontmatter += `pages: ${task.pages}\n`;
        if (task.link) frontmatter += `link: ${task.link}\n`;
        if (task.durationInMinutes) frontmatter += `durationInMinutes: ${task.durationInMinutes}\n`;
        if (task.platform) frontmatter += `platform: ${task.platform}\n`;
        if (task.episodes) frontmatter += `episodes: ${task.episodes}\n`;
        if (task.laborInputInHours) frontmatter += `laborInputInHours: ${task.laborInputInHours}\n`;

        frontmatter += `---\n\n`;

        const taskType = this.settings.materialTypes.find(t => t.name === task.type);
        if (taskType) {
            frontmatter += generateTaskContent(taskType);
        } else {
            frontmatter += `# ${t('taskLabel')}\n\n`;
            frontmatter += `${t('taskDefaultDescription')}\n\n`;
            frontmatter += `## ${t('checklist')}\n\n`;
            frontmatter += `## ${t('notes')}\n\n`;
            frontmatter += `${t('addYourThoughts')}`;
        }

        return frontmatter;
    }
}
