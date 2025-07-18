import { t } from './localization';

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
        tooltip: 'Текущие активные задачи и проекты'
    },
    {
        id: 'planned',
        name: t('planned'),
        icon: 'calendar',
        tooltip: 'Запланированные на будущее задачи'
    },
    {
        id: 'knowledge-base',
        name: t('knowledgeBase'),
        icon: 'book',
        tooltip: 'База знаний и полезной информации'
    },
    {
        id: 'sources',
        name: t('sources'),
        icon: 'link',
        tooltip: 'Источники и ссылки на дополнительные материалы'
    },
    {
        id: 'statistics',
        name: t('statistics'),
        icon: 'statistics',
        tooltip: 'Статистика и аналитика по вашей деятельности'
    },
    {
        id: 'history',
        name: t('history'),
        icon: 'history',
        tooltip: 'История изменений и выполненных задач'
    },
    {
        id: 'examples',
        name: t('examples'),
        icon: 'examples',
        tooltip: 'Примеры использования и шаблоны'
    },
];
