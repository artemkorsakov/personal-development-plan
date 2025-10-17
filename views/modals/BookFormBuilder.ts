import { Setting } from 'obsidian';
import { TaskFormBuilder } from './TaskFormFactory';
import { t } from '../../localization/localization';
import { BookTask } from '../../settings/task-types';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { generateSafeTitle } from '../../utils/taskUtils';

interface BookFormData {
    status: string;
    sectionId?: string;
    order?: number;
    startDate?: string;
    dueDate?: string;
    name?: string;
    authors?: string;
    pages?: number;
    filePath?: string;
    [key: string]: unknown;
}

export class BookFormBuilder extends TaskFormBuilder {
    protected formData: BookFormData;

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
            .setName(t('authors'))
            .addText(text => {
                text.setPlaceholder(t('authorsPlaceholder'))
                    .onChange(value => this.formData.authors = value);
            });

        new Setting(this.container)
            .setName(t('bookName'))
            .addText(text => {
                text.setPlaceholder(t('bookNamePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(this.container)
            .setName(t('pages'))
            .addText(text => {
                text.setPlaceholder(t('pagesPlaceholder'))
                    .inputEl.type = 'number';
                text.onChange(value => this.formData.pages = parseInt(value) || 0);
            });

        this.addCommonFields(this.formData.status);
    }

    getTaskData(): BookTask {
        return {
            status: this.formData.status,
            type: this.getType(),
            section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
            authors: this.formData.authors || '',
            name: this.formData.name || '',
            title: this.generateTitle(),
            pages: this.formData.pages || 0,
            order: this.formData.order || 999,
            startDate: this.formData.startDate || '',
            dueDate: this.formData.dueDate || '',
            filePath: this.formData.filePath || ''
        };
    }

    generateTitle(): string {
        const name = `${this.formData.authors || 'Unknown authors'} - ${this.formData.name || 'Untitled book'}`;
        return generateSafeTitle(name);
    }
}
