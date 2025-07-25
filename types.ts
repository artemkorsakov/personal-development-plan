import { App, TFile, Vault, EventRef, WorkspaceLeaf } from 'obsidian';
import { t } from './localization/localization';

/* Настройки плагина */
export interface PersonalDevelopmentPlanSettings {
    maxActiveTasks: number;
    statsStartDate: string;
    folderPath: string;
    materialTypes: MaterialType[];
    sections: Section[];
    periodicTasks: PeriodicTaskSettings;
}

export interface MaterialType {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    checklistItems: string[];
}

export function getMaterialIdByName(materialTypes: MaterialType[], name: string): string {
    const foundType = materialTypes.find((type: MaterialType) => type.name === name);
    return foundType?.id || `${t('unknownType')}: ${name}`;
}

export function getMaterialNameById(materialTypes: MaterialType[], id: string): string {
    const foundType = materialTypes.find((type: MaterialType) => type.id === id);
    return foundType?.name || `${t('unknownType')}: ${id}`;
}

export interface Section {
    id: string;
    name: string;
    order: number;
}

export interface PeriodicTaskSettings {
    daily: { enabled: boolean; tasks: string[] };
    weekly: { enabled: boolean; tasks: string[] };
    monthly: { enabled: boolean; tasks: string[] };
    quarterly: { enabled: boolean; tasks: string[] };
    yearly: { enabled: boolean; tasks: string[] };
}

/* Определения вкладок */
export interface TabDefinition {
    id: string;
    name: string;
    icon: string;
    tooltip?: string;
}

export const TAB_DEFINITIONS: TabDefinition[] = [
    {
        id: 'in-progress',
        name: t('inProgress'),
        icon: 'play',
        tooltip: t('inProgressTooltip')
    },
    {
        id: 'planned',
        name: t('planned'),
        icon: 'calendar',
        tooltip: t('plannedTooltip')
    },
    {
        id: 'knowledge-base',
        name: t('knowledgeBase'),
        icon: 'book',
        tooltip: t('knowledgeBaseTooltip')
    },
    {
        id: 'sources',
        name: t('sources'),
        icon: 'link',
        tooltip: t('sourcesTooltip')
    },
    {
        id: 'statistics',
        name: t('statistics'),
        icon: 'statistics',
        tooltip: t('statisticsTooltip')
    },
    {
        id: 'history',
        name: t('history'),
        icon: 'history',
        tooltip: t('historyTooltip')
    },
    {
        id: 'examples',
        name: t('examples'),
        icon: 'examples',
        tooltip: t('examplesTooltip')
    },
];

/* Типы задач */
export interface BaseTask {
    name: string;
    type: string;
    section: string;
    order: number;
    filePath: string;
}

export interface TaskInProgress extends BaseTask {
    startDate: string;
    dueDate: string;
    progress: number;
}

export interface PlannedTask extends BaseTask {}

export interface KnowledgeItem extends BaseTask {}

export interface BaseTypeTask {
	status: string;
    title: string;
    type: string;
    section: string;
    order: number;
    startDate: string;
    dueDate: string;
    filePath: string;
}

export interface BookTask extends BaseTypeTask {
    authors: string;
    name: string;
    pages: number;
}

export interface SourceItem {
    type: string;
    name: string;
    icon: string;
    filePath: string;
}

/* Вспомогательные типы */
export type TaskStatus = 'in-progress' | 'planned' | 'knowledge-base' | 'completed';

export interface PluginContext {
    app: App;
    vault: Vault;
    settings: PersonalDevelopmentPlanSettings;
    metadataCache: any;
}

/* Типы для работы с файлами */
export interface FileHandler {
    (file: TFile): Promise<void>;
}

/* Типы для компонентов */
export interface TabComponent {
    create(settings: PersonalDevelopmentPlanSettings, vault: Vault, metadataCache: any): Promise<HTMLElement>;
    refresh?(): Promise<void>;
}

export interface ModalComponent {
    new (app: App, settings: PersonalDevelopmentPlanSettings): any;
}

/* Типы для событий */
export interface FileEventHandlers {
    create: EventRef;
    modify: EventRef;
    delete: EventRef;
}

/* Типы для утилит */
export interface ProgressData {
    completed: number;
    total: number;
    percentage: number;
}

export interface DateRange {
    start: Date;
    end: Date;
}
