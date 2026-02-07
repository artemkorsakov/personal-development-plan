import { Setting } from 'obsidian';
import { TaskFormBuilder } from './TaskFormFactory';
import { t } from '../../localization/localization';
import { UserTypeTask, MAX_ORDER } from '../../settings/task-types';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { generateSafeTitle } from '../../utils/taskUtils';

interface UserTypeFormData {
    status: string;
    sectionId?: string;
    order?: number;
    startDate?: string;
    dueDate?: string;
    name?: string;
    laborInputInHours?: number;
    filePath?: string;
    [key: string]: unknown;
}

export class UserTypeFormBuilder extends TaskFormBuilder {
    protected formData: UserTypeFormData;

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
            .setName(t('taskTitle'))
            .addText(text => {
                text.setPlaceholder(t('taskTitlePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(this.container)
            .setName(t('laborInputInHours'))
            .addText(text => {
                text.setPlaceholder('5')
                    .inputEl.type = 'number';
                text.onChange(value => {
                    this.formData.laborInputInHours = parseFloat(value) || 0;
                });
            });

        this.addCommonFields(this.formData.status);
    }

    getTaskData(): UserTypeTask {
        return {
            status: this.formData.status,
            type: this.getType(),
            section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
            title: this.generateTitle(),
            laborInputInHours: this.formData.laborInputInHours || 0,
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
