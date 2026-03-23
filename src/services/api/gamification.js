import apiCaller from './apiCaller';
import { URLS } from './Urls';

/** Get current user's gamification stats (streak, XP, level, badges) */
export const getMyGamificationStats = async () => {
    return apiCaller.get(URLS.GAMIFICATION.STATS);
};

/** Get another user's gamification stats */
export const getUserGamificationStats = async (userId) => {
    return apiCaller.get(URLS.GAMIFICATION.USER_STATS(userId));
};

/** Record a gamification action (POST, LIKE, COMMENT, SHARE) */
export const recordGamificationAction = async (actionType) => {
    return apiCaller.post(URLS.GAMIFICATION.ACTION, { actionType });
};
