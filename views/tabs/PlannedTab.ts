import { App, MetadataCache, Vault, TFile, Workspace, Notice } from 'obsidian';
import { openTaskFile } from '../../utils/fileUtils';
import { getPlannedTasks, getTaskTypeIcon } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { PlannedTask } from '../tabs-types';
import { PersonalDevelopmentPlanSettings, getMaterialIdByName } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { StartTaskModal } from '../modals/StartTaskModal';

export default class PlannedTab {
    private static currentType: string | null = null;
    private static currentSection: string | null = null;
    private static vault: Vault;
    private static app: App;
    private static settings: PersonalDevelopmentPlanSettings;
    private static metadataCache: MetadataCache;
    private static contentContainer: HTMLElement;
    private static typeTabsContainer: HTMLElement;
    private static sectionTabsContainer: HTMLElement;

    static async create(
        app: App,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        workspace: Workspace,
        metadataCache: MetadataCache
    ): Promise<HTMLElement> {
        this.app = app;
        this.settings = settings;
        this.vault = vault;
        this.metadataCache = metadataCache;
        this.currentType = null;
        this.currentSection = null;

        const mainContainer = createDiv();
        mainContainer.addClass('planned-main-container');

        this.createHeader(mainContainer);

        const allTasks = await getPlannedTasks(vault, settings, metadataCache);
        const [typeTabsContainer, sectionTabsContainer, contentContainer] = this.createContainers(mainContainer);
        this.typeTabsContainer = typeTabsContainer as HTMLElement;
        this.sectionTabsContainer = sectionTabsContainer as HTMLElement;
        this.contentContainer = contentContainer;

        this.createTypeTabs(typeTabsContainer as HTMLElement, settings, allTasks, contentContainer);
        this.createSectionTabs(sectionTabsContainer as HTMLElement, settings, allTasks, contentContainer);

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
        const allTypeTab = this.typeTabsContainer.querySelector('.planned-tab[data-type="all"]') as HTMLElement;
        if (allTypeTab) {
            allTypeTab.click();
        }
    }

    private static async refreshContent() {
        const allTasks = await getPlannedTasks(this.vault, this.settings, this.metadataCache);
        this.updateContent(this.contentContainer, allTasks);

        if (this.typeTabsContainer) {
            this.updateTabCounts(this.typeTabsContainer, allTasks);
        }
        if (this.sectionTabsContainer) {
            this.updateSectionTabCounts(this.sectionTabsContainer, allTasks);
        }
    }

    private static updateTabCounts(container: HTMLElement, tasks: PlannedTask[]) {
        container.querySelectorAll('.planned-tab').forEach((tabElement: Element) => {
            const tab = tabElement as HTMLElement;
            const typeId = tab.getAttribute('data-type');
            if (!typeId) return;

            let taskCount = 0;

            if (typeId === 'all') {
                taskCount = this.getFilteredTasksCount(tasks, null, this.currentSection);
            } else if (typeId === 'other') {
                taskCount = this.getFilteredTasksCount(tasks, 'other', this.currentSection);
            } else {
                const type = this.settings.materialTypes.find(t => t.id === typeId);
                if (type) {
                    taskCount = this.getFilteredTasksCount(tasks, type.name, this.currentSection);
                }
            }

            const label = tab.querySelector('.planned-tab-label');
            if (label) {
                if (typeId === 'other') {
                    label.textContent = `${t('otherTypes')} (${taskCount})`;
                } else if (typeId === 'all') {
                    label.textContent = `${t('all')} (${taskCount})`;
                } else {
                    const type = this.settings.materialTypes.find(t => t.id === typeId);
                    if (type) {
                        label.textContent = `${type.name} (${taskCount})`;
                    }
                }
            }

            // Скрываем вкладку, если количество задач равно 0
            if (taskCount === 0) {
                tab.style.display = 'none';
            } else {
                tab.style.display = 'flex';
            }
        });
    }

    private static updateSectionTabCounts(container: HTMLElement, tasks: PlannedTask[]) {
        container.querySelectorAll('.planned-tab').forEach((tabElement: Element) => {
            const tab = tabElement as HTMLElement;
            const sectionId = tab.getAttribute('data-section');
            if (!sectionId) return;

            let taskCount = 0;

            if (sectionId === 'all') {
                taskCount = this.getFilteredTasksCount(tasks, this.currentType, null);
            } else if (sectionId === 'other') {
                taskCount = this.getFilteredTasksCount(tasks, this.currentType, 'other');
            } else {
                const section = this.settings.sections.find(s => s.id === sectionId);
                if (section) {
                    taskCount = this.getFilteredTasksCount(tasks, this.currentType, section.name);
                }
            }

            const label = tab.querySelector('.planned-tab-label');
            if (label) {
                if (sectionId === 'other') {
                    label.textContent = `${t('otherSections')} (${taskCount})`;
                } else if (sectionId === 'all') {
                    label.textContent = `${t('all')} (${taskCount})`;
                } else {
                    const section = this.settings.sections.find(s => s.id === sectionId);
                    if (section) {
                        label.textContent = `${section.name} (${taskCount})`;
                    }
                }
            }

            // Скрываем вкладку, если количество задач равно 0
            if (taskCount === 0) {
                tab.style.display = 'none';
            } else {
                tab.style.display = 'flex';
            }
        });
    }

    private static createContainers(parent: HTMLElement): [HTMLElement, HTMLElement, HTMLElement] {
        const tabsContainer = parent.createDiv({ cls: 'planned-tabs-container' });

        const typeTabsContainer = tabsContainer.createDiv({ cls: 'planned-type-tabs' });
        const sectionTabsContainer = tabsContainer.createDiv({ cls: 'planned-section-tabs' });

        const contentContainer = parent.createDiv({ cls: 'planned-content-container' });
        return [typeTabsContainer, sectionTabsContainer, contentContainer];
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

        const enabledTypeNames = enabledTypes.map(type => type.name);

        const allTab = container.createDiv({ cls: 'planned-tab', attr: { 'data-type': 'all' } });
        allTab.createSpan({ cls: 'planned-tab-icon', text: getTaskTypeIcon('all') });
        const allLabel = allTab.createSpan({ cls: 'planned-tab-label' });
        const allTaskCount = tasks.length;
        allLabel.textContent = `${t('all')} (${allTaskCount})`;

        allTab.addEventListener('click', () => {
            this.currentType = null;
            this.updateActiveTab(allTab, container);
            this.resetActiveTab(this.sectionTabsContainer);
            this.currentSection = null;
            this.updateContent(contentContainer, tasks);
            this.updateSectionTabCounts(this.sectionTabsContainer, tasks);
        });

        // Скрываем вкладку "all", если нет задач
        if (allTaskCount === 0) {
            allTab.style.display = 'none';
        }

        container.appendChild(allTab);

        enabledTypes.forEach(type => {
            const taskCount = tasks.filter(task => task.type === type.name).length;

            // Пропускаем тип, если нет задач
            if (taskCount === 0) {
                return;
            }

            const tab = container.createDiv({ cls: 'planned-tab' });
            tab.dataset.type = type.id;

            const icon = tab.createSpan({ cls: 'planned-tab-icon' });
            icon.textContent = getTaskTypeIcon(type.id);

            const label = tab.createSpan({ cls: 'planned-tab-label' });
            label.textContent = `${type.name} (${taskCount})`;

            tab.addEventListener('click', () => {
                this.currentType = type.name;
                this.updateActiveTab(tab, container);
                this.resetActiveTab(this.sectionTabsContainer);
                this.currentSection = null;
                this.updateContent(contentContainer, tasks);
                this.updateSectionTabCounts(this.sectionTabsContainer, tasks);
            });

            container.appendChild(tab);
        });

        const otherTasksCount = tasks.filter(task => !enabledTypeNames.includes(task.type)).length;
        if (otherTasksCount > 0) {
            const otherTab = container.createDiv({ cls: 'planned-tab', attr: { 'data-type': 'other' } });
            otherTab.createSpan({ cls: 'planned-tab-icon', text: getTaskTypeIcon('other') });
            const otherLabel = otherTab.createSpan({ cls: 'planned-tab-label' });
            otherLabel.textContent = `${t('otherTypes')} (${otherTasksCount})`;

            otherTab.addEventListener('click', () => {
                this.currentType = 'other';
                this.updateActiveTab(otherTab, container);
                this.resetActiveTab(this.sectionTabsContainer);
                this.currentSection = null;
                this.updateContent(contentContainer, tasks);
                this.updateSectionTabCounts(this.sectionTabsContainer, tasks);
            });

            container.appendChild(otherTab);
        }

        allTab.click();
    }

    private static createSectionTabs(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        tasks: PlannedTask[],
        contentContainer: HTMLElement
    ) {
        const sections = [...settings.sections].sort((a, b) => a.order - b.order);
        const sectionNames = sections.map(section => section.name);

        const allTab = container.createDiv({ cls: 'planned-tab', attr: { 'data-section': 'all' } });
        const allLabel = allTab.createSpan({ cls: 'planned-tab-label' });
        const allTaskCount = tasks.length;
        allLabel.textContent = `${t('all')} (${allTaskCount})`;

        allTab.addEventListener('click', () => {
            this.currentSection = null;
            this.updateActiveTab(allTab, container);
            this.updateContent(contentContainer, tasks);
        });

        // Скрываем вкладку "all", если нет задач
        if (allTaskCount === 0) {
            allTab.style.display = 'none';
        }

        container.appendChild(allTab);

        sections.forEach(section => {
            const taskCount = tasks.filter(task => task.section === section.name).length;

            // Пропускаем раздел, если нет задач
            if (taskCount === 0) {
                return;
            }

            const tab = container.createDiv({ cls: 'planned-tab' });
            tab.dataset.section = section.id;

            const label = tab.createSpan({ cls: 'planned-tab-label' });
            label.textContent = `${section.name} (${taskCount})`;

            tab.addEventListener('click', () => {
                this.currentSection = section.name;
                this.updateActiveTab(tab, container);
                this.updateContent(contentContainer, tasks);
            });

            container.appendChild(tab);
        });

        const otherSectionsCount = tasks.filter(task => !sectionNames.includes(task.section)).length;
        if (otherSectionsCount > 0) {
            const otherTab = container.createDiv({ cls: 'planned-tab', attr: { 'data-section': 'other' } });
            const otherLabel = otherTab.createSpan({ cls: 'planned-tab-label' });
            otherLabel.textContent = `${t('otherSections')} (${otherSectionsCount})`;

            otherTab.addEventListener('click', () => {
                this.currentSection = 'other';
                this.updateActiveTab(otherTab, container);
                this.updateContent(contentContainer, tasks);
            });

            container.appendChild(otherTab);
        }
    }

    private static updateActiveTab(activeTab: HTMLElement, container: HTMLElement) {
        container.querySelectorAll('.planned-tab').forEach(tab =>
            tab.removeClass('active')
        );
        activeTab.addClass('active');
    }

    private static resetActiveTab(container: HTMLElement | null) {
        if (!container) return;
        container.querySelectorAll('.planned-tab').forEach(tab =>
            tab.removeClass('active')
        );
    }

    private static getFilteredTasksCount(tasks: PlannedTask[], typeFilter: string | null, sectionFilter: string | null): number {
        let filteredTasks = [...tasks];

        if (typeFilter === 'other') {
            const enabledTypeNames = this.settings.materialTypes
                .filter(type => type.enabled)
                .map(type => type.name);
            filteredTasks = filteredTasks.filter(task => !enabledTypeNames.includes(task.type));
        } else if (typeFilter) {
            filteredTasks = filteredTasks.filter(task => task.type === typeFilter);
        }

        if (sectionFilter === 'other') {
            const sectionNames = this.settings.sections.map(section => section.name);
            filteredTasks = filteredTasks.filter(task => !sectionNames.includes(task.section));
        } else if (sectionFilter) {
            filteredTasks = filteredTasks.filter(task => task.section === sectionFilter);
        }

        return filteredTasks.length;
    }

    private static updateContent(container: HTMLElement, tasks: PlannedTask[]) {
        container.empty();

        let filteredTasks = this.filterTasks(tasks, this.currentType, this.currentSection);

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

            const actionsContainer = taskCard.createDiv({ cls: 'planned-actions with-gap' });

            const startBtn = actionsContainer.createEl('button', {
                cls: 'knowledge-action-btn plan-btn',
                text: t('startTask')
            });
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleStartTask(task);
            });

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

    private static filterTasks(tasks: PlannedTask[], typeFilter: string | null, sectionFilter: string | null): PlannedTask[] {
        let filteredTasks = [...tasks];

        if (typeFilter === 'other') {
            const enabledTypeNames = this.settings.materialTypes
                .filter(type => type.enabled)
                .map(type => type.name);
            filteredTasks = filteredTasks.filter(task => !enabledTypeNames.includes(task.type));
        } else if (typeFilter) {
            filteredTasks = filteredTasks.filter(task => task.type === typeFilter);
        }

        if (sectionFilter === 'other') {
            const sectionNames = this.settings.sections.map(section => section.name);
            filteredTasks = filteredTasks.filter(task => !sectionNames.includes(task.section));
        } else if (sectionFilter) {
            filteredTasks = filteredTasks.filter(task => task.section === sectionFilter);
        }

        return filteredTasks;
    }

    private static async handleStartTask(task: PlannedTask) {
        const modal = new StartTaskModal(this.app);
        modal.open();
        const result = await modal.waitForClose();

        if (result) {
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
