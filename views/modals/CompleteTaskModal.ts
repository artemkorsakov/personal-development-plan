import { Modal } from 'obsidian';
import { t } from '../../localization/localization';

export interface CompleteTaskModalData {
    review: string;
    rating: number;
    completionDate: string;
}

export class CompleteTaskModal extends Modal {
    private resolve: (data: CompleteTaskModalData | null) => void;
    private promise: Promise<CompleteTaskModalData | null>;
    private ratingSelect: HTMLSelectElement;

    constructor(app: any) {
        super(app);
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });
        this.titleEl.setText(t('completeTask'));
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const today = new Date().toISOString().split('T')[0];

        const form = contentEl.createEl('form');

        // Поле для ревью (на всю ширину)
        const reviewGroup = form.createDiv({ cls: 'modal-form-group full-width' });
        reviewGroup.createEl('label', {
            text: t('taskReview'),
            attr: { for: 'task-review' }
        });
        const reviewTextarea = reviewGroup.createEl('textarea', {
            attr: {
                id: 'task-review',
                placeholder: t('taskReviewPlaceholder')
            },
            cls: 'full-width-textarea'
        });

        // Поле для оценки (выпадающий список)
        const ratingGroup = form.createDiv({ cls: 'modal-form-group' });
        ratingGroup.createEl('label', {
            text: t('taskRating'),
            attr: { for: 'task-rating' }
        });

        this.ratingSelect = ratingGroup.createEl('select', {
            attr: { id: 'task-rating' },
            cls: 'rating-select'
        });

        // Добавляем варианты оценок
        const ratings = [
            { value: 1, label: '★ - ' + t('ratingPoor') },
            { value: 2, label: '★★ - ' + t('ratingFair') },
            { value: 3, label: '★★★ - ' + t('ratingGood') },
            { value: 4, label: '★★★★ - ' + t('ratingVeryGood') },
            { value: 5, label: '★★★★★ - ' + t('ratingExcellent') }
        ];

        ratings.forEach(rating => {
            this.ratingSelect.createEl('option', {
                value: rating.value.toString(),
                text: rating.label
            });
        });

        // Поле для даты завершения
        const dateGroup = form.createDiv({ cls: 'modal-form-group' });
        dateGroup.createEl('label', {
            text: t('completionDate'),
            attr: { for: 'completion-date' }
        });
        const dateInput = dateGroup.createEl('input', {
            attr: {
                type: 'date',
                id: 'completion-date',
                value: today
            }
        });

        // Кнопки
        const buttonContainer = form.createDiv({ cls: 'modal-button-container' });
        const completeBtn = buttonContainer.createEl('button', {
            text: t('complete'),
            cls: 'modal-save-btn',
            type: 'submit'
        });
        const cancelBtn = buttonContainer.createEl('button', {
            text: t('cancel'),
            cls: 'modal-cancel-btn',
            type: 'button'
        });
        cancelBtn.onclick = () => {
            this.resolve(null);
            this.close();
        };

        form.onsubmit = (e) => {
            e.preventDefault();
            this.resolve({
                review: reviewTextarea.value,
                rating: parseInt(this.ratingSelect.value),
                completionDate: dateInput.value || today
            });
            this.close();
        };
    }

    async waitForClose(): Promise<CompleteTaskModalData | null> {
        await this.promise;
        return this.promise;
    }

    onClose() {
        this.resolve(null);
    }
}
