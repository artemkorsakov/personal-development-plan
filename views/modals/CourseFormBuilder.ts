import { Setting } from 'obsidian';
import { TaskFormBuilder } from './TaskFormFactory';
import { t } from '../../localization/localization';
import { CourseTask, MAX_ORDER } from '../../settings/task-types';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { generateSafeTitle } from '../../utils/taskUtils';

interface CourseFormData {
    status: string;
    sectionId?: string;
    order?: number;
    startDate?: string;
    dueDate?: string;
    name?: string;
    platform?: string;
    link?: string;
    durationInMinutes?: number;
    filePath?: string;
    [key: string]: unknown;
}

export class CourseFormBuilder extends TaskFormBuilder {
    protected formData: CourseFormData;

    constructor(
        settings: PersonalDevelopmentPlanSettings,
        container: HTMLElement,
        taskStatus: string,
        taskType: string
    ) {
        super(settings, container, taskStatus, taskType);
        this.formData = { status: taskStatus };
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
            type: this.getType(),
            section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
            title: this.generateTitle(),
            platform: this.formData.platform || '',
            link: this.formData.link || '',
            durationInMinutes: this.formData.durationInMinutes || 0,
            order: this.formData.order || MAX_ORDER,
            startDate: this.formData.startDate || '',
            dueDate: this.formData.dueDate || '',
            filePath: this.formData.filePath || ''
        };
    }

    generateTitle(): string {
        return generateSafeTitle(this.formData.name || '');
    }
}
