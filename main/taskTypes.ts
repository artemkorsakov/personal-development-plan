import { PersonalDevelopmentPlanSettings } from './../settings/settings';
import { getTaskTypeIcon } from './common';

/**
 * Базовый интерфейс для всех типов задач
 */
export interface BaseTask {
    typeId: string;
    name: string;
    status: 'in-progress' | 'planned' | 'knowledge-base';
    sectionId: string;
    order: number;
    /** yyyy-MM-dd */
    startDate: string;
    /** yyyy-MM-dd */
    dueDate: string;
}

/**
 * Полный тип задачи с учетом настроек
 */
export type Task = BaseTask & {
    typeName: string;
    sectionName: string;
    icon: string;
    title: string;
    checklistItems: string[];
    progress: number;
    customFields: Record<string, any>;
};

/**
 * Утилиты для работы с задачами
 */
export class TaskUtils {
    /**
     * Создает новую задачу на основе настроек
     */
    static createTask(
        settings: PersonalDevelopmentPlanSettings,
        typeId: string,
        sectionId: string,
        baseFields: Omit<BaseTask, 'typeId' | 'sectionId'>
    ): Task {
        const materialType = settings.materialTypes.find(t => t.id === typeId);
        const section = settings.sections.find(s => s.id === sectionId);

        if (!materialType) {
            throw new Error(`Material type ${typeId} not found in settings`);
        }

        if (!section) {
            throw new Error(`Section ${sectionId} not found in settings`);
        }

        return {
            ...baseFields,
            typeId,
            sectionId,
            typeName: materialType.name,
            sectionName: section.name,
            icon: getTaskTypeIcon(typeId),
            title: baseFields.name, // Добавляем title на основе name
            checklistItems: [...materialType.checklistItems],
            progress: 0,
            customFields: {}
        };
    }

    /**
     * Получает все доступные типы задач из настроек
     */
    static getAvailableTaskTypes(settings: PersonalDevelopmentPlanSettings): {
        id: string;
        name: string;
        icon: string;
        checklistItems: string[];
    }[] {
        return settings.materialTypes
            .filter(type => type.enabled)
            .sort((a, b) => a.order - b.order)
            .map(type => ({
                id: type.id,
                name: type.name,
                icon: getTaskTypeIcon(type.id),
                checklistItems: type.checklistItems
            }));
    }

    /**
     * Получает все доступные разделы из настроек
     */
    static getAvailableSections(settings: PersonalDevelopmentPlanSettings): {
        id: string;
        name: string;
    }[] {
        return settings.sections
            .sort((a, b) => a.order - b.order)
            .map(section => ({
                id: section.id,
                name: section.name
            }));
    }
}
