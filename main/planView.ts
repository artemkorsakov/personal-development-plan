import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { t } from './localization';
import { TabDefinition, TAB_DEFINITIONS } from './tabs';
import { getTasksInProgressElement } from './inProgress';
import PersonalDevelopmentPlanPlugin from "./../main";
import { PersonalDevelopmentPlanSettings } from './../settings/settings';

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

    private createHelpIcon(tabTitle: HTMLElement, tooltip: string) {
        const helpIcon = tabTitle.createEl('span', {
            cls: 'tab-help-icon',
        });

        // Создаем SVG элемент
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');

        // Создаем круг
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        circle.setAttribute('stroke-width', '1.5');
        svg.appendChild(circle);

        // Создаем путь (знак вопроса)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);

        // Создаем точку внизу
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', '12');
        dot.setAttribute('cy', '16');
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', 'currentColor');
        svg.appendChild(dot);

        // Добавляем SVG в иконку
        helpIcon.appendChild(svg);
        helpIcon.setAttribute('data-tooltip', tooltip);
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
                this.createHelpIcon(tabTitle, tab.tooltip);
            }

            if (tab.id === 'in-progress') {
                const tasksElement = await getTasksInProgressElement(this.plugin.settings);
                tabContent.appendChild(tasksElement);
            } else if (tab.id === 'planned') {
                tabContent.createEl('p', {
                    text: `Здесь будет содержимое раздела "${tab.id}"`
                });
            } else if (tab.id === 'knowledge-base') {
                tabContent.createEl('p', {
                    text: `Здесь будет содержимое раздела "${tab.id}"`
                });
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
