import api from '../../auth/api';

const BASE_URL = '/api/v1/hashtags';

/**
 * Search hashtags by query
 */
export const searchHashtags = async (query, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/search`, {
        params: { query, page, size }
    });
    return response.data;
};

/**
 * Get trending hashtags (last 7 days)
 */
export const getTrendingHashtags = async ({ page = 0, size = 10 } = {}) => {
    const response = await api.get(`${BASE_URL}/trending`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get top hashtags by usage count
 */
export const getTopHashtags = async ({ page = 0, size = 10 } = {}) => {
    const response = await api.get(`${BASE_URL}/top`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get hashtag details by name
 */
export const getHashtagByName = async (tagName) => {
    const response = await api.get(`${BASE_URL}/${tagName}`);
    return response.data;
};

/**
 * Get posts by hashtag
 */
export const getPostsByHashtag = async (tagName, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/${tagName}/posts`, {
        params: { page, size }
    });
    return response.data;
};

export default {
    searchHashtags,
    getTrendingHashtags,
    getTopHashtags,
    getHashtagByName,
    getPostsByHashtag
};
