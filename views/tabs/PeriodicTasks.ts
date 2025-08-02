import { Vault, Notice, TFile, TAbstractFile, moment } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { generateProgressBar, calculateTaskProgress } from '../../utils/progressUtils';
import { openOrCreateSourceFile } from '../../utils/fileUtils';
import { getTaskTypeIcon } from '../../utils/taskUtils';

type CompletedTasks = {
    daily: string[];
    weekly: string[];
    monthly: string[];
    quarterly: string[];
    yearly: string[];
};

export class PeriodicTasks {
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;
    private static taskType: string = 'periodic';
    private static startDate: moment.Moment;

    static initialize(app: any, settings: PersonalDevelopmentPlanSettings, vault: Vault) {
        this.app = app;
        this.settings = settings;
        this.vault = vault;
        this.startDate = moment(settings.statsStartDate);
    }

    private static getPeriodicPath(): string {
        return `${this.settings.folderPath}/Periodic/Periodic.md`;
    }

    private static getCompletedPeriodicPath(): string {
        return `${this.settings.folderPath}/Periodic/completed_tasks.json`;
    }

    private static async loadCompletedTasks(): Promise<CompletedTasks> {
        const path = this.getCompletedPeriodicPath();
        try {
            const file = this.vault.getAbstractFileByPath(path);
            if (file && file instanceof TFile) {
                const content = await this.vault.cachedRead(file);
                return JSON.parse(content) || this.getDefaultCompletedTasks();
            }
        } catch (error) {
            console.error('Error loading completed tasks:', error);
        }
        return this.getDefaultCompletedTasks();
    }

    private static getDefaultCompletedTasks(): CompletedTasks {
        return {
            daily: [],
            weekly: [],
            monthly: [],
            quarterly: [],
            yearly: []
        };
    }

    private static async saveCompletedTasks(tasks: CompletedTasks): Promise<void> {
        const path = this.getCompletedPeriodicPath();
        try {
            await this.vault.adapter.mkdir(`${this.settings.folderPath}/Periodic`);
            await this.vault.adapter.write(path, JSON.stringify(tasks, null, 2));
        } catch (error) {
            console.error('Error saving completed tasks:', error);
            throw error;
        }
    }

    private static async updateCompletedTasks(newTasks: {
        daily?: string[],
        weekly?: string[],
        monthly?: string[],
        quarterly?: string[],
        yearly?: string[]
    }): Promise<void> {
        const completedTasks = await this.loadCompletedTasks();

        if (newTasks.daily) {
            completedTasks.daily = [...new Set([...completedTasks.daily, ...newTasks.daily])];
        }
        if (newTasks.weekly) {
            completedTasks.weekly = [...new Set([...completedTasks.weekly, ...newTasks.weekly])];
        }
        if (newTasks.monthly) {
            completedTasks.monthly = [...new Set([...completedTasks.monthly, ...newTasks.monthly])];
        }
        if (newTasks.quarterly) {
            completedTasks.quarterly = [...new Set([...completedTasks.quarterly, ...newTasks.quarterly])];
        }
        if (newTasks.yearly) {
            completedTasks.yearly = [...new Set([...completedTasks.yearly, ...newTasks.yearly])];
        }

        await this.saveCompletedTasks(completedTasks);
    }

    private static async generateDailyTasks(): Promise<{content: string, newTasks: string[]}> {
        if (!this.settings.periodicTasks?.daily?.enabled) return {content: '', newTasks: []};

        const tasks = this.settings.periodicTasks.daily.tasks || [];
        if (tasks.length === 0) return {content: '', newTasks: []};

        const completedTasks = await this.loadCompletedTasks();
        let content = `## ${t('dailyTasks')}\n\n`;
        const today = moment();
        let currentDate = this.startDate.clone();
        const newTasks: string[] = [];

        while (currentDate.isSameOrBefore(today)) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            if (!completedTasks.daily.includes(dateStr)) {
                content += `#### ${dateStr}\n\n`;
                tasks.forEach(task => content += `- [ ] ${task}\n`);
                content += '\n';
                newTasks.push(dateStr);
            }
            currentDate.add(1, 'day');
        }

        return {content, newTasks};
    }

    private static async generateWeeklyTasks(): Promise<{content: string, newTasks: string[]}> {
        if (!this.settings.periodicTasks?.weekly?.enabled) return {content: '', newTasks: []};

        const tasks = this.settings.periodicTasks.weekly.tasks || [];
        if (tasks.length === 0) return {content: '', newTasks: []};

        const completedTasks = await this.loadCompletedTasks();
        let content = `## ${t('weeklyTasks')}\n\n`;
        const today = moment();
        let currentDate = this.startDate.clone().startOf('week');
        const newTasks: string[] = [];

        while (currentDate.isSameOrBefore(today, 'week')) {
            const weekStr = currentDate.format('YYYY-[W]WW');
            if (!completedTasks.weekly.includes(weekStr)) {
                content += `#### ${t('week')} ${weekStr}\n\n`;
                tasks.forEach(task => content += `- [ ] ${task}\n`);
                content += '\n';
                newTasks.push(weekStr);
            }
            currentDate.add(1, 'week');
        }

        return {content, newTasks};
    }

    private static async generateMonthlyTasks(): Promise<{content: string, newTasks: string[]}> {
        if (!this.settings.periodicTasks?.monthly?.enabled) return {content: '', newTasks: []};

        const tasks = this.settings.periodicTasks.monthly.tasks || [];
        if (tasks.length === 0) return {content: '', newTasks: []};

        const completedTasks = await this.loadCompletedTasks();
        let content = `## ${t('monthlyTasks')}\n\n`;
        const today = moment();
        let currentDate = this.startDate.clone().startOf('month');
        const newTasks: string[] = [];

        while (currentDate.isSameOrBefore(today, 'month')) {
            const monthStr = currentDate.format('YYYY-MM');
            if (!completedTasks.monthly.includes(monthStr)) {
                content += `#### ${t('month')} ${monthStr}\n\n`;
                tasks.forEach(task => content += `- [ ] ${task}\n`);
                content += '\n';
                newTasks.push(monthStr);
            }
            currentDate.add(1, 'month');
        }

        return {content, newTasks};
    }

    private static async generateQuarterlyTasks(): Promise<{content: string, newTasks: string[]}> {
        if (!this.settings.periodicTasks?.quarterly?.enabled) return {content: '', newTasks: []};

        const tasks = this.settings.periodicTasks.quarterly.tasks || [];
        if (tasks.length === 0) return {content: '', newTasks: []};

        const completedTasks = await this.loadCompletedTasks();
        let content = `## ${t('quarterlyTasks')}\n\n`;
        const today = moment();
        let currentDate = this.startDate.clone().startOf('quarter');
        const newTasks: string[] = [];

        while (currentDate.isSameOrBefore(today, 'quarter')) {
            const quarterStr = currentDate.format('YYYY-[Q]Q');
            if (!completedTasks.quarterly.includes(quarterStr)) {
                content += `#### ${t('quarter')} ${quarterStr}\n\n`;
                tasks.forEach(task => content += `- [ ] ${task}\n`);
                content += '\n';
                newTasks.push(quarterStr);
            }
            currentDate.add(1, 'quarter');
        }

        return {content, newTasks};
    }

    private static async generateYearlyTasks(): Promise<{content: string, newTasks: string[]}> {
        if (!this.settings.periodicTasks?.yearly?.enabled) return {content: '', newTasks: []};

        const tasks = this.settings.periodicTasks.yearly.tasks || [];
        if (tasks.length === 0) return {content: '', newTasks: []};

        const completedTasks = await this.loadCompletedTasks();
        let content = `## ${t('yearlyTasks')}\n\n`;
        const today = moment();
        let currentDate = this.startDate.clone().startOf('year');
        const newTasks: string[] = [];

        while (currentDate.isSameOrBefore(today, 'year')) {
            const yearStr = currentDate.format('YYYY');
            if (!completedTasks.yearly.includes(yearStr)) {
                content += `#### ${t('year')} ${yearStr}\n\n`;
                tasks.forEach(task => content += `- [ ] ${task}\n`);
                content += '\n';
                newTasks.push(yearStr);
            }
            currentDate.add(1, 'year');
        }

        return {content, newTasks};
    }

    private static async generateAllTasks(): Promise<string> {
        const [
            dailyResult,
            weeklyResult,
            monthlyResult,
            quarterlyResult,
            yearlyResult
        ] = await Promise.all([
            this.generateDailyTasks(),
            this.generateWeeklyTasks(),
            this.generateMonthlyTasks(),
            this.generateQuarterlyTasks(),
            this.generateYearlyTasks()
        ]);

        // Сохраняем все новые задачи одним запросом
        await this.updateCompletedTasks({
            daily: dailyResult.newTasks,
            weekly: weeklyResult.newTasks,
            monthly: monthlyResult.newTasks,
            quarterly: quarterlyResult.newTasks,
            yearly: yearlyResult.newTasks
        });

        return this.getPeriodicFileContent() +
            dailyResult.content +
            weeklyResult.content +
            monthlyResult.content +
            quarterlyResult.content +
            yearlyResult.content;
    }

    static async createPeriodicTasksCard(container: HTMLElement) {
        const periodicCard = container.createDiv({ cls: 'task-card periodic-card' });
        const cardContent = periodicCard.createDiv({ cls: 'task-card-content' });

        cardContent.onclick = async () => {
            const filePath = this.getPeriodicPath();
            const content = await this.generateAllTasks();
            openOrCreateSourceFile(filePath, this.vault, this.app.workspace, content);
        };

        const firstLine = cardContent.createDiv({ cls: 'task-first-line' });
        firstLine.createSpan({
            cls: 'task-type-icon',
            text: `${getTaskTypeIcon(this.taskType)} ${t('periodicTasks')}:`
        });

        const content = await this.getCurrentPeriodicContent();
        const progress = calculateTaskProgress(content);
        const progressContainer = cardContent.createDiv({ cls: 'task-progress-line' });
        progressContainer.createSpan({
            cls: 'task-progress-bar',
            text: `${generateProgressBar(progress)} ${progress}%`
        });
    }

    private static async getCurrentPeriodicContent(): Promise<string> {
        const filePath = this.getPeriodicPath();
        try {
            const file = this.vault.getAbstractFileByPath(filePath);
            if (file && file instanceof TFile) {
                return await this.vault.cachedRead(file);
            }
            return this.getPeriodicFileContent();
        } catch (error) {
            console.error('Error reading periodic file:', error);
            return this.getPeriodicFileContent();
        }
    }

    private static getPeriodicFileContent(): string {
        return `---\n` +
               `title: ${t('periodicTasks')}\n` +
               `type: ${this.taskType}\n` +
               `---\n\n` +
               `## ${t('oneTimeTasks')}\n\n`;
    }
}
