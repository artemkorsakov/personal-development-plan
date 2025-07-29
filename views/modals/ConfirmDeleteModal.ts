import { Modal } from 'obsidian';
import { t, tParametrized } from '../../localization/localization';

export class ConfirmDeleteModal extends Modal {
    private resolve: (confirmed: boolean) => void;
    private promise: Promise<boolean>;

    constructor(app: any, private itemName: string) {
        super(app);
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.titleEl.setText(t('confirmDeletion'));
        const confirmationText = tParametrized('confirmDeleteTask', { taskName: this.itemName });

        this.contentEl.createEl('p', {
            text: confirmationText
        });

        const buttonContainer = this.contentEl.createDiv({ cls: 'modal-button-container' });
        const deleteBtn = buttonContainer.createEl('button', {
            text: t('delete'),
            cls: 'modal-delete-btn'
        });
        deleteBtn.addEventListener('click', () => {
            this.resolve(true);
            this.close();
        });

        const cancelBtn = buttonContainer.createEl('button', {
            text: t('cancel'),
            cls: 'modal-cancel-btn'
        });
        cancelBtn.addEventListener('click', () => {
            this.resolve(false);
            this.close();
        });
    }

    async waitForClose(): Promise<boolean> {
        await this.promise;
        return this.promise;
    }

    onClose() {
        this.resolve(false);
    }
}
