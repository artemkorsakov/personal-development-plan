import { App, MetadataCache, Vault, TFile, Notice } from 'obsidian';
import { getActiveTasks, getTaskTypeIcon, isTaskOverdue } from '../../utils/taskUtils';
import { formatDate, calculateDaysBetween, parseDateInput } from '../../utils/dateUtils';
import { KnowledgeItem, PlannedTask, TaskInProgress } from '../tabs-types';
import { openTaskFile, openOrCreateSourceFile } from '../../utils/fileUtils';
import { generateProgressBar, calculateTaskProgress } from '../../utils/progressUtils';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings, getMaterialIdByName } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { CompleteTaskModal } from '../modals/CompleteTaskModal';
import { PostponeTaskModal } from '../modals/PostponeTaskModal';
import { PeriodicTasks } from './PeriodicTasks';

export default class InProgressTab {
    private static app: App;
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;
    private static metadataCache: MetadataCache;
    private static container: HTMLElement;
    private static periodicTasksInstance: PeriodicTasks;

    static async create(
        app: App,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: MetadataCache
    ): Promise<HTMLElement> {
        this.app = app;
        this.settings = settings;
        this.vault = vault;
        this.metadataCache = metadataCache;

        this.container = createDiv();
        this.container.addClass('tasks-container');

        this.createHeader(this.container);
        await this.updateTasksList();

        return this.container;
    }

    private static async updateTasksList() {
        const activeTasks = await getActiveTasks(this.vault, this.settings, this.metadataCache);
        const maxTasks = this.settings.maxActiveTasks || 10;

        const contentContainer = this.container.querySelector('.tasks-content') as HTMLElement ||
            this.container.createDiv({ cls: 'tasks-content' });
        contentContainer.empty();

        if (activeTasks.length > maxTasks) {
            const warningDiv = contentContainer.createDiv({ cls: 'task-warning' });
            warningDiv.textContent = `${t('maxActiveTasksWarning')} (${activeTasks.length} > ${maxTasks})`;
        }

        activeTasks.sort((a, b) => {
            const dateA = parseDateInput(a.dueDate)?.getTime() || 0;
            const dateB = parseDateInput(b.dueDate)?.getTime() || 0;
            return dateA === dateB ? (a.order || 0) - (b.order || 0) : dateA - dateB;
        });

        // Рендер обычных задач
        activeTasks.forEach(task => this.createTaskCard(contentContainer, task));

        // Добавляем карточку периодических задач
        this.createPeriodicTasksCard(contentContainer);
    }

    private static createPeriodicTasksCard(container: HTMLElement) {
        try {
            if (!this.periodicTasksInstance) {
                this.periodicTasksInstance = new PeriodicTasks(this.app, this.settings, this.vault);
            } else {
                this.periodicTasksInstance.updateSettings(this.settings);
            }

            this.periodicTasksInstance.createPeriodicTasksCard(container);
        } catch (error) {
            console.error('Error creating periodic tasks card:', error);
            const errorCard = container.createDiv({ cls: 'task-card error-card' });
            errorCard.createSpan({ text: t('errorCreatingPeriodicFile') });
        }
    }

    private static createTaskCard(container: HTMLElement, task: TaskInProgress) {
        const taskCard = container.createDiv({ cls: 'task-card' });
        if (isTaskOverdue(task)) {
            taskCard.addClass('task-overdue');
        }

        const cardContent = taskCard.createDiv({ cls: 'task-card-content' });
        cardContent.onclick = () => openTaskFile(task.filePath, this.vault, this.app.workspace);

        // Заголовок и тип задачи
        const firstLine = cardContent.createDiv({ cls: 'task-first-line' });
        const typeIcon = getTaskTypeIcon(getMaterialIdByName(this.settings.materialTypes, task.type))
        firstLine.createSpan({
            cls: 'task-type-icon',
            text: `${typeIcon} ${task.type}:`
        });
        firstLine.createSpan({ cls: 'task-name', text: task.name });
        firstLine.createSpan({ cls: 'task-section', text: `[${task.section}]` });

        // Даты
        const datesDiv = cardContent.createDiv({ cls: 'task-dates' });
        datesDiv.createSpan({ cls: 'task-date', text: `${t('inProgressStartDate')}: ${formatDate(task.startDate)}` });

        const dueDateSpan = datesDiv.createSpan({
            cls: isTaskOverdue(task) ? 'task-date overdue' : 'task-date',
            text: `${t('inProgressDueDate')}: ${formatDate(task.dueDate)}${isTaskOverdue(task) ? t('inProgressOverdue') : ''}`
        });

        // Прогресс
        const progressContainer = cardContent.createDiv({ cls: 'task-progress-line' });
        progressContainer.createSpan({
            cls: 'task-progress-bar',
            text: `${generateProgressBar(task.progress)} ${task.progress}%`
        });

        // Кнопки действий
        this.createActionButtons(taskCard, task);
    }

    private static createActionButtons(container: HTMLElement, task: TaskInProgress) {
        const actionsContainer = container.createDiv({ cls: 'task-actions' });

        // Кнопка "Выполнить"
        const completeBtn = actionsContainer.createEl('button', {
            cls: 'task-action-btn complete-btn',
            text: t('completeTask')
        });
        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleCompleteTask(task);
        });

        // Кнопка "Отложить"
        const postponeBtn = actionsContainer.createEl('button', {
            cls: 'task-action-btn postpone-btn',
            text: t('postponeTask')
        });
        postponeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handlePostponeTask(task);
        });

        // Кнопка "Удалить"
        const deleteBtn = actionsContainer.createEl('button', {
            cls: 'task-action-btn delete-btn',
            text: t('delete')
        });
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDeleteTask(task);
        });
    }

    private static async handleCompleteTask(task: TaskInProgress) {
        const modal = new CompleteTaskModal(this.app);
        modal.open();
        const result = await modal.waitForClose();

        if (result) {
            try {
                await this.saveToHistory(task, result);
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
                    await this.app.fileManager.trashFile(file);
                }
                new Notice(t('taskCompletedSuccessfully'));
                await this.updateTasksList();
            } catch (error) {
                console.error('Error completing task:', error);
                new Notice(t('errorCompletingTask'));
            }
        }
    }

    private static async saveToHistory(task: TaskInProgress, result: any) {
        const historyFolder = this.settings.historyFolderPath;
        const historyFilePath = `${historyFolder}/completed_tasks.json`;

        try {
            await this.app.vault.createFolder(historyFolder).catch(() => {});

            let historyData: any[] = [];
            const abstractFile = this.app.vault.getAbstractFileByPath(historyFilePath);

            if (abstractFile) {
                if (!(abstractFile instanceof TFile)) {
                    throw new Error(`History path exists but is not a file: ${historyFilePath}`);
                }

                try {
                    const content = await this.app.vault.read(abstractFile);
                    historyData = JSON.parse(content);
                    if (!Array.isArray(historyData)) {
                        historyData = [];
                    }
                } catch (readError) {
                    console.error("Failed to read history file, creating new", readError);
                    historyData = [];
                }
            }

            const completedTask = {
                type: task.type,
                title: task.name,
                startDate: task.startDate,
                completionDate: result.completionDate,
                workingDays: calculateDaysBetween(task.startDate, result.completionDate) + 1,
                rating: result.rating,
                review: result.review,
                completedAt: new Date().toISOString(),
                section: task.section,
                pages: task.pages,
                laborInputInHours: task.laborInputInHours,
                durationInMinutes: task.durationInMinutes
            };

            historyData.push(completedTask);

            const fileToWrite = abstractFile instanceof TFile
                ? abstractFile
                : await this.app.vault.create(historyFilePath, JSON.stringify([], null, 2));

            await this.app.vault.process(fileToWrite, (currentContent: string) => JSON.stringify(historyData, null, 2));

        } catch (error) {
            console.error(t('errorLoadingHistory'), error);
            new Notice(`Failed to save task history: ${error.message}`);
            throw error;
        }
    }

    private static async handlePostponeTask(task: TaskInProgress) {
        const modal = new PostponeTaskModal(this.app);
        modal.open();
        const confirmed = await modal.waitForClose();

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file && file instanceof TFile) {
                    let content = await this.app.vault.read(file);
                    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
                    const match = content.match(frontmatterRegex);

                    if (match) {
                        let frontmatter = match[1];

                        frontmatter = frontmatter
                            .replace(/status:.*(\n|$)/g, '')
                            .replace(/startDate:.*(\n|$)/g, '')
                            .replace(/dueDate:.*(\n|$)/g, '');

                        frontmatter = frontmatter.replace(/\n+$/, '');

                        if (frontmatter.length > 0 && !frontmatter.endsWith('\n')) {
                            frontmatter += '\n';
                        }

                        frontmatter += `status: planned\n`;

                        if (!frontmatter.endsWith('\n')) {
                            frontmatter += '\n';
                        }

                        await this.app.vault.process(file, (currentContent: string) => currentContent.replace(frontmatterRegex, `---\n${frontmatter}---`));
                        new Notice(t('taskPostponedSuccessfully'));
                        await this.updateTasksList();
                    }
                }
            } catch (error) {
                console.error('Error postponing task:', error);
                new Notice(t('errorPostponingTask'));
            }
        }
    }

    private static async handleDeleteTask(task: TaskInProgress) {
        const modal = new ConfirmDeleteModal(this.app, task.name);
        modal.open();
        const confirmed = await modal.waitForClose();

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
                    await this.app.fileManager.trashFile(file);
                    new Notice(t('taskDeletedSuccessfully'));
                    await this.updateTasksList();
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                new Notice(t('errorDeletingTask'));
            }
        }
    }

    private static createHeader(container: HTMLElement) {
        const header = container.createDiv({ cls: 'tasks-header' });

        const createBtn = header.createEl('button', {
            cls: 'task-create-btn',
            text: t('createNewTask')
        });

        createBtn.addEventListener('click', () => {
            const modal = new CreateTaskModal(
                this.app,
                this.settings,
                'in-progress',
                async (success) => {
                    if (success) {
                        await this.updateTasksList();
                    }
                }
            );
            modal.open();
        });
    }

    static async refresh(): Promise<void> {
        await this.updateTasksList();
    }
}
