import api from '../../auth/api';

const BASE_URL = '/api/v1/posts';

/**
 * Get timeline feed (posts from users you follow)
 */
export const getTimelineFeed = async ({ page = 0, size = 20 } = {}) => {
    const response = await api.get(`/api/v1/feed/timeline`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get explore feed (all public posts)
 */
export const getExploreFeed = async ({ page = 0, size = 20 } = {}) => {
    const response = await api.get(`/api/v1/feed/explore`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get user's posts
 */
export const getUserPosts = async (userId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/user/${userId}`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get single post by ID
 */
export const getPostById = async (postId) => {
    const response = await api.get(`${BASE_URL}/${postId}`);
    return response.data;
};

/**
 * Create a new post
 */
export const createPost = async (content) => {
    const response = await api.post(BASE_URL, { content });
    return response.data;
};

/**
 * Update a post
 */
export const updatePost = async (postId, content) => {
    const response = await api.put(`${BASE_URL}/${postId}`, { content });
    return response.data;
};

/**
 * Delete a post
 */
export const deletePost = async (postId) => {
    await api.delete(`${BASE_URL}/${postId}`);
};

/**
 * Search posts
 */
export const searchPosts = async (keyword, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/search`, {
        params: { keyword, page, size }
    });
    return response.data;
};

/**
 * Increment view count for a post
 */
export const incrementViewCount = async (postId) => {
    await api.post(`${BASE_URL}/${postId}/view`);
};

/**
 * Like a post
 */
export const likePost = async (postId) => {
    await api.post(`${BASE_URL}/${postId}/like`);
};

/**
 * Unlike a post
 */
export const unlikePost = async (postId) => {
    await api.delete(`${BASE_URL}/${postId}/like`);
};

/**
 * Get users who liked a post
 */
export const getPostLikes = async (postId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/${postId}/likes`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get comments for a post
 */
export const getPostComments = async (postId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/${postId}/comments`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Add comment to a post
 */
export const addComment = async (postId, content) => {
    const response = await api.post(`${BASE_URL}/${postId}/comments`, { content });
    return response.data;
};

export default {
    getTimelineFeed,
    getExploreFeed,
    getUserPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    incrementViewCount,
    likePost,
    unlikePost,
    getPostLikes,
    getPostComments,
    addComment
};
