import { t } from './localization';
import { openTaskFile, getTaskTypeIcon, getMaterialNameById, createHelpIcon } from './common';
import { PersonalDevelopmentPlanSettings, MaterialType } from './../settings/settings';
import { App, TFile, Vault } from 'obsidian';

interface KnowledgeItem {
    name: string;
    type: string;
    section: string;
    filePath: string;
}

export async function getKnowledgeBaseElement(settings: PersonalDevelopmentPlanSettings): Promise<HTMLElement> {
    // Main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'knowledge-base-container';

    // Create header with export button
    const header = document.createElement('div');
    header.className = 'knowledge-header';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'knowledge-export-btn';
    exportBtn.textContent = t('exportToJSON');
    exportBtn.addEventListener('click', () => exportToJSON(settings));
    header.appendChild(exportBtn);

    createHelpIcon(header, t('exportToJSONTooltip'));

    mainContainer.appendChild(header);

    // Tabs container for dual categorization
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'knowledge-tabs-container';

    // Type tabs
    const typeTabs = document.createElement('div');
    typeTabs.className = 'knowledge-type-tabs';

    // Section tabs
    const sectionTabs = document.createElement('div');
    sectionTabs.className = 'knowledge-section-tabs';

    tabsContainer.appendChild(typeTabs);
    tabsContainer.appendChild(sectionTabs);
    mainContainer.appendChild(tabsContainer);

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'knowledge-content-container';
    mainContainer.appendChild(contentContainer);

    // Get all knowledge items
    const allItems = await getKnowledgeItems(this.app.vault, settings);

    // Track currently selected type and section
    let currentType: string | null = null;
    let currentSection: string | null = null;

    // Function to update section tabs counts based on current filters
    const updateSectionTabsCounts = () => {
        const sectionTabs = mainContainer.querySelector('.knowledge-section-tabs');
        if (!sectionTabs) return;

        sectionTabs.querySelectorAll('.knowledge-tab').forEach(tab => {
            const sectionId = tab.getAttribute('data-id');
            const section = settings.sections.find(s => s.id === sectionId);
            if (!section) return;

            const count = currentType
                ? allItems.filter(item => item.section === section.name && item.type === currentType).length
                : allItems.filter(item => item.section === section.name).length;

            // Update count in the tab label
            const labelSpan = tab.querySelector('.knowledge-tab-label');
            if (labelSpan) {
                const label = section.name;
                labelSpan.textContent = `${label} (${count})`;
            }
        });
    };

    // Function to update content view based on current filters
    const updateContent = () => {
        let filteredItems = [...allItems];

        // Apply type filter if set
        if (currentType) {
            filteredItems = filteredItems.filter(item => item.type === currentType);
        }

        // Apply section filter if set
        if (currentSection) {
            filteredItems = filteredItems.filter(item => item.section === currentSection);
        }

        // Update the content view
        renderContent(contentContainer, filteredItems, settings.materialTypes);
    };

    // Create type tabs
    const sortedTypes = [...settings.materialTypes]
        .filter(type => type.enabled)
        .sort((a, b) => a.order - b.order);

    sortedTypes.forEach(type => {
        const tab = createTab(
            type.id,
            `${getTaskTypeIcon(type.id)} ${type.name}`,
            allItems.filter(item => item.type === type.id).length
        );
        tab.addEventListener('click', () => {
            currentType = type.id;
            currentSection = null; // Reset section when type changes
            updateContent();
            setActiveTab(tab, typeTabs);
            resetActiveTab(sectionTabs);
            updateSectionTabsCounts(); // Обновляем счетчики в секциях
        });
        typeTabs.appendChild(tab);
    });

    // Create section tabs
    const uniqueSections = [...settings.sections]
        .sort((a, b) => a.order - b.order);
    uniqueSections.forEach(section => {
        // Initial count calculation
        const initialCount = allItems.filter(item => item.section === section.name).length;

        const tab = createTab(
            section.id,
            section.name,
            initialCount
        );
        tab.addEventListener('click', () => {
            currentSection = section.name;
            updateContent();
            setActiveTab(tab, sectionTabs);
        });
        sectionTabs.appendChild(tab);
    });

    // Set initial view (first type tab)
    if (sortedTypes.length > 0) {
        const firstTab = typeTabs.children[0] as HTMLElement;
        firstTab.click();
    }

    return mainContainer;
}

// Function to render content based on filtered items
function renderContent(container: HTMLElement, items: KnowledgeItem[], materialTypes: MaterialType[]) {
    container.empty();

    const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

    if (sortedItems.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'knowledge-empty-msg';
        emptyMsg.textContent = t('noTasksForThisType');
        container.appendChild(emptyMsg);
        return;
    }

    // Create table
    const table = document.createElement('table');
    table.className = 'knowledge-items-table';

    // Table header
    const headerRow = document.createElement('tr');
    const nameHeader = document.createElement('th');
    nameHeader.textContent = t('knowledgeBaseName');
    const typeHeader = document.createElement('th');
    typeHeader.textContent = t('knowledgeBaseType');
    const sectionHeader = document.createElement('th');
    sectionHeader.textContent = t('knowledgeBaseSection');

    headerRow.appendChild(nameHeader);
    headerRow.appendChild(typeHeader);
    headerRow.appendChild(sectionHeader);
    table.appendChild(headerRow);

    // Table rows
    sortedItems.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'knowledge-item-row';

        const nameCell = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.href = '#';
        nameLink.textContent = item.name;
        nameLink.addEventListener('click', (e) => {
            e.preventDefault();
            openTaskFile(item.filePath, this.app.vault);
        });
        nameCell.appendChild(nameLink);

        const typeCell = document.createElement('td');
        typeCell.textContent = getMaterialNameById(materialTypes, item.type);

        const sectionCell = document.createElement('td');
        sectionCell.textContent = item.section;

        row.appendChild(nameCell);
        row.appendChild(typeCell);
        row.appendChild(sectionCell);
        table.appendChild(row);
    });

    container.appendChild(table);
}

// Новая функция для сброса активной вкладки
function resetActiveTab(container: HTMLElement) {
    container.querySelectorAll('.knowledge-tab').forEach(tab => {
        tab.classList.remove('active');
    });
}

function createTab(id: string, label: string, count: number): HTMLElement {
    const tab = document.createElement('div');
    tab.className = 'knowledge-tab';
    tab.dataset.id = id;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'knowledge-tab-label';
    labelSpan.textContent = `${label} (${count})`;

    tab.appendChild(labelSpan);
    return tab;
}

function setActiveTab(tab: HTMLElement, container: HTMLElement) {
    container.querySelectorAll('.knowledge-tab').forEach(t =>
        t.classList.remove('active'));
    tab.classList.add('active');
}

async function getKnowledgeItems(vault: Vault, settings: PersonalDevelopmentPlanSettings): Promise<KnowledgeItem[]> {
    const items: KnowledgeItem[] = [];
    const folderPath = settings.folderPath;

    const files = vault.getFiles().filter(file =>
        file.path.startsWith(folderPath + '/') &&
        file.extension === 'md'
    );

    for (const file of files) {
        try {
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
            if (!frontmatter) continue;

            // Проверяем статус задачи
            if (frontmatter?.status !== 'knowledge-base') {
                continue;
            }

            const item: KnowledgeItem = {
                name: frontmatter?.title || file.basename || "???",
                type: frontmatter?.type || "???",
                section: frontmatter?.section || "???",
                filePath: file.path
            };

            items.push(item);
        } catch (error) {
            console.error(`Error reading file ${file.path}:`, error);
        }
    }

    return items;
}

async function exportToJSON(settings: PersonalDevelopmentPlanSettings) {
    const items = await getKnowledgeItems(this.app.vault, settings);
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
