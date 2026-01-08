import { App, MetadataCache, Vault, TFile } from 'obsidian';
import { PersonalDevelopmentPlanSettings, getMaterialIdByName, MaterialType } from '../../settings/settings-types';
import { t } from '../../localization/localization';
import { getActiveTasks, getPlannedTasks, getKnowledgeItems } from '../../utils/taskUtils';
import { KnowledgeItem, PlannedTask, TaskInProgress } from '../tabs-types';
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
    private static metadataCache: MetadataCache;

    // Вспомогательные методы для получения материалов
    private static getEnabledMaterialTypes(): MaterialType[] {
        return this.settings.materialTypes.filter(type => type.enabled);
    }

    private static getEnabledMaterialTypeNames(): string[] {
        return this.getEnabledMaterialTypes().map(type => type.name);
    }

    private static getSectionNames(): string[] {
        return this.settings.sections.map(section => section.name);
    }

    static async create(app: App, settings: PersonalDevelopmentPlanSettings, vault: Vault, metadataCache: MetadataCache): Promise<HTMLElement> {
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

    private static calculateGeneralStats(activeTasks: TaskInProgress[], plannedTasks: PlannedTask[], knowledgeItems: KnowledgeItem[]): TaskStats {
        return {
            total: activeTasks.length + plannedTasks.length + knowledgeItems.length,
            inProgress: activeTasks.length,
            planned: plannedTasks.length,
            knowledgeBase: knowledgeItems.length
        };
    }

    private static calculateContentTypeStats(
        activeTasks: TaskInProgress[],
        plannedTasks: PlannedTask[],
        knowledgeItems: KnowledgeItem[],
        completedTasks: CompletedTask[]
    ): Record<string, ContentTypeStats> {
        const allTasks = [...activeTasks, ...plannedTasks, ...knowledgeItems];
        const stats: Record<string, ContentTypeStats> = {};

        // Создаем статистику для включенных типов материалов
        this.getEnabledMaterialTypes().forEach(type => {
            stats[type.name] = { total: 0, completed: 0, remaining: '0' };
        });

        // Добавляем категорию "Остальные" для типов
        stats[t('otherTypes')] = { total: 0, completed: 0, remaining: '0' };

        // Получаем имена включенных типов
        const enabledTypeNames = this.getEnabledMaterialTypeNames();

        // Считаем задачи по типам
        allTasks.forEach(task => {
            if (enabledTypeNames.includes(task.type) && stats[task.type]) {
                stats[task.type].total += 1;
            } else {
                stats[t('otherTypes')].total += 1;
            }
        });

        // Считаем выполненные задачи по типам
        completedTasks.forEach(task => {
            if (enabledTypeNames.includes(task.type) && stats[task.type]) {
                stats[task.type].completed += 1;
            } else {
                stats[t('otherTypes')].completed += 1;
            }
        });

        // Рассчитываем оставшиеся усилия для каждого типа
        Object.entries(stats).forEach(([type, typeStats]) => {
            // Получаем актуальные задачи для этого типа
            let relevantTasks: any[] = [];

            if (type === t('otherTypes')) {
                relevantTasks = allTasks.filter(t => !enabledTypeNames.includes(t.type));
            } else if (enabledTypeNames.includes(type)) {
                relevantTasks = allTasks.filter(t => t.type === type);
            }

            if (relevantTasks.length === 0) {
                typeStats.remaining = type === t('otherTypes') ? `0 ${t('remainingHours')}` : '0';
                return;
            }

            // Определяем ID материала для типа
            const materialId = type === t('otherTypes') ? 'other' : getMaterialIdByName(this.settings.materialTypes, type);

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

    private static calculateSectionStats(
        activeTasks: TaskInProgress[],
        plannedTasks: PlannedTask[],
        knowledgeItems: KnowledgeItem[]
    ): Record<string, number> {
        const sectionCounts: Record<string, number> = {};
        const allTasks = [...activeTasks, ...plannedTasks, ...knowledgeItems];

        // Получаем имена разделов
        const sectionNames = this.getSectionNames();

        // Создаем записи для всех включенных разделов
        sectionNames.forEach(sectionName => {
            sectionCounts[sectionName] = 0;
        });

        // Добавляем категорию "Остальные" для разделов
        sectionCounts[t('otherSections')] = 0;

        // Считаем задачи по разделам
        allTasks.forEach(task => {
            if (task.section && sectionNames.includes(task.section)) {
                sectionCounts[task.section] = (sectionCounts[task.section] || 0) + 1;
            } else if (task.section) {
                sectionCounts[t('otherSections')] = (sectionCounts[t('otherSections')] || 0) + 1;
            }
        });

        // Удаляем пустые разделы
        Object.keys(sectionCounts).forEach(section => {
            if (sectionCounts[section] === 0) {
                delete sectionCounts[section];
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

        // Фильтруем только типы, у которых есть задачи
        const filteredStats = Object.entries(stats).filter(([type, typeStats]) =>
            typeStats.total > 0 || typeStats.completed > 0
        );

        if (filteredStats.length === 0) {
            section.createEl('p', { text: t('noStatisticsAvailable') });
            return;
        }

        this.createTable(section,
            [t('type'), t('totalInPlan'), t('remaining'), t('completedCount'), t('completedTotal')],
            filteredStats.map(([type, typeStats]) => [
                type,
                typeStats.total.toString(),
                typeStats.remaining,
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
        // Получаем имена включенных типов
        const enabledTypeNames = this.getEnabledMaterialTypeNames();

        let filteredTasks: CompletedTask[];

        if (type === t('otherTypes')) {
            // Для "Остальных" типов фильтруем задачи, которые не входят во включенные типы
            filteredTasks = completedTasks.filter(task => !enabledTypeNames.includes(task.type));
        } else {
            // Для обычных типов фильтруем по названию типа
            filteredTasks = completedTasks.filter(task => task.type === type);
        }

        if (filteredTasks.length === 0) {
            return `0 ${t('remainingHours')}`;
        }

        // Определяем ID материала
        const materialId = type === t('otherTypes') ? 'other' : getMaterialIdByName(this.settings.materialTypes, type);

        const total = filteredTasks.reduce((sum, task) => {
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

        if (totalTasks === 0) {
            section.createEl('p', { text: t('noSectionStatistics') });
            return;
        }

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
        [t('type'), t('baseForecast'), t('formula'), t('weekForecast'), t('monthForecast'), t('yearForecast')].forEach(text => {
            headerRow.createEl('th', { text });
        });

        const tbody = forecastTable.createEl('tbody');

        // Фильтруем только типы, для которых есть данные прогноза
        const filteredForecastData = Object.entries(forecastData)
            .filter(([type, data]) => data.baseDays > 0)
            .sort((a, b) => a[0].localeCompare(b[0]));

        if (filteredForecastData.length === 0) {
            const row = tbody.createEl('tr');
            const emptyCell = row.createEl('td', {
                text: t('noForecastDataAvailable'),
                attr: { 'colspan': '5' },
                cls: 'forecast-empty'
            });
            return;
        }

        filteredForecastData.forEach(([type, data]) => {
            const row = tbody.createEl('tr');
            const formula = this.getForecastFormula(type, data, stats[type], completedTasks);

            // Тип
            row.createEl('td', {
                text: type,
                cls: 'forecast-type'
            });

            // Базовый прогноз
            row.createEl('td', {
                text: `${data.baseDays.toFixed(1)}`,
                cls: 'stat-value forecast-base'
            });

            // Формула
            row.createEl('td', {
                text: formula,
                cls: 'forecast-formula'
            });

            // Прогноз в неделях
            row.createEl('td', {
                text: `${(data.baseDays / 7.0).toFixed(1)}`,
                cls: 'stat-value'
            });

            // Прогноз в месяцах
            row.createEl('td', {
                text: `${(data.baseDays / 30.0).toFixed(1)}`,
                cls: 'stat-value'
            });

            // Прогноз в годах
            row.createEl('td', {
                text: `${(data.baseDays / 365.0).toFixed(1)}`,
                cls: 'stat-value'
            });
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

        // Получаем имена включенных типов
        const enabledTypeNames = this.getEnabledMaterialTypeNames();

        const materialId = type === t('otherTypes') ? 'other' : getMaterialIdByName(this.settings.materialTypes, type);
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
            // Определяем ID материала
            const materialId = type === t('otherTypes') ? 'other' : getMaterialIdByName(this.settings.materialTypes, type);

            // Получаем выполненные усилия для этого типа
            const completedText = this.calculateTotalEffort(completedTasks, type);
            const completed = parseFloat(completedText.split(' ')[0]) || 0;

            if (completed <= 0) {
                result[type] = { baseDays: 0 };
                return;
            }

            // Получаем оставшиеся усилия
            const remaining = parseFloat(typeStats.remaining.split(' ')[0]) || 0;

            if (remaining <= 0) {
                result[type] = { baseDays: 0 };
                return;
            }

            const ratePerDay = completed / daysPassed;

            result[type] = {
                baseDays: remaining / (ratePerDay || 1)
            };
        });

        return result;
    }
}
