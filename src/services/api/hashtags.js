import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Search hashtags by query
 */
export const searchHashtags = async (query, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.HASHTAGS.SEARCH, {
        params: { query, page, size }
    });
};

/**
 * Get trending hashtags (last 7 days)
 */
export const getTrendingHashtags = async ({ page = 0, size = 10 } = {}) => {
    return apiCaller.get(URLS.HASHTAGS.TRENDING, {
        params: { page, size }
    });
};

/**
 * Get top hashtags by usage count
 */
export const getTopHashtags = async ({ page = 0, size = 10 } = {}) => {
    return apiCaller.get(URLS.HASHTAGS.TOP, {
        params: { page, size }
    });
};

/**
 * Get hashtag details by name
 */
export const getHashtagByName = async (tagName) => {
    return apiCaller.get(URLS.HASHTAGS.BY_NAME(tagName));
};

/**
 * Get posts by hashtag
 */
export const getPostsByHashtag = async (tagName, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.HASHTAGS.POSTS(tagName), {
        params: { page, size }
    });
};

export default {
    searchHashtags,
    getTrendingHashtags,
    getTopHashtags,
    getHashtagByName,
    getPostsByHashtag
};
