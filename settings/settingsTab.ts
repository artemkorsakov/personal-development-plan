import { App, Plugin, Setting, PluginSettingTab } from 'obsidian';
import { PersonalDevelopmentPlanSettings, DEFAULT_SETTINGS, MaterialType, Section } from './settings';
import { getLocalizedSettings } from './../main/localization';

export class PersonalDevelopmentPlanSettingsTab extends PluginSettingTab {
    plugin: Plugin;
    settings: PersonalDevelopmentPlanSettings;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = (plugin as any).settings;
    }

    display(): void {
        const { containerEl } = this;
        const t = getLocalizedSettings();

        containerEl.empty();
        containerEl.createEl('h1', { text: t.settingsTitle });

        this.addGeneralSettings();
        this.addMaterialTypesSettings();
        this.addSectionsSettings();
        this.addPeriodicTasksSettings();
    }

    addGeneralSettings(): void {
        const { containerEl } = this;
        const t = getLocalizedSettings();

        containerEl.createEl('h2', { text: t.generalSettings });

        // Task limits
        new Setting(containerEl)
            .setName(t.maxActiveTasks)
            .setDesc(t.maxActiveTasksDesc)
            .addSlider(slider => slider
                .setLimits(1, 10, 1)
                .setValue(this.settings.maxActiveTasks)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.settings.maxActiveTasks = value;
                    await (this.plugin as any).saveSettings();
                }));

        // Stats start date
        new Setting(containerEl)
            .setName(t.statsStartDate)
            .setDesc(t.statsStartDateDesc)
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD')
                .setValue(this.settings.statsStartDate)
                .onChange(async (value) => {
                    this.settings.statsStartDate = value;
                    await (this.plugin as any).saveSettings();
                }));
    }

    addMaterialTypesSettings(): void {
        const { containerEl } = this;
        const t = getLocalizedSettings();

        containerEl.createEl('h2', { text: t.materialTypes });

        // Material types list
        this.settings.materialTypes.forEach((material, index) => {
            // Основные настройки типа материала (название, переключатель, кнопки вверх/вниз)
            const setting = new Setting(containerEl)
                .setName(material.name)
                .addToggle(toggle => toggle
                    .setValue(material.enabled)
                    .onChange(async (value) => {
                        material.enabled = value;
                        await (this.plugin as any).saveSettings();
                    }))
                .addText(text => text
                    .setPlaceholder(t.typeName)
                    .setValue(material.name)
                    .onChange(async (value) => {
                        material.name = value;
                        await (this.plugin as any).saveSettings();
                    }))
                .addButton(button => button
                    .setButtonText('↑')
                    .onClick(async () => {
                        if (index > 0) {
                            const temp = this.settings.materialTypes[index - 1];
                            this.settings.materialTypes[index - 1] = material;
                            this.settings.materialTypes[index] = temp;
                            await (this.plugin as any).saveSettings();
                            this.display();
                        }
                    }))
                .addButton(button => button
                    .setButtonText('↓')
                    .onClick(async () => {
                        if (index < this.settings.materialTypes.length - 1) {
                            const temp = this.settings.materialTypes[index + 1];
                            this.settings.materialTypes[index + 1] = material;
                            this.settings.materialTypes[index] = temp;
                            await (this.plugin as any).saveSettings();
                            this.display();
                        }
                    }));

            // Добавляем кнопку "Добавить пункт" (оставляем её в основной строке)
            setting.addButton(button => button
                .setButtonText(t.addItem)
                .onClick(async () => {
                    material.checklistItems.push('');
                    await (this.plugin as any).saveSettings();
                    this.display();
                }));

            // Каждый пункт чеклиста выводим в отдельной строке
            material.checklistItems.forEach((item, itemIndex) => {
                new Setting(containerEl)
					.addText(text => {
                        text.inputEl.style.width = "100%"; // Растягиваем на всю ширину
                        text
                            .setPlaceholder(t.checklistItem)
                            .setValue(item)
                            .onChange(async (value) => {
                                material.checklistItems[itemIndex] = value;
                                await (this.plugin as any).saveSettings();
                            });
                    })
                    .addButton(button => button
                        .setButtonText('×') // или '−' для удаления
                        .onClick(async () => {
                            material.checklistItems.splice(itemIndex, 1);
                            await (this.plugin as any).saveSettings();
                            this.display();
                        }));
            });
        });

        // Добавление нового типа материала (оставляем без изменений)
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(t.addNewType)
                .onClick(async () => {
                    const newType: MaterialType = {
                        id: `custom-${Date.now()}`,
                        name: t.newType,
                        enabled: true,
                        order: this.settings.materialTypes.length,
                        checklistItems: []
                    };
                    this.settings.materialTypes.push(newType);
                    await (this.plugin as any).saveSettings();
                    this.display();
                }));
    }

    addSectionsSettings(): void {
        const { containerEl } = this;
        const t = getLocalizedSettings();

        containerEl.createEl('h2', { text: t.sectionsCategories });

        this.settings.sections.forEach((section, index) => {
            const setting = new Setting(containerEl)
                .setName(section.name)
                .addText(text => text
                    .setPlaceholder(t.sectionName)
                    .setValue(section.name)
                    .onChange(async (value) => {
                        section.name = value;
                        await (this.plugin as any).saveSettings();
                    }))
                .addButton(button => button
                    .setButtonText('↑')
                    .onClick(async () => {
                        if (index > 0) {
                            const temp = this.settings.sections[index - 1];
                            this.settings.sections[index - 1] = section;
                            this.settings.sections[index] = temp;
                            await (this.plugin as any).saveSettings();
                            this.display();
                        }
                    }))
                .addButton(button => button
                    .setButtonText('↓')
                    .onClick(async () => {
                        if (index < this.settings.sections.length - 1) {
                            const temp = this.settings.sections[index + 1];
                            this.settings.sections[index + 1] = section;
                            this.settings.sections[index] = temp;
                            await (this.plugin as any).saveSettings();
                            this.display();
                        }
                    }));
        });

        // Add new section
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(t.addNewSection)
                .onClick(async () => {
                    const newSection: Section = {
                        id: `section-${Date.now()}`,
                        name: t.newSection,
                        order: this.settings.sections.length
                    };
                    this.settings.sections.push(newSection);
                    await (this.plugin as any).saveSettings();
                    this.display();
                }));
    }

    addPeriodicTasksSettings(): void {
        const { containerEl } = this;
        const t = getLocalizedSettings();

        containerEl.createEl('h2', { text: t.periodicTasks });

        // Функция для создания блока задач (чтобы избежать дублирования кода)
        const createTaskSection = (taskType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly') => {
            const taskConfig = this.settings.periodicTasks[taskType];
            const taskName = t[taskType]; // Локализованное название (daily, weekly и т.д.)
            const taskPlaceholder = t[`${taskType}Task`] || t[taskType]; // Плейсхолдер для поля ввода

            // Заголовок и переключатель
            new Setting(containerEl)
                .setName(taskName)
                .addToggle(toggle => toggle
                    .setValue(taskConfig.enabled)
                    .onChange(async (value) => {
                        taskConfig.enabled = value;
                        await (this.plugin as any).saveSettings();
                    }));

            // Список задач
            taskConfig.tasks.forEach((task, index) => {
                const setting = new Setting(containerEl)
                    .setClass('periodic-task-setting');

                // Поле ввода (на всю ширину)
                setting.addText(text => {
                    text.inputEl.style.width = "100%";
                    text
                        .setPlaceholder(taskPlaceholder)
                        .setValue(task)
                        .onChange(async (value) => {
                            taskConfig.tasks[index] = value;
                            await (this.plugin as any).saveSettings();
                        });
                });

                // Кнопка удаления
                setting.addButton(button => button
                    .setButtonText('×')
                    .setClass('delete-task-button')
                    .onClick(async () => {
                        taskConfig.tasks.splice(index, 1);
                        await (this.plugin as any).saveSettings();
                        this.display(); // Перерисовываем интерфейс
                    }));
            });

            // Кнопка "Добавить задачу"
            new Setting(containerEl)
                .addButton(button => button
                    .setButtonText(t.addTask) // "Добавить задачу" из локализации
                    .onClick(async () => {
                        taskConfig.tasks.push('');
                        await (this.plugin as any).saveSettings();
                        this.display();
                    }));
        };

        // Создаем секции для каждого типа задач
        createTaskSection('daily');
        createTaskSection('weekly');
        createTaskSection('monthly');
        createTaskSection('quarterly');
        createTaskSection('yearly');
    }
}
