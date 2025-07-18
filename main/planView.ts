import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { t } from './localization';
import { TabDefinition, TAB_DEFINITIONS } from './tabs';

export const PLAN_VIEW_TYPE = 'personal-development-plan-view';

export class PlanView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
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

    createTabs(container: HTMLElement) {
        // Создаем панель вкладок
        const tabsHeader = container.createDiv({ cls: 'plan-tabs-header' });
        const tabsContent = container.createDiv({ cls: 'plan-tabs-content' });

        TAB_DEFINITIONS.forEach((tab, index) => {
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
                const helpIcon = tabTitle.createEl('span', {
                    cls: 'tab-help-icon',
                });

                helpIcon.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke-width="1.5" stroke-linecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                `;
                helpIcon.style.marginLeft = '4px';
                helpIcon.style.opacity = '0.7';
                helpIcon.style.cursor = 'help';
                helpIcon.setAttribute('data-tooltip', tab.tooltip);
            }

            // Контент вкладки
            tabContent.createEl('p', {
                text: `Здесь будет содержимое раздела "${tab.name}"`
            });
        });
    }

    async onClose() {
        // Очистка ресурсов при необходимости
    }
}
