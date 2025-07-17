import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { PersonalDevelopmentPlanSettings, DEFAULT_SETTINGS } from './settings/settings';
import { PersonalDevelopmentPlanSettingsTab } from './settings/settingsTab';
import { PlanView, PLAN_VIEW_TYPE } from './main/planView';
import { t } from './main/localization';

export default class PersonalDevelopmentPlanPlugin extends Plugin {
    settings: PersonalDevelopmentPlanSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new PersonalDevelopmentPlanSettingsTab(this.app, this));

	    this.registerView(
            PLAN_VIEW_TYPE,
            (leaf) => new PlanView(leaf)
        );

        this.addCommand({
            id: 'open-plan-view',
            name: t('openPlan'),
            callback: () => this.openPlanView()
        });

        this.addRibbonIcon(
            'graduation-cap',
            t('plan'),
            () => this.openPlanView()
        );

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

    async openPlanView() {
        const { workspace } = this.app;

        // Ищем уже открытый view
        const existing = workspace.getLeavesOfType(PLAN_VIEW_TYPE);
        if (existing.length > 0) {
            workspace.revealLeaf(existing[0]);
            return;
        }

        // Создаем новый leaf в центральной области
        const leaf = workspace.getLeaf('tab');
        await leaf.setViewState({
            type: PLAN_VIEW_TYPE,
            active: true,
        });

        workspace.revealLeaf(leaf);
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(PLAN_VIEW_TYPE);
    }
}
