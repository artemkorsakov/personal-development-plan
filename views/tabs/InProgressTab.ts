import { Vault } from 'obsidian';
import { getActiveTasks, getTaskTypeIcon, isTaskOverdue } from '../../utils/taskUtils';
import { formatDate } from '../../utils/dateUtils';
import { openTaskFile } from '../../utils/fileUtils';
import { generateProgressBar } from '../../utils/progressUtils';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings, getMaterialNameById, getMaterialIdByName } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';

export default class InProgressTab {
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;
    private static vault: Vault;
    private static metadataCache: any;

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

        const container = document.createElement('div');
        container.className = 'tasks-container';

        // Добавляем заголовок с кнопкой создания
        this.createHeader(container);

        const activeTasks = await getActiveTasks(vault, settings, metadataCache);
        const maxTasks = settings.maxActiveTasks || 10;

        if (activeTasks.length > maxTasks) {
            const warningDiv = container.createDiv({ cls: 'task-warning' });
            warningDiv.textContent = `${t('maxActiveTasksWarning')} (${activeTasks.length} > ${maxTasks})`;
        }

        activeTasks.sort((a, b) => a.order - b.order).forEach(task => {
            const taskCard = container.createDiv({ cls: 'task-card' });
            taskCard.onclick = () => openTaskFile(task.filePath, vault, this.app.workspace);

            const orderBadge = taskCard.createDiv({ cls: 'task-order-badge', text: `#${task.order}` });

            const firstLine = taskCard.createDiv({ cls: 'task-first-line' });
            firstLine.createSpan({
                cls: 'task-type-icon',
                text: getTaskTypeIcon(getMaterialIdByName(settings.materialTypes, task.type))
            });
            firstLine.createSpan({ cls: 'task-name', text: task.name });
            firstLine.createSpan({ cls: 'task-section', text: `[${task.section}]` });

            const datesDiv = taskCard.createDiv({ cls: 'task-dates' });
            datesDiv.createSpan({ text: `${t('inProgressStartDate')}: ${formatDate(task.startDate)}` });

            const dueDateSpan = datesDiv.createSpan({
                text: `${t('inProgressDueDate')}: ${formatDate(task.dueDate)}`
            });

            if (isTaskOverdue(task)) {
                dueDateSpan.style.color = 'red';
                dueDateSpan.style.fontWeight = 'bold';
                dueDateSpan.textContent += t('inProgressOverdue');
            }

            const progressContainer = taskCard.createDiv({ cls: 'task-progress-line' });
            progressContainer.createSpan({
                cls: 'task-progress-bar',
                text: `${generateProgressBar(task.progress)} ${task.progress}%`
            });
        });

        return container;
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
                'in-progress', // Устанавливаем статус для активных задач
                async (success) => {
                    if (success) {
                        // Обновляем список задач после успешного создания
                        const newContainer = await InProgressTab.create(
                            this.app,
                            this.settings,
                            this.vault,
                            this.metadataCache
                        );
                        container.replaceWith(newContainer);
                    }
                }
            );
            modal.open();
        });
    }

    static async refresh(
        app: any,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: any,
        container: HTMLElement
    ): Promise<HTMLElement> {
        const newContainer = await this.create(app, settings, vault, metadataCache);
        container.replaceWith(newContainer);
        return newContainer;
    }
}
