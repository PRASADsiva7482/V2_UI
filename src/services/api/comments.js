import api from '../../auth/api';

/**
 * Get comments for a post
 */
export const getPostComments = async (postId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`/api/v1/posts/${postId}/comments`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Add comment to a post
 */
export const addComment = async (postId, content) => {
    const response = await api.post(`/api/v1/posts/${postId}/comments`, { content });
    return response.data;
};

/**
 * Reply to a comment
 */
export const replyToComment = async (commentId, content) => {
    const response = await api.post(`/api/v1/comments/${commentId}/reply`, { content });
    return response.data;
};

/**
 * Get replies for a comment
 */
export const getRepliesForComment = async (commentId) => {
    const response = await api.get(`/api/v1/comments/${commentId}/replies`);
    return response.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId) => {
    await api.delete(`/api/v1/comments/${commentId}`);
};

/**
 * Like a comment
 */
export const likeComment = async (commentId) => {
    await api.post(`/api/v1/comments/${commentId}/like`);
};

/**
 * Unlike a comment
 */
export const unlikeComment = async (commentId) => {
    await api.delete(`/api/v1/comments/${commentId}/like`);
};

/**
 * Get users who liked a comment
 */
export const getCommentLikes = async (commentId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`/api/v1/comments/${commentId}/likes`, {
        params: { page, size }
    });
    return response.data;
};

export default {
    getPostComments,
    addComment,
    replyToComment,
    getRepliesForComment,
    deleteComment,
    likeComment,
    unlikeComment,
    getCommentLikes
};
