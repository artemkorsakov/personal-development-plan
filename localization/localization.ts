import { getLanguage } from 'obsidian';

export interface TranslationKeys {
    // Основной интерфейс
    plan: string;
    openPlan: string;
    inProgress: string;
    inProgressTooltip: string;
    maxActiveTasksWarning: string;
    inProgressStartDate: string;
    inProgressDueDate: string;
    inProgressOverdue: string;
    planned: string;
    plannedTooltip: string;
    unknownType: string;
    unknownSection: string;
    noTasksForThisType: string;
    knowledgeBase: string;
    knowledgeBaseTooltip: string;
    knowledgeBaseName: string;
    knowledgeBaseType: string;
    knowledgeBaseSection: string;

    // Экспорт и источники
    exportToJSON: string;
    exportToJSONTooltip: string;
    sources: string;
    sourcesTooltip: string;
    sourceItemsList: string;
    sourceItemsExample: string;

    // Статистика и история
    statistics: string;
    statisticsTooltip: string;
    history: string;
    historyTooltip: string;
    examples: string;
    examplesTooltip: string;

    // Настройки
    settingsTitle: string;
    generalSettings: string;
    materialTypes: string;
    sectionsCategories: string;
    periodicTasks: string;
    folderPath: string;
    folderPathDesc: string;
    maxActiveTasks: string;
    maxActiveTasksDesc: string;
    statsStartDate: string;
    statsStartDateDesc: string;

    // Управление элементами
    addNewType: string;
    newType: string;
    addNewSection: string;
    newSection: string;
    checklistItem: string;
    addItem: string;
    sectionName: string;
    typeName: string;
    addTask: string;
    moveUp: string;
    moveDown: string;
    deleteItem: string;
    enableDisable: string;

    // Периодические задачи
    daily: string;
    weekly: string;
    monthly: string;
    quarterly: string;
    yearly: string;
    dailyTask: string;
    weeklyTask: string;
    monthlyTask: string;
    quarterlyTask: string;
    yearlyTask: string;

    // Типы материалов по умолчанию
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

    // Разделы по умолчанию
    section1: string;
    section2: string;
    section3: string;

    // Периодические задачи по умолчанию
    periodicTasksDaily1: string;
    periodicTasksDaily2: string;
    periodicTasksWeekly1: string;
    periodicTasksWeekly2: string;
    periodicTasksMonthly1: string;
    periodicTasksQuarterly1: string;
    periodicTasksYearly1: string;

    // Создание задач
    createNewTask: string;
    fillRequiredFields: string;
    invalidSectionOrType: string;
    taskType: string;
    invalidTaskType: string;
    taskCreationError: string;
    selectTaskType: string;
    untitledTask: string;
    taskLabel: string;
    taskDefaultDescription: string;
    checklist: string;
    create: string;
    cancel: string;

    // Ошибки файловой системы
    fileCreationError: string;
    fileReadError: string;
    folderCreationError: string;
    taskCreatedSuccessfully: string;

    // Метаданные материалов
    authors: string;
    authorsPlaceholder: string;
    bookName: string;
    bookNamePlaceholder: string;
    pages: string;
    pagesPlaceholder: string;
    section: string;
    bookContentHeader: string;
    sourcesDefaultContent: string;
    articleTitle: string;
    articleTitlePlaceholder: string;
    articleUrl: string;
    notes: string;
    addYourThoughts: string;

    // Дополнительные
    openSourceError: string;
    recommendedResources: string;
    findAndAddResources: string;
    personalNotes: string;
    exportSuccess: string;
    exportError: string;

    // Группы настроек
    taskLimit: string;
    startTrackingDate: string;
    customFolder: string;
    materialTypeSettings: string;
    sectionSettings: string;
    taskSettings: string;
}

const translations: Record<string, TranslationKeys> = {
    ru: {
        // Основной интерфейс
        plan: 'План развития',
        openPlan: 'Открыть план развития',
        inProgress: '🛠️ В работе',
        inProgressTooltip: 'Текущие задачи в работе',
        maxActiveTasksWarning: 'Слишком много задач в работе, верните часть из них в Очередь',
        inProgressStartDate: 'Дата начала',
        inProgressDueDate: 'Завершить до',
        inProgressOverdue: ' (Просрочено!)',
        planned: '⏳ Запланировано',
        plannedTooltip: 'Запланированные, но ещё не начатые задачи',
        unknownType: 'Неизвестный тип',
        unknownSection: 'Неизвестный раздел',
        noTasksForThisType: 'Нет задач для этого типа',
        knowledgeBase: '📚 База знаний',
        knowledgeBaseTooltip: 'Материалы для изучения, по которым пока не сформирован детализированный план',
        knowledgeBaseName: 'Наименование',
        knowledgeBaseType: 'Тип',
        knowledgeBaseSection: 'Раздел',

        // Экспорт и источники
        exportToJSON: 'Экспортировать в JSON',
        exportToJSONTooltip: 'Экспортировать базу знаний в JSON-файл, чтобы можно было поделиться с сообществом',
        sources: '🔍 Источник',
        sourcesTooltip: 'Ресурсы для пополнения Базы знаний',
        sourceItemsList: 'Список источников',
        sourceItemsExample: '- [ ] Пример источника 1\n- [ ] Пример источника 2',

        // Статистика и история
        statistics: '📊 Статистика',
        statisticsTooltip: 'Анализ прогресса по всем разделам',
        history: '🕰️ История',
        historyTooltip: 'Архив выполненных задач',
        examples: '📂 Примеры',
        examplesTooltip: 'Шаблоны планов от сообщества',

        // Настройки
        settingsTitle: 'Настройки системы',
        generalSettings: 'Общие настройки',
        materialTypes: 'Типы материалов',
        sectionsCategories: 'Разделы и категории',
        periodicTasks: 'Периодические задачи',
        folderPath: 'Путь к папке с задачами',
        folderPathDesc: 'Папка для хранения всех файлов плана развития (по умолчанию: PersonalDevelopmentPlan)',
        maxActiveTasks: 'Максимум активных задач',
        maxActiveTasksDesc: 'Максимальное количество одновременно выполняемых задач (1-10)',
        statsStartDate: 'Начало отсчёта статистики',
        statsStartDateDesc: 'Дата начала сбора данных (формат: ГГГГ-ММ-ДД)',

        // Управление элементами
        addNewType: '+ Новый тип',
        newType: 'Новый тип',
        addNewSection: '+ Новый раздел',
        newSection: 'Новый раздел',
        checklistItem: 'Элемент чек-листа',
        addItem: 'Добавить пункт',
        sectionName: 'Название раздела',
        typeName: 'Название типа',
        addTask: '+ Задача',
        moveUp: 'Вверх',
        moveDown: 'Вниз',
        deleteItem: 'Удалить',
        enableDisable: 'Вкл/Выкл',

        // Периодические задачи
        daily: 'Ежедневно',
        weekly: 'Еженедельно',
        monthly: 'Ежемесячно',
        quarterly: 'Ежеквартально',
        yearly: 'Ежегодно',
        dailyTask: 'Ежедневная задача (пример)',
        weeklyTask: 'Еженедельная задача (пример)',
        monthlyTask: 'Ежемесячная задача (пример)',
        quarterlyTask: 'Ежеквартальная задача (пример)',
        yearlyTask: 'Ежегодная задача (пример)',

        // Типы материалов по умолчанию
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

        // Разделы по умолчанию
        section1: 'Общие',
        section2: 'Обучение',
        section3: 'Работа',

        // Периодические задачи по умолчанию
        periodicTasksDaily1: 'Утренний обзор почты',
        periodicTasksDaily2: 'Прочитать главу из книги',
        periodicTasksWeekly1: 'Решить задачу на Project Euler',
        periodicTasksWeekly2: 'Прослушать подкаст Culips',
        periodicTasksMonthly1: 'Посмотреть видео с доклада ScalaConf',
        periodicTasksQuarterly1: 'Добавить в Базу знаний книги, рекомендованные на ScalaConf',
        periodicTasksYearly1: 'Закончить курс Продвинутая Scala',

        // Создание задач
        createNewTask: 'Создать задачу',
        fillRequiredFields: 'Заполните обязательные поля',
        invalidSectionOrType: 'Неверно указан раздел или тип',
        taskType: 'Тип задачи',
        invalidTaskType: 'Неверно указан тип задачи',
        taskCreationError: 'Ошибка создания задачи',
        selectTaskType: 'Выберите тип задачи',
        untitledTask: 'Без названия',
        taskLabel: 'Информация',
        taskDefaultDescription: 'Описание задачи',
        checklist: 'План выполнения',
        create: 'Создать',
        cancel: 'Отмена',

        // Ошибки файловой системы
        fileCreationError: 'Ошибка создания файла',
        fileReadError: 'Ошибка чтения файла',
        folderCreationError: 'Ошибка создания папки',
        taskCreatedSuccessfully: 'Задача успешно создана',

        // Метаданные материалов
        authors: 'Автор(ы)',
        authorsPlaceholder: 'Введите авторов через запятую',
        bookName: 'Название книги',
        bookNamePlaceholder: 'Введите название книги',
        pages: 'Страниц',
        pagesPlaceholder: 'Введите количество страниц',
        section: 'Раздел',
        bookContentHeader: '## Описание\n\nКраткое описание содержания и цели чтения\n\n## Прогресс выполнения\n\n',
        sourcesDefaultContent: '- [ ] Пример источника 1\n- [ ] Пример источника 2',
        articleTitle: 'Название статьи',
        articleTitlePlaceholder: 'Введите название статьи',
        articleUrl: 'Ссылка на статью',
        notes: 'Заметки',
        addYourThoughts: 'Добавьте ваши мысли',

        // Дополнительные
        openSourceError: 'Ошибка открытия исходного кода',
        recommendedResources: 'Рекомендуемые ресурсы',
        findAndAddResources: 'Найдите и добавьте ресурсы',
        personalNotes: 'Личные заметки',
        exportSuccess: 'Экспорт успешно завершён',
        exportError: 'Ошибка экспорта',

        // Группы настроек
        taskLimit: 'Лимит задач',
        startTrackingDate: 'Начало отслеживания',
        customFolder: 'Пользовательская папка',
        materialTypeSettings: 'Настройки типов материалов',
        sectionSettings: 'Настройки разделов',
        taskSettings: 'Настройки задач'
    },
    en: {
        // Main interface
        plan: 'Development Plan',
        openPlan: 'Open Development Plan',
        inProgress: '🛠️ In Progress',
        inProgressTooltip: 'Current tasks in progress',
        maxActiveTasksWarning: 'Too many tasks in progress, return some to Planned',
        inProgressStartDate: 'Start Date',
        inProgressDueDate: 'Due Date',
        inProgressOverdue: ' (Overdue!)',
        planned: '⏳ Planned',
        plannedTooltip: 'Planned, but not yet started tasks',
        unknownType: 'Unknown Type',
        unknownSection: 'Unknown Section',
        noTasksForThisType: 'No tasks for this type',
        knowledgeBase: '📚 Knowledge Base',
        knowledgeBaseTooltip: 'Materials for learning, which are not yet detailed',
        knowledgeBaseName: 'Name',
        knowledgeBaseType: 'Type',
        knowledgeBaseSection: 'Section',

        // Export and sources
        exportToJSON: 'Export to JSON',
        exportToJSONTooltip: 'Export the Knowledge Base to a JSON file to share with the community',
        sources: '🔍 Sources',
        sourcesTooltip: 'Resources for filling the Knowledge Base',
        sourceItemsList: 'Source Items',
        sourceItemsExample: '- [ ] Example Source 1\n- [ ] Example Source 2',

        // Statistics and history
        statistics: '📊 Statistics',
        statisticsTooltip: 'Progress analysis by sections',
        history: '🕰️ History',
        historyTooltip: 'Archive of completed tasks',
        examples: '📂 Examples',
        examplesTooltip: 'Development plans from the community',

        // Settings
        settingsTitle: 'System Settings',
        generalSettings: 'General Settings',
        materialTypes: 'Material Types',
        sectionsCategories: 'Sections and Categories',
        periodicTasks: 'Periodic Tasks',
        folderPath: 'Folder Path',
        folderPathDesc: 'Folder to store all development plan files (default: PersonalDevelopmentPlan)',
        maxActiveTasks: 'Max Active Tasks',
        maxActiveTasksDesc: 'Maximum number of simultaneously active tasks (1-10)',
        statsStartDate: 'Statistics Start Date',
        statsStartDateDesc: 'Start date for statistics collection (format: YYYY-MM-DD)',

        // Item management
        addNewType: '+ New Type',
        newType: 'New Type',
        addNewSection: '+ New Section',
        newSection: 'New Section',
        checklistItem: 'Checklist Item',
        addItem: 'Add Item',
        sectionName: 'Section Name',
        typeName: 'Type Name',
        addTask: '+ Task',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
        deleteItem: 'Delete',
        enableDisable: 'Enable/Disable',

        // Periodic tasks
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly',
        dailyTask: 'Daily Task (example)',
        weeklyTask: 'Weekly Task (example)',
        monthlyTask: 'Monthly Task (example)',
        quarterlyTask: 'Quarterly Task (example)',
        yearlyTask: 'Yearly Task (example)',

        // Default material types
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

        // Default sections
        section1: 'General',
        section2: 'Learning',
        section3: 'Work',

        // Default periodic tasks
        periodicTasksDaily1: 'Morning email review',
        periodicTasksDaily2: 'Read a book chapter',
        periodicTasksWeekly1: 'Solve Project Euler problem',
        periodicTasksWeekly2: 'Listen to Culips podcast',
        periodicTasksMonthly1: 'Watch ScalaConf talk video',
        periodicTasksQuarterly1: 'Add ScalaConf recommended books to Knowledge Base',
        periodicTasksYearly1: 'Complete Advanced Scala course',

        // Task creation
        createNewTask: 'Create Task',
        fillRequiredFields: 'Fill in required fields',
        invalidSectionOrType: 'Invalid section or type',
        taskType: 'Task Type',
        invalidTaskType: 'Invalid task type',
        taskCreationError: 'Task creation error',
        selectTaskType: 'Select Task Type',
        untitledTask: 'Untitled Task',
        taskLabel: 'Information',
        taskDefaultDescription: 'Task description',
        checklist: 'Checklist',
        create: 'Create',
        cancel: 'Cancel',

        // Filesystem errors
        fileCreationError: 'File creation error',
        fileReadError: 'File read error',
        folderCreationError: 'Folder creation error',
        taskCreatedSuccessfully: 'Task created successfully',

        // Material metadata
        authors: 'Authors',
        authorsPlaceholder: 'Enter authors separated by commas',
        bookName: 'Book Name',
        bookNamePlaceholder: 'Enter book name',
        pages: 'Pages',
        pagesPlaceholder: 'Enter number of pages',
        section: 'Section',
        bookContentHeader: '## Description\n\nBrief description of the book content and reading goals\n\n## Progress\n\n',
        sourcesDefaultContent: '- [ ] Example Source 1\n- [ ] Example Source 2',
        articleTitle: 'Article Title',
        articleTitlePlaceholder: 'Enter article title',
        articleUrl: 'Article URL',
        notes: 'Notes',
        addYourThoughts: 'Add your thoughts',

        // Additional
        openSourceError: 'Error opening source code',
        recommendedResources: 'Recommended Resources',
        findAndAddResources: 'Find and add resources',
        personalNotes: 'Personal Notes',
        exportSuccess: 'Export successful',
        exportError: 'Export error',

        // Settings groups
        taskLimit: 'Task Limit',
        startTrackingDate: 'Start Tracking Date',
        customFolder: 'Custom Folder',
        materialTypeSettings: 'Material Types Settings',
        sectionSettings: 'Sections Settings',
        taskSettings: 'Tasks Settings'
    }
};

const DEFAULT_LANGUAGE = 'en';

const translationCache = new Map<string, string>();

export function t(key: keyof TranslationKeys): string {
    const cacheKey = `${getLanguage()}:${key}`;

    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    try {
        const lang = getLanguage();
        const translation = translations[lang]?.[key] ?? translations[DEFAULT_LANGUAGE][key];
        translationCache.set(cacheKey, translation);
        return translation;
    } catch {
        return translations[DEFAULT_LANGUAGE][key];
    }
}
