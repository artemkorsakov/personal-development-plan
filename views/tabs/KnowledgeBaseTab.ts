import { Notice, Vault } from 'obsidian';
import { openTaskFile } from '../../utils/fileUtils';
import { getKnowledgeItems, getTaskTypeIcon, getItems } from '../../utils/taskUtils';
import { exportToJSON } from '../../utils/exportUtils';
import { t } from '../../localization/localization';
import { KnowledgeItem } from '../tabs-types';
import { PersonalDevelopmentPlanSettings, Section } from '../../settings/settings-types';
import CreateTaskModal from '../modals/CreateTaskModal';
import { PlanTaskModal, PlanTaskModalData } from '../modals/PlanTaskModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

export default class KnowledgeBaseTab {
    private static currentType: string | null = null;
    private static currentSection: string | null = null;
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;
    private static contentContainer: HTMLElement;
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
        this.currentType = null;
        this.currentSection = null;

        const mainContainer = createDiv();
        mainContainer.addClass('knowledge-base-container');

        this.createHeader(mainContainer);

        const allItems = await getKnowledgeItems(vault, settings, metadataCache);

        const [typeTabs, sectionTabs, contentContainer] = this.createTabContainers(mainContainer);
        this.contentContainer = contentContainer;

        this.initializeTypeTabs(typeTabs, settings, allItems, contentContainer);
        this.initializeSectionTabs(sectionTabs, settings, allItems, contentContainer);

        return mainContainer;
    }

    static async refreshContent() {
        try {
            // Получаем свежие экземпляры vault и metadataCache
            const vault = this.app.vault;
            const metadataCache = this.app.metadataCache;

            // Принудительно обновляем данные
            const allItems = await getKnowledgeItems(vault, this.settings, metadataCache);

            // Обновляем UI
            this.updateContent(this.contentContainer, allItems);

            // Обновляем счетчики во вкладках
            const mainContainer = this.contentContainer.closest('.knowledge-base-container');
            if (mainContainer) {
                const typeTabs = mainContainer.querySelector('.knowledge-type-tabs') as HTMLElement;
                const sectionTabs = mainContainer.querySelector('.knowledge-section-tabs') as HTMLElement;

                if (typeTabs) this.updateTabCounts(typeTabs, allItems);
                if (sectionTabs) this.updateSectionTabsCounts(sectionTabs, allItems);
            }

            return allItems;
        } catch (error) {
            console.error('Refresh error:', error);
            new Notice('Failed to refresh content');
            throw error;
        }
    }

    private static createHeader(container: HTMLElement) {
        const header = container.createDiv({ cls: 'knowledge-header' });

        const createBtn = header.createEl('button', {
            cls: 'knowledge-create-btn',
            text: t('createNewTask')
        });

        createBtn.addEventListener('click', () => {
            const modal = new CreateTaskModal(
                this.app,
                this.settings,
                'knowledge-base',
                async (success) => {
                    if (!success) return;

                    try {
                        // 1. Ждем обновления данных
                        await this.refreshContent();

                        // 2. Получаем свежие DOM-элементы
                        const allTab = container.querySelector('.knowledge-tab[data-id="all"]') as HTMLElement;
                        const typeTabs = container.querySelector('.knowledge-type-tabs') as HTMLElement;
                        const sectionTabs = container.querySelector('.knowledge-section-tabs') as HTMLElement;

                        // 3. Переключаем на вкладку all
                        if (allTab && typeTabs) {
                            this.currentType = null;
                            this.currentSection = null;
                            this.setActiveTab(allTab, typeTabs);
                            if (sectionTabs) this.resetActiveTab(sectionTabs);

                            // 4. Дополнительное обновление для гарантии
                            await this.refreshContent();
                        }
                    } catch (error) {
                        console.error('Post-create error:', error);
                    }
                }
            );

            if (this.currentType) {
                modal.setInitialType(this.currentType);
            }

            modal.open();
        });

        const exportBtn = header.createEl('button', {
            cls: 'knowledge-export-btn',
            text: t('exportToJSON')
        });
        exportBtn.addEventListener('click', () => this.handleExport());
    }

    private static createTabContainers(container: HTMLElement): [HTMLElement, HTMLElement, HTMLElement] {
        const tabsContainer = container.createDiv({ cls: 'knowledge-tabs-container' });

        const typeTabs = tabsContainer.createDiv({ cls: 'knowledge-type-tabs' });
        const sectionTabs = tabsContainer.createDiv({ cls: 'knowledge-section-tabs' });

        const contentContainer = container.createDiv({ cls: 'knowledge-content-container' });

        return [typeTabs, sectionTabs, contentContainer];
    }

    private static initializeTypeTabs(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        items: KnowledgeItem[],
        contentContainer: HTMLElement
    ) {
        const enabledTypes = settings.materialTypes
            .filter(type => type.enabled)
            .sort((a, b) => a.order - b.order);

        // Add "All" tab
        const allTab = this.createTab(
            'all',
            `${getTaskTypeIcon('all')} ${t('all')}`,
            items.length
        );

        allTab.addEventListener('click', () => {
            this.currentType = null;
            this.currentSection = null;
            this.setActiveTab(allTab, container);
            this.resetActiveTab(container.parentElement?.querySelector('.knowledge-section-tabs'));
            this.updateContent(contentContainer, items);
            this.updateSectionTabsCounts(container.parentElement?.querySelector('.knowledge-section-tabs'), items);
        });

        container.appendChild(allTab);

        enabledTypes.forEach(type => {
            const tab = this.createTab(
                type.id,
                `${getTaskTypeIcon(type.id)} ${type.name}`,
                items.filter(item => item.type === type.name).length
            );

            tab.addEventListener('click', () => {
                this.currentType = type.name;
                this.currentSection = null;
                this.setActiveTab(tab, container);
                this.resetActiveTab(container.parentElement?.querySelector('.knowledge-section-tabs'));
                this.updateContent(contentContainer, items);
                this.updateSectionTabsCounts(container.parentElement?.querySelector('.knowledge-section-tabs'), items);
            });

            container.appendChild(tab);
        });

        // Set 'all' tab as active by default
        allTab.click();
    }

    private static initializeSectionTabs(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        items: KnowledgeItem[],
        contentContainer: HTMLElement
    ) {
        const sections = [...settings.sections].sort((a, b) => a.order - b.order);

        // Add "All" tab
        const allTab = this.createTab(
            'all-sections',
            t('all'),
            this.currentType
                ? items.filter(item => item.type === this.currentType).length
                : items.length
        );

        allTab.addEventListener('click', () => {
            this.currentSection = null;
            this.setActiveTab(allTab, container);
            this.updateContent(contentContainer, items);
        });

        container.appendChild(allTab);

        sections.forEach(section => {
            const count = items.filter(item =>
                item.section === section.name &&
                (!this.currentType || item.type === this.currentType)
            ).length;

            const tab = this.createTab(
                section.id,
                section.name,
                count
            );

            tab.addEventListener('click', () => {
                this.currentSection = section.name;
                this.setActiveTab(tab, container);
                this.updateContent(contentContainer, items);
            });

            container.appendChild(tab);
        });
    }

    private static createTab(id: string, label: string, count: number): HTMLElement {
		const tab = createDiv();
        tab.addClass('knowledge-tab');
        tab.setAttribute('data-id', id);

        const labelSpan = createSpan();
        labelSpan.addClass('knowledge-tab-label');
        labelSpan.setText(`${label} (${count})`);

        tab.appendChild(labelSpan);
        return tab;
    }

    private static updateContent(container: HTMLElement, items: KnowledgeItem[]) {
        container.empty();

        let filteredItems = [...items];

        if (this.currentType) {
            filteredItems = filteredItems.filter(item => item.type === this.currentType);
        }

        if (this.currentSection) {
            filteredItems = filteredItems.filter(item => item.section === this.currentSection);
        }

        if (filteredItems.length === 0) {
            const emptyMsg = container.createDiv({ cls: 'knowledge-empty-msg' });
            emptyMsg.textContent = t('noTasksForThisType');
            return;
        }

        filteredItems.sort((a, b) => a.name.localeCompare(b.name));

        const table = createEl('table', { cls: 'knowledge-items-table' });

        const headerRow = table.createEl('tr');
        headerRow.createEl('th', { text: t('knowledgeBaseName') });
        headerRow.createEl('th', { text: t('knowledgeBaseType') });
        headerRow.createEl('th', { text: t('knowledgeBaseSection') });
        headerRow.createEl('th', { text: t('actions') });

        filteredItems.forEach(item => {
            const row = table.createEl('tr');
            row.className = 'knowledge-item-row';

            const nameCell = row.createEl('td');
            const nameLink = nameCell.createEl('a', {
                href: '#',
                text: item.name
            });
            nameLink.addEventListener('click', (e) => {
                e.preventDefault();
                openTaskFile(item.filePath, this.app.vault, this.app.workspace);
            });

            row.createEl('td', { text: item.type });
            row.createEl('td', { text: item.section });

            // Добавляем столбец с кнопками действий
            const actionsCell = row.createEl('td');
            actionsCell.className = 'knowledge-item-actions';

            // Кнопка "В очередь"
            const planBtn = actionsCell.createEl('button', {
                cls: 'knowledge-action-btn plan-btn',
                text: t('addToQueue')
            });
            planBtn.addEventListener('click', () => this.handlePlanTask(item));

            // Кнопка "Удалить"
            const deleteBtn = actionsCell.createEl('button', {
                cls: 'knowledge-action-btn delete-btn',
                text: t('delete')
            });
            deleteBtn.addEventListener('click', () => this.handleDeleteTask(item));
        });

        container.appendChild(table);
    }

    private static updateTabCounts(container: HTMLElement, items: KnowledgeItem[]) {
        container.querySelectorAll('.knowledge-tab').forEach(tab => {
            const tabId = tab.getAttribute('data-id');
            if (tabId === 'all') {
                const count = items.length;
                const labelSpan = tab.querySelector('.knowledge-tab-label');
                if (labelSpan) {
                    labelSpan.textContent = `${t('all')} (${count})`;
                }
                return;
            }

            const type = this.settings.materialTypes.find(t => t.id === tabId);
            if (!type) return;

            const count = items.filter(item => item.type === type.name).length;
            const labelSpan = tab.querySelector('.knowledge-tab-label');
            if (labelSpan) {
                labelSpan.textContent = `${type.name} (${count})`;
            }
        });
    }

    private static updateSectionTabsCounts(container: HTMLElement | null | undefined, items: KnowledgeItem[]) {
        if (!container) return;

        container.querySelectorAll('.knowledge-tab').forEach(tab => {
            const sectionId = tab.getAttribute('data-id');
            if (sectionId === 'all-sections') {
                const count = this.currentType
                    ? items.filter(item => item.type === this.currentType).length
                    : items.length;
                const labelSpan = tab.querySelector('.knowledge-tab-label');
                if (labelSpan) {
                    labelSpan.textContent = `${t('all')} (${count})`;
                }
                return;
            }

            const section = this.settings.sections.find((s: Section) => s.id === sectionId);
            if (!section) return;

            const count = this.currentType
                ? items.filter(item =>
                    item.section === section.name &&
                    item.type === this.currentType
                ).length
                : items.filter(item => item.section === section.name).length;

            const labelSpan = tab.querySelector('.knowledge-tab-label');
            if (labelSpan) {
                labelSpan.textContent = `${section.name} (${count})`;
            }
        });
    }

    private static setActiveTab(tab: HTMLElement, container: HTMLElement) {
        container.querySelectorAll('.knowledge-tab').forEach(t =>
            t.classList.remove('active')
        );
        tab.classList.add('active');
    }

    private static resetActiveTab(container: HTMLElement | null | undefined) {
        container?.querySelectorAll('.knowledge-tab').forEach(tab => {
            tab.classList.remove('active');
        });
    }

    private static async handleExport() {
        try {
			const {
                articles,
                books,
                courses,
                podcasts,
                userTypes,
                videos
            } = await getItems(this.vault, this.settings, this.metadataCache);
            await exportToJSON(articles, books, courses, podcasts, userTypes, videos);
            new Notice(t('exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            new Notice(t('exportError'));
        }
    }

    private static async handlePlanTask(item: KnowledgeItem) {
        const modal = new PlanTaskModal(this.app, this.settings, item.type);
        modal.open();
        const result = await modal.waitForClose();

        if (result) {
            try {
                const file = this.app.vault.getAbstractFileByPath(item.filePath);
                if (file) {
                    let content = await this.app.vault.read(file);
                    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
                    const match = content.match(frontmatterRegex);

                    if (match) {
                        let frontmatter = match[1];
                        frontmatter = frontmatter
                            .replace(/status:.*(\n|$)/g, '')
                            .replace(/order:.*(\n|$)/g, '');

                        frontmatter = frontmatter.replace(/\n+$/, '');

                        if (frontmatter.length > 0 && !frontmatter.endsWith('\n')) {
                            frontmatter += '\n';
                        }

                        frontmatter += `status: planned\n`;
                        frontmatter += `order: ${result.order}\n`;

                        if (!frontmatter.endsWith('\n')) {
                            frontmatter += '\n';
                        }

                        const newContent = content.replace(
                            frontmatterRegex,
                            `---\n${frontmatter}---`
                        );

                        await this.app.vault.process(file, (currentContent: string) => newContent);
                        new Notice(t('taskPlannedSuccessfully'));
                        await this.refreshContent();
                    } else {
                        console.warn(`No frontmatter found in file: ${item.filePath}`);
                    }
                } else {
                    console.error(`File not found: ${item.filePath}`);
                }
            } catch (error) {
                console.error('Error planning task:', error);
                console.error(`Error details:`, {
                    itemPath: item.filePath,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                new Notice(t('errorPlanningTask'));
            }
        }
    }

    private static async handleDeleteTask(item: KnowledgeItem) {
        const modal = new ConfirmDeleteModal(this.app, item.name);
        modal.open();
        const confirmed = await modal.waitForClose();

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(item.filePath);
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
