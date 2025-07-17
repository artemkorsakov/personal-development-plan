import { getLanguage } from 'obsidian';

interface TranslationKeys {
    plan: string;
    openPlan: string;
    inProgress: string;
    planned: string;
    knowledgeBase: string;
    sources: string;
    statistics: string;
    history: string;
    examples: string;
    // Settings
    settingsTitle: string;
    generalSettings: string;
    materialTypes: string;
    sectionsCategories: string;
    periodicTasks: string;
    maxActiveTasks: string;
    maxActiveTasksDesc: string;
    statsStartDate: string;
    statsStartDateDesc: string;
    addNewType: string;
    newType: string;
    addNewSection: string;
    newSection: string;
    daily: string;
    weekly: string;
    monthly: string;
    quarterly: string;
    yearly: string;
    checklistItem: string;
    addItem: string;
    sectionName: string;
    typeName: string;
    dailyTask: string;
    weeklyTask: string;
    monthlyTask: string;
    quarterlyTask: string;
    yearlyTask: string;
    addTask: string;
    // Default settings
    book: string;
    bookTask1: string;
    bookTask2: string;
    article: string;
    articleTask1: string;
    articleTask2: string;
    video: string;
    videoTask1: string;
    videoTask2: string;
    podcast: string;
    podcastTask1: string;
    podcastTask2: string;
    course: string;
    courseTask1: string;
    courseTask2: string;
    section1: string;
    section2: string;
    section3: string;
    periodicTasksDaily1: string;
    periodicTasksDaily2: string;
    periodicTasksWeekly1: string;
    periodicTasksWeekly2: string;
    periodicTasksMonthly1: string;
    periodicTasksQuarterly1: string;
    periodicTasksYearly1: string;
}

const translations: Record<string, TranslationKeys> = {
    ru: {
        plan: 'План развития',
        openPlan: 'Открыть план развития',
        inProgress: 'В работе',
        planned: 'Запланировано',
        knowledgeBase: 'База знаний',
        sources: 'Источник',
        statistics: 'Статистика',
        history: 'История',
        examples: 'Примеры',
        settingsTitle: 'Настройки системы',
        generalSettings: 'Общие настройки',
        materialTypes: 'Типы материалов',
        sectionsCategories: 'Разделы и категории',
        periodicTasks: 'Периодические задачи',
        maxActiveTasks: 'Максимум активных задач',
        maxActiveTasksDesc: 'Максимальное количество задач "В работе"',
        statsStartDate: 'Начало отсчёта статистики',
        statsStartDateDesc: 'Дата начала сбора данных',
        addNewType: '+ Новый тип',
        newType: 'Новый тип',
        addNewSection: '+ Новый раздел',
        newSection: 'Новый раздел',
        daily: 'Ежедневно',
        weekly: 'Еженедельно',
        monthly: 'Ежемесячно',
        quarterly: 'Ежеквартально',
        yearly: 'Ежегодно',
        checklistItem: 'Пункт плана',
        addItem: '+ Пункт',
        sectionName: 'Название раздела',
        typeName: 'Название типа',
        dailyTask: 'Ежедневная задача',
        weeklyTask: 'Еженедельная задача',
        monthlyTask: 'Ежемесячная задача',
        quarterlyTask: 'Ежеквартальная задача',
        yearlyTask: 'Ежегодная задача',
        addTask: '+ Задача',
        book: 'Книга',
        bookTask1: 'Прочитать книгу',
        bookTask2: 'Конспектировать',
        article: 'Статья',
        articleTask1: 'Прочитать',
        articleTask2: 'Выписать цитаты',
        video: 'Видео',
        videoTask1: 'Посмотреть',
        videoTask2: 'Конспектировать',
        podcast: 'Подкаст',
        podcastTask1: 'Прослушать',
        podcastTask2: 'Конспектировать',
        course: 'Курс',
        courseTask1: 'Пройти урок',
        courseTask2: 'Выполнить задания',
        section1: 'Общие',
        section2: 'Обучение',
        section3: 'Работа',
        periodicTasksDaily1: 'Утренний обзор почты',
        periodicTasksDaily2: 'Прочитать главу из книги',
        periodicTasksWeekly1: 'Решить задачу на Project Euler',
        periodicTasksWeekly2: 'Прослушать подкаст Culips',
        periodicTasksMonthly1: 'Посмотреть видео с доклада ScalaConf',
        periodicTasksQuarterly1: 'Добавить в Базу знаний книги, рекомендованные на ScalaConf',
        periodicTasksYearly1: 'Закончить курс Продвинутая Scala',
    },
    en: {
        plan: 'Development Plan',
        openPlan: 'Open Development Plan',
        inProgress: 'In Progress',
        planned: 'Planned',
        knowledgeBase: 'Knowledge Base',
        sources: 'Sources',
        statistics: 'Statistics',
        history: 'History',
        examples: 'Examples',
        settingsTitle: 'System Settings',
        generalSettings: 'General Settings',
        materialTypes: 'Material Types',
        sectionsCategories: 'Sections and Categories',
        periodicTasks: 'Periodic Tasks',
        maxActiveTasks: 'Max Active Tasks',
        maxActiveTasksDesc: 'Maximum number of "In Progress" tasks',
        statsStartDate: 'Statistics Start Date',
        statsStartDateDesc: 'Data collection start date',
        addNewType: '+ New Type',
        newType: 'New Type',
        addNewSection: '+ New Section',
        newSection: 'New Section',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly',
        checklistItem: 'Checklist Item',
        addItem: '+ Item',
        sectionName: 'Section Name',
        typeName: 'Type Name',
        dailyTask: 'Daily Task',
        weeklyTask: 'Weekly Task',
        monthlyTask: 'Monthly Task',
        quarterlyTask: 'Quarterly Task',
        yearlyTask: 'Yearly Task',
        addTask: '+ Task',
        book: 'Book',
        bookTask1: 'Read book',
        bookTask2: 'Take notes',
        article: 'Article',
        articleTask1: 'Read',
        articleTask2: 'Extract quotes',
        video: 'Video',
        videoTask1: 'Watch',
        videoTask2: 'Take notes',
        podcast: 'Podcast',
        podcastTask1: 'Listen',
        podcastTask2: 'Take notes',
        course: 'Course',
        courseTask1: 'Complete lesson',
        courseTask2: 'Do assignments',
        section1: 'General',
        section2: 'Learning',
        section3: 'Work',
        periodicTasksDaily1: 'Morning email review',
        periodicTasksDaily2: 'Read a book chapter',
        periodicTasksWeekly1: 'Solve Project Euler problem',
        periodicTasksWeekly2: 'Listen to Culips podcast',
        periodicTasksMonthly1: 'Watch ScalaConf talk video',
        periodicTasksQuarterly1: 'Add ScalaConf recommended books to Knowledge Base',
        periodicTasksYearly1: 'Complete Advanced Scala course',
    }
};

const DEFAULT_LANGUAGE = 'en';

export function t(key: keyof TranslationKeys): string {
    try {
        const lang = getLanguage();
        return translations[lang]?.[key] ?? translations[DEFAULT_LANGUAGE][key];
    } catch {
        return translations[DEFAULT_LANGUAGE][key];
    }
}

const SETTINGS_KEYS: (keyof TranslationKeys)[] = [
    'settingsTitle', 'generalSettings', 'materialTypes', 'sectionsCategories',
    'periodicTasks', 'maxActiveTasks', 'maxActiveTasksDesc', 'statsStartDate',
    'statsStartDateDesc', 'addNewType', 'newType', 'addNewSection', 'newSection',
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'checklistItem',
    'addItem', 'sectionName', 'typeName', 'dailyTask', 'weeklyTask',
    'monthlyTask', 'quarterlyTask', 'yearlyTask', 'addTask'
];

export function getLocalizedSettings() {
    return Object.fromEntries(
        SETTINGS_KEYS.map(key => [key, t(key)])
    ) as { [K in typeof SETTINGS_KEYS[number]]: string };
}
