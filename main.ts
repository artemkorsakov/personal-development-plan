import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PersonalDevelopmentPlanSettings, DEFAULT_SETTINGS } from './settings/settings';
import { PersonalDevelopmentPlanSettingsTab } from './settings/settingsTab';

export default class PersonalDevelopmentPlanPlugin extends Plugin {
    settings: PersonalDevelopmentPlanSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new PersonalDevelopmentPlanSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
