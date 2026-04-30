import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import tel from './locales/tel.json';
import ml from './locales/ml.json';
import kn from './locales/kn.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

// Language resources
const resources = {
    en: {
        translation: en
    },
    tel: {
        translation: tel
    },
    ml: {
        translation: ml
    },
    kn: {
        translation: kn
    },
    hi: {
        translation: hi
    },
    ta: {
        translation: ta
    }
    // Add more languages here in the future
    // es: { translation: es },
    // fr: { translation: fr },
};

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,
        fallbackLng: 'en', // Fallback language
        lng: 'en', // Default language
        debug: false, // Set to true for debugging

        interpolation: {
            escapeValue: false // React already escapes values
        },

        // Language detector options
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        }
    });

export default i18n;
