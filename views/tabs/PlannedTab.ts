import { Vault, TFile, Workspace } from 'obsidian';
import { openTaskFile } from '../../utils/fileUtils';
import { generateProgressBar } from '../../utils/progressUtils';
import { getPlannedTasks, getTaskTypeIcon, isTaskOverdue } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { PlannedTask } from '../tabs-types';
import { PersonalDevelopmentPlanSettings, getMaterialNameById, getMaterialIdByName } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';

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

        const mainContainer = document.createElement('div');
        mainContainer.className = 'planned-main-container';

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
            taskCard.addEventListener('click', () =>
                openTaskFile(task.filePath, this.vault, this.app.workspace)
            );

            const orderBadge = taskCard.createDiv({ cls: 'planned-order-badge' });
            orderBadge.textContent = `#${task.order}`;

            const nameSpan = taskCard.createDiv({ cls: 'planned-name' });
            nameSpan.textContent = task.name;

            const sectionSpan = taskCard.createDiv({ cls: 'planned-section' });
            sectionSpan.textContent = `[${task.section}]`;

            const typeSpan = taskCard.createDiv({ cls: 'planned-type' });
            typeSpan.textContent = task.type;
        });
    }
}
