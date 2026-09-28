import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import el from './el.json';

export const LANG_KEY = 'cinesuggest_language';

const deviceLang = (Localization.getLocales?.()[0]?.languageCode) === 'el' ? 'el' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    el: { translation: el },
  },
  lng: deviceLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export async function loadSavedLanguage() {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
    return saved || i18n.language;
  } catch (e) {
    return i18n.language;
  }
}

export async function setAppLanguage(lang) {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export default i18n;
