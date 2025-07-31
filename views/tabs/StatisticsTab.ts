import { Vault, TFile, Notice } from 'obsidian';
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

    static async create(
        app: any,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: any
    ): Promise<HTMLElement> {
        this.settings = settings;
        this.vault = vault;
        this.metadataCache = metadataCache;

        const container = document.createElement('div');
        container.addClass('statistics-tab-container');

        try {
            // Load all necessary data
            const [activeTasks, plannedTasks, knowledgeItems, completedTasks] = await Promise.all([
                getActiveTasks(vault, settings, metadataCache),
                getPlannedTasks(vault, settings, metadataCache),
                getKnowledgeItems(vault, settings, metadataCache),
                loadCompletedTasks(vault, settings)
            ]);

            // Calculate general statistics
            const generalStats = this.calculateGeneralStats(activeTasks, plannedTasks, knowledgeItems);

            // Calculate content type statistics
            const contentTypeStats = this.calculateContentTypeStats(
                activeTasks,
                plannedTasks,
                knowledgeItems,
                completedTasks
            );

            // Calculate section statistics
            const sectionStats = this.calculateSectionStats(
                activeTasks,
                plannedTasks,
                knowledgeItems
            );

            // Render all statistics
            this.renderGeneralStats(container, generalStats);
            this.renderContentTypeStats(container, contentTypeStats, completedTasks);
            this.renderSectionStats(container, sectionStats);
            this.renderForecastSection(container, contentTypeStats, completedTasks);
        } catch (error) {
            container.createEl('p', { text: `${t('errorLoadingStatistics')}: ${error.message}` });
            console.error('Error loading statistics:', error);
        }

        return container;
    }

    private static calculateGeneralStats(
        activeTasks: any[],
        plannedTasks: any[],
        knowledgeItems: any[]
    ): TaskStats {
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

        // Initialize stats for all material types
        this.settings.materialTypes.forEach(type => {
            stats[type.name] = {
                total: 0,
                completed: 0,
                remaining: '0'
            };
        });

        // Count current tasks by type
        allTasks.forEach(task => {
            if (stats[task.type]) {
                stats[task.type].total++;
            }
        });

        // Count completed tasks by type
        completedTasks.forEach(task => {
            if (stats[task.type]) {
                stats[task.type].completed++;
            }
        });

        // Calculate remaining work
        Object.keys(stats).forEach(type => {
            const typeStats = stats[type];
            const materialId = getMaterialIdByName(this.settings.materialTypes, type);

            if (materialId === 'book') {
                const totalPages = allTasks
                    .filter(t => t.type === type && t.pages)
                    .reduce((sum, task) => sum + (task.pages || 0), 0);

                typeStats.remaining = `${totalPages } ${t('remainingPages')}`;
            } else {
                const totalHours = allTasks
                    .filter(t => t.type === type && (t.durationInMinutes || t.laborInputInHours))
                    .reduce((sum, task) => {
                        if (task.durationInMinutes) {
                            return sum + (task.durationInMinutes / 60);
                        }
                        return sum + (task.laborInputInHours || 0);
                    }, 0);

                typeStats.remaining = `${Math.round(totalHours * 100) / 100} ${t('remainingHours')}`;
            }
        });

        return stats;
    }

    private static calculateSectionStats(
        activeTasks: any[],
        plannedTasks: any[],
        knowledgeItems: any[]
    ): Record<string, number> {
        const allTasks = [...activeTasks, ...plannedTasks, ...knowledgeItems];
        const sectionCounts: Record<string, number> = {};

        allTasks.forEach(task => {
            if (task.section) {
                sectionCounts[task.section] = (sectionCounts[task.section] || 0) + 1;
            }
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

        // Таблица "Всего в плане"
        const planTable = section.createEl('table', { cls: 'stats-table' });
        const planThead = planTable.createEl('thead');
        const planHeaderRow = planThead.createEl('tr');

        [t('type'), t('totalInPlan'), t('remaining')].forEach(text => {
            planHeaderRow.createEl('th', { text });
        });

        const planTbody = planTable.createEl('tbody');
        Object.entries(stats).forEach(([type, typeStats]) => {
            const row = planTbody.createEl('tr');
            row.createEl('td', { text: type });
            row.createEl('td', { text: typeStats.total.toString(), cls: 'stat-value' });
            row.createEl('td', { text: typeStats.remaining, cls: 'stat-value' });
        });

        section.createEl('div', { cls: 'stats-table-divider' });

        // Таблица "Завершено" с новым столбцом
        const completedTable = section.createEl('table', { cls: 'stats-table' });
        const completedThead = completedTable.createEl('thead');
        const completedHeaderRow = completedThead.createEl('tr');

        [t('type'), t('completedCount'), t('completedTotal')].forEach(text => {
            completedHeaderRow.createEl('th', { text });
        });

        const completedTbody = completedTable.createEl('tbody');
        Object.entries(stats).forEach(([type, typeStats]) => {
            const row = completedTbody.createEl('tr');

            // Название типа
            row.createEl('td', { text: type });

            // Количество завершенных
            row.createEl('td', {
                text: typeStats.completed.toString(),
                cls: 'stat-value'
            });

            // Суммарные трудозатраты
            const totalEffort = this.calculateTotalEffort(completedTasks, type);
            row.createEl('td', {
                text: totalEffort,
                cls: 'stat-value'
            });
        });
    }

    private static calculateTotalEffort(completedTasks: CompletedTask[], type: string): string {
        const tasksOfType = completedTasks.filter(task => task.type === type);
        const materialId = getMaterialIdByName(this.settings.materialTypes, type);

        const total = tasksOfType.reduce((sum, task) => {
            if (materialId === 'book' && task.pages) {
                return sum + task.pages;
            } else if (task.durationInMinutes) {
                return sum + task.durationInMinutes / 60;
            } else if (task.laborInputInHours) {
                return sum + task.laborInputInHours;
            }
            return sum;
        }, 0);

        if (type === 'book') {
            return `${total} ${t('remainingPages')}`;
        } else {
            return `${total.toFixed(1)} ${t('remainingHours')}`;
        }
    }

    private static renderGeneralStats(container: HTMLElement, stats: TaskStats) {
        const section = container.createEl('section', { cls: 'stats-section' });
        section.createEl('h2', { text: t('generalStatistics') });

        const chartContainer = section.createDiv({ cls: 'bar-chart-container' });

        // Добавляем строки для каждой метрики
        this.addBarRow(chartContainer, t('totalTasksInPlan'), stats.total, stats.total);
        this.addBarRow(chartContainer, t('inProgress'), stats.inProgress, stats.total);
        this.addBarRow(chartContainer, t('planned'), stats.planned, stats.total);
        this.addBarRow(chartContainer, t('knowledgeBase'), stats.knowledgeBase, stats.total);
    }

    private static renderSectionStats(container: HTMLElement, stats: Record<string, number>) {
        const section = container.createEl('section', { cls: 'stats-section' });
        section.createEl('h2', { text: t('sectionStatistics') });

        const totalTasks = Object.values(stats).reduce((sum, count) => sum + count, 0);
        const sortedSections = Object.entries(stats).sort((a, b) => b[1] - a[1]);

        const chartContainer = section.createDiv({ cls: 'bar-chart-container' });

        sortedSections.forEach(([sectionName, count]) => {
            this.addBarRow(chartContainer, sectionName, count, totalTasks);
        });
    }

    // Общая функция для создания строк диаграммы
    private static addBarRow(
        container: HTMLElement,
        label: string,
        value: number,
        total: number
    ) {
        const percentage = Math.round((value / total) * 100);
        const barContainer = container.createDiv({ cls: 'bar-row' });

        barContainer.createDiv({
            cls: 'bar-label',
            text: label
        });

        const bar = barContainer.createDiv({ cls: 'bar' });
        bar.createDiv({
            cls: 'bar-fill',
            attr: {
                'style': `width: ${percentage}%`,
                'data-value': value.toString()
            }
        });

        barContainer.createDiv({
            cls: 'bar-value',
            text: `${value} (${percentage}%)`
        });
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

        const algorithms = methodology.createEl('div');
        algorithms.createEl('p', { text: `${t('forecastStartDate')}: ${this.settings.statsStartDate}` });
        algorithms.createEl('p', { text: t('booksForecastFormula') });
        algorithms.createEl('p', { text: t('otherTypesForecastFormula') });

        // Расчет прогноза
        const forecastData = this.calculateForecast(stats, completedTasks);

        // Таблица прогноза завершения
        const forecastTable = section.createEl('table', { cls: 'stats-table' });
        const thead = forecastTable.createEl('thead');
        const headerRow = thead.createEl('tr');

        [t('type'), t('optimistic'), t('base'), t('pessimistic')].forEach(text => {
            headerRow.createEl('th', { text });
        });

        const tbody = forecastTable.createEl('tbody');
        Object.entries(forecastData).forEach(([type, data]) => {
            if (data.baseDays > 0) {
                const row = tbody.createEl('tr');

                row.createEl('td', {
                    text: type,
                    cls: 'forecast-type'
                });

                row.createEl('td', {
                    text: String(Math.round(data.baseDays * 0.85)),
                    cls: 'stat-value forecast-optimistic'
                });

                // Базовый прогноз с формулой в скобках
                const formula = this.getForecastFormula(type, data, stats[type], completedTasks);
                row.createEl('td', {
                    text: `${Math.round(data.baseDays)} (${formula})`,
                    cls: 'stat-value forecast-base'
                });

                row.createEl('td', {
                    text: String(Math.round(data.baseDays * 1.15)),
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
        const startDate = this.settings.statsStartDate;
        const daysPassed = startDate ?
            Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 30;

        const materialId = getMaterialIdByName(this.settings.materialTypes, type);
        const totalEffort = this.calculateTotalEffort(completedTasks, type);
        const completed = parseFloat(totalEffort.split(' ')[0]) || 0;

        if (materialId === 'book') {
            const remainingPages = parseInt(typeStats.remaining) || 0;
            const pagesPerDay = completed / daysPassed;
            return `= ${remainingPages} / (${completed.toFixed(1)} / ${daysPassed})`;
        } else {
            const remainingHours = parseFloat(typeStats.remaining.split(' ')[0]) || 0;
            const hoursPerDay = completed / daysPassed;
            return `= ${remainingHours.toFixed(1)} / (${completed.toFixed(1)} / ${daysPassed})`;
        }
    }

    private static calculateForecast(stats: Record<string, ContentTypeStats>, completedTasks: CompletedTask[]): Record<string, { baseDays: number }> {
        const result: Record<string, { baseDays: number }> = {};
        const startDate = this.settings.statsStartDate;
        const daysPassed = startDate ?
            Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 30;

        Object.entries(stats).forEach(([type, typeStats]) => {
			const totalEffort = this.calculateTotalEffort(completedTasks, type);
			const completed = parseFloat(totalEffort.split(' ')[0]) || 0;

            if (completed > 0) {
                let baseDays = 0;

                const materialId = getMaterialIdByName(this.settings.materialTypes, type);

                if (materialId === 'book') {
                    const remainingPages = parseInt(typeStats.remaining) || 0;
                    const pagesPerDay = completed / daysPassed;
                    baseDays = remainingPages / (pagesPerDay || 1);
                } else {
                    const remainingHours = parseFloat(typeStats.remaining.split(' ')[0]) || 0;
                    const hoursPerDay = completed / daysPassed;
                    baseDays = remainingHours / (hoursPerDay || 1);
                }

                result[type] = { baseDays };
            }
        });

        return result;
    }

    private static renderForecastChart(container: HTMLElement, data: Record<string, { baseDays: number }>) {
        const chart = container.createDiv({ cls: 'forecast-bars' });

        Object.entries(data).forEach(([type, forecast]) => {
            if (forecast.baseDays > 0) {
                const barContainer = chart.createDiv({ cls: 'forecast-bar-container' });
                barContainer.createDiv({
                    cls: 'forecast-bar-label',
                    text: type
                });

                const bar = barContainer.createDiv({ cls: 'forecast-bar' });
                bar.createDiv({
                    cls: 'forecast-bar-fill',
                    attr: {
                        'style': `width: ${Math.min(100, forecast.baseDays / 5)}%`,
                        'data-value': forecast.baseDays.toString()
                    }
                });

                barContainer.createDiv({
                    cls: 'forecast-bar-value',
                    text: Math.round(forecast.baseDays) + ' '
                });
            }
        });
    }
}
