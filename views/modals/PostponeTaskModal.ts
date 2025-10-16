import { App, Modal } from 'obsidian';
import { t } from '../../localization/localization';

export class PostponeTaskModal extends Modal {
    private resolve: (confirmed: boolean) => void;
    private promise: Promise<boolean>;

    constructor(app: App) {
        super(app);
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });
        this.titleEl.setText(t('postponeTask'));
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('p', { text: t('confirmPostponeTask') });

        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        const postponeBtn = buttonContainer.createEl('button', {
            text: t('postpone'),
            cls: 'modal-save-btn'
        });
        postponeBtn.onclick = () => {
            this.resolve(true);
            this.close();
        };

        const cancelBtn = buttonContainer.createEl('button', {
            text: t('cancel'),
            cls: 'modal-cancel-btn'
        });
        cancelBtn.onclick = () => {
            this.resolve(false);
            this.close();
        };
    }

    async waitForClose(): Promise<boolean> {
        await this.promise;
        return this.promise;
    }

    onClose() {
        this.resolve(false);
    }
}
