import apiCaller from './apiCaller';
import { URLS } from './Urls';

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

/**
 * Reply to a comment
 */
export const replyToComment = async (commentId, content) => {
    return apiCaller.post(URLS.COMMENTS.REPLY(commentId), { content });
};

/**
 * Get replies for a comment
 */
export const getRepliesForComment = async (commentId) => {
    return apiCaller.get(URLS.COMMENTS.REPLIES(commentId));
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId) => {
    return apiCaller.delete(URLS.COMMENTS.BY_ID(commentId));
};

/**
 * Like a comment
 */
export const likeComment = async (commentId) => {
    return apiCaller.post(URLS.COMMENTS.LIKE(commentId));
};

/**
 * Unlike a comment
 */
export const unlikeComment = async (commentId) => {
    return apiCaller.delete(URLS.COMMENTS.LIKE(commentId));
};

/**
 * Get users who liked a comment
 */
export const getCommentLikes = async (commentId, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.COMMENTS.LIKES(commentId), {
        params: { page, size }
    });
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

