import { Setting } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { getMaterialNameById } from '../../settings/settings-types';

export abstract class TaskFormBuilder {
    protected formData: Record<string, any> = {};

    constructor(
        protected settings: PersonalDevelopmentPlanSettings,
        protected container: HTMLElement,
        protected taskStatus: string,
        protected taskType: string
    ) {
        this.formData.status = taskStatus;
    }

    abstract buildForm(): void;
    abstract getTaskData(): any;
    abstract generateTitle(): string;

    protected addSectionField() {
        new Setting(this.container)
            .setName(t('section'))
            .addDropdown(dropdown => {
                const sections = this.settings.sections.sort((a, b) => a.order - b.order);
                sections.forEach(section => {
                    dropdown.addOption(section.id, section.name);
                });

                if (sections.length > 0) {
                    this.formData.sectionId = sections[0].id;
                    dropdown.setValue(sections[0].id);
                }

                dropdown.onChange(value => this.formData.sectionId = value);
            });
    }

    protected addCommonFields(status: string) {
        if (status !== 'knowledge-base') {
            new Setting(this.container)
                .setName(t('taskOrder'))
                .addText(text => {
                    text.setPlaceholder('999')
                        .inputEl.type = 'number';
                    text.setValue('999');
                    text.onChange(value => {
                        this.formData.order = parseInt(value) || 999;
                    });
                });

            if (status === 'in-progress') {
                new Setting(this.container)
                    .setName(t('inProgressStartDate'))
                    .addText(text => {
                        text.setPlaceholder('YYYY-MM-DD')
                            .onChange(value => {
                                this.formData.startDate = value;
                            });
                    });

                new Setting(this.container)
                    .setName(t('inProgressDueDate'))
                    .addText(text => {
                        text.setPlaceholder('YYYY-MM-DD')
                            .onChange(value => {
                                this.formData.dueDate = value;
                            });
                    });
            }
        }
    }

    protected getType() {
		return getMaterialNameById(this.settings.materialTypes, this.taskType);
	}
}
