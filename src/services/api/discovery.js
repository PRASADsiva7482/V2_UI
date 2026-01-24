import api from '../../auth/api';

const BASE_URL = '/api/v1/discovery';

/**
 * Get trending posts
 */
export const getTrendingPosts = async (limit = 10) => {
    const response = await api.get(`${BASE_URL}/trending/posts`, {
        params: { limit }
    });
    return response.data;
};

/**
 * Get popular users to follow
 */
export const getPopularUsers = async (limit = 10) => {
    const response = await api.get(`${BASE_URL}/popular/users`, {
        params: { limit }
    });
    return response.data;
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
};

/**
 * Get smart user suggestions based on social network
 */
export const getSmartSuggestions = async (limit = 10) => {
    const response = await api.get(`${BASE_URL}/suggestions/users`, {
        params: { limit }
    });
    return response.data;
};

export default {
    getTrendingPosts,
    getPopularUsers,
    getSmartSuggestions,
    getPlatformStats
};

