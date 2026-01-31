import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Follow a user
 */
export const followUser = async (userId) => {
    return apiCaller.post(URLS.USERS.FOLLOW(userId));
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId) => {
    return apiCaller.delete(URLS.USERS.FOLLOW(userId));
};

/**
 * Get user's followers
 */
export const getFollowers = async (userId, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.USERS.FOLLOWERS(userId), {
        params: { page, size }
    });
};

/**
 * Get users that a user is following
 */
export const getFollowing = async (userId, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.USERS.FOLLOWING(userId), {
        params: { page, size }
    });
};

/**
 * Get follow status between current user and another user
 */
export const getFollowStatus = async (userId) => {
    return apiCaller.get(URLS.USERS.FOLLOW_STATUS(userId));
};

export default {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus
};

