import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en';
import fr from './locales/fr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      fr,
    },
    fallbackLng: 'fr', // Définir le français comme langue par défaut
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
