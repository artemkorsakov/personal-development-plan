import { Vault, Notice, TFile, moment } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { generateProgressBar, calculateTaskProgress } from '../../utils/progressUtils';
import { openTaskFile } from '../../utils/fileUtils';
import { getTaskTypeIcon } from '../../utils/taskUtils';

type CompletedTasks = {
    daily: string[];
    weekly: string[];
    monthly: string[];
    quarterly: string[];
    yearly: string[];
};

type PeriodType = keyof CompletedTasks;

export class PeriodicTasks {
    private app: any;
    private settings: PersonalDevelopmentPlanSettings;
    private vault: Vault;
    private taskType: string = 'periodic';
    private startDate: moment.Moment;

    constructor(app: any, settings: PersonalDevelopmentPlanSettings, vault: Vault) {
        this.app = app;
        this.settings = settings;
        this.vault = vault;
        this.startDate = moment(settings.statsStartDate);
    }

    public updateSettings(settings: PersonalDevelopmentPlanSettings) {
        this.settings = settings;
        this.startDate = moment(settings.statsStartDate);
    }

    private getPeriodicPath(): string {
        if (!this.settings?.folderPath) {
            throw new Error('Folder path is not defined in settings');
        }
        return `${this.settings.folderPath}/Periodic/Periodic.md`;
    }

    private getCompletedPeriodicPath(): string {
        return `${this.settings.folderPath}/Periodic/completed_tasks.json`;
    }

    private async ensurePeriodicFolder(): Promise<void> {
        const folderPath = `${this.settings.folderPath}/Periodic`;
        const folder = this.vault.getAbstractFileByPath(folderPath);

        if (!folder) {
            await this.vault.createFolder(folderPath);
        }
    }

    private async loadCompletedTasks(): Promise<CompletedTasks> {
        const path = this.getCompletedPeriodicPath();
        try {
            await this.ensurePeriodicFolder();

            const file = this.vault.getAbstractFileByPath(path);
            if (file && file instanceof TFile) {
                const content = await this.vault.cachedRead(file);
                return JSON.parse(content) || this.getDefaultCompletedTasks();
            }
            return this.getDefaultCompletedTasks();
        } catch (error) {
            console.error('Error loading completed tasks:', error);
            return this.getDefaultCompletedTasks();
        }
    }

    private getDefaultCompletedTasks(): CompletedTasks {
        return {
            daily: [],
            weekly: [],
            monthly: [],
            quarterly: [],
            yearly: []
        };
    }

    private async saveCompletedTasks(tasks: CompletedTasks): Promise<void> {
        const path = this.getCompletedPeriodicPath();
        try {
            const existingFile = this.vault.getAbstractFileByPath(path);

            if (existingFile && existingFile instanceof TFile) {
				await this.vault.process(existingFile, (currentContent: string) => JSON.stringify(tasks, null, 2));
            } else {
                await this.vault.create(path, JSON.stringify(tasks, null, 2));
            }
        } catch (error) {
            console.error('Error saving completed tasks:', error);
            throw error;
        }
    }

    private async updateCompletedTasks(newTasks: Partial<CompletedTasks>): Promise<void> {
        const completedTasks = await this.loadCompletedTasks();
        for (const type in newTasks) {
            if (newTasks.hasOwnProperty(type)) {
                const periods = newTasks[type as PeriodType];
                if (periods) {
                    completedTasks[type as PeriodType] = [
                        ...new Set([...completedTasks[type as PeriodType], ...periods])
                    ];
                }
            }
        }
        await this.saveCompletedTasks(completedTasks);
    }

    public async createPeriodicTasksCard(container: HTMLElement) {
        const periodicCard = container.createDiv({ cls: 'task-card periodic-card' });
        const cardContent = periodicCard.createDiv({ cls: 'task-card-content' });

        const handleClick = async () => {
            try {
                const filePath = this.getPeriodicPath();
                const fileExists = this.vault.getAbstractFileByPath(filePath) instanceof TFile;

                const { newPeriods, contentToAdd } = await this.generateNewPeriods();

                if (fileExists) {
                    await this.appendToExistingFile(filePath, contentToAdd);
                } else {
                    await this.createNewFile(filePath, contentToAdd);
                }

                if (newPeriods.length > 0) {
                    const updatedTasks: Partial<CompletedTasks> = {};
                    newPeriods.forEach(({type, period}) => {
                        if (!updatedTasks[type]) {
                            updatedTasks[type] = [];
                        }
                        updatedTasks[type]!.push(period);
                    });
                    await this.updateCompletedTasks(updatedTasks);
                }

                await openTaskFile(filePath, this.vault, this.app.workspace);

            } catch (error) {
                console.error('Error handling periodic tasks:', error);
                new Notice(t('errorCreatingPeriodicFile'));
            }
        };

        cardContent.onclick = handleClick.bind(this);

        const firstLine = cardContent.createDiv({ cls: 'task-first-line' });
        firstLine.createSpan({
            cls: 'task-type-icon',
            text: `${getTaskTypeIcon(this.taskType)} ${t('periodicTasks')}`
        });

        // Отображение прогресса
        try {
            const content = await this.getCurrentPeriodicContent();
            const progress = calculateTaskProgress(content);
            const progressContainer = cardContent.createDiv({ cls: 'task-progress-line' });
            progressContainer.createSpan({
                cls: 'task-progress-bar',
                text: `${generateProgressBar(progress)} ${progress}%`
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    private formatPeriodHeader(type: PeriodType, date: moment.Moment): string {
        switch (type) {
            case 'daily':
                return `${date.format('YYYY-MM-DD')} (${date.format('dddd')})`;

            case 'weekly':
                const weekStart = date.clone().startOf('week');
                const weekEnd = date.clone().endOf('week');
                return `${t('week')} ${date.format('W')} (${weekStart.format('YYYY-MM-DD')} — ${weekEnd.format('YYYY-MM-DD')})`;

            case 'monthly':
                return `${date.format('MMMM YYYY')}`;

            case 'quarterly':
                const quarter = Math.ceil((date.month() + 1) / 3);
                const quarterMonths = [
                    t('quarter1'),
                    t('quarter2'),
                    t('quarter3'),
                    t('quarter4')
                ];
                return `${quarter}${t('quarter')} ${date.format('YYYY')} (${quarterMonths[quarter - 1]})`;

            case 'yearly':
                return `${date.format('YYYY')} ${t('year')}`;

            default:
                return date.format('YYYY-MM-DD');
        }
    }

    private async generateNewPeriods(): Promise<{
        newPeriods: Array<{type: PeriodType, period: string}>,
        contentToAdd: string
    }> {
        const completedTasks = await this.loadCompletedTasks();
        const today = moment();
        let contentToAdd = '';
        const newPeriods: Array<{type: PeriodType, period: string}> = [];

        const processPeriod = async (
            type: PeriodType,
            dateFormat: string,
            unit: 'day' | 'week' | 'month' | 'quarter' | 'year'
        ) => {
            if (!this.settings.periodicTasks?.[type]?.enabled) return;

            const tasks = this.settings.periodicTasks[type]?.tasks || [];
            if (tasks.length === 0) return;

            let currentDate = this.startDate.clone().startOf(unit);
            let sectionContent = '';

            while (currentDate.isSameOrBefore(today, unit)) {
                const periodStr = currentDate.format(dateFormat);
                if (!completedTasks[type].includes(periodStr)) {
					const formattedHeader = this.formatPeriodHeader(type, currentDate);
                    sectionContent += `#### ${formattedHeader}\n\n`;
                    tasks.forEach(task => sectionContent += `- [ ] ${task}\n`);
                    sectionContent += '\n';
                    newPeriods.push({type, period: periodStr});
                }
                currentDate.add(1, unit);
            }

            if (sectionContent) {
                contentToAdd += sectionContent;
            }
        };

        await Promise.all([
            processPeriod('daily', 'YYYY-MM-DD', 'day'),
            processPeriod('weekly', 'YYYY-[W]WW', 'week'),
            processPeriod('monthly', 'YYYY-MM', 'month'),
            processPeriod('quarterly', 'YYYY-[Q]Q', 'quarter'),
            processPeriod('yearly', 'YYYY', 'year')
        ]);

        return { newPeriods, contentToAdd };
    }

    private async createNewFile(filePath: string, content: string): Promise<void> {
        const header = `---\ntitle: ${t('periodicTasks')}\ntype: ${this.taskType}\n---\n\n# ${t('oneTimeTasks')}\n\n- [ ] ${t('oneTimeTasksExample')}\n\n# ${t('periodicTasks')}\n\n`;
        await this.vault.create(filePath, header + content);
    }

    private async appendToExistingFile(filePath: string, contentToAdd: string): Promise<void> {
        const abstractFile = this.vault.getAbstractFileByPath(filePath);

        if (!abstractFile || !(abstractFile instanceof TFile)) {
            console.error(`File not found or is not a file: ${filePath}`);
            return;
        }

        try {
            await this.vault.process(abstractFile, (currentContent: string) => currentContent + contentToAdd);
        } catch (error) {
            console.error(`Failed to append content to file ${filePath}:`, error);
            throw error;
        }
    }

    private async getCurrentPeriodicContent(): Promise<string> {
        const filePath = this.getPeriodicPath();
        try {
            const file = this.vault.getAbstractFileByPath(filePath);
            if (file && file instanceof TFile) {
                return await this.vault.cachedRead(file);
            }
            return '';
        } catch (error) {
            console.error('Error reading periodic file:', error);
            return '';
        }
    }
}
