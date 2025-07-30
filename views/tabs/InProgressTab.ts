import { Vault, TFile, Notice } from 'obsidian';
import { getActiveTasks, getTaskTypeIcon, isTaskOverdue } from '../../utils/taskUtils';
import { formatDate, calculateDaysBetween, parseDateInput } from '../../utils/dateUtils';
import { openTaskFile } from '../../utils/fileUtils';
import { generateProgressBar } from '../../utils/progressUtils';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings, getMaterialNameById, getMaterialIdByName } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { CompleteTaskModal } from '../modals/CompleteTaskModal';
import { PostponeTaskModal } from '../modals/PostponeTaskModal';

export default class InProgressTab {
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;
    private static metadataCache: any;
    private static container: HTMLElement;

    static async create(
        app: any,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: any
    ): Promise<HTMLElement> {
        this.app = app;
        this.settings = settings;
        this.vault = vault;
        this.metadataCache = metadataCache;

        this.container = document.createElement('div');
        this.container.className = 'tasks-container';

        this.createHeader(this.container);
        await this.updateTasksList();

        return this.container;
    }

    private static async updateTasksList() {
        const activeTasks = await getActiveTasks(this.vault, this.settings, this.metadataCache);
        const maxTasks = this.settings.maxActiveTasks || 10;

        const contentContainer = this.container.querySelector('.tasks-content') ||
            this.container.createDiv({ cls: 'tasks-content' });
        contentContainer.empty();

        if (activeTasks.length > maxTasks) {
            const warningDiv = contentContainer.createDiv({ cls: 'task-warning' });
            warningDiv.textContent = `${t('maxActiveTasksWarning')} (${activeTasks.length} > ${maxTasks})`;
        }

        activeTasks.sort((a, b) => {
            // Сначала сортируем по дате выполнения
            const dateA = parseDateInput(a.dueDate)?.getTime() || 0;
            const dateB = parseDateInput(b.dueDate)?.getTime() || 0;

            // Если даты одинаковые, сортируем по order
            if (dateA === dateB) {
                return (a.order || 0) - (b.order || 0);
            }

            return dateA - dateB;
        });

        activeTasks.forEach(task => {
            const taskCard = contentContainer.createDiv({ cls: 'task-card' });

            const cardContent = taskCard.createDiv({ cls: 'task-card-content' });
            cardContent.onclick = () => openTaskFile(task.filePath, this.vault, this.app.workspace);

            const firstLine = cardContent.createDiv({ cls: 'task-first-line' });
            const typeIcon = getTaskTypeIcon(getMaterialIdByName(this.settings.materialTypes, task.type))
            firstLine.createSpan({
                cls: 'task-type-icon',
                text: `${typeIcon} ${task.type}:`
            });
            firstLine.createSpan({ cls: 'task-name', text: task.name });
            firstLine.createSpan({ cls: 'task-section', text: `[${task.section}]` });

            const datesDiv = cardContent.createDiv({ cls: 'task-dates' });
            datesDiv.createSpan({ text: `${t('inProgressStartDate')}: ${formatDate(task.startDate)}` });

            const dueDateSpan = datesDiv.createSpan({
                text: `${t('inProgressDueDate')}: ${formatDate(task.dueDate)}`
            });

            if (isTaskOverdue(task)) {
                dueDateSpan.style.color = 'var(--text-error)';
                dueDateSpan.style.fontWeight = 'bold';
                dueDateSpan.textContent += t('inProgressOverdue');
            }

            const progressContainer = cardContent.createDiv({ cls: 'task-progress-line' });
            progressContainer.createSpan({
                cls: 'task-progress-bar',
                text: `${generateProgressBar(task.progress)} ${task.progress}%`
            });

            // Добавляем кнопки действий
            const actionsContainer = taskCard.createDiv({ cls: 'task-actions' });

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
        });
    }

    private static async handleCompleteTask(task: any) {
        const modal = new CompleteTaskModal(this.app);
        modal.open();
        const result = await modal.waitForClose();

        if (result) {
            try {
                // 1. Сохраняем задачу в историю
                await this.saveToHistory(task, result);

                // 2. Удаляем исходный файл задачи
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
                    await this.app.vault.delete(file);
                }

                new Notice(t('taskCompletedSuccessfully'));
                await this.updateTasksList();
            } catch (error) {
                console.error('Error completing task:', error);
                new Notice(t('errorCompletingTask'));
            }
        }
    }

    private static async saveToHistory(task: any, result: any) {
        const historyFolder = this.settings.historyFolderPath;
        const historyFilePath = `${historyFolder}/completed_tasks.json`;

        // Создаем папку для истории, если ее нет
        try {
            await this.app.vault.createFolder(historyFolder).catch(() => {});
        } catch (e) {
        }

        let historyData = [];
        let historyFile = this.app.vault.getAbstractFileByPath(historyFilePath);

        try {
            if (historyFile) {
                const content = await this.app.vault.read(historyFile as TFile);
                historyData = JSON.parse(content);
            } else {
                historyFile = await this.app.vault.create(
                    historyFilePath,
                    JSON.stringify([], null, 2)
                );
            }

            const completedTask: any = {
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

            await this.app.vault.modify(
                historyFile as TFile,
                JSON.stringify(historyData, null, 2)
            );

        } catch (error) {
            console.error(t('errorLoadingHistory'), error);
            throw error;
        }
    }

    private static async handlePostponeTask(task: any) {
        const modal = new PostponeTaskModal(this.app);
        modal.open();
        const confirmed = await modal.waitForClose();

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
                    let content = await this.app.vault.read(file);
                    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
                    const match = content.match(frontmatterRegex);

                    if (match) {
                        let frontmatter = match[1];
                        frontmatter = frontmatter.replace(/status:.*\n/g, '');
                        frontmatter = frontmatter.replace(/startDate:.*\n/g, '');
                        frontmatter = frontmatter.replace(/dueDate:.*\n/g, '');
                        frontmatter += `\nstatus: planned\n`;

                        content = content.replace(
                            frontmatterRegex,
                            `---\n${frontmatter}---`
                        );

                        await this.app.vault.modify(file, content);
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

    private static async handleDeleteTask(task: any) {
        const modal = new ConfirmDeleteModal(this.app, task.name);
        modal.open();
        const confirmed = await modal.waitForClose();

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
                    await this.app.vault.delete(file);
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
