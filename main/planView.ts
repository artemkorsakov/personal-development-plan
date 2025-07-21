import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { t } from './localization';
import { TabDefinition, TAB_DEFINITIONS } from './tabs';
import { getTasksInProgressElement } from './inProgress';
import { getPlannedTasksElement } from './planned';
import { getKnowledgeBaseElement } from './knowledgeBase';
import PersonalDevelopmentPlanPlugin from "./../main";
import { PersonalDevelopmentPlanSettings } from './../settings/settings';
import { createHelpIcon } from './common';

export const PLAN_VIEW_TYPE = 'personal-development-plan-view';

export class PlanView extends ItemView {
	private plugin: PersonalDevelopmentPlanPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: PersonalDevelopmentPlanPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return PLAN_VIEW_TYPE;
    }

    getDisplayText(): string {
        return t('plan');
    }

    getIcon(): string {
        return 'graduation-cap';
    }

    async onOpen() {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass('plan-development-view');

        // Основной контейнер
        const mainContainer = container.createDiv({ cls: 'plan-main-container' });

        // Создаем вкладки
        this.createTabs(mainContainer);
    }

    async createTabs(container: HTMLElement) {
        // Создаем панель вкладок
        const tabsHeader = container.createDiv({ cls: 'plan-tabs-header' });
        const tabsContent = container.createDiv({ cls: 'plan-tabs-content' });

        // Заменяем forEach на for...of для работы с await
        for (const [index, tab] of TAB_DEFINITIONS.entries()) {
            // Кнопка вкладки (без иконки вопроса)
            const tabBtn = tabsHeader.createEl('button', {
                cls: 'plan-tab',
            });

            // Иконка вкладки в кнопке
            tabBtn.createEl('span', {
                cls: `icon icon-${tab.icon}`,
            });

            // Текст вкладки в кнопке
            tabBtn.createEl('span', {
                text: tab.name,
                cls: 'tab-text'
            });

            // Содержимое вкладки
            const tabContent = tabsContent.createDiv({
                cls: 'plan-tab-content',
                attr: { 'data-tab': tab.id }
            });

            if (index === 0) {
                tabBtn.addClass('active');
                tabContent.addClass('active');
            }

            tabBtn.onclick = () => {
                // Деактивируем все вкладки
                tabsHeader.querySelectorAll('.plan-tab').forEach(t => t.removeClass('active'));
                tabsContent.querySelectorAll('.plan-tab-content').forEach(c => c.removeClass('active'));

                // Активируем выбранную
                tabBtn.addClass('active');
                tabContent.addClass('active');
            };

            // Заголовок вкладки с иконкой вопроса
            const tabTitle = tabContent.createEl('h3', { cls: 'tab-title' });
            tabTitle.createEl('span', { text: tab.name });

            // Добавляем иконку вопроса только если есть tooltip
            if (tab.tooltip) {
                createHelpIcon(tabTitle, tab.tooltip);
            }

            if (tab.id === 'in-progress') {
                const tasksElement = await getTasksInProgressElement(this.plugin.settings);
                tabContent.appendChild(tasksElement);
            } else if (tab.id === 'planned') {
                const tasksElement = await getPlannedTasksElement(this.plugin.settings);
                tabContent.appendChild(tasksElement);
            } else if (tab.id === 'knowledge-base') {
                const tasksElement = await getKnowledgeBaseElement(this.plugin.settings);
                tabContent.appendChild(tasksElement);
            } else if (tab.id === 'sources') {
                tabContent.createEl('p', {
                    text: `Здесь будет содержимое раздела "${tab.id}"`
                });
            } else if (tab.id === 'statistics') {
                tabContent.createEl('p', {
                    text: `Здесь будет содержимое раздела "${tab.id}"`
                });
            } else if (tab.id === 'history') {
                tabContent.createEl('p', {
                    text: `Здесь будет содержимое раздела "${tab.id}"`
                });
            } else if (tab.id === 'examples') {
                tabContent.createEl('p', {
                    text: `Здесь будет содержимое раздела "${tab.id}"`
                });
            }
        }
    }

    async onClose() {
        // Очистка ресурсов при необходимости
    }
}
