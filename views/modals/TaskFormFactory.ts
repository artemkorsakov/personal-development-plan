import { Setting } from 'obsidian';
import { t } from '../../localization/localization';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { getMaterialNameById } from '../../settings/settings-types';
import { TaskType } from '../../settings/task-types';
import { formatDateForInput } from '../../utils/dateUtils';

interface TaskFormData {
    status: string;
    sectionId?: string;
    order?: number;
    startDate?: string;
    dueDate?: string;
    name?: string;
    link?: string;
    durationInMinutes?: number;
    filePath?: string;
    [key: string]: unknown;
}

export abstract class TaskFormBuilder {
    protected formData: TaskFormData;

    constructor(
        protected settings: PersonalDevelopmentPlanSettings,
        protected container: HTMLElement,
        protected taskStatus: string,
        protected taskType: string
    ) {
        this.formData = { status: taskStatus };
    }

    abstract buildForm(): void;
    abstract getTaskData(): TaskType;
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
                this.addDateField(t('inProgressStartDate'), 'startDate');
                this.addDateField(t('inProgressDueDate'), 'dueDate');
            }
        }
    }

    /**
     * Добавляет поле ввода даты с календарем
     * @param label Подпись поля
     * @param fieldName Имя поля в formData
     * @param defaultValue Значение по умолчанию (Date или строка в формате YYYY-MM-DD)
     */
    protected addDateField(label: string, fieldName: keyof TaskFormData, defaultValue?: Date | string) {
        const setting = new Setting(this.container)
            .setName(label)
            .addText(text => {
                const inputEl = text.inputEl;
                inputEl.type = 'date';

                // Устанавливаем значение по умолчанию
                if (defaultValue) {
                    const dateValue = typeof defaultValue === 'string'
                        ? defaultValue
                        : formatDateForInput(defaultValue);
                    inputEl.value = dateValue;
                    this.formData[fieldName] = dateValue;
                }

                inputEl.onchange = (e) => {
                    const value = (e.target as HTMLInputElement).value;
                    this.formData[fieldName] = value;
                };
            });

        return setting;
    }

    protected getType() {
        return getMaterialNameById(this.settings.materialTypes, this.taskType);
    }
}
