import { App, Modal } from 'obsidian';
import { t, tParametrized } from '../../localization/localization';
import { getActiveTasks, getPlannedTasks } from '../../utils/taskUtils';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';

export interface PlanTaskModalData {
    order: number;
}

export class PlanTaskModal extends Modal {
    private orderInput: HTMLInputElement;
    private resolve: (data: PlanTaskModalData | null) => void;
    private promise: Promise<PlanTaskModalData | null>;
    private taskType: string;
    private settings: PersonalDevelopmentPlanSettings;

    constructor(app: App, settings: PersonalDevelopmentPlanSettings, taskType: string) {
        super(app);
        this.settings = settings;
        this.taskType = taskType;
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.titleEl.setText(t('planTask'));
        this.createForm();
    }

    private async createForm() {
        const form = this.contentEl.createEl('form');

        // 1. Получаем свободные номера
        const freeOrders = await this.getFreeOrders();
        const firstFreeOrder = freeOrders.length > 0 ? freeOrders[0].order : 1;

        // 2. Список свободных номеров (если есть)
        if (freeOrders.length > 0) {
            const freeOrdersContainer = form.createDiv({ cls: 'free-orders-container' });
            freeOrdersContainer.createEl('h4', { text: t('availableOrders') });

            freeOrders.forEach(orderInfo => {
                const orderEl = freeOrdersContainer.createDiv({ cls: 'free-order-item' });
                orderEl.createSpan({
                    text: tParametrized('freeOrderAfter', {
                        order: String(orderInfo.order),
                        taskName: orderInfo.previousTaskName
                    })
                });
            });
        }

        // 3. Поле ввода порядка с первым свободным номером
        const orderContainer = form.createDiv({ cls: 'order-input-container' });
        orderContainer.createEl('label', {
            text: t('taskOrder'),
            attr: { for: 'task-order' }
        });
        this.orderInput = orderContainer.createEl('input', {
            attr: {
                type: 'number',
                id: 'task-order',
                value: String(firstFreeOrder),  // Используем первый свободный номер
                min: '1'
            }
        });


        // 3. Основное напоминание
        const reminderContainer = form.createDiv({ cls: 'task-reminder-container' });
        reminderContainer.createDiv({ cls: 'task-reminder' }, el => {
            el.textContent = t('dontForgetToFillPlan');
        });

        // 4. Кнопки действий
        const buttonContainer = form.createDiv({ cls: 'modal-button-container' });
        const saveBtn = buttonContainer.createEl('button', {
            text: t('save'),
            cls: 'modal-save-btn'
        });
        saveBtn.type = 'submit';

        const cancelBtn = buttonContainer.createEl('button', {
            text: t('cancel'),
            cls: 'modal-cancel-btn'
        });
        cancelBtn.type = 'button';
        cancelBtn.addEventListener('click', () => {
            this.resolve(null);
            this.close();
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            this.resolve({
                order: parseInt(this.orderInput.value)
            });
            this.close();
        });
    }

    private async getFreeOrders(): Promise<Array<{order: number, previousTaskName: string}>> {
        const activeTasks = await getActiveTasks(this.app.vault, this.settings, this.app.metadataCache);
        const plannedTasks = await getPlannedTasks(this.app.vault, this.settings, this.app.metadataCache);

        const allTasks = [...activeTasks, ...plannedTasks]
            .filter(task => task.type === this.taskType)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const freeOrders: Array<{order: number, previousTaskName: string}> = [];
        let lastOrder = 0;

        for (const task of allTasks) {
            const currentOrder = task.order || 0;

            if (currentOrder - lastOrder > 1) {
                for (let i = lastOrder + 1; i < currentOrder && freeOrders.length < 5; i++) {
                    freeOrders.push({
                        order: i,
                        previousTaskName: allTasks.find(t => t.order === lastOrder)?.name || t('noTask')
                    });
                }
            }

            lastOrder = currentOrder;
        }

        for (let i = 1; i <= 5 - freeOrders.length; i++) {
            freeOrders.push({
                order: lastOrder + i,
                previousTaskName: allTasks.find(t => t.order === lastOrder)?.name || t('noTask')
            });
        }

        return freeOrders.slice(0, 5);
    }

    async waitForClose(): Promise<PlanTaskModalData | null> {
        await this.promise;
        return this.promise;
    }

    onClose() {
        this.resolve(null);
    }
}
