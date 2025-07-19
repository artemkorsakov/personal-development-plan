import { t } from './localization';
import { openTaskFile } from './common';
import { PersonalDevelopmentPlanSettings } from './../settings/settings';

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

export function getTasksInProgressElement(settings: PersonalDevelopmentPlanSettings): HTMLElement {
    // Создаем контейнер для всех задач
    const container = document.createElement('div');
    container.className = 'tasks-container';

    // Получаем все задачи в работе из системы
    const activeTasks = getActiveTasks();

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
            openTaskFile(task.filePath);
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

function getActiveTasks(): TaskInProgress[] {
    // Логика получения активных задач
    return [
        {
            name: "Прочитать книгу 'Atomic Habits'",
            type: "Книга",
            section: "Саморазвитие",
            order: 1,
            startDate: "2023-10-01",
            dueDate: "2023-11-15",
            progress: 60,
            filePath: "Tasks/Book.md"
        },
        {
            name: "Прочитать статью 'Как работать над проектом'",
            type: "Статья",
            section: "Проектирование",
            order: 3,
            startDate: "2025-07-01",
            dueDate: "2025-07-25",
            progress: 40,
            filePath: "Tasks/Article.md"
        },
        {
            name: "Прослушать подкаст 'Culips'",
            type: "Подкаст",
            section: "Learning English",
            order: 2,
            startDate: "2025-06-01",
            dueDate: "2025-12-25",
            progress: 11,
            filePath: "Tasks/Podcast.md"
        }
    ];
}

function getTaskTypeIcon(type: string): string {
    const icons: Record<string, string> = {
        "Книга": "📚",
        "Статья": "📄",
        "Курс": "🎓",
        "Видео": "▶️",
        "Подкаст": "🎧"
    };
    return icons[type] || "✏️";
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
