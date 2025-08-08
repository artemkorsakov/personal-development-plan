import { Plugin, Vault } from 'obsidian';
import { PLAN_VIEW_TYPE } from './views/PlanView';
import { PersonalDevelopmentPlanSettings } from './settings/settings-types';
import { PersonalDevelopmentPlanSettingsTab, DEFAULT_SETTINGS } from './settings/settings';
import { t } from './localization/localization';
import PlanView from './views/PlanView';

export default class PersonalDevelopmentPlanPlugin extends Plugin {
    settings: PersonalDevelopmentPlanSettings;

    async onload() {
        await this.loadSettings();

        this.ensureDefaultSettings();

        this.addSettingTab(new PersonalDevelopmentPlanSettingsTab(this.app, this));

        this.registerView(
            PLAN_VIEW_TYPE,
            (leaf) => new PlanView(leaf, this)
        );

        this.addCommand({
            id: 'open-plan-view',
            name: t('openPlan'),
            callback: () => this.openPlanView()
        });

        this.addRibbonIcon('graduation-cap', t('plan'), () => this.openPlanView());
    }

    private ensureDefaultSettings() {
        const defaultKeys = Object.keys(DEFAULT_SETTINGS) as Array<keyof PersonalDevelopmentPlanSettings>;

        defaultKeys.forEach(key => {
            if (this.settings[key] === undefined) {
                (this.settings[key] as typeof DEFAULT_SETTINGS[typeof key]) = DEFAULT_SETTINGS[key];
            }
        });

        // Special handling for nested structures
        if (!this.settings.materialTypes || this.settings.materialTypes.length === 0) {
            this.settings.materialTypes = [...DEFAULT_SETTINGS.materialTypes];
        }

        if (!this.settings.sections || this.settings.sections.length === 0) {
            this.settings.sections = [...DEFAULT_SETTINGS.sections];
        }

        if (!this.settings.periodicTasks) {
            this.settings.periodicTasks = { ...DEFAULT_SETTINGS.periodicTasks };
        }
    }

    async loadSettings() {
        const loadedData = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async openPlanView() {
        const existing = this.app.workspace.getLeavesOfType(PLAN_VIEW_TYPE);
        if (existing.length > 0) {
            this.app.workspace.revealLeaf(existing[0]);
            return;
        }

        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.setViewState({
            type: PLAN_VIEW_TYPE,
            active: true
        });
        this.app.workspace.revealLeaf(leaf);
    }

    async onunload() {
    }

    get vault(): Vault {
        return this.app.vault;
    }
}
