import { Modal } from 'obsidian';
import { t } from '../../localization/localization';

export interface PlanTaskModalData {
    order: number;
}

export class PlanTaskModal extends Modal {
    private orderInput: HTMLInputElement;
    private resolve: (data: PlanTaskModalData | null) => void;
    private promise: Promise<PlanTaskModalData | null>;

    constructor(app: any) {
        super(app);
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.titleEl.setText(t('planTask'));
        const reminderContainer = this.contentEl.createDiv({ cls: 'task-reminder-container' });
        reminderContainer.createDiv({ cls: 'task-reminder' }, el => {
            el.textContent = t('dontForgetToFillPlan');
        });

        const form = this.contentEl.createEl('form');
        form.createEl('label', { text: t('taskOrder'), attr: { for: 'task-order' } });

        // Исправленное создание input элемента
        this.orderInput = form.createEl('input', {
            attr: {
                type: 'number',
                id: 'task-order',
                value: '1',
                min: '1'
            }
        });

        const buttonContainer = form.createDiv({ cls: 'modal-button-container' });
        const saveBtn = buttonContainer.createEl('button', {
            text: t('save'),
            cls: 'modal-save-btn'
        });
        saveBtn.type = 'submit';

        const cancelBtn = buttonContainer.createEl('button', {
            text: t('cancel'),
            cls: 'modal-cancel-btn'
        });
        cancelBtn.type = 'button';
        cancelBtn.addEventListener('click', () => {
            this.resolve(null);
            this.close();
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            this.resolve({
                order: parseInt(this.orderInput.value)
            });
            this.close();
        });
    }

    async waitForClose(): Promise<PlanTaskModalData | null> {
        await this.promise;
        return this.promise;
    }

    onClose() {
        this.resolve(null);
    }
}
