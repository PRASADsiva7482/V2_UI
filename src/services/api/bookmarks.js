import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Bookmark a post
 */
export const bookmarkPost = async (postId) => {
    return apiCaller.post(URLS.BOOKMARKS.BY_POST(postId));
};

/**
 * Remove bookmark from a post
 */
export const unbookmarkPost = async (postId) => {
    return apiCaller.delete(URLS.BOOKMARKS.BY_POST(postId));
};

/**
 * Check if a post is bookmarked
 */
export const isPostBookmarked = async (postId) => {
    return apiCaller.get(URLS.BOOKMARKS.STATUS(postId));
};

/**
 * Get user's bookmarked posts
 */
export const getBookmarkedPosts = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.BOOKMARKS.BASE, {
        params: { page, size }
    });
};

/**
 * Get user's bookmark count
 */
export const getBookmarkCount = async () => {
    return apiCaller.get(URLS.BOOKMARKS.COUNT);
};

export default {
    bookmarkPost,
    unbookmarkPost,
    isPostBookmarked,
    getBookmarkedPosts,
    getBookmarkCount
};
