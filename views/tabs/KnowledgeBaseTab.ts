import { Notice, Vault, TFile } from 'obsidian';
import { getFilesInFolder, openTaskFile } from '../../utils/fileUtils';
import { getTaskTypeIcon } from '../../utils/taskUtils';
import { t } from '../../localization/localization';
import { KnowledgeItem, MaterialType, PersonalDevelopmentPlanSettings, Section } from '../../types';
import CreateTaskModal from '../modals/CreateTaskModal';

export default class KnowledgeBaseTab {
    private static currentType: string | null = null;
    private static currentSection: string | null = null;
    private static app: any;
    private static settings: PersonalDevelopmentPlanSettings;

    static async create(
        app: any,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: any
    ): Promise<HTMLElement> {
        this.app = app;
        this.settings = settings;

        const mainContainer = document.createElement('div');
        mainContainer.className = 'knowledge-base-container';

        // Создаем заголовок с кнопками
        this.createHeader(mainContainer, settings, vault, metadataCache);

        // Получаем все элементы базы знаний
        const allItems = await this.getKnowledgeItems(vault, settings, metadataCache);

        // Создаем контейнеры вкладок и контента
        const [typeTabs, sectionTabs, contentContainer] = this.createTabContainers(mainContainer);

        // Инициализируем вкладки
        this.initializeTypeTabs(typeTabs, settings, allItems, contentContainer);
        this.initializeSectionTabs(sectionTabs, settings, allItems, contentContainer);

        return mainContainer;
    }

    private static createHeader(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: any
    ) {
        const header = container.createDiv({ cls: 'knowledge-header' });

        // Кнопка создания новой задачи
        const createBtn = header.createEl('button', {
            cls: 'knowledge-create-btn',
            text: t('createNewTask')
        });
        createBtn.addEventListener('click', () => {
            new CreateTaskModal(this.app, this.settings).open();
        });

        // Кнопка экспорта в JSON
        const exportBtn = header.createEl('button', {
            cls: 'knowledge-export-btn',
            text: t('exportToJSON')
        });
        exportBtn.addEventListener('click', () => this.handleExport(settings, vault, metadataCache));
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

        // Активируем первую вкладку
        if (enabledTypes.length > 0 && !this.currentType) {
            const firstTab = container.children[0] as HTMLElement;
            firstTab.click();
        }
    }

    private static initializeSectionTabs(
        container: HTMLElement,
        settings: PersonalDevelopmentPlanSettings,
        items: KnowledgeItem[],
        contentContainer: HTMLElement
    ) {
        const sections = [...settings.sections].sort((a, b) => a.order - b.order);

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
        const tab = document.createElement('div');
        tab.className = 'knowledge-tab';
        tab.dataset.id = id;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'knowledge-tab-label';
        labelSpan.textContent = `${label} (${count})`;

        tab.appendChild(labelSpan);
        return tab;
    }

    private static updateContent(container: HTMLElement, items: KnowledgeItem[]) {
        container.empty();

        let filteredItems = [...items];

        // Применяем фильтры
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

        // Сортируем по имени
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));

        // Создаем таблицу
        const table = document.createElement('table');
        table.className = 'knowledge-items-table';

        // Заголовок таблицы
        const headerRow = table.createEl('tr');
        headerRow.createEl('th', { text: t('knowledgeBaseName') });
        headerRow.createEl('th', { text: t('knowledgeBaseType') });
        headerRow.createEl('th', { text: t('knowledgeBaseSection') });

        // Строки таблицы
        filteredItems.forEach(item => {
            const row = table.createEl('tr');
            row.className = 'knowledge-item-row';

            // Название (ссылка)
            const nameCell = row.createEl('td');
            const nameLink = nameCell.createEl('a', {
                href: '#',
                text: item.name
            });
            nameLink.addEventListener('click', (e) => {
                e.preventDefault();
                openTaskFile(item.filePath, this.app.vault, this.app.workspace);
            });

            // Тип
            row.createEl('td', { text: item.type });

            // Раздел
            row.createEl('td', { text: item.section });
        });

        container.appendChild(table);
    }

    private static updateSectionTabsCounts(container: HTMLElement | null | undefined, items: KnowledgeItem[]) {
        if (!container) return;

        container.querySelectorAll('.knowledge-tab').forEach(tab => {
            const sectionId = tab.getAttribute('data-id');
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

    private static async getKnowledgeItems(
        vault: Vault,
        settings: PersonalDevelopmentPlanSettings,
        metadataCache: any
    ): Promise<KnowledgeItem[]> {
        const items: KnowledgeItem[] = [];
        const files = getFilesInFolder(vault, settings.folderPath);

        for (const file of files) {
            try {
                const frontmatter = metadataCache.getFileCache(file)?.frontmatter;
                if (!frontmatter) continue;

                if (frontmatter.status !== 'knowledge-base') continue;

                items.push({
                    name: frontmatter.title || file.basename || "???",
                    type: frontmatter.type || "???",
                    section: frontmatter.section || "???",
                    filePath: file.path,
                    order: frontmatter.order || 0 // Добавлено недостающее свойство order
                });
            } catch (error) {
                console.error(`Error reading file ${file.path}:`, error);
            }
        }

        return items;
    }

    private static async handleExport(
        settings: PersonalDevelopmentPlanSettings,
        vault: Vault,
        metadataCache: any
    ) {
        try {
            const items = await this.getKnowledgeItems(vault, settings, metadataCache);
            await this.exportToJSON(items);
            new Notice(t('exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            new Notice(t('exportError'));
        }
    }

    private static async exportToJSON(items: KnowledgeItem[]) {
        const jsonStr = JSON.stringify(items, null, 2);

        // Create download link
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-base-export-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
