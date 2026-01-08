import { App, Notice, Vault, Modal, TFile } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings, generateTaskContent } from '../../settings/settings-types';
import { EXAMPLE_PLANS } from '../../examples/examplePlans';
import { TaskType } from '../../settings/task-types';

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

    private static async importTasks(tasks: TaskType[]) {
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

    private static createTaskContent(task: TaskType): string {
        let frontmatter = `---\n`;
        frontmatter += `status: ${task.status || 'knowledge-base'}\n`;
        frontmatter += `type: ${task.type || 'user'}\n`;
        frontmatter += `section: ${task.section || 'general'}\n`;
        frontmatter += `title: ${task.title || 'Untitled'}\n`;
        frontmatter += `order: ${task.order || 100}\n`;

        if (task.startDate) frontmatter += `startDate: ${task.startDate}\n`;
        if (task.dueDate) frontmatter += `dueDate: ${task.dueDate}\n`;

        if ('authors' in task && typeof task.authors === 'string') {
            frontmatter += `authors: ${task.authors}\n`;
        }
        if ('author' in task && typeof task.author === 'string') {
            frontmatter += `author: ${task.author}\n`;
        }
        if ('name' in task && typeof task.name === 'string') {
            frontmatter += `name: ${task.name}\n`;
        }
        if ('pages' in task && typeof task.pages === 'number') {
            frontmatter += `pages: ${task.pages}\n`;
        }
        if ('link' in task && typeof task.link === 'string') {
            frontmatter += `link: ${task.link}\n`;
        }
        if ('durationInMinutes' in task && typeof task.durationInMinutes === 'number') {
            frontmatter += `durationInMinutes: ${task.durationInMinutes}\n`;
        }
        if ('platform' in task && typeof task.platform === 'string') {
            frontmatter += `platform: ${task.platform}\n`;
        }
        if ('episodes' in task && typeof task.episodes === 'number') {
            frontmatter += `episodes: ${task.episodes}\n`;
        }
        if ('laborInputInHours' in task && typeof task.laborInputInHours === 'number') {
            frontmatter += `laborInputInHours: ${task.laborInputInHours}\n`;
        }

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
