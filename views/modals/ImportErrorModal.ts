import { App, Modal } from 'obsidian';
import { t } from '../../localization/localization';

export class ImportErrorModal extends Modal {
    private missingTypes: string[];
    private missingSections: string[];

    constructor(app: App, missingTypes: string[], missingSections: string[]) {
        super(app);
        this.missingTypes = missingTypes;
        this.missingSections = missingSections;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h3', { text: t('importErrorTitle') });

        if (this.missingTypes.length > 0) {
            contentEl.createEl('p', { text: t('missingTypes') });
            const typesList = contentEl.createEl('ul');
            this.missingTypes.forEach(type => {
                typesList.createEl('li', { text: type });
            });
        }

        if (this.missingSections.length > 0) {
            contentEl.createEl('p', { text: t('missingSections') });
            const sectionsList = contentEl.createEl('ul');
            this.missingSections.forEach(section => {
                sectionsList.createEl('li', { text: section });
            });
        }

        contentEl.createEl('p', { text: t('importErrorInstructions') });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
