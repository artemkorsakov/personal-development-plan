import { Vault, TFile } from 'obsidian';
import { PersonalDevelopmentPlanSettings, getMaterialIdByName } from '../../settings/settings-types';
import { t } from '../../localization/localization';
import { getActiveTasks, getPlannedTasks, getKnowledgeItems } from '../../utils/taskUtils';
import { CompletedTask, loadCompletedTasks } from './historyUtils';

interface TaskStats {
    total: number;
    inProgress: number;
    planned: number;
    knowledgeBase: number;
}

interface ContentTypeStats {
    total: number;
    completed: number;
    remaining: string;
}

export class StatisticsTab {
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;
    private static metadataCache: any;

    static async create(app: any, settings: PersonalDevelopmentPlanSettings, vault: Vault, metadataCache: any): Promise<HTMLElement> {
        this.settings = settings;
        this.vault = vault;
        this.metadataCache = metadataCache;

        const container = createDiv();
        container.addClass('statistics-tab-container');

        try {
            const [activeTasks, plannedTasks, knowledgeItems, completedTasks] = await Promise.all([
                getActiveTasks(vault, settings, metadataCache),
                getPlannedTasks(vault, settings, metadataCache),
                getKnowledgeItems(vault, settings, metadataCache),
                loadCompletedTasks(vault, settings)
            ]);

            const generalStats = this.calculateGeneralStats(activeTasks, plannedTasks, knowledgeItems);
            const contentTypeStats = this.calculateContentTypeStats(activeTasks, plannedTasks, knowledgeItems, completedTasks);
            const sectionStats = this.calculateSectionStats(activeTasks, plannedTasks, knowledgeItems);

            this.renderStatistics(container, {
                generalStats,
                contentTypeStats,
                sectionStats,
                completedTasks
            });
        } catch (error) {
            container.createEl('p', { text: `${t('errorLoadingStatistics')}: ${error.message}` });
            console.error('Error loading statistics:', error);
        }

        return container;
    }

    private static renderStatistics(container: HTMLElement, data: {
        generalStats: TaskStats,
        contentTypeStats: Record<string, ContentTypeStats>,
        sectionStats: Record<string, number>,
        completedTasks: CompletedTask[]
    }) {
        this.renderGeneralStats(container, data.generalStats);
        this.renderContentTypeStats(container, data.contentTypeStats, data.completedTasks);
        this.renderSectionStats(container, data.sectionStats);
        this.renderForecastSection(container, data.contentTypeStats, data.completedTasks);
    }

    private static calculateGeneralStats(activeTasks: any[], plannedTasks: any[], knowledgeItems: any[]): TaskStats {
        return {
            total: activeTasks.length + plannedTasks.length + knowledgeItems.length,
            inProgress: activeTasks.length,
            planned: plannedTasks.length,
            knowledgeBase: knowledgeItems.length
        };
    }

    private static calculateContentTypeStats(
        activeTasks: any[],
        plannedTasks: any[],
        knowledgeItems: any[],
        completedTasks: CompletedTask[]
    ): Record<string, ContentTypeStats> {
        const allTasks = [...activeTasks, ...plannedTasks, ...knowledgeItems];
        const stats: Record<string, ContentTypeStats> = {};

        this.settings.materialTypes.forEach(type => {
            stats[type.name] = { total: 0, completed: 0, remaining: '0' };
        });

        allTasks.forEach(task => {
            if (stats[task.type]) {
                stats[task.type].total += 1; // Исправлено: вместо инкремента через ++
            }
        });

        completedTasks.forEach(task => {
            if (stats[task.type]) {
                stats[task.type].completed += 1; // Исправлено: вместо инкремента через ++
            }
        });

        Object.entries(stats).forEach(([type, typeStats]) => {
            const materialId = getMaterialIdByName(this.settings.materialTypes, type);
            const relevantTasks = allTasks.filter(t => t.type === type);

            if (materialId === 'book') {
                const totalPages = relevantTasks.reduce((sum, task) => sum + (task.pages || 0), 0);
                typeStats.remaining = `${totalPages} ${t('remainingPages')}`;
            } else {
                const totalHours = relevantTasks.reduce((sum, task) => {
                    return sum + (task.durationInMinutes ? task.durationInMinutes / 60 : task.laborInputInHours || 0);
                }, 0);
                typeStats.remaining = `${Math.round(totalHours * 100) / 100} ${t('remainingHours')}`;
            }
        });

        return stats;
    }

    private static calculateSectionStats(activeTasks: any[], plannedTasks: any[], knowledgeItems: any[]): Record<string, number> {
        const sectionCounts: Record<string, number> = {};
        [...activeTasks, ...plannedTasks, ...knowledgeItems].forEach(task => {
            if (task.section) sectionCounts[task.section] = (sectionCounts[task.section] || 0) + 1;
        });
        return sectionCounts;
    }

    private static renderContentTypeStats(
        container: HTMLElement,
        stats: Record<string, ContentTypeStats>,
        completedTasks: CompletedTask[]
    ) {
        const section = container.createEl('section', { cls: 'stats-section' });
        section.createEl('h2', { text: t('contentTypeStatistics') });

        this.createTable(section, [t('type'), t('totalInPlan'), t('remaining')],
            Object.entries(stats).map(([type, typeStats]) => [
                type,
                typeStats.total.toString(),
                typeStats.remaining
            ])
        );

        section.createEl('div', { cls: 'stats-table-divider' });

        this.createTable(section, [t('type'), t('completedCount'), t('completedTotal')],
            Object.entries(stats).map(([type, typeStats]) => [
                type,
                typeStats.completed.toString(),
                this.calculateTotalEffort(completedTasks, type)
            ])
        );
    }

    private static createTable(container: HTMLElement, headers: string[], rows: string[][]) {
        const table = container.createEl('table', { cls: 'stats-table' });
        const headerRow = table.createEl('thead').createEl('tr');
        headers.forEach(text => headerRow.createEl('th', { text }));

        const tbody = table.createEl('tbody');
        rows.forEach(rowData => {
            const row = tbody.createEl('tr');
            rowData.forEach((text, i) =>
                row.createEl('td', {
                    text,
                    cls: i > 0 ? 'stat-value' : ''
                })
            );
        });
    }

    private static calculateTotalEffort(completedTasks: CompletedTask[], type: string): string {
        const materialId = getMaterialIdByName(this.settings.materialTypes, type);
        const total = completedTasks
            .filter(task => task.type === type)
            .reduce((sum, task) => {
                if (materialId === 'book') return sum + (task.pages || 0);
                if (task.durationInMinutes) return sum + task.durationInMinutes / 60;
                return sum + (task.laborInputInHours || 0);
            }, 0);

        return materialId === 'book'
            ? `${total} ${t('remainingPages')}`
            : `${total.toFixed(1)} ${t('remainingHours')}`;
    }

    private static renderGeneralStats(container: HTMLElement, stats: TaskStats) {
        const section = container.createEl('section', { cls: 'stats-section' });
        section.createEl('h2', { text: t('generalStatistics') });

        const chartContainer = section.createDiv({ cls: 'bar-chart-container' });
        Object.entries({
            [t('totalTasksInPlan')]: stats.total,
            [t('inProgress')]: stats.inProgress,
            [t('planned')]: stats.planned,
            [t('knowledgeBase')]: stats.knowledgeBase
        }).forEach(([label, value]) =>
            this.addBarRow(chartContainer, label, value, stats.total)
        );
    }

    private static renderSectionStats(container: HTMLElement, stats: Record<string, number>) {
        const section = container.createEl('section', { cls: 'stats-section' });
        section.createEl('h2', { text: t('sectionStatistics') });

        const totalTasks = Object.values(stats).reduce((sum, count) => sum + count, 0);
        const chartContainer = section.createDiv({ cls: 'bar-chart-container' });

        Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([sectionName, count]) =>
                this.addBarRow(chartContainer, sectionName, count, totalTasks)
            );
    }

    private static addBarRow(container: HTMLElement, label: string, value: number, total: number) {
        const percentage = Math.round((value / total) * 100) || 0;
        const barContainer = container.createDiv({ cls: 'bar-row' });

        barContainer.createDiv({ cls: 'bar-label', text: label });

        const bar = barContainer.createDiv({ cls: 'bar' });
        bar.createDiv({
            cls: 'bar-fill',
            attr: { 'style': `width: ${percentage}%`, 'data-value': value.toString() }
        });

        barContainer.createDiv({ cls: 'bar-value', text: `${value} (${percentage}%)` });
    }

    private static renderForecastSection(
        container: HTMLElement,
        stats: Record<string, ContentTypeStats>,
        completedTasks: CompletedTask[]
    ) {
        const section = container.createEl('section', { cls: 'forecast-section' });
        section.createEl('h2', { text: t('forecastTitle') });

        // Блок методологии
        const methodology = section.createDiv({ cls: 'forecast-methodology' });
        methodology.createEl('h3', { text: t('forecastMethodology') });
        methodology.createEl('p', { text: `${t('forecastStartDate')}: ${this.settings.statsStartDate}` });
        methodology.createEl('p', { text: t('booksForecastFormula') });
        methodology.createEl('p', { text: t('otherTypesForecastFormula') });

        // Расчет прогноза
        const forecastData = this.calculateForecast(stats, completedTasks);

        // Таблица прогноза завершения с 5 столбцами
        const forecastTable = section.createEl('table', { cls: 'stats-table' });
        const thead = forecastTable.createEl('thead');
        const headerRow = thead.createEl('tr');

        // Заголовки столбцов
        [t('type'), t('baseForecast'), t('formula'), t('optimistic'), t('pessimistic')].forEach(text => {
            headerRow.createEl('th', { text });
        });

        const tbody = forecastTable.createEl('tbody');
        Object.entries(forecastData).forEach(([type, data]) => {
            if (data.baseDays > 0) {
                const row = tbody.createEl('tr');
                const formula = this.getForecastFormula(type, data, stats[type], completedTasks);

                // Тип
                row.createEl('td', {
                    text: type,
                    cls: 'forecast-type'
                });

                // Базовый прогноз
                row.createEl('td', {
                    text: `${Math.round(data.baseDays)}`,
                    cls: 'stat-value forecast-base'
                });

                // Формула
                row.createEl('td', {
                    text: formula,
                    cls: 'forecast-formula'
                });

                // Оптимистичный прогноз (-15%)
                row.createEl('td', {
                    text: `${Math.round(data.baseDays * 0.85)}`,
                    cls: 'stat-value forecast-optimistic'
                });

                // Пессимистичный прогноз (+15%)
                row.createEl('td', {
                    text: `${Math.round(data.baseDays * 1.15)}`,
                    cls: 'stat-value forecast-pessimistic'
                });
            } else {
                const row = tbody.createEl('tr');

                // Тип
                row.createEl('td', {
                    text: type,
                    cls: 'forecast-type'
                });

                // Базовый прогноз
                row.createEl('td', {
                    text: t('noForecast'),
                    cls: 'stat-value forecast-base'
                });

                // Формула
                row.createEl('td', {
                    text: '-',
                    cls: 'forecast-formula'
                });

                // Оптимистичный прогноз (-15%)
                row.createEl('td', {
                    text: '-',
                    cls: 'stat-value forecast-optimistic'
                });

                // Пессимистичный прогноз (+15%)
                row.createEl('td', {
                    text: '-',
                    cls: 'stat-value forecast-pessimistic'
                });
			}
        });
    }

    private static getForecastFormula(
        type: string,
        forecastData: { baseDays: number },
        typeStats: ContentTypeStats,
        completedTasks: CompletedTask[]
    ): string {
        const daysPassed = this.settings.statsStartDate
            ? Math.floor((Date.now() - new Date(this.settings.statsStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 30;

        const materialId = getMaterialIdByName(this.settings.materialTypes, type);
        const completed = parseFloat(this.calculateTotalEffort(completedTasks, type).split(' ')[0]) || 0;

        if (materialId === 'book') {
            const remainingPages = parseInt(typeStats.remaining) || 0;
            return `= ${remainingPages} / (${completed.toFixed(1)} / ${daysPassed})`;
        } else {
            const remainingHours = parseFloat(typeStats.remaining.split(' ')[0]) || 0;
            return `= ${remainingHours.toFixed(1)} / (${completed.toFixed(1)} / ${daysPassed})`;
        }
    }

    private static calculateForecast(
        stats: Record<string, ContentTypeStats>,
        completedTasks: CompletedTask[]
    ): Record<string, { baseDays: number }> {
        const result: Record<string, { baseDays: number }> = {};
        const daysPassed = this.settings.statsStartDate
            ? Math.floor((Date.now() - new Date(this.settings.statsStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 30;

        Object.entries(stats).forEach(([type, typeStats]) => {
            const completed = parseFloat(this.calculateTotalEffort(completedTasks, type).split(' ')[0]) || 0;
            if (completed <= 0) return;

            const materialId = getMaterialIdByName(this.settings.materialTypes, type);
            const remaining = parseFloat(typeStats.remaining.split(' ')[0]) || 0;
            const ratePerDay = completed / daysPassed;

            result[type] = {
                baseDays: materialId === 'book'
                    ? remaining / (ratePerDay || 1)
                    : remaining / (ratePerDay || 1)
            };
        });

        return result;
    }
}
