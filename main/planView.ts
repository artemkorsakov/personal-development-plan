import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { t } from './localization';

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

        const tabs = [
            { id: 'in-progress', name: t('inProgress'), icon: 'play' },
            { id: 'planned', name:  t('planned'), icon: 'calendar' },
            { id: 'knowledge-base', name:  t('knowledgeBase'), icon: 'book' },
            { id: 'sources', name:  t('sources'), icon: 'link' },
            { id: 'statistics', name:  t('statistics'), icon: 'statistics' },
            { id: 'history', name:  t('history'), icon: 'history' },
            { id: 'examples', name:  t('examples'), icon: 'examples' },
        ];

        tabs.forEach((tab, index) => {
            // Кнопка вкладки
            const tabBtn = tabsHeader.createEl('button', {
                cls: 'plan-tab',
                text: tab.name
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

            // Заголовок вкладки
            tabContent.createEl('h3', { text: tab.name });

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
