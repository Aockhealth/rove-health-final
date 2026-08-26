import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en/index';
import hi from '../locales/hi/index';

export const LANGUAGE_STORAGE_KEY = 'rove_language';

export type SupportedLanguage = 'en' | 'hi';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'hi'];

async function resolveInitialLanguage(): Promise<SupportedLanguage> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'en' || stored === 'hi') {
    return stored;
  }
  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  return deviceLanguage === 'hi' ? 'hi' : 'en';
}

let initPromise: Promise<SupportedLanguage> | null = null;

// Resolves once i18next has a language selected — either the user's saved
// override or their device locale — so _layout.tsx can gate rendering until
// the right strings (and font set, which depends on language) are ready.
export function initI18n(): Promise<SupportedLanguage> {
  if (!initPromise) {
    initPromise = (async () => {
      const language = await resolveInitialLanguage();
      await i18n.use(initReactI18next).init({
        resources: { en, hi },
        lng: language,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        compatibilityJSON: 'v4',
      });
      return language;
    })();
  }
  return initPromise;
}

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) === 'hi' ? 'hi' : 'en';
}

/** BCP-47 tag for `Intl`/`toLocaleDateString` calls, kept in step with the active app language. */
export function getDateLocaleTag(): string {
  return getCurrentLanguage() === 'hi' ? 'hi-IN' : 'en-US';
}

export default i18n;
