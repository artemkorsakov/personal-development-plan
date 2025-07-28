import { Setting } from 'obsidian';
import { TaskFormBuilder } from './TaskFormFactory';
import { t } from '../../localization/localization';
import { PodcastTask } from '../../settings/task-types';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';

export class PodcastFormBuilder extends TaskFormBuilder {
    constructor(
        settings: PersonalDevelopmentPlanSettings,
        container: HTMLElement,
        taskStatus: string,
        taskType: string
    ) {
        super(settings, container, taskStatus, taskType);
    }

    buildForm() {
        this.addSectionField();

        new Setting(this.container)
            .setName(t('podcastTitle'))
            .addText(text => {
                text.setPlaceholder(t('podcastTitlePlaceholder'))
                    .onChange(value => this.formData.name = value);
            });

        new Setting(this.container)
            .setName(t('author'))
            .addText(text => {
                text.setPlaceholder(t('authorPlaceholder'))
                    .onChange(value => this.formData.author = value);
            });

        new Setting(this.container)
            .setName(t('platform'))
            .addText(text => {
                text.setPlaceholder('Spotify, Apple Podcasts etc.')
                    .onChange(value => this.formData.platform = value);
            });

        new Setting(this.container)
            .setName(t('podcastUrl'))
            .addText(text => {
                text.setPlaceholder('https://example.com')
                    .onChange(value => this.formData.link = value);
            });

        new Setting(this.container)
            .setName(t('durationInMinutes'))
            .addText(text => {
                text.setPlaceholder('60')
                    .inputEl.type = 'number';
                text.onChange(value => {
                    this.formData.durationInMinutes = parseFloat(value) || 0;
                });
            });

        this.addCommonFields(this.formData.status);
    }

    getTaskData(): PodcastTask {
        return {
            status: this.formData.status,
            type: this.getType(),
            section: this.settings.sections.find(s => s.id === this.formData.sectionId)?.name || '',
            title: this.generateTitle(),
            author: this.formData.author || '',
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
        return this.formData.name || 'Untitled podcast';
    }
}
