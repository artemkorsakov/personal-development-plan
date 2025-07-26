import { t } from '../localization/localization';

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
