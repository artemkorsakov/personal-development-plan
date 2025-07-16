import { getLanguage } from 'obsidian';

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
    materialTypes: MaterialType[];
    sections: Section[];
    periodicTasks: PeriodicTaskSettings;
}

// Helper function to get localized strings
export function getLocalizedStrings(isRussian: boolean) {
    return {
        settingsTitle: isRussian ? 'Настройки системы' : 'System Settings',
        generalSettings: isRussian ? 'Общие настройки' : 'General Settings',
        materialTypes: isRussian ? 'Типы материалов' : 'Learning Materials',
        sectionsCategories: isRussian ? 'Разделы и категории' : 'Sections and Categories',
        periodicTasks: isRussian ? 'Периодические задачи' : 'Periodic Tasks',
        maxActiveTasks: isRussian ? 'Максимум активных задач' : 'Maximum active tasks',
        maxActiveTasksDesc: isRussian ? 'Настройте максимально количество задач "В работе"' : 'Set maximum number of "In Progress" tasks',
        statsStartDate: isRussian ? 'Начало отсчета статистики' : 'Statistics start date',
        statsStartDateDesc: isRussian ? 'Укажите дату, с которой собирать данные' : 'Specify date to start collecting data from',
        newType: isRussian ? '+ Новый тип' : '+ New Type',
        newSection: isRussian ? '+ Новый раздел' : '+ New Section',
        daily: isRussian ? 'Ежедневно' : 'Daily',
        weekly: isRussian ? 'Еженедельно' : 'Weekly',
        monthly: isRussian ? 'Ежемесячно' : 'Monthly',
        quarterly: isRussian ? 'Ежеквартально' : 'Quarterly',
        yearly: isRussian ? 'Ежегодно' : 'Yearly',
        checklistItem: isRussian ? 'Пункт плана' : 'Checklist item',
        addItem: isRussian ? '+ Пункт' : '+ Item',
        sectionName: isRussian ? 'Название раздела' : 'Section name',
        typeName: isRussian ? 'Название типа' : 'Type name',
        dailyTask: isRussian ? 'Ежедневная задача' : 'Daily task',
        weeklyTask: isRussian ? 'Еженедельная задача' : 'Weekly task',
        monthlyTask: isRussian ? 'Ежемесячная задача' : 'Monthly task',
        quarterlyTask: isRussian ? 'Ежеквартальная задача' : 'Quarterly task',
        yearlyTask: isRussian ? 'Ежегодная задача' : 'Yearly task',
        addTask: isRussian ? '+ Задача' : '+ Task',
    };
}

// Helper function to get localized default settings
function getDefaultSettings(isRussian: boolean): PersonalDevelopmentPlanSettings {
    return {
        maxActiveTasks: 5,
        statsStartDate: new Date().toISOString().split('T')[0],
        materialTypes: [
            {
                id: "book",
                name: isRussian ? "Книга" : "Book",
                enabled: true,
                order: 0,
                checklistItems: isRussian ?
                    ["Прочитать", "Конспектировать"] :
                    ["Read", "Take notes"]
            },
            {
                id: "article",
                name: isRussian ? "Статья" : "Article",
                enabled: true,
                order: 1,
                checklistItems: isRussian ?
                    ["Прочитать", "Выписать цитаты"] :
                    ["Read", "Extract quotes"]
            },
            {
                id: "video",
                name: isRussian ? "Видео" : "Video",
                enabled: true,
                order: 2,
                checklistItems: isRussian ?
                    ["Посмотреть", "Конспектировать"] :
                    ["Watch", "Take notes"]
            },
            {
                id: "podcast",
                name: isRussian ? "Подкаст" : "Podcast",
                enabled: true,
                order: 3,
                checklistItems: isRussian ?
                    ["Прослушать", "Конспектировать"] :
                    ["Listen", "Take notes"]
            },
            {
                id: "course",
                name: isRussian ? "Курс" : "Course",
                enabled: true,
                order: 4,
                checklistItems: isRussian ?
                    ["Пройти урок", "Выполнить задания"] :
                    ["Complete lesson", "Do assignments"]
            }
        ],
        sections: [
            {
                id: "general",
                name: isRussian ? "Общие" : "General",
                order: 0
            },
            {
                id: "learning",
                name: isRussian ? "Обучение" : "Learning",
                order: 1
            },
            {
                id: "work",
                name: isRussian ? "Работа" : "Work",
                order: 2
            }
        ],
        periodicTasks: {
            daily: {
                enabled: true,
                tasks: isRussian ?
                    ["Утренний обзор почты", "Прочитать главу из книги"] :
                    ["Morning email review", "Read a book chapter"]
            },
            weekly: {
                enabled: true,
                tasks: isRussian ?
                    ["Решить задачу на Project Euler", "Прослушать подкаст Culips"] :
                    ["Solve Project Euler problem", "Listen to Culips podcast"]
            },
            monthly: {
                enabled: true,
                tasks: isRussian ?
                    ["Посмотреть видео с доклада ScalaConf"] :
                    ["Watch ScalaConf talk video"]
            },
            quarterly: {
                enabled: true,
                tasks: isRussian ?
                    ["Добавить в Базу знаний книги, рекомендованные на ScalaConf"] :
                    ["Add ScalaConf recommended books to Knowledge Base"]
            },
            yearly: {
                enabled: true,
                tasks: isRussian ?
                    ["Закончить курс Продвинутая Scala"] :
                    ["Complete Advanced Scala course"]
            }
        }
    };
}

const isRussian = getLanguage() === 'ru';
export const DEFAULT_SETTINGS = getDefaultSettings(isRussian);
