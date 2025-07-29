import { Vault, TFile, Notice } from 'obsidian';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { t } from '../../localization/localization';

interface CompletedTask {
    type: string;
    title: string;
    startDate: string;
    completionDate: string;
    workingDays: number;
    rating: number;
    review: string;
    completedAt: string;
    section: string;
}

export class HistoryTab {
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;

    static async create(
        app: any,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault
    ): Promise<HTMLElement> {
        this.settings = settings;
        this.vault = vault;

        const container = document.createElement('div');
        container.addClass('history-tab-container');

        try {
            const completedTasks = await this.loadCompletedTasks();

            completedTasks.sort((a: CompletedTask, b: CompletedTask) =>
                new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
            );

            if (completedTasks.length === 0) {
                container.createEl('p', { text: t('noCompletedTasks') });
                return container;
            }

            const table = container.createEl('table', { cls: 'history-table' });
            const thead = table.createEl('thead');
            const headerRow = thead.createEl('tr');

            [
                t('historyTitle'),
                t('historyType'),
                t('historyRating'),
                t('historyReview'),
                t('historyWorkingDays')
            ].forEach(text => {
                headerRow.createEl('th', { text });
            });

            const tbody = table.createEl('tbody');
            completedTasks.forEach((task: CompletedTask) => {
                const row = tbody.createEl('tr');

                row.createEl('td', {
                    text: task.title,
                    cls: 'history-task-title'
                });

                row.createEl('td', {
                    text: task.type,
                    cls: 'history-task-type'
                });

                const ratingCell = row.createEl('td', { cls: 'history-task-rating' });
                const stars = '★'.repeat(task.rating);
                const emptyStars = '☆'.repeat(5 - task.rating);
                ratingCell.setText(`${stars}${emptyStars}`);

                const reviewCell = row.createEl('td', { cls: 'history-task-review' });
                reviewCell.createEl('div', {
                    text: task.review,
                    cls: 'history-review-content'
                });

                row.createEl('td', {
                    text: `${task.workingDays} (${task.completionDate})`,
                    cls: 'history-task-days'
                });
            });

        } catch (error) {
            container.createEl('p', { text: `${t('errorLoadingHistory')}: ${error.message}` });
            console.error('Error loading history:', error);
        }

        return container;
    }

    private static async loadCompletedTasks(): Promise<CompletedTask[]> {
        try {
            const historyFilePath = `${this.settings.historyFolderPath}/completed_tasks.json`;
            const file = this.vault.getAbstractFileByPath(historyFilePath);

            if (!file || !(file instanceof TFile)) {
                throw new Error(t('historyFileNotFound'));
            }

            const content = await this.vault.read(file);
            const tasks: CompletedTask[] = JSON.parse(content);

            return tasks;
        } catch (error) {
            console.error('Error loading completed tasks:', error);
            return [];
        }
    }
}
