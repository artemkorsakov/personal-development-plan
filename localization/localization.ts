import { getLanguage } from 'obsidian';
import { TranslationKeys, ParametrizedTranslations } from './localization-types';
import { en, enParametrized } from './localization-en';
import { ru, ruParametrized } from './localization-ru';

const translations: Record<string, TranslationKeys> = {
    en,
    ru
};

const parametrizedTranslations: Record<string, ParametrizedTranslations> = {
    en: enParametrized,
    ru: ruParametrized
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

export function tParametrized<K extends keyof ParametrizedTranslations>(
    key: K,
    params: Parameters<ParametrizedTranslations[K]>[0]
): string {
    const lang = getLanguage();
    const translator = parametrizedTranslations[lang] ?? parametrizedTranslations[DEFAULT_LANGUAGE];
    return translator[key](params as any);
}
