import { Setting } from 'obsidian';
import { TaskFormBuilder } from './TaskFormFactory';
import { t } from '../../localization/localization';
import { CourseTask } from '../../settings/task-types';
import { getMaterialNameById } from '../../settings/settings-types';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';

export class CourseFormBuilder extends TaskFormBuilder {
    constructor(
        settings: PersonalDevelopmentPlanSettings,
        container: HTMLElement,
        taskStatus: string
    ) {
        super(settings, container, taskStatus);
    }

    buildForm() {
        this.addSectionField();

        new Setting(this.container)
            .setName(t('courseTitle'))
            .addText(text => {
                text.setPlaceholder(t('courseTitlePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(this.container)
            .setName(t('platform'))
            .addText(text => {
                text.setPlaceholder('Coursera, Udemy etc.')
                    .onChange(value => this.formData.platform = value);
            });

        new Setting(this.container)
            .setName(t('courseUrl'))
            .addText(text => {
                text.setPlaceholder('https://example.com')
                    .onChange(value => this.formData.link = value);
            });

        new Setting(this.container)
            .setName(t('durationInMinutes'))
            .addText(text => {
                text.setPlaceholder('600')
                    .inputEl.type = 'number';
                text.onChange(value => {
                    this.formData.durationInMinutes = parseFloat(value) || 0;
                });
            });

        this.addCommonFields(this.formData.status);
    }

    getTaskData(): CourseTask {
        return {
            status: this.formData.status,
            type: getMaterialNameById(this.settings.materialTypes, 'course'),
            section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
            title: this.generateTitle(),
            platform: this.formData.platform || '',
            link: this.formData.link || '',
            durationInMinutes: this.formData.durationInMinutes || 0,
            order: this.formData.order || 999,
            startDate: this.formData.startDate || '',
            dueDate: this.formData.dueDate || '',
            filePath: this.formData.filePath
        };
    }

    generateTitle(): string {
        return this.formData.name || 'Untitled course';
    }
}
