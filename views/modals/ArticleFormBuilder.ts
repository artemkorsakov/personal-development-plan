import { Setting } from 'obsidian';
import { TaskFormBuilder } from './TaskFormFactory';
import { t } from '../../localization/localization';
import { ArticleTask } from '../../settings/task-types';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';

export class ArticleFormBuilder extends TaskFormBuilder {
	constructor(
		settings: PersonalDevelopmentPlanSettings,
        container: HTMLElement,
        taskStatus: string,
        taskType: string
    ) {
		super(settings, container, taskStatus, taskType);
    }

    buildForm() {
        this.addSectionField();

        new Setting(this.container)
            .setName(t('articleTitle'))
            .addText(text => {
                text.setPlaceholder(t('articleTitlePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(this.container)
            .setName(t('articleUrl'))
            .addText(text => {
                text.setPlaceholder('https://example.com')
                    .onChange(value => {
                        this.formData.link = value;
                    });
            });

        new Setting(this.container)
            .setName(t('durationInMinutes'))
            .addText(text => {
                text.setPlaceholder('2')
                    .inputEl.type = 'number';
                text.onChange(value => {
                    this.formData.durationInMinutes = parseFloat(value) || 0;
                });
            });

        this.addCommonFields(this.formData.status);
    }

    getTaskData(): ArticleTask {
        return {
			status: this.formData.status,
            type: this.getType(),
            section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
            title: this.generateTitle(),
            link: this.formData.link || '',
            durationInMinutes: this.formData.durationInMinutes || 0,
            order: this.formData.order || 999,
            startDate: this.formData.startDate || '',
            dueDate: this.formData.dueDate || '',
            filePath: this.formData.filePath
        };
    }

    generateTitle(): string {
        return this.formData.name || 'Untitled article';
    }
}
