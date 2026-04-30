import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Follow a user (or send follow request if private).
 * Returns { status: 'ACCEPTED' | 'PENDING', message: string }
 */
export const followUser = async (userId) => {
    return apiCaller.post(URLS.USERS.FOLLOW(userId));
};

/**
 * Unfollow a user or cancel a pending follow request
 */
export const unfollowUser = async (userId) => {
    return apiCaller.delete(URLS.USERS.FOLLOW(userId));
};

/**
 * Accept a follow request (for private accounts)
 */
export const acceptFollowRequest = async (userId) => {
    return apiCaller.put(URLS.USERS.FOLLOW_ACCEPT(userId));
};

/**
 * Decline a follow request (for private accounts)
 */
export const declineFollowRequest = async (userId) => {
    return apiCaller.put(URLS.USERS.FOLLOW_DECLINE(userId));
};

/**
 * Get pending follow requests for the current user
 */
export const getFollowRequests = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.USERS.FOLLOW_REQUESTS, {
        params: { page, size }
    });
};

/**
 * Get count of pending follow requests
 */
export const getFollowRequestsCount = async () => {
    return apiCaller.get(URLS.USERS.FOLLOW_REQUESTS_COUNT);
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
    acceptFollowRequest,
    declineFollowRequest,
    getFollowRequests,
    getFollowRequestsCount,
    getFollowers,
    getFollowing,
    getFollowStatus
};
