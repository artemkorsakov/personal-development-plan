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
                const sections = this.settings.sections.sort((a, b) => a.order - b.order);
                sections.forEach(section => {
                    dropdown.addOption(section.id, section.name);
                });

                // Устанавливаем первое значение по умолчанию
                if (sections.length > 0) {
                    this.formData.sectionId = sections[0].id;
                    dropdown.setValue(sections[0].id);
                }

                dropdown.onChange(value => this.formData.sectionId = value);
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
                const sections = this.settings.sections.sort((a, b) => a.order - b.order);
                sections.forEach(section => {
                    dropdown.addOption(section.id, section.name);
                });

                // Устанавливаем первое значение по умолчанию
                if (sections.length > 0) {
                    this.formData.sectionId = sections[0].id;
                    dropdown.setValue(sections[0].id);
                }

                dropdown.onChange(value => this.formData.sectionId = value);
            });
    }

    private async handleCreateTask() {
        try {
            const taskType = this.settings.materialTypes.find(t => t.id === this.selectedTaskType);
            if (!taskType) throw new Error(t('invalidTaskType'));

            // Generate task title to check if it already exists
            const tempTaskData: Partial<BookTask> = {
                type: taskType.name,
                section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
                ...this.formData
            };
            tempTaskData.title = this.generateTaskTitle(tempTaskData);

            // Check if task already exists
            const filePath = `${this.settings.folderPath}/${tempTaskData.title}.md`;
            const fileExists = await this.app.vault.adapter.exists(filePath);
            if (fileExists) {
                new Notice(t('fileAlreadyExists'));
                return;
            }

            const { sectionId, ...taskDataWithoutSectionId } = this.formData;

            const taskData: BookTask = {
                status: 'knowledge-base',
                type: taskType.name,
                section: this.settings.sections.find(s => s.id === sectionId)?.name || '',
                authors: this.formData.authors || '',
                name: this.formData.name || '',
                title: tempTaskData.title as string,
                pages: this.formData.pages || 0,
                order: 999,
                startDate: '',
                dueDate: '',
                filePath: filePath
            };

            const content = this.generateTaskContent(taskType);

            await createTaskFile(taskData, content, this.settings, this.app.vault);
            this.close();
        } catch (error) {
            console.error('Error creating task:', error);
            new Notice(t('taskCreationError') + ': ' + (error instanceof Error ? error.message : String(error)));
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
