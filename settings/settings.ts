import { t } from './../main/localization';

export interface MaterialType {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    checklistItems: string[];
}

export interface PeriodicTaskSettings {
    daily: { enabled: boolean; tasks: string[] };
    weekly: { enabled: boolean; tasks: string[] };
    monthly: { enabled: boolean; tasks: string[] };
    quarterly: { enabled: boolean; tasks: string[] };
    yearly: { enabled: boolean; tasks: string[] };
}

export interface Section {
    id: string;
    name: string;
    order: number;
}

export interface PersonalDevelopmentPlanSettings {
    maxActiveTasks: number;
    statsStartDate: string;
    folderPath: string;
    materialTypes: MaterialType[];
    sections: Section[];
    periodicTasks: PeriodicTaskSettings;
}

// Helper function to get localized default settings
function getDefaultSettings(): PersonalDevelopmentPlanSettings {
    return {
        maxActiveTasks: 5,
        statsStartDate: new Date().toISOString().split('T')[0],
        folderPath: 'PersonalDevelopmentPlan',
        materialTypes: [
            {
                id: "book",
                name: t('book'),
                enabled: true,
                order: 0,
                checklistItems: [ t('bookTask1'), t('bookTask2') ]
            },
            {
                id: "article",
                name: t('article'),
                enabled: true,
                order: 1,
                checklistItems: [ t('articleTask1'), t('articleTask2') ]
            },
            {
                id: "video",
                name: t('video'),
                enabled: true,
                order: 2,
                checklistItems: [ t('videoTask1'), t('videoTask2') ]
            },
            {
                id: "podcast",
                name: t('podcast'),
                enabled: true,
                order: 3,
                checklistItems: [ t('podcastTask1'), t('podcastTask2') ]
            },
            {
                id: "course",
                name: t('course'),
                enabled: true,
                order: 4,
                checklistItems: [ t('courseTask1'), t('courseTask2') ]
            }
        ],
        sections: [
            {
                id: "general",
                name: t('section1'),
                order: 0
            },
            {
                id: "learning",
                name: t('section2'),
                order: 1
            },
            {
                id: "work",
                name: t('section3'),
                order: 2
            }
        ],
        periodicTasks: {
            daily: {
                enabled: true,
                tasks: [ t('periodicTasksDaily1'), t('periodicTasksDaily2') ]
            },
            weekly: {
                enabled: true,
                tasks: [ t('periodicTasksWeekly1'), t('periodicTasksWeekly2') ]
            },
            monthly: {
                enabled: true,
                tasks: [ t('periodicTasksMonthly1') ]
            },
            quarterly: {
                enabled: true,
                tasks: [ t('periodicTasksQuarterly1') ]
            },
            yearly: {
                enabled: true,
                tasks: [ t('periodicTasksYearly1') ]
            }
        }
    };
}

const isRussian = true;
export const DEFAULT_SETTINGS = getDefaultSettings();
