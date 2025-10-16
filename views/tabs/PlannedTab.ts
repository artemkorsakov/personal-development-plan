import { Vault, TFile, Workspace, Notice } from 'obsidian';
import { openTaskFile } from '../../utils/fileUtils';
import { generateProgressBar } from '../../utils/progressUtils';
import { getPlannedTasks, getTaskTypeIcon, isTaskOverdue } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { PlannedTask } from '../tabs-types';
import { PersonalDevelopmentPlanSettings, getMaterialNameById, getMaterialIdByName } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { StartTaskModal } from '../modals/StartTaskModal';

export default class PlannedTab {
    private static currentType: string | null = null;
    private static vault: Vault;
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;
    private static metadataCache: any;
    private static contentContainer: HTMLElement;
    private static tabsContainer: HTMLElement;

    static async create(
        app: any,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        workspace: Workspace,
        metadataCache: any
    ): Promise<HTMLElement> {
        this.app = app;
        this.settings = settings;
        this.vault = vault;
        this.metadataCache = metadataCache;

        const mainContainer = createDiv();
        mainContainer.addClass('planned-main-container');

        this.createHeader(mainContainer);

        const allTasks = await getPlannedTasks(vault, settings, metadataCache);
        const [tabsContainer, contentContainer] = this.createContainers(mainContainer);
        this.tabsContainer = tabsContainer as HTMLElement; // Приведение типа
        this.contentContainer = contentContainer;

        this.createTypeTabs(tabsContainer as HTMLElement, settings, allTasks, contentContainer);

        return mainContainer;
    }

    private static createHeader(container: HTMLElement) {
        const header = container.createDiv({ cls: 'planned-header' });

        const createBtn = header.createEl('button', {
            cls: 'planned-create-btn',
            text: t('createNewTask')
        });

        createBtn.addEventListener('click', () => {
            const modal = new CreateTaskModal(
                this.app,
                this.settings,
                'planned',
                async (success) => {
                    if (success) {
                        await this.refreshContent();
                        this.switchToAllTab();
                    }
                }
            );

            if (this.currentType) {
                modal.setInitialType(getMaterialIdByName(this.settings.materialTypes, this.currentType));
            }

            modal.open();
        });
    }

    private static switchToAllTab() {
        const allTab = this.tabsContainer.querySelector('.planned-tab[data-type="all"]') as HTMLElement;
        if (allTab) {
            allTab.click();
        }
    }

    private static async refreshContent() {
        const allTasks = await getPlannedTasks(this.vault, this.settings, this.metadataCache);
        this.updateContent(this.contentContainer, allTasks, this.currentType || '');

        if (this.tabsContainer) {
            this.updateTabCounts(this.tabsContainer, allTasks);
        }
    }

    private static updateTabCounts(container: HTMLElement, tasks: PlannedTask[]) {
        container.querySelectorAll('.planned-tab').forEach(tab => {
            const typeId = tab.getAttribute('data-type');
            if (!typeId) return;

            const type = this.settings.materialTypes.find(t => t.id === typeId);
            if (!type) return;

            const taskCount = tasks.filter(task => task.type === type.name).length;
            const label = tab.querySelector('.planned-tab-label');
            if (label) {
                label.textContent = `${type.name} (${taskCount})`;
            }
        });
    }

    private static createContainers(parent: HTMLElement): [HTMLElement, HTMLElement] {
        const tabsContainer = parent.createDiv({ cls: 'planned-tabs-container' });
        const contentContainer = parent.createDiv({ cls: 'planned-content-container' });
        return [tabsContainer, contentContainer];
    }

    private static createTypeTabs(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        tasks: PlannedTask[],
        contentContainer: HTMLElement
    ) {
        const enabledTypes = settings.materialTypes
            .filter(type => type.enabled)
            .sort((a, b) => a.order - b.order);

        // Добавляем вкладку "All"
        const allTab = container.createDiv({ cls: 'planned-tab', attr: { 'data-type': 'all' } });
        allTab.createSpan({ cls: 'planned-tab-icon', text: getTaskTypeIcon('all') });
        const allLabel = allTab.createSpan({ cls: 'planned-tab-label' });
        allLabel.textContent = `${t('all')} (${tasks.length})`;

        allTab.addEventListener('click', () => {
            this.currentType = null;
            this.updateActiveTab(allTab, container);
            this.updateContent(contentContainer, tasks, '');
        });

        enabledTypes.forEach(type => {
            const tab = container.createDiv({ cls: 'planned-tab' });
            tab.dataset.type = type.id;

            const icon = tab.createSpan({ cls: 'planned-tab-icon' });
            icon.textContent = getTaskTypeIcon(type.id);

            const label = tab.createSpan({ cls: 'planned-tab-label' });
            const taskCount = tasks.filter(task => task.type === type.name).length;
            label.textContent = `${type.name} (${taskCount})`;

            tab.addEventListener('click', () => {
                this.currentType = type.name;
                this.updateActiveTab(tab, container);
                this.updateContent(contentContainer, tasks, type.name);
            });
        });

        // По умолчанию выбираем вкладку "All"
        allTab.click();
    }

    private static updateActiveTab(activeTab: HTMLElement, container: HTMLElement) {
        container.querySelectorAll('.planned-tab').forEach(tab =>
            tab.removeClass('active')
        );
        activeTab.addClass('active');
    }

    private static updateContent(container: HTMLElement, tasks: PlannedTask[], type: string) {
        container.empty();

        const filteredTasks = type ? tasks.filter(task => task.type === type) : [...tasks];

        if (filteredTasks.length === 0) {
            const emptyMsg = container.createDiv({ cls: 'planned-empty-message' });
            emptyMsg.textContent = t('noTasksForThisType');
            return;
        }

        filteredTasks.sort((a, b) => a.order - b.order);

        filteredTasks.forEach(task => {
            const taskCard = container.createDiv({ cls: 'planned-card' });

            const cardContent = taskCard.createDiv({ cls: 'planned-card-content' });
            cardContent.addEventListener('click', () =>
                openTaskFile(task.filePath, this.vault, this.app.workspace)
            );

            const orderBadge = cardContent.createDiv({ cls: 'planned-order-badge' });
            orderBadge.textContent = `#${task.order}`;

            const nameSpan = cardContent.createDiv({ cls: 'planned-name' });
            nameSpan.textContent = task.name;

            const sectionSpan = cardContent.createDiv({ cls: 'planned-section' });
            sectionSpan.textContent = `[${task.section}]`;

            const typeSpan = cardContent.createDiv({ cls: 'planned-type' });
            typeSpan.textContent = task.type;

            // Добавляем кнопки действий
            const actionsContainer = taskCard.createDiv({ cls: 'planned-actions with-gap' });

            // Кнопка "Взять в работу"
            const startBtn = actionsContainer.createEl('button', {
                cls: 'knowledge-action-btn plan-btn',
                text: t('startTask')
            });
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleStartTask(task);
            });

            // Кнопка "Удалить"
            const deleteBtn = actionsContainer.createEl('button', {
                cls: 'knowledge-action-btn delete-btn',
                text: t('delete')
            });
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteTask(task);
            });
        });
    }

    private static async handleStartTask(task: PlannedTask) {
        const modal = new StartTaskModal(this.app);
        modal.open();
        const result = await modal.waitForClose();

        if (result) {
            try {
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
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

                        frontmatter += `status: in-progress\n`;
                        frontmatter += `startDate: ${result.startDate}\n`;
                        frontmatter += `dueDate: ${result.dueDate}\n`;

                        if (task.order) {
                            frontmatter = frontmatter.replace(/order:.*(\n|$)/g, '');
                            frontmatter = frontmatter.replace(/\n+$/, '');
                            if (frontmatter.length > 0 && !frontmatter.endsWith('\n')) {
                                frontmatter += '\n';
                            }
                            frontmatter += `order: ${task.order}\n`;
                        }

                        if (!frontmatter.endsWith('\n')) {
                            frontmatter += '\n';
                        }

                        const newContent = content.replace(
                            frontmatterRegex,
                            `---\n${frontmatter}---`
                        );

                        await this.app.vault.process(file, (currentContent: string) => newContent);

                        new Notice(t('taskStartedSuccessfully'));
                        await this.refreshContent();
                    } else {
                        console.warn(`No frontmatter found in file: ${task.filePath}`);
                    }
                } else {
                    console.error(`File not found: ${task.filePath}`);
                }
            } catch (error) {
                console.error('Error starting task:', error);
                console.error(`Error details:`, {
                    taskPath: task.filePath,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                new Notice(t('errorStartingTask'));
            }
        }
    }

    private static async handleDeleteTask(task: PlannedTask) {
        const modal = new ConfirmDeleteModal(this.app, task.name);
        modal.open();
        const confirmed = await modal.waitForClose();

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(task.filePath);
                if (file) {
                    await this.app.fileManager.trashFile(file);
                    new Notice(t('taskDeletedSuccessfully'));
                    await this.refreshContent();
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                new Notice(t('errorDeletingTask'));
            }
        }
    }
}
