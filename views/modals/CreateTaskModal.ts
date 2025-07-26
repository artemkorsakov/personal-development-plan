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
        if (this.contentEl.querySelector('#task-type')) {
            (this.contentEl.querySelector('#task-type') as HTMLSelectElement).value = type;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('pdp-create-task-modal');

        contentEl.createEl('h2', { text: t('createNewTask') });

        new Setting(contentEl)
            .setName(t('taskType'))
            .addDropdown(dropdown => {
                const taskTypes = this.getAvailableTaskTypes();
                taskTypes.forEach(type => {
                    dropdown.addOption(type.id, type.name);
                });

                dropdown.onChange(value => {
                    this.selectedTaskType = value;
                    this.updateForm(contentEl);
                });

                this.selectedTaskType = taskTypes[0]?.id || '';
                dropdown.setValue(this.selectedTaskType);
            });

        const formContainer = contentEl.createDiv({ cls: 'task-form-container' });
        this.updateForm(formContainer);

        // Добавляем напоминалку перед кнопками
        this.renderReminder();

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

    private updateForm(container: HTMLElement) {
        container.empty();

        switch (this.selectedTaskType) {
            case 'book':
                this.formBuilder = new BookFormBuilder(this.settings, container, this.taskStatus);
                break;
            case 'article':
                this.formBuilder = new ArticleFormBuilder(this.settings, container, this.taskStatus);
                break;
            // Добавить другие case для каждого типа задачи
            default:
                container.createEl('p', { text: t('selectTaskType') });
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
