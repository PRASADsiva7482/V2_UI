import apiCaller from './apiCaller';
import URLS from './Urls';

// AI Moderation endpoints
export const reportContent = (data) => {
    return apiCaller.post(URLS.MODERATION.REPORT, data);
};

export const scanContent = (text, postId = null) => {
    return apiCaller.post(URLS.MODERATION.SCAN, { content: text, postId });
};
