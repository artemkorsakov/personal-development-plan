import { t } from './localization';
import { openTaskFile, getTaskTypeIcon, getMaterialNameById } from './common';
import { PersonalDevelopmentPlanSettings } from './../settings/settings';
import { App, TFile, Vault } from 'obsidian';

interface PlannedTask {
    name: string;
    type: string;
    section: string;
    order: number;
    filePath: string;
}

export async function getPlannedTasksElement(settings: PersonalDevelopmentPlanSettings): Promise<HTMLElement> {
    // Основной контейнер
    const mainContainer = document.createElement('div');
    mainContainer.className = 'planned-main-container';

    // Контейнер вкладок
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'planned-tabs-container';
    mainContainer.appendChild(tabsContainer);

    // Контейнер контента
    const contentContainer = document.createElement('div');
    contentContainer.className = 'planned-content-container';
    mainContainer.appendChild(contentContainer);

    // Получаем все задачи
    const allTasks = await getPlannedTasks(this.app.vault, settings);

    const sortedTypes = [...settings.materialTypes]
        .filter(type => type.enabled)
        .sort((a, b) => a.order - b.order);

    // Создаем вкладки для каждого типа материала
    sortedTypes.forEach(materialType => {
        const tab = document.createElement('div');
        tab.className = 'planned-tab';
        tab.dataset.type = materialType.id;

        const icon = document.createElement('span');
        icon.className = 'planned-tab-icon';
        icon.textContent = getTaskTypeIcon(materialType.id);
        tab.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'planned-tab-label';

        // Подсчет задач для этого типа
        const taskCount = allTasks.filter(task => task.type === materialType.id).length;
        label.textContent = `${materialType.name} (${taskCount})`;
        tab.appendChild(label);

        // Обработчик клика по вкладке
        tab.addEventListener('click', () => {
            // Убираем активный класс у всех вкладок
            document.querySelectorAll('.planned-tab').forEach(t =>
                t.classList.remove('active'));

            // Добавляем активный класс текущей вкладке
            tab.classList.add('active');

            // Обновляем контент
            updateContent(contentContainer, allTasks, materialType.id);
        });

        tabsContainer.appendChild(tab);
    });

    // Активируем первую вкладку по умолчанию
    const firstTab = tabsContainer.querySelector('.planned-tab') as HTMLElement;
    if (firstTab) {
        firstTab.classList.add('active');
        const defaultType = firstTab.dataset.type || '';
        updateContent(contentContainer, allTasks, defaultType);
    }

    return mainContainer;
}

function updateContent(container: HTMLElement, tasks: PlannedTask[], type: string) {
    container.empty();

    // Фильтруем задачи по выбранному типу
    const filteredTasks = tasks.filter(task => task.type === type);

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'planned-empty-message';
        emptyMessage.textContent = t('noTasksForThisType');
        container.appendChild(emptyMessage);
        return;
    }

    // Сортируем задачи
    filteredTasks.sort((a, b) => a.order - b.order);

    // Создаем карточки задач
    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'planned-card';

        taskCard.addEventListener('click', () => {
            openTaskFile(task.filePath, this.app.vault);
        });

        // Порядковый номер
        const orderBadge = document.createElement('div');
        orderBadge.className = 'planned-order-badge';
        orderBadge.textContent = `#${task.order}`;
        taskCard.appendChild(orderBadge);

        // Название задачи
        const nameSpan = document.createElement('div');
        nameSpan.className = 'planned-name';
        nameSpan.textContent = task.name;
        taskCard.appendChild(nameSpan);

        // Раздел задачи
        const sectionSpan = document.createElement('div');
        sectionSpan.className = 'planned-section';
        sectionSpan.textContent = `[${task.section}]`;
        taskCard.appendChild(sectionSpan);

        container.appendChild(taskCard);
    });
}

async function getPlannedTasks(vault: Vault, settings: PersonalDevelopmentPlanSettings): Promise<PlannedTask[]> {
    const plannedTasks: PlannedTask[] = [];
    const folderPath = settings.folderPath;

    const files = vault.getFiles().filter(file =>
        file.path.startsWith(folderPath + '/') &&
        file.extension === 'md'
    );

    for (const file of files) {
        try {
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

            if (frontmatter?.status !== 'planned') {
                continue;
            }

            const task: PlannedTask = {
                name: frontmatter?.title || file.basename || "???",
                type: frontmatter?.type || "???",
                section: frontmatter?.section || "???",
                order: frontmatter?.order ?? 100,
                filePath: file.path
            };

            plannedTasks.push(task);
        } catch (error) {
            console.error(`Error reading file ${file.path}:`, error);
        }
    }

    return plannedTasks;
}
