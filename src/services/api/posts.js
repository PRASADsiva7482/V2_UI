import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Get timeline feed (posts from users you follow)
 */
export const getTimelineFeed = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.POSTS.TIMELINE, {
        params: { page, size }
    });
};

/**
 * Get explore feed (all public posts)
 */
export const getExploreFeed = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.POSTS.EXPLORE, {
        params: { page, size }
    });
};

/**
 * Get user's posts
 */
export const getUserPosts = async (userId, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.POSTS.USER_POSTS(userId), {
        params: { page, size }
    });
};

/**
 * Get single post by ID
 */
export const getPostById = async (postId) => {
    return apiCaller.get(URLS.POSTS.BY_ID(postId));
};

/**
 * Create a new post
 * @param {string} content - Post content (optional if media is provided)
 * @param {number[]} mediaIds - Array of media IDs to attach (optional)
 */
export const createPost = async (content, mediaIds = null) => {
    const requestBody = {};

    if (content && content.trim()) {
        requestBody.content = content;
    }

    if (mediaIds && mediaIds.length > 0) {
        requestBody.mediaIds = mediaIds;
    }

    return apiCaller.post(URLS.POSTS.BASE, requestBody);
};

/**
 * Update a post
 */
export const updatePost = async (postId, content) => {
    return apiCaller.put(URLS.POSTS.BY_ID(postId), { content });
};

/**
 * Delete a post
 */
export const deletePost = async (postId) => {
    return apiCaller.delete(URLS.POSTS.BY_ID(postId));
};

/**
 * Search posts
 */
export const searchPosts = async (keyword, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.POSTS.SEARCH, {
        params: { keyword, page, size }
    });
};

/**
 * Increment view count for a post
 */
export const incrementViewCount = async (postId) => {
    return apiCaller.post(URLS.POSTS.VIEW(postId));
};

/**
 * Like a post
 */
export const likePost = async (postId) => {
    return apiCaller.post(URLS.POSTS.LIKE(postId));
};

/**
 * Unlike a post
 */
export const unlikePost = async (postId) => {
    return apiCaller.delete(URLS.POSTS.LIKE(postId));
};

/**
 * Get users who liked a post
 */
export const getPostLikes = async (postId, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.POSTS.LIKES(postId), {
        params: { page, size }
    });
};

/**
 * Get comments for a post
 */
export const getPostComments = async (postId, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.POSTS.COMMENTS(postId), {
        params: { page, size }
    });
};

/**
 * Add comment to a post
 */
export const addComment = async (postId, content) => {
    return apiCaller.post(URLS.POSTS.COMMENTS(postId), { content });
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

