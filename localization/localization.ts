import { getLanguage } from 'obsidian';
import { TranslationKeys } from './localization-types';
import { en } from './localization-en';
import { ru } from './localization-ru';

const translations: Record<string, TranslationKeys> = {
    en,
    ru
};

const DEFAULT_LANGUAGE = 'en';

const translationCache = new Map<string, string>();

export function t(key: keyof TranslationKeys): string {
    const cacheKey = `${getLanguage()}:${key}`;

    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    try {
        const lang = getLanguage();
        const translation = translations[lang]?.[key] ?? translations[DEFAULT_LANGUAGE][key];
        translationCache.set(cacheKey, translation);
        return translation;
    } catch {
        return translations[DEFAULT_LANGUAGE][key];
    }
}
