import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import { createTaskFile, generateSafeFilename } from '../../utils/fileUtils';
import { t } from '../../localization/localization';
import { MaterialType, PersonalDevelopmentPlanSettings, generateTaskContent } from '../../settings/settings-types';
import { TaskFormBuilder } from './TaskFormFactory';
import { ArticleFormBuilder } from './ArticleFormBuilder';
import { BookFormBuilder } from './BookFormBuilder';
import { CourseFormBuilder } from './CourseFormBuilder';
import { PodcastFormBuilder } from './PodcastFormBuilder';
import { VideoFormBuilder } from './VideoFormBuilder';
import { UserTypeFormBuilder } from './UserTypeFormBuilder';
import { KNOWLEDGE_BASE, PLANNED } from '../tabs-types';
import { reorderPlannedTasks } from '../../utils/taskUtils';

export default class CreateTaskModal extends Modal {
    private settings: PersonalDevelopmentPlanSettings;
    private selectedTaskType: string = '';
    private onSubmitCallback: ((success: boolean, taskType?: string) => void) | null = null;
    private taskStatus: string;
    private formBuilder: TaskFormBuilder | null = null;
    private typeDropdown: HTMLSelectElement | null = null;
    private formContainer: HTMLElement | null = null;
    private shiftOrderContainer: HTMLElement | null = null;
    private shiftOrderEnabled: boolean = false;

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

        contentEl.createEl('h2', { text: t('createNewTask') });

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
                    window.setTimeout(() => dropdown.selectEl.focus(), 0);
                });

                this.selectedTaskType = taskTypes[0]?.id || '';
                dropdown.setValue(this.selectedTaskType);
            });

        const mainFormContainer = contentEl.createDiv({ cls: 'task-main-container' });
        this.formContainer = mainFormContainer.createDiv({ cls: 'task-form-container' });
        this.shiftOrderContainer = mainFormContainer.createDiv({ cls: 'shift-order-container' });
        this.updateForm();
        this.renderReminder();

        const actionsEl = contentEl.createDiv({ cls: 'modal-actions' });
        new Setting(actionsEl)
            .addButton(button => {
                button
                    .setButtonText(t('create'))
                    .setCta()
                    .onClick(() => this.handleCreateTask());
            })
            .addButton(button => {
                button
                    .setButtonText(t('cancel'))
                    .onClick(() => this.close());
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
            case 'article':
                this.formBuilder = new ArticleFormBuilder(
                    this.settings,
                    this.formContainer,
                    this.taskStatus,
                    this.selectedTaskType
                );
                break;
            case 'book':
                this.formBuilder = new BookFormBuilder(
                    this.settings,
                    this.formContainer,
                    this.taskStatus,
                    this.selectedTaskType
                );
                break;
            case 'course':
                this.formBuilder = new CourseFormBuilder(
                    this.settings,
                    this.formContainer,
                    this.taskStatus,
                    this.selectedTaskType
                );
                break;
            case 'podcast':
                this.formBuilder = new PodcastFormBuilder(
                    this.settings,
                    this.formContainer,
                    this.taskStatus,
                    this.selectedTaskType
                );
                break;
            case 'video':
                this.formBuilder = new VideoFormBuilder(
                    this.settings,
                    this.formContainer,
                    this.taskStatus,
                    this.selectedTaskType
                );
                break;
            default:
                this.formBuilder = new UserTypeFormBuilder(
                    this.settings,
                    this.formContainer,
                    this.taskStatus,
                    this.selectedTaskType
                );
                break;
        }

        if (this.formBuilder) {
            this.formBuilder.buildForm();
        }
        
        this.addOrUpdateShiftOrderCheckbox();
    }

    private addOrUpdateShiftOrderCheckbox() {
        if (this.taskStatus === PLANNED && this.shiftOrderContainer) {
            this.shiftOrderContainer.empty();
            
            new Setting(this.shiftOrderContainer)
                .setName(t('shiftOrderForExistingTasks'))
                .setDesc(t('shiftOrderTooltip'))
                .addToggle(toggle => {
                    toggle
                        .setValue(this.shiftOrderEnabled)
                        .onChange(value => this.shiftOrderEnabled = value);
                });
        } else if (this.shiftOrderContainer) {
            this.shiftOrderContainer.style.display = 'none';
        }
    }

    private renderReminder() {
        if (this.taskStatus !== KNOWLEDGE_BASE) {
            const reminderContainer = this.contentEl.createDiv({ cls: 'task-reminder-container' });
            reminderContainer.createDiv({ cls: 'task-reminder' }, el => {
                el.textContent = t('dontForgetToFillPlan');
            });
        }
    }

    private async handleCreateTask() {
        try {
            if (!this.formBuilder) return;
    
            const taskType = this.settings.materialTypes.find(t => t.id === this.selectedTaskType);
            if (!taskType) throw new Error(t('invalidTaskType'));
    
            const taskData = this.formBuilder.getTaskData();
            const safeFilename = generateSafeFilename(this.formBuilder.generateTitle());
            taskData.filePath = `${this.settings.folderPath}/${safeFilename}.md`;
    
            const existingFile = this.app.vault.getAbstractFileByPath(taskData.filePath);
            if (existingFile && existingFile instanceof TFile) {
                new Notice(t('fileAlreadyExists'));
                return;
            }
    
            if (this.taskStatus === PLANNED && this.shiftOrderEnabled && taskData.order) {
                try {
                    await reorderPlannedTasks(
                        this.app.vault,
                        this.settings,
                        this.app.metadataCache,
                        taskData.order
                    );
                    new Notice(t('tasksReordered'));
                } catch (error) {
                    console.error('Error reordering tasks:', error);
                }
            }
            
            const content = generateTaskContent(taskType);
            await createTaskFile(taskData, content, this.settings, this.app.vault);
            
            this.close();
            
            this.onSubmitCallback?.(true, taskType.id);
            
        } catch (error) {
            console.error('Error creating task:', error);
            new Notice(t('taskCreationError') + ': ' + (error instanceof Error ? error.message : String(error)));
            this.onSubmitCallback?.(false);
        }
    }

    onClose() {
        this.contentEl.empty();
        this.shiftOrderEnabled = false;
    }
}