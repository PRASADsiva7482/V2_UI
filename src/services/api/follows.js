import api from '../../auth/api';

const BASE_URL = '/api/v1/users';

/**
 * Follow a user
 */
export const followUser = async (userId) => {
    await api.post(`${BASE_URL}/${userId}/follow`);
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId) => {
    await api.delete(`${BASE_URL}/${userId}/follow`);
};

/**
 * Get user's followers
 */
export const getFollowers = async (userId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/${userId}/followers`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get users that a user is following
 */
export const getFollowing = async (userId, { page = 0, size = 20 } = {}) => {
    const response = await api.get(`${BASE_URL}/${userId}/following`, {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get follow status between current user and another user
 */
export const getFollowStatus = async (userId) => {
    const response = await api.get(`${BASE_URL}/${userId}/follow-status`);
    return response.data;
};

export default {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus
};
