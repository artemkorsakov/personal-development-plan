import { t } from './localization';
import { openTaskFile, getTaskTypeIcon, getMaterialIdByName } from './common';
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
    const activeTasks = await getActiveTasks(this.app.vault, settings, this.app.metadataCache);

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
    for (const task of activeTasks) {
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
        const typeId = getMaterialIdByName(settings.materialTypes, task.type)
        const typeIcon = document.createElement('span');
        typeIcon.className = 'task-type-icon';
        typeIcon.textContent = getTaskTypeIcon(typeId);
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
    }

    return container;
}

async function getActiveTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings,
    metadataCache: any
): Promise<TaskInProgress[]> {
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
            const frontmatter = metadataCache.getFileCache(file)?.frontmatter;

            // Проверяем статус задачи
            if (frontmatter?.status !== 'in-progress') {
                continue;
            }

            // Рассчитываем прогресс на основе чекбоксов
            const progress = calculateTaskProgress(content);

            // Формируем объект задачи
            const task: TaskInProgress = {
                name: frontmatter?.title || file.basename || "???",
                type: frontmatter?.type || "???",
                section: frontmatter?.section || "???",
                order: frontmatter?.order ?? 100,
                startDate: frontmatter?.startDate || "???",
                dueDate: frontmatter?.dueDate || "???",
                progress: progress,
                filePath: file.path
            };

            activeTasks.push(task);
        } catch (error) {
            console.error(`Error reading file ${file.path}:`, error);
        }
    }

    return activeTasks.sort((a, b) => a.order - b.order);
}

function calculateTaskProgress(content: string): number {
    // Находим все чекбоксы в содержимом
    const checkboxRegex = /- \[(x| )\]/g;
    const checkboxes = content.match(checkboxRegex) || [];

    if (checkboxes.length === 0) {
        return 0;
    }

    // Считаем выполненные чекбоксы
    const completed = checkboxes.filter(cb => cb === '- [x]').length;
    const total = checkboxes.length;

    // Рассчитываем процент выполнения
    return Math.round((completed / total) * 100);
}

function generateProgressBar(progress: number): string {
    const filled = '🟩';
    const empty = '⬜';
    const totalBlocks = 20;
    const filledBlocks = Math.round(progress / 100 * totalBlocks);
    return filled.repeat(filledBlocks) + empty.repeat(totalBlocks - filledBlocks);
}

function isTaskOverdue(task: TaskInProgress): boolean {
    if (task.dueDate === "???") return false;

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today > dueDate && !isNaN(dueDate.getTime());
}

function formatDate(dateStr: string): string {
    if (dateStr === "???") return dateStr;

    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
    } catch {
        return dateStr;
    }
}
