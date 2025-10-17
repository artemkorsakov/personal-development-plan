import { App, Plugin, Setting, PluginSettingTab } from 'obsidian';
import { MaterialType, PersonalDevelopmentPlanSettings, Section } from './settings-types';
import { t } from '../localization/localization';
import { TranslationKeys } from '../localization/localization-types';
import PersonalDevelopmentPlanPlugin from '../main';

export class PersonalDevelopmentPlanSettingsTab extends PluginSettingTab {
    private readonly plugin: PersonalDevelopmentPlanPlugin;
    private readonly settings: PersonalDevelopmentPlanSettings;

    constructor(app: App, plugin: PersonalDevelopmentPlanPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = plugin.settings;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('pdp-settings-container');

        new Setting(containerEl)
            .setName(t('settingsTitle'))
            .setHeading()
            .setClass('pdp-settings-title');

        [
            this.addGeneralSettings,
            this.addMaterialTypesSettings,
            this.addSectionsSettings,
            this.addPeriodicTasksSettings
        ].forEach(fn => fn.call(this));
    }

    private updateItemsOrder<T extends { order: number }>(items: T[]): void {
        items.forEach((item, index) => item.order = index);
    }

    private async saveSettings(): Promise<void> {
        await this.plugin.saveSettings();
    }

    private addGeneralSettings(): void {
        const { containerEl } = this;
        const section = containerEl.createDiv({ cls: 'pdp-settings-section' });
        
        new Setting(section)
            .setName(t('generalSettings'))
            .setHeading()
            .setClass('pdp-settings-subtitle');

        new Setting(section)
            .setName(t('folderPath'))
            .setDesc(t('folderPathDesc'))
            .addText(text => {
                text.inputEl.addClass('pdp-settings-input');
                text
                    .setPlaceholder('PersonalDevelopmentPlan')
                    .setValue(this.settings.folderPath)
                    .onChange(async (value) => {
                        this.settings.folderPath = value.trim();
                        await this.saveSettings();
                    });
            });

        new Setting(section)
            .setName(t('historyFolderPath'))
            .setDesc(t('historyFolderPathDesc'))
            .addText(text => {
                text.inputEl.addClass('pdp-settings-input');
                text
                    .setPlaceholder('PersonalDevelopmentPlan/history')
                    .setValue(this.settings.historyFolderPath)
                    .onChange(async (value) => {
                        this.settings.historyFolderPath = value.trim();
                        await this.saveSettings();
                    });
            });

        new Setting(section)
            .setName(t('maxActiveTasks'))
            .setDesc(t('maxActiveTasksDesc'))
            .addSlider(slider => {
                slider.sliderEl.addClass('pdp-settings-slider');
                slider
                    .setLimits(1, 10, 1)
                    .setValue(this.settings.maxActiveTasks)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.settings.maxActiveTasks = value;
                        await this.saveSettings();
                    });
            });

        new Setting(section)
            .setName(t('statsStartDate'))
            .setDesc(t('statsStartDateDesc'))
            .addText(text => {
                text.inputEl.addClass('pdp-settings-input');
                text
                    .setPlaceholder('YYYY-MM-DD')
                    .setValue(this.settings.statsStartDate)
                    .onChange(async (value) => {
                        this.settings.statsStartDate = value;
                        await this.saveSettings();
                    });
            });
    }

    private addMaterialTypesSettings(): void {
        const { containerEl } = this;
        const section = containerEl.createDiv({ cls: 'pdp-settings-section' });
        
        new Setting(section)
            .setName(t('materialTypes'))
            .setHeading()
            .setClass('pdp-settings-subtitle');

        this.settings.materialTypes.forEach((material, index) => {
            const setting = new Setting(section)
                .setName(material.name)
                .addToggle(toggle => {
                    toggle.toggleEl.addClass('pdp-settings-toggle');
                    toggle
                        .setValue(material.enabled)
                        .onChange(async (value) => {
                            material.enabled = value;
                            await this.saveSettings();
                        });
                })
                .addText(text => {
                    text.inputEl.addClass('pdp-settings-input');
                    text
                        .setPlaceholder(t('typeName'))
                        .setValue(material.name)
                        .onChange(async (value) => {
                            material.name = value;
                            await this.saveSettings();
                        });
                })
                .addButton(button => {
                    button.buttonEl.addClass('pdp-settings-button');
                    button.buttonEl.addClass('pdp-settings-button-up');
                    button
                        .setButtonText('↑')
                        .onClick(async () => this.moveMaterialType(index, 'up'));
                })
                .addButton(button => {
                    button.buttonEl.addClass('pdp-settings-button');
                    button.buttonEl.addClass('pdp-settings-button-down');
                    button
                        .setButtonText('↓')
                        .onClick(async () => this.moveMaterialType(index, 'down'));
                });

            setting.addButton(button => {
                button.buttonEl.addClass('pdp-settings-button');
                button.buttonEl.addClass('pdp-settings-button-add');
                button
                    .setButtonText(t('addItem'))
                    .onClick(async () => {
                        material.checklistItems.push('');
                        await this.saveSettings();
                        this.display();
                    });
            });

            material.checklistItems.forEach((item, itemIndex) => {
                new Setting(section)
                    .addText(text => {
                        text.inputEl.addClass('pdp-settings-input');
                        text.inputEl.addClass('pdp-settings-checklist-input');
                        text
                            .setPlaceholder(t('checklistItem'))
                            .setValue(item)
                            .onChange(async (value) => {
                                material.checklistItems[itemIndex] = value;
                                await this.saveSettings();
                            });
                    })
                    .addButton(button => {
                        button.buttonEl.addClass('pdp-settings-button');
                        button.buttonEl.addClass('pdp-settings-button-remove');
                        button
                            .setButtonText('×')
                            .onClick(async () => {
                                material.checklistItems.splice(itemIndex, 1);
                                await this.saveSettings();
                                this.display();
                            });
                    });
            });
        });

        new Setting(section)
            .addButton(button => {
                button.buttonEl.addClass('pdp-settings-button');
                button.buttonEl.addClass('pdp-settings-button-primary');
                button
                    .setButtonText(t('addNewType'))
                    .onClick(async () => {
                        this.settings.materialTypes.push({
                            id: `custom-${Date.now()}`,
                            name: t('newType'),
                            enabled: true,
                            order: this.settings.materialTypes.length,
                            checklistItems: []
                        });
                        await this.saveSettings();
                        this.display();
                    });
            });
    }

    private async moveMaterialType(index: number, direction: 'up' | 'down'): Promise<void> {
        const materials = this.settings.materialTypes;
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < materials.length) {
            [materials[index], materials[newIndex]] = [materials[newIndex], materials[index]];
            this.updateItemsOrder(materials);
            await this.saveSettings();
            this.display();
        }
    }

    private addSectionsSettings(): void {
        const { containerEl } = this;
        const sectionContainer = containerEl.createDiv({ cls: 'pdp-settings-section' });
        
        new Setting(sectionContainer)
            .setName(t('sectionsCategories'))
            .setHeading()
            .setClass('pdp-settings-subtitle');

        this.settings.sections.forEach((section, index) => {
            const setting = new Setting(sectionContainer)
                .setName(section.name)
                .addText(text => {
                    text.inputEl.addClass('pdp-settings-input');
                    text
                        .setPlaceholder(t('sectionName'))
                        .setValue(section.name)
                        .onChange(async (value) => {
                            section.name = value;
                            await this.saveSettings();
                        });
                })
                .addButton(button => {
                    button.buttonEl.addClass('pdp-settings-button');
                    button.buttonEl.addClass('pdp-settings-button-up');
                    button
                        .setButtonText('↑')
                        .onClick(async () => this.moveSection(index, 'up'));
                })
                .addButton(button => {
                    button.buttonEl.addClass('pdp-settings-button');
                    button.buttonEl.addClass('pdp-settings-button-down');
                    button
                        .setButtonText('↓')
                        .onClick(async () => this.moveSection(index, 'down'));
                });
        });

        new Setting(sectionContainer)
            .addButton(button => {
                button.buttonEl.addClass('pdp-settings-button');
                button.buttonEl.addClass('pdp-settings-button-primary');
                button
                    .setButtonText(t('addNewSection'))
                    .onClick(async () => {
                        this.settings.sections.push({
                            id: `section-${Date.now()}`,
                            name: t('newSection'),
                            order: this.settings.sections.length
                        });
                        await this.saveSettings();
                        this.display();
                    });
            });
    }

    private async moveSection(index: number, direction: 'up' | 'down'): Promise<void> {
        const sections = this.settings.sections;
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < sections.length) {
            [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
            this.updateItemsOrder(sections);
            await this.saveSettings();
            this.display();
        }
    }

    private addPeriodicTasksSettings(): void {
        const { containerEl } = this;
        const sectionContainer = containerEl.createDiv({ cls: 'pdp-settings-section' });
        
        new Setting(sectionContainer)
            .setName(t('periodicTasks'))
            .setHeading()
            .setClass('pdp-settings-subtitle');

        const taskTypes = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const;

        taskTypes.forEach(taskType => {
            const taskSection = sectionContainer.createDiv({ cls: 'pdp-task-type-section' });
            const taskConfig = this.settings.periodicTasks[taskType];
            const taskName = t(taskType);
            const taskPlaceholderKey = `${taskType}Task` as const;
            const taskPlaceholder = t(taskPlaceholderKey) || t(taskType);

            new Setting(taskSection)
                .setName(taskName)
                .addToggle(toggle => {
                    toggle.toggleEl.addClass('pdp-settings-toggle');
                    toggle
                        .setValue(taskConfig.enabled)
                        .onChange(async (value) => {
                            taskConfig.enabled = value;
                            await this.saveSettings();
                        });
                });

            taskConfig.tasks.forEach((task, index) => {
                new Setting(taskSection)
                    .addText(text => {
                        text.inputEl.addClass('pdp-settings-input');
                        text.inputEl.addClass('pdp-settings-task-input');
                        text
                            .setPlaceholder(taskPlaceholder)
                            .setValue(task)
                            .onChange(async (value) => {
                                taskConfig.tasks[index] = value;
                                await this.saveSettings();
                            });
                    })
                    .addButton(button => {
                        button.buttonEl.addClass('pdp-settings-button');
                        button.buttonEl.addClass('pdp-settings-button-remove');
                        button
                            .setButtonText('×')
                            .onClick(async () => {
                                taskConfig.tasks.splice(index, 1);
                                await this.saveSettings();
                                this.display();
                            });
                    });
            });

            new Setting(taskSection)
                .addButton(button => {
                    button.buttonEl.addClass('pdp-settings-button');
                    button.buttonEl.addClass('pdp-settings-button-primary');
                    button
                        .setButtonText(t('addTask'))
                        .onClick(async () => {
                            taskConfig.tasks.push('');
                            await this.saveSettings();
                            this.display();
                        });
                });
        });
    }
}

export const DEFAULT_SETTINGS = getDefaultSettings();

function getDefaultSettings(): PersonalDevelopmentPlanSettings {
    const now = new Date().toISOString().split('T')[0];

    const defaultMaterialTypes: MaterialType[] = [
        createMaterialType('book', 0, ['bookTask1', 'bookTask2']),
        createMaterialType('article', 1, ['articleTask1', 'articleTask2']),
        createMaterialType('video', 2, ['videoTask1', 'videoTask2']),
        createMaterialType('podcast', 3, ['podcastTask1', 'podcastTask2']),
        createMaterialType('course', 4, ['courseTask1', 'courseTask2'])
    ];

    const defaultSections: Section[] = [
        createSection('general', 0, 'section1'),
        createSection('learning', 1, 'section2'),
        createSection('work', 2, 'section3')
    ];

    return {
        maxActiveTasks: 5,
        statsStartDate: now,
        folderPath: 'PersonalDevelopmentPlan',
        historyFolderPath: 'PersonalDevelopmentPlan/history',
        materialTypes: defaultMaterialTypes,
        sections: defaultSections,
        periodicTasks: {
            daily: createPeriodicTask(['periodicTasksDaily1', 'periodicTasksDaily2']),
            weekly: createPeriodicTask(['periodicTasksWeekly1', 'periodicTasksWeekly2']),
            monthly: createPeriodicTask(['periodicTasksMonthly1']),
            quarterly: createPeriodicTask(['periodicTasksQuarterly1']),
            yearly: createPeriodicTask(['periodicTasksYearly1'])
        }
    };

    function createMaterialType(type: keyof TranslationKeys, order: number, tasks: (keyof TranslationKeys)[]): MaterialType {
        return {
            id: type,
            name: t(type),
            enabled: true,
            order,
            checklistItems: tasks.map(task => t(task))
        };
    }

    function createSection(id: string, order: number, nameKey: keyof TranslationKeys): Section {
        return {
            id,
            name: t(nameKey),
            order
        };
    }

    function createPeriodicTask(tasks: (keyof TranslationKeys)[]) {
        return {
            enabled: true,
            tasks: tasks.map(task => t(task))
        };
    }
}
