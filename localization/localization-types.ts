export interface TranslationKeys {
    // Main interface
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

    // Export and sources
    exportToJSON: string;
    exportToJSONTooltip: string;
    sources: string;
    sourcesTooltip: string;
    sourceItemsList: string;
    sourceItemsExample: string;

    // Statistics and history
    statistics: string;
    statisticsTooltip: string;
    history: string;
    historyTooltip: string;
    examples: string;
    examplesTooltip: string;

    // Settings
    settingsTitle: string;
    generalSettings: string;
    materialTypes: string;
    sectionsCategories: string;
    folderPath: string;
    folderPathDesc: string;
    historyFolderPath: string;
    historyFolderPathDesc: string;
    moveToHistory: string;
    moveToHistoryDesc: string;
    maxActiveTasks: string;
    maxActiveTasksDesc: string;
    statsStartDate: string;
    statsStartDateDesc: string;
    cantDeleteTheLast: string;

    // Item management
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

    // Periodic tasks
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
    periodicTasks: string;
    errorCreatingPeriodicFile: string;
    oneTimeTasks: string;
    oneTimeTasksExample: string;
    dailyTasks: string;
    weeklyTasks: string;
    monthlyTasks: string;
    quarterlyTasks: string;
    yearlyTasks: string;
    week: string;
    month: string;
    quarter: string;
    quarter1: string;
    quarter2: string;
    quarter3: string;
    quarter4: string;
    year: string;

    // Default material types
    all: string;
    otherTypes: string;
    otherSections: string;
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

    // Default sections
    section1: string;
    section2: string;
    section3: string;

    // Default periodic tasks
    periodicTasksDaily1: string;
    periodicTasksDaily2: string;
    periodicTasksWeekly1: string;
    periodicTasksWeekly2: string;
    periodicTasksMonthly1: string;
    periodicTasksQuarterly1: string;
    periodicTasksYearly1: string;

    // Task creation
    createNewTask: string;
    fillRequiredFields: string;
    invalidSectionOrType: string;
    taskType: string;
    invalidTaskType: string;
    taskCreationError: string;
    selectTaskType: string;
    untitledTask: string;
    dontForgetToFillPlan: string;
    taskOrder: string;
    taskLabel: string;
    articleTitle: string;
    articleTitlePlaceholder: string;
    articleUrl: string;
    laborInputInHours: string;
    taskDefaultDescription: string;
    checklist: string;
    create: string;
    cancel: string;
    refreshFailed: string;
    shiftOrderForExistingTasks: string;
    shiftOrderTooltip: string;
    tasksReordered: string;
    reorderError: string;

    // New keys for task management
    actions: string;
    addToQueue: string;
    availableOrders: string;
    noTask: string;
    delete: string;
    planTask: string;
    startTask: string;
    taskPlannedSuccessfully: string;
    errorPlanningTask: string;
    confirmDeletion: string;
    confirmDeleteTask: string;
    taskStartedSuccessfully: string;
    taskDeletedSuccessfully: string;
    errorStartingTask: string;
    errorDeletingTask: string;
    dueDateBeforeStartError: string;
    dueDateInPastError: string;
    save: string;

    // In progress buttons
    completeTask: string;
    taskReview: string;
    taskReviewPlaceholder: string;
    taskRating: string;
    completionDate: string;
    complete: string;
    ratingPoor: string;
    ratingFair: string;
    ratingGood: string;
    ratingVeryGood: string;
    ratingExcellent: string;
    taskCompletedSuccessfully: string;
    errorCompletingTask: string;
    errorMovingToHistory: string;
    postponeTask: string;
    confirmPostponeTask: string;
    postpone: string;
    taskPostponedSuccessfully: string;
    errorPostponingTask: string;

    // File system
    fileCreationError: string;
    fileAlreadyExists: string;
    fileReadError: string;
    folderCreationError: string;
    taskCreatedSuccessfully: string;

    // Material details
    authors: string;
    authorsPlaceholder: string;
    bookName: string;
    bookNamePlaceholder: string;
    pages: string;
    pagesPlaceholder: string;
    section: string;
    bookContentHeader: string;
    videoTitle: string;
    videoTitlePlaceholder: string;
    videoUrl: string;
    podcastTitle: string;
    podcastTitlePlaceholder: string;
    podcastUrl: string;
    courseTitle: string;
    courseTitlePlaceholder: string;
    courseUrl: string;
    taskTitle: string;
    taskTitlePlaceholder: string;
    author: string;
    authorPlaceholder: string;
    platform: string;
    platformPlaceholder: string;
    durationInMinutes: string;
    episodes: string;
    notes: string;
    addYourThoughts: string;

    // Extra
    openSourceError: string;
    recommendedResources: string;
    findAndAddResources: string;
    personalNotes: string;
    exportSuccess: string;
    exportError: string;

    // Setting groups
    taskLimit: string;
    startTrackingDate: string;
    customFolder: string;
    materialTypeSettings: string;
    sectionSettings: string;
    taskSettings: string;

    // Statistics
    errorLoadingStatistics: string;
    generalStatistics: string;
    totalTasksInPlan: string;
    contentTypeStatistics: string;
    type: string;
    totalInPlan: string;
    completed: string;
    completedCount: string;
    completedTotal: string;
    remaining: string;
    remainingPages: string;
    remainingHours: string;
    sectionStatistics: string;
    noStatisticsAvailable: string;
    noSectionStatistics: string;
    noForecastDataAvailable: string;

    // Forecast
    forecastTitle: string;
    forecastMethodology: string;
    forecastVisualisation: string;
    forecastCompletion: string;
    forecastStartDate: string;
    booksForecastFormula: string;
    otherTypesForecastFormula: string;
    baseForecast: string;
    formula: string;
    weekForecast: string;
    monthForecast: string;
    yearForecast: string;
    noForecast: string;

    // History
    noCompletedTasks: string;
    errorLoadingHistory: string;
    historyFileNotFound: string;
    historyType: string;
    historyTitle: string;
    historyStartDate: string;
    historyCompletionDate: string;
    historyWorkingDays: string;
    historyRating: string;
    historyReview: string;

    // Export and Import
    noExamplePlansAvailable: string;
    planName: string;
    description: string;
    import: string;
    exampleImportedSuccessfully: string;
    errorImportingExample: string;
    importFromJSON: string;
    importStarted: string;
    importSuccess: string;
    importError: string;
    importReadError: string;
    invalidImportFile: string;
    tasksImported: string;
}

export interface ParametrizedTranslationParams {
    confirmDeleteTask: { taskName: string };
    freeOrderAfter: { order: string; taskName: string };
}

export type ParametrizedTranslations = {
    [K in keyof ParametrizedTranslationParams]: (params: ParametrizedTranslationParams[K]) => string;
};
