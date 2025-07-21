import { t } from './localization';
import { openTaskFile, getTaskTypeIcon, getMaterialNameById } from './common';
import { PersonalDevelopmentPlanSettings } from './../settings/settings';
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
            updateContentView(contentContainer, allItems, 'type', type.id);
            setActiveTab(tab, typeTabs);
        });
        typeTabs.appendChild(tab);
    });

    // Create section tabs
    const uniqueSections = [...settings.sections]
        .sort((a, b) => a.order - b.order);
    uniqueSections.forEach(section => {
        const tab = createTab(
            section.id,
            section.name,
            allItems.filter(item => item.section === section.id).length
        );
        tab.addEventListener('click', () => {
            updateContentView(contentContainer, allItems, 'section', section.id);
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

function updateContentView(
    container: HTMLElement,
    items: KnowledgeItem[],
    filterBy: 'type' | 'section',
    value: string
) {
    container.empty();

    const filteredItems = items.filter(item => item[filterBy] === value)
        .sort((a, b) => a.name.localeCompare(b.name));

    if (filteredItems.length === 0) {
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
    const sectionHeader = document.createElement('th');
    sectionHeader.textContent = t('knowledgeBaseSection');

    headerRow.appendChild(nameHeader);
    headerRow.appendChild(sectionHeader);
    table.appendChild(headerRow);

    // Table rows
    filteredItems.forEach(item => {
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

        const sectionCell = document.createElement('td');
        sectionCell.textContent = item.section;

        row.appendChild(nameCell);
        row.appendChild(sectionCell);
        table.appendChild(row);
    });

    container.appendChild(table);
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
