import { t } from './localization';
import { openTaskFile, getTaskTypeIcon } from './common';
import { PersonalDevelopmentPlanSettings } from './../settings/settings';
import { App, TFile, Vault } from 'obsidian';

interface TaskInProgress {
    name: string;
    type: string;
    section: string;
    order: number;
    startDate: string;
    dueDate: string;
    progress: number;
    filePath: string;
}

export async function getTasksInProgressElement(settings: PersonalDevelopmentPlanSettings): Promise<HTMLElement> {
    // Создаем контейнер для всех задач
    const container = document.createElement('div');
    container.className = 'tasks-container';

    // Получаем все задачи в работе из системы
    const activeTasks = await getActiveTasks(this.app.vault, settings);

    // Проверка на превышение лимита задач
    const maxTasks = settings.maxActiveTasks || 10;
    if (activeTasks.length > maxTasks) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'task-warning';
        warningDiv.textContent = `${t('maxActiveTasksWarning')} (${activeTasks.length} > ${maxTasks})`;
        container.appendChild(warningDiv);
    }

    // Сортировка задач по порядковому номеру
    activeTasks.sort((a, b) => a.order - b.order);

    // Создание карточек задач
    activeTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';

        taskCard.addEventListener('click', () => {
            openTaskFile(task.filePath, this.app.vault);
        });

        // Порядковый номер (в правом верхнем углу)
        const orderBadge = document.createElement('div');
        orderBadge.className = 'task-order-badge';
        orderBadge.textContent = `#${task.order}`;
        taskCard.appendChild(orderBadge);

        // Первая строка (иконка типа, название и секция)
        const firstLine = document.createElement('div');
        firstLine.className = 'task-first-line';

        // Иконка типа задачи
        const typeIcon = document.createElement('span');
        typeIcon.className = 'task-type-icon';
        typeIcon.textContent = getTaskTypeIcon(task.type);
        firstLine.appendChild(typeIcon);

        // Название задачи
        const nameSpan = document.createElement('span');
        nameSpan.className = 'task-name';
        nameSpan.textContent = task.name;
        firstLine.appendChild(nameSpan);

        // Секция задачи
        const sectionSpan = document.createElement('span');
        sectionSpan.className = 'task-section';
        sectionSpan.textContent = `[${task.section}]`;
        firstLine.appendChild(sectionSpan);

        taskCard.appendChild(firstLine);

        // Контейнер дат
        const datesDiv = document.createElement('div');
        datesDiv.className = 'task-dates';

        // Дата начала
        const startDateSpan = document.createElement('span');
        startDateSpan.textContent = `${t('inProgressStartDate')}: ${formatDate(task.startDate)}`;
        datesDiv.appendChild(startDateSpan);

        // Дата завершения
        const dueDateSpan = document.createElement('span');
        dueDateSpan.textContent = `${t('inProgressDueDate')}: ${formatDate(task.dueDate)}`;

        if (isTaskOverdue(task)) {
            dueDateSpan.style.color = 'red';
            dueDateSpan.style.fontWeight = 'bold';
            dueDateSpan.textContent += t('inProgressOverdue');
        }
        datesDiv.appendChild(dueDateSpan);

        taskCard.appendChild(datesDiv);

        // Прогресс (одна строка - бар и значение)
        const progressContainer = document.createElement('div');
        progressContainer.className = 'task-progress-line';

        // Прогресс-бар
        const progressBar = document.createElement('span');
        progressBar.className = 'task-progress-bar';
        progressBar.textContent = `${generateProgressBar(task.progress)} ${task.progress}%`;
        progressContainer.appendChild(progressBar);

        taskCard.appendChild(progressContainer);

        // Добавляем карточку в контейнер
        container.appendChild(taskCard);
    });

    return container;
}

async function getActiveTasks(vault: Vault, settings: PersonalDevelopmentPlanSettings): Promise<TaskInProgress[]> {
    const activeTasks: TaskInProgress[] = [];
    const folderPath = settings.folderPath;

    // Получаем все файлы в указанной папке
    const files = vault.getFiles().filter(file =>
        file.path.startsWith(folderPath + '/') &&
        file.extension === 'md'
    );

    for (const file of files) {
        try {
            // Читаем содержимое файла
            const content = await vault.cachedRead(file);
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

            // Проверяем статус задачи
            if (frontmatter?.status !== 'in-progress') {
                continue;
            }

            // Формируем объект задачи
            const task: TaskInProgress = {
                name: frontmatter?.title || file.basename || "???",
                type: frontmatter?.type || "???",
                section: frontmatter?.section || "???",
                order: frontmatter?.order ?? 100,
                startDate: frontmatter?.startDate || "???",
                dueDate: frontmatter?.dueDate || "???",
                progress: frontmatter?.progress ?? 0,
                filePath: file.path
            };

            activeTasks.push(task);
        } catch (error) {
            console.error(`Error reading file ${file.path}:`, error);
        }
    }

    // Сортируем задачи по порядку
    return activeTasks.sort((a, b) => a.order - b.order);
}

function generateProgressBar(progress: number): string {
    const filled = '🟩';
    const empty = '⬜';
    const totalBlocks = 5;
    const filledBlocks = Math.round(progress / 100 * totalBlocks);
    return filled.repeat(filledBlocks) + empty.repeat(totalBlocks - filledBlocks);
}

function isTaskOverdue(task: TaskInProgress): boolean {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today > dueDate;
}

function formatDate(dateStr: string): string {
    return dateStr;
}
