import { Vault, TFile } from 'obsidian';
import { PersonalDevelopmentPlanSettings } from '../../settings/settings-types';
import { t } from '../../localization/localization';

export interface CompletedTask {
    type: string;
    title: string;
    startDate: string;
    completionDate: string;
    workingDays: number;
    rating: number;
    review: string;
    completedAt: string;
    section: string;
    pages?: number;
    laborInputInHours?: number;
    durationInMinutes?: number;
}

export async function loadCompletedTasks(
    vault: Vault,
    settings: PersonalDevelopmentPlanSettings
): Promise<CompletedTask[]> {
    try {
        const historyFilePath = `${settings.historyFolderPath}/completed_tasks.json`;
        const file = vault.getAbstractFileByPath(historyFilePath);

        if (!file || !(file instanceof TFile)) {
            throw new Error(t('historyFileNotFound'));
        }

        const content = await vault.read(file);
        return JSON.parse(content);
    } catch (error) {
        console.error('Error loading completed tasks:', error);
        return [];
    }
}
