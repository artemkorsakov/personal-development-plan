import { ItemView, WorkspaceLeaf, TFile, EventRef } from 'obsidian';
import PersonalDevelopmentPlanPlugin from "../main";
import { TabDefinition, TAB_DEFINITIONS, IN_PROGRESS, PLANNED, KNOWLEDGE_BASE } from './tabs-types';
import { t } from '../localization/localization';
import InProgressTab from './tabs/InProgressTab';
import PlannedTab from './tabs/PlannedTab';
import KnowledgeBaseTab from './tabs/KnowledgeBaseTab';
import SourcesTab from './tabs/SourcesTab';
import { HistoryTab } from './tabs/HistoryTab';
import { StatisticsTab } from './tabs/StatisticsTab';
import ExamplesTab from './tabs/ExamplesTab';

export default class PlanView extends ItemView {
    private plugin: PersonalDevelopmentPlanPlugin;
    private fileChangeEventRef: EventRef[] = [];
    private activeTabId: string | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: PersonalDevelopmentPlanPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string { return PLAN_VIEW_TYPE; }
    getDisplayText(): string { return t('plan'); }
    getIcon(): string { return 'graduation-cap'; }

    async onOpen() {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass('plan-development-view');

        const mainContainer = container.createDiv({ cls: 'plan-main-container' });
        await this.createTabs(mainContainer);
        this.setupFileWatchers();
    }

    async onClose() {
        this.removeFileWatchers();
    }

    private async createTabs(container: HTMLElement) {
        const tabsHeader = container.createDiv({ cls: 'plan-tabs-header' });
        const tabsContent = container.createDiv({ cls: 'plan-tabs-content' });

        for (const [index, tab] of TAB_DEFINITIONS.entries()) {
            const tabBtn = tabsHeader.createEl('button', { cls: 'plan-tab' });
            tabBtn.createEl('span', { cls: `icon icon-${tab.icon}` });
            tabBtn.createEl('span', { text: tab.name, cls: 'tab-text' });

            const tabContent = tabsContent.createDiv({
                cls: 'plan-tab-content',
                attr: { 'data-tab': tab.id }
            });

            if (index === 0) {
                tabBtn.addClass('active');
                tabContent.addClass('active');
                this.activeTabId = tab.id;
            }

            tabBtn.onclick = () => this.activateTab(tab.id, tabBtn, tabContent);
        }

        await this.loadActiveTabContent();
    }

    private async activateTab(tabId: string, tabBtn: HTMLElement, tabContent: HTMLElement) {
        this.containerEl.querySelectorAll('.plan-tab').forEach(t => t.classList.remove('active'));
        this.containerEl.querySelectorAll('.plan-tab-content').forEach(c => c.classList.remove('active'));

        tabBtn.classList.add('active');
        tabContent.classList.add('active');
        this.activeTabId = tabId;

        await this.refreshTabContent(tabId, tabContent);
    }

    private async loadActiveTabContent() {
        if (!this.activeTabId) return;
        const tabContent = this.containerEl.querySelector(`.plan-tab-content[data-tab="${this.activeTabId}"]`);
        if (tabContent) {
            await this.refreshTabContent(this.activeTabId, tabContent as HTMLElement);
        }
    }

    private async refreshTabContent(tabId: string, tabContent: HTMLElement) {
        const scrollTop = tabContent.scrollTop;
        tabContent.empty();

        const tabDefinition = TAB_DEFINITIONS.find(tab => tab.id === tabId);
        if (!tabDefinition) return;

        await this.initializeTabContent(tabDefinition, tabContent);
        tabContent.scrollTop = scrollTop;
    }

    private async initializeTabContent(tab: TabDefinition, tabContent: HTMLElement) {
        const tabTitle = tabContent.createEl('h3', { cls: 'tab-title' });
        tabTitle.createEl('span', { text: tab.name });

        if (tab.tooltip) this.createHelpIcon(tabTitle, tab.tooltip);
        await this.loadTabContent(tab.id, tabContent);
    }

    private async loadTabContent(tabId: string, tabContent: HTMLElement) {
        const { settings, app } = this.plugin;

        switch (tabId) {
            case IN_PROGRESS:
                tabContent.appendChild(await InProgressTab.create(app, settings, app.vault, app.metadataCache));
                break;
            case PLANNED:
                tabContent.appendChild(await PlannedTab.create(app, settings, app.vault, app.workspace, app.metadataCache));
                break;
            case KNOWLEDGE_BASE:
                tabContent.appendChild(await KnowledgeBaseTab.create(app, settings, app.vault, app.metadataCache));
                break;
            case 'sources':
                tabContent.appendChild(await SourcesTab.create(
                    settings,
                    app.vault,
                    app.workspace
                ));
                break;
            case 'statistics':
                tabContent.appendChild(await StatisticsTab.create(app, settings, app.vault, app.metadataCache));
                break;
            case 'history':
                tabContent.appendChild(await HistoryTab.create(app, settings, app.vault));
                break;
            case 'examples':
                tabContent.appendChild(await ExamplesTab.create(app, settings, app.vault));
                break;
        }
    }

    private setupFileWatchers() {
        const { settings } = this.plugin;
        const vault = this.plugin.vault; // Получаем vault через геттер
        const folderPath = settings.folderPath;

        const handler = async (file: TFile) => {
            if (file.path.startsWith(`${folderPath}/`) && file.extension === 'md' && this.activeTabId) {
                const tabContent = this.containerEl.querySelector(`.plan-tab-content[data-tab="${this.activeTabId}"]`);
                if (tabContent) {
                    await this.refreshTabContent(this.activeTabId, tabContent as HTMLElement);
                }
            }
        };

        this.fileChangeEventRef = [
            vault.on('create', handler),
            vault.on('modify', handler),
            vault.on('delete', handler)
        ];
    }

    private removeFileWatchers() {
        const vault = this.plugin.vault;
        this.fileChangeEventRef.forEach(ref => vault.offref(ref));
        this.fileChangeEventRef = [];
    }

    private createHelpIcon(element: HTMLElement, tooltip: string) {
        const helpIcon = element.createSpan({
            cls: 'tab-help-icon',
            attr: {
                'data-tooltip': tooltip
            }
        });

        const svg = createSvg('svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');

        const circle = createSvg('circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        circle.setAttribute('stroke-width', '1.5');
        svg.appendChild(circle);

        const path = createSvg('path');
        path.setAttribute('d', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);

        const dot = createSvg('circle');
        dot.setAttribute('cx', '12');
        dot.setAttribute('cy', '16');
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', 'currentColor');
        svg.appendChild(dot);

        helpIcon.appendChild(svg);
    }
}

export const PLAN_VIEW_TYPE = 'personal-development-plan-view';
