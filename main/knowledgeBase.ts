import { t } from './localization';
import { openTaskFile, getTaskTypeIcon, getMaterialNameById, createHelpIcon, getAvailableTaskTypes, getAvailableSections } from './common';
import { PersonalDevelopmentPlanSettings, MaterialType } from './../settings/settings';
import { App, TFile, Vault } from 'obsidian';
import { BookTask } from './taskTypes';

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

    // Create header with export button and create task button
    const header = document.createElement('div');
    header.className = 'knowledge-header';

    // Add Create Task button
    const createTaskBtn = document.createElement('button');
    createTaskBtn.className = 'knowledge-create-btn';
    createTaskBtn.textContent = t('createNewTask');
    createTaskBtn.addEventListener('click', () => showCreateTaskForm(settings));
    header.appendChild(createTaskBtn);

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
            allItems.filter(item => item.type === type.name).length
        );
        tab.addEventListener('click', () => {
            currentType = type.name;
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
        typeCell.textContent = item.type;

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

function showCreateTaskForm(settings: PersonalDevelopmentPlanSettings) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeSpan = document.createElement('span');
    closeSpan.className = 'close';
    closeSpan.innerHTML = '&times;';
    closeSpan.addEventListener('click', () => modal.remove());

    const title = document.createElement('h2');
    title.textContent = t('createNewTask');

    const taskTypeSelect = document.createElement('select');
    taskTypeSelect.id = 'task-type-select';

    const availableTaskTypes = getAvailableTaskTypes(settings);
    availableTaskTypes.forEach(taskType => {
        const option = document.createElement('option');
        option.value = taskType.id;
        option.textContent = taskType.name;
        taskTypeSelect.appendChild(option);
    });

    const formContainer = document.createElement('div');
    formContainer.id = 'task-form-container';

    // Add event listener to show appropriate form based on task type
    taskTypeSelect.addEventListener('change', () => {
        updateFormBasedOnTaskType(formContainer, taskTypeSelect.value, settings);
    });

    modalContent.appendChild(closeSpan);
    modalContent.appendChild(title);
    modalContent.appendChild(createLabel(t('taskType')));
    modalContent.appendChild(taskTypeSelect);
    modalContent.appendChild(formContainer);

    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'modal-buttons';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = t('cancel');
    cancelButton.addEventListener('click', () => modal.remove());

    const createButton = document.createElement('button');
    createButton.textContent = t('create');
    createButton.className = 'mod-cta';
    createButton.addEventListener('click', () => {
        createTaskBasedOnType(taskTypeSelect.value, settings);
        modal.remove();
    });

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(createButton);
    modalContent.appendChild(buttonsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Initialize form for the first selected task type
    updateFormBasedOnTaskType(formContainer, taskTypeSelect.value, settings);
}

function updateFormBasedOnTaskType(container: HTMLElement, taskTypeId: string, settings: PersonalDevelopmentPlanSettings) {
    container.empty();

    if (taskTypeId === 'book') {
        renderBookTaskForm(container, settings);
    }
    // Add other task type forms here when needed
}

function renderBookTaskForm(container: HTMLElement, settings: PersonalDevelopmentPlanSettings) {
    // Authors field
    container.appendChild(createLabel(t('authors')));
    const authorsInput = document.createElement('input');
    authorsInput.type = 'text';
    authorsInput.id = 'book-authors';
    authorsInput.placeholder = t('authorsPlaceholder');
    container.appendChild(authorsInput);

    // Name field
    container.appendChild(createLabel(t('bookName')));
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'book-name';
    nameInput.placeholder = t('bookNamePlaceholder');
    container.appendChild(nameInput);

    // Pages field
    container.appendChild(createLabel(t('pages')));
    const pagesInput = document.createElement('input');
    pagesInput.type = 'number';
    pagesInput.id = 'book-pages';
    pagesInput.placeholder = t('pagesPlaceholder');
    container.appendChild(pagesInput);

    // Section selection
    container.appendChild(createLabel(t('section')));
    const sectionSelect = document.createElement('select');
    sectionSelect.id = 'book-section';

    const availableSections = getAvailableSections(settings);
    availableSections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        sectionSelect.appendChild(option);
    });

    container.appendChild(sectionSelect);
}

function createTaskBasedOnType(taskTypeId: string, settings: PersonalDevelopmentPlanSettings) {
    if (taskTypeId === 'book') {
        createBookTask(settings);
    }
    // Add other task type creation functions here when needed
}

async function createBookTask(settings: PersonalDevelopmentPlanSettings) {
    const authors = (document.getElementById('book-authors') as HTMLInputElement)?.value;
    const name = (document.getElementById('book-name') as HTMLInputElement)?.value;
    const pages = parseInt((document.getElementById('book-pages') as HTMLInputElement)?.value || '0');
    const sectionId = (document.getElementById('book-section') as HTMLSelectElement)?.value;

    if (!authors || !name || !sectionId) {
        alert(t('fillRequiredFields'));
        return;
    }

    const availableSections = getAvailableSections(settings);
    const section = availableSections.find(s => s.id === sectionId);
    const availableTaskTypes = getAvailableTaskTypes(settings);
    const taskType = availableTaskTypes.find(t => t.id === 'book');

    if (!section || !taskType) {
        alert(t('invalidSectionOrType'));
        return;
    }

    const bookTask: BookTask = {
        type: taskType.name,
        authors: authors,
        name: name,
        pages: pages,
        title: `${authors} - ${name}`,
        status: 'knowledge-base',
        section: section.name,
        order: 999,
        startDate: '',
        dueDate: ''
    };

    const content = `${t('bookContentHeader')}${
        taskType.checklistItems.map(item => `- [ ] ${item}`).join('\n')
    }`;

    await createTaskFile(bookTask, content, settings);
}

async function createTaskFile(task: BookTask, content: string, settings: PersonalDevelopmentPlanSettings) {
    const fileName = `${task.title}.md`;
    const filePath = `${settings.folderPath}/${fileName}`;

    const frontmatter = `---\n${Object.entries(task)
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
        .join('\n')}\n---\n\n${content}`;

    try {
        await this.app.vault.create(filePath, frontmatter);
    } catch (error) {
        console.error('Error creating task file:', error);
        alert(t('fileCreationError'));
    }
}

function createLabel(text: string): HTMLElement {
    const label = document.createElement('label');
    label.textContent = text;
    return label;
}
