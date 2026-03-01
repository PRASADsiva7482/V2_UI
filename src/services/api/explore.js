import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Get Explore "For You" page data (trending topics + news + hashtags + posts)
 */
export const getExploreForYou = async ({ topicLimit = 20, newsLimit = 10 } = {}) => {
    return apiCaller.get(URLS.EXPLORE.FOR_YOU, {
        params: { topicLimit, newsLimit }
    });
};

/**
 * Get explore categories
 */
export const getExploreCategories = async () => {
    return apiCaller.get(URLS.EXPLORE.CATEGORIES);
};

/**
 * Get trending topics, optionally by category
 */
export const getTrendingTopics = async ({ category, limit = 20 } = {}) => {
    const params = { limit };
    if (category) params.category = category;
    return apiCaller.get(URLS.EXPLORE.TRENDING, { params });
};

/**
 * Get news, optionally by category
 */
export const getExploreNews = async ({ category, limit = 20 } = {}) => {
    const params = { limit };
    if (category) params.category = category;
    return apiCaller.get(URLS.EXPLORE.NEWS, { params });
};

/**
 * Get breaking news
 */
export const getBreakingNews = async (limit = 5) => {
    return apiCaller.get(URLS.EXPLORE.BREAKING_NEWS, {
        params: { limit }
    });
};

/**
 * Search explore topics
 */
export const searchExploreTopics = async (query, limit = 20) => {
    return apiCaller.get(URLS.EXPLORE.SEARCH, {
        params: { query, limit }
    });
};

/**
 * Get trending posts by category
 */
export const getTrendingPostsByCategory = async ({ category, limit = 20 } = {}) => {
    const params = { limit };
    if (category) params.category = category;
    return apiCaller.get(URLS.EXPLORE.TRENDING_POSTS, { params });
};

export default {
    getExploreForYou,
    getExploreCategories,
    getTrendingTopics,
    getExploreNews,
    getBreakingNews,
    searchExploreTopics,
    getTrendingPostsByCategory
};
