import { Vault, TFile, Workspace } from 'obsidian';
import { getFilesInFolder, openTaskFile } from '../../utils/fileUtils';
import { generateProgressBar } from '../../utils/progressUtils';
import { getTaskTypeIcon, isTaskOverdue } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings, PlannedTask, getMaterialNameById, getMaterialIdByName } from '../../types';

export default class PlannedTab {
    private static currentType: string | null = null;
    private static vault: Vault;
    private static workspace: Workspace;

    static async create(
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        workspace: Workspace,
        metadataCache: any
    ): Promise<HTMLElement> {
        this.vault = vault;
        this.workspace = workspace;

        const mainContainer = document.createElement('div');
        mainContainer.className = 'planned-main-container';

        const allTasks = await this.getPlannedTasks(vault, settings, metadataCache);
        const [tabsContainer, contentContainer] = this.createContainers(mainContainer);
        this.createTypeTabs(tabsContainer, settings, allTasks, contentContainer);

        return mainContainer;
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

            if (!this.currentType) {
                this.currentType = type.name;
                tab.addClass('active');
                this.updateContent(contentContainer, tasks, type.name);
            }
        });
    }

    private static updateActiveTab(activeTab: HTMLElement, container: HTMLElement) {
        container.querySelectorAll('.planned-tab').forEach(tab =>
            tab.removeClass('active')
        );
        activeTab.addClass('active');
    }

    private static updateContent(container: HTMLElement, tasks: PlannedTask[], type: string) {
        container.empty();

        const filteredTasks = tasks.filter(task => task.type === type);

        if (filteredTasks.length === 0) {
            const emptyMsg = container.createDiv({ cls: 'planned-empty-message' });
            emptyMsg.textContent = t('noTasksForThisType');
            return;
        }

        filteredTasks.sort((a, b) => a.order - b.order);

        filteredTasks.forEach(task => {
            const taskCard = container.createDiv({ cls: 'planned-card' });
            taskCard.addEventListener('click', () =>
                openTaskFile(task.filePath, this.vault, this.workspace)
            );

            const orderBadge = taskCard.createDiv({ cls: 'planned-order-badge' });
            orderBadge.textContent = `#${task.order}`;

            const nameSpan = taskCard.createDiv({ cls: 'planned-name' });
            nameSpan.textContent = task.name;

            const sectionSpan = taskCard.createDiv({ cls: 'planned-section' });
            sectionSpan.textContent = `[${task.section}]`;
        });
    }

    private static async getPlannedTasks(
        vault: Vault,
        settings: PersonalDevelopmentPlanSettings,
        metadataCache: any
    ): Promise<PlannedTask[]> {
        const plannedTasks: PlannedTask[] = [];
        const files = getFilesInFolder(vault, settings.folderPath);

        for (const file of files) {
            try {
                const frontmatter = metadataCache.getFileCache(file)?.frontmatter;
                if (frontmatter?.status !== 'planned') continue;

                plannedTasks.push({
                    name: frontmatter?.title || file.basename || "???",
                    type: frontmatter?.type || "???",
                    section: frontmatter?.section || "???",
                    order: frontmatter?.order ?? 100,
                    filePath: file.path
                });
            } catch (error) {
                console.error(`Error reading file ${file.path}:`, error);
            }
        }

        return plannedTasks;
    }

    static async refresh(
        vault?: Vault,
        workspace?: Workspace
    ): Promise<void> {
        if (vault) this.vault = vault;
        if (workspace) this.workspace = workspace;

        if (this.currentType) {
            // Логика обновления при изменении файлов
        }
    }
}
