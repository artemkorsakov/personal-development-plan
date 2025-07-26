import { App, Modal, Setting, Notice } from 'obsidian';
import { createTaskFile } from '../../utils/fileUtils';
import { t } from '../../localization/localization';
import { MaterialType, PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { TaskFormBuilder } from './TaskFormFactory';
import { ArticleFormBuilder } from './ArticleFormBuilder';
import { BookFormBuilder } from './BookFormBuilder';

export default class CreateTaskModal extends Modal {
    private settings: PersonalDevelopmentPlanSettings;
    private selectedTaskType: string = '';
    private onSubmitCallback: ((success: boolean, taskType?: string) => void) | null = null;
    private taskStatus: string;
    private formBuilder: TaskFormBuilder | null = null;
    private typeDropdown: HTMLSelectElement | null = null;
    private formContainer: HTMLElement | null = null;

    constructor(
        app: App,
        settings: PersonalDevelopmentPlanSettings,
        taskStatus: string,
        onSubmit?: (success: boolean, taskType?: string) => void
    ) {
        super(app);
        this.settings = settings;
        this.taskStatus = taskStatus;
        this.onSubmitCallback = onSubmit || null;
    }

    setInitialType(type: string) {
        this.selectedTaskType = type;
        if (this.typeDropdown) {
            this.typeDropdown.value = type;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('pdp-create-task-modal');

        // Заголовок
        contentEl.createEl('h2', { text: t('createNewTask') });

        // Поле выбора типа
        const typeSetting = new Setting(contentEl)
            .setName(t('taskType'))
            .addDropdown(dropdown => {
                this.typeDropdown = dropdown.selectEl;
                const taskTypes = this.getAvailableTaskTypes();
                taskTypes.forEach(type => {
                    dropdown.addOption(type.id, type.name);
                });

                dropdown.onChange(value => {
                    this.selectedTaskType = value;
                    this.updateForm();
                    setTimeout(() => dropdown.selectEl.focus(), 0);
                });

                this.selectedTaskType = taskTypes[0]?.id || '';
                dropdown.setValue(this.selectedTaskType);
            });

        // Контейнер для динамической формы
        this.formContainer = contentEl.createDiv({ cls: 'task-form-container' });
        this.updateForm();

        // Напоминалка
        this.renderReminder();

        // Кнопки действий
        const actionsEl = contentEl.createDiv({ cls: 'modal-actions' });
        new Setting(actionsEl)
            .addButton(button => {
                button
                    .setButtonText(t('cancel'))
                    .onClick(() => this.close());
            })
            .addButton(button => {
                button
                    .setButtonText(t('create'))
                    .setCta()
                    .onClick(() => this.handleCreateTask());
            });
    }

    private getAvailableTaskTypes() {
        return this.settings.materialTypes
            .filter(type => type.enabled)
            .sort((a, b) => a.order - b.order);
    }

    private updateForm() {
        if (!this.formContainer) return;

        this.formContainer.empty();

        switch (this.selectedTaskType) {
            case 'book':
                this.formBuilder = new BookFormBuilder(this.settings, this.formContainer, this.taskStatus);
                break;
            case 'article':
                this.formBuilder = new ArticleFormBuilder(this.settings, this.formContainer, this.taskStatus);
                break;
            default:
                this.formContainer.createEl('p', { text: t('selectTaskType') });
                return;
        }

        if (this.formBuilder) {
            this.formBuilder.buildForm();
        }
    }

    private renderReminder() {
        if (this.taskStatus !== 'knowledge-base') {
            const reminderContainer = this.contentEl.createDiv({ cls: 'task-reminder-container' });
            reminderContainer.createDiv({ cls: 'task-reminder' }, el => {
                el.textContent = t('dontForgetToFillPlan');
                el.style.color = 'var(--text-accent)';
                el.style.margin = '10px 0';
                el.style.fontStyle = 'italic';
            });
        }
    }

    private async handleCreateTask() {
        try {
            if (!this.formBuilder) return;

            const taskType = this.settings.materialTypes.find(t => t.id === this.selectedTaskType);
            if (!taskType) throw new Error(t('invalidTaskType'));

            const taskData = this.formBuilder.getTaskData();
            taskData.filePath = `${this.settings.folderPath}/${this.formBuilder.generateTitle()}.md`;

            if (await this.app.vault.adapter.exists(taskData.filePath)) {
                new Notice(t('fileAlreadyExists'));
                return;
            }

            const content = this.generateTaskContent(taskType);
            await createTaskFile(taskData, content, this.settings, this.app.vault);
            await new Promise(resolve => setTimeout(resolve, 200));

            this.close();
            this.onSubmitCallback?.(true, taskType.id);
        } catch (error) {
            console.error('Error creating task:', error);
            new Notice(t('taskCreationError') + ': ' + (error instanceof Error ? error.message : String(error)));
            this.onSubmitCallback?.(false);
        }
    }

    private generateTaskContent(taskType: MaterialType): string {
        return `# ${t('taskLabel')}\n\n` +
               `${t('taskDefaultDescription')}\n\n` +
               `## ${t('checklist')}\n\n` +
               taskType.checklistItems.map(item => `- [ ] ${item}`).join('\n') + '\n\n' +
               `## ${t('notes')}\n\n` +
               `${t('addYourThoughts')}`;
    }

    onClose() {
        this.contentEl.empty();
    }
}
