import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Get trending posts
 */
export const getTrendingPosts = async (limit = 10) => {
    return apiCaller.get(URLS.DISCOVERY.TRENDING_POSTS, {
        params: { limit }
    });
};

/**
 * Get personalized For You feed
 */
export const getForYouFeed = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.DISCOVERY.FOR_YOU, {
        params: { page, size }
    });
};

/**
 * Get popular users to follow
 */
export const getPopularUsers = async (limit = 10) => {
    return apiCaller.get(URLS.DISCOVERY.POPULAR_USERS, {
        params: { limit }
    });
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
    return apiCaller.get(URLS.DISCOVERY.STATS);
};

/**
 * Get smart user suggestions based on social network
 */
export const getSmartSuggestions = async (limit = 10) => {
    return apiCaller.get(URLS.DISCOVERY.SUGGESTIONS, {
        params: { limit }
    });
};

export default {
    getTrendingPosts,
    getForYouFeed,
    getPopularUsers,
    getSmartSuggestions,
    getPlatformStats
};


