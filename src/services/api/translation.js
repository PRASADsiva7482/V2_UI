import apiCaller from './apiCaller';
import { URLS } from './Urls';

/** Translate text to target language */
export const translateText = async (text, targetLang = 'en', sourceLang = 'auto') => {
    return apiCaller.post(URLS.TRANSLATION.TRANSLATE, { text, targetLang, sourceLang });
};

/** Detect the language of a text */
export const detectLanguage = async (text) => {
    return apiCaller.post(URLS.TRANSLATION.DETECT, { text });
};
