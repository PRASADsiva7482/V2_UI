import apiCaller from './apiCaller';
import URLS from './Urls';

// AI Moderation endpoints
export const reportContent = (data) => {
    return apiCaller.post(URLS.MODERATION.REPORT, data);
};

export const scanContent = (text, postId = null) => {
    return apiCaller.post(URLS.MODERATION.SCAN, { content: text, postId });
};

/** Advanced AI-powered content scan with severity scoring */
export const advancedScanContent = (text) => {
    return apiCaller.post(`${URLS.MODERATION.SCAN}/advanced`, { content: text });
};

/** Get pending moderation flags */
export const getPendingFlags = () => {
    return apiCaller.get(URLS.MODERATION.PENDING);
};
