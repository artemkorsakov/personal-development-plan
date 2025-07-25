import { App, Modal, Setting, Notice } from 'obsidian';
import { BookTask, MaterialType, PersonalDevelopmentPlanSettings } from '../../types';
import { createTaskFile } from '../../utils/fileUtils';
import { t } from '../../localization/localization';

export default class CreateTaskModal extends Modal {
    private settings: PersonalDevelopmentPlanSettings;
    private selectedTaskType: string = '';
    private formData: Record<string, any> = {};

    constructor(app: App, settings: PersonalDevelopmentPlanSettings) {
        super(app);
        this.settings = settings;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('pdp-create-task-modal');

        // Заголовок модального окна
        contentEl.createEl('h2', { text: t('createNewTask') });

        // Выбор типа задачи
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

        // Контейнер для динамической формы
        const formContainer = contentEl.createDiv({ cls: 'task-form-container' });
        this.updateForm(formContainer);

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

    private updateForm(container: HTMLElement) {
        container.empty();

        switch (this.selectedTaskType) {
            case 'book':
                this.renderBookForm(container);
                break;
            case 'article':
                this.renderArticleForm(container);
                break;
            default:
                container.createEl('p', { text: t('selectTaskType') });
        }
    }

    private renderBookForm(container: HTMLElement) {
        new Setting(container)
            .setName(t('authors'))
            .addText(text => {
                text.setPlaceholder(t('authorsPlaceholder'))
                    .onChange(value => this.formData.authors = value);
            });

        new Setting(container)
            .setName(t('bookName'))
            .addText(text => {
                text.setPlaceholder(t('bookNamePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(container)
            .setName(t('pages'))
            .addText(text => {
                text.setPlaceholder(t('pagesPlaceholder'))
                    .inputEl.type = 'number';
                text.onChange(value => this.formData.pages = parseInt(value) || 0);
            });

        new Setting(container)
            .setName(t('section'))
            .addDropdown(dropdown => {
                this.settings.sections
                    .sort((a, b) => a.order - b.order)
                    .forEach(section => {
                        dropdown.addOption(section.id, section.name);
                    });
                dropdown.onChange(value => this.formData.section = value);
            });
    }

    private renderArticleForm(container: HTMLElement) {
        new Setting(container)
            .setName(t('articleTitle'))
            .addText(text => {
                text.setPlaceholder(t('articleTitlePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(container)
            .setName(t('articleUrl'))
            .addText(text => {
                text.setPlaceholder('https://example.com')
                    .onChange(value => this.formData.url = value);
            });

        new Setting(container)
            .setName(t('section'))
            .addDropdown(dropdown => {
                this.settings.sections
                    .sort((a, b) => a.order - b.order)
                    .forEach(section => {
                        dropdown.addOption(section.id, section.name);
                    });
                dropdown.onChange(value => this.formData.section = value);
            });
    }

    private async handleCreateTask() {
        try {
            const taskType = this.settings.materialTypes.find(t => t.id === this.selectedTaskType);
            if (!taskType) throw new Error(t('invalidTaskType'));

            const taskData: Partial<BookTask> = {
				status: 'knowledge-base',
                type: taskType.name,
                order: 999,
                startDate: '',
                dueDate: '',
                ...this.formData
            };

            taskData.title = this.generateTaskTitle(taskData);
            taskData.section = this.settings.sections.find(s => s.id === this.formData.section)?.name || '';
            const content = this.generateTaskContent(taskType);

            await createTaskFile(taskData as BookTask, content, this.settings, this.app.vault);
            new Notice(t('taskCreatedSuccessfully'));
            this.close();
        } catch (error) {
            console.error('Error creating task:', error);
            new Notice(t('taskCreationError') + ': ' + error.message);
        }
    }

    private generateTaskTitle(taskData: Partial<BookTask>): string {
        switch (this.selectedTaskType) {
            case 'book':
                return `${taskData.authors} - ${taskData.name}`;
            case 'article':
                return `Article: ${taskData.name}`;
            default:
                return taskData.name || t('untitledTask');
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
