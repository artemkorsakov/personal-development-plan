import { t } from '../localization/localization';

export interface PersonalDevelopmentPlanSettings {
    maxActiveTasks: number;
    statsStartDate: string;
    folderPath: string;
    historyFolderPath: string;
    materialTypes: MaterialType[];
    sections: Section[];
    periodicTasks: PeriodicTaskSettings;
}

export interface MaterialType {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    checklistItems: string[];
}

export function getMaterialIdByName(materialTypes: MaterialType[], name: string): string {
    const foundType = materialTypes.find((type: MaterialType) => type.name === name);
    return foundType?.id || `${t('unknownType')}: ${name}`;
}

export function getMaterialNameById(materialTypes: MaterialType[], id: string): string {
    const foundType = materialTypes.find((type: MaterialType) => type.id === id);
    return foundType?.name || `${t('unknownType')}: ${id}`;
}

export function generateTaskContent(taskType: MaterialType): string {
    return `# ${t('taskLabel')}\n\n` +
           `${t('taskDefaultDescription')}\n\n` +
           `## ${t('checklist')}\n\n` +
           taskType.checklistItems.map(item => `- [ ] ${item}`).join('\n') + '\n\n' +
           `## ${t('notes')}\n\n` +
           `${t('addYourThoughts')}`;
}

export interface Section {
    id: string;
    name: string;
    order: number;
}

export interface PeriodicTaskSettings {
    daily: { enabled: boolean; tasks: string[] };
    weekly: { enabled: boolean; tasks: string[] };
    monthly: { enabled: boolean; tasks: string[] };
    quarterly: { enabled: boolean; tasks: string[] };
    yearly: { enabled: boolean; tasks: string[] };
}
