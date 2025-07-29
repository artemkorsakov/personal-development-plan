import { Modal } from 'obsidian';
import { t } from '../../localization/localization';

export interface StartTaskModalData {
    startDate: string;
    dueDate: string;
}

export class StartTaskModal extends Modal {
    private startDateInput: HTMLInputElement;
    private dueDateInput: HTMLInputElement;
    private resolve: (data: StartTaskModalData | null) => void;
    private promise: Promise<StartTaskModalData | null>;
    private errorEl: HTMLElement;

    constructor(app: any) {
        super(app);
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.titleEl.setText(t('startTask'));
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // Форматируем текущую дату для input[type="date"]
        const today = new Date();
        const defaultDueDate = new Date();
        defaultDueDate.setDate(today.getDate() + 7); // +7 дней по умолчанию

        const formatDateForInput = (date: Date) => {
            return date.toISOString().split('T')[0];
        };

        const form = contentEl.createEl('form');

        // Элемент для отображения ошибок
        this.errorEl = contentEl.createDiv({
            cls: 'modal-error-message',
            attr: { style: 'color: var(--text-error); margin-bottom: 1em; display: none;' }
        });

        // Поле для даты начала
        const startDateGroup = form.createDiv({ cls: 'modal-form-group' });
        startDateGroup.createEl('label', {
            text: t('inProgressStartDate'),
            attr: { for: 'start-date' }
        });
        this.startDateInput = startDateGroup.createEl('input', {
            attr: {
                type: 'date',
                id: 'start-date',
                value: formatDateForInput(today),
                min: formatDateForInput(today)
            }
        });

        // Поле для даты завершения
        const dueDateGroup = form.createDiv({ cls: 'modal-form-group' });
        dueDateGroup.createEl('label', {
            text: t('inProgressDueDate'),
            attr: { for: 'due-date' }
        });
        this.dueDateInput = dueDateGroup.createEl('input', {
            attr: {
                type: 'date',
                id: 'due-date',
                value: formatDateForInput(defaultDueDate),
                min: formatDateForInput(today)
            }
        });

        // Обновление минимальной даты завершения при изменении даты начала
        this.startDateInput.addEventListener('change', () => {
            this.dueDateInput.min = this.startDateInput.value;
            if (new Date(this.dueDateInput.value) < new Date(this.startDateInput.value)) {
                this.dueDateInput.value = this.startDateInput.value;
            }
        });

        // Кнопки действия
        const buttonContainer = form.createDiv({ cls: 'modal-button-container' });
        const saveBtn = buttonContainer.createEl('button', {
            text: t('save'),
            cls: 'modal-save-btn',
            type: 'submit'
        });

        const cancelBtn = buttonContainer.createEl('button', {
            text: t('cancel'),
            cls: 'modal-cancel-btn',
            type: 'button'
        });
        cancelBtn.addEventListener('click', () => {
            this.resolve(null);
            this.close();
        });

        form.addEventListener('submit', e => {
            e.preventDefault();

            // Валидация дат
            const startDate = new Date(this.startDateInput.value);
            const dueDate = new Date(this.dueDateInput.value);

            if (startDate > dueDate) {
                this.showError(t('dueDateBeforeStartError'));
                return;
            }

            if (dueDate < new Date()) {
                this.showError(t('dueDateInPastError'));
                return;
            }

            this.resolve({
                startDate: this.startDateInput.value,
                dueDate: this.dueDateInput.value
            });
            this.close();
        });
    }

    private showError(message: string) {
        this.errorEl.textContent = message;
        this.errorEl.style.display = 'block';
        setTimeout(() => {
            this.errorEl.style.display = 'none';
        }, 5000);
    }

    async waitForClose(): Promise<StartTaskModalData | null> {
        await this.promise;
        return this.promise;
    }

    onClose() {
        this.resolve(null);
    }
}
