import api from '../../auth/api';

/**
 * API service for Explore feature
 */

/**
 * Get explore content by category
 * @param {string} category - Category: FOR_YOU, TRENDING, NEWS, SPORTS, ENTERTAINMENT
 * @param {number} limit - Number of items to return
 * @returns {Promise} Explore content response
 */
export const getExploreContent = async (category = 'FOR_YOU', limit = 20) => {
    try {
        const response = await api.get(`/api/v1/explore/${category}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching explore content:', error);
        throw error;
    }
};

/**
 * Get trending topics with pagination
 * @param {string} category - Optional category filter
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise} Paginated trending topics
 */
export const getTrendingTopics = async (category = null, page = 0, size = 20) => {
    try {
        const params = { page, size };
        if (category) {
            params.category = category;
        }

        const response = await api.get('/api/v1/explore/trending-topics', {
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        throw error;
    }
};

/**
 * Manually trigger trending score update (debug/admin)
 * @returns {Promise} Success message
 */
export const updateTrendingScores = async () => {
    try {
        const response = await api.post('/api/v1/explore/update-trending');
        return response.data;
    } catch (error) {
        console.error('Error updating trending scores:', error);
        throw error;
    }
};
