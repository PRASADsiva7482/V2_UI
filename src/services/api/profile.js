import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
    return apiCaller.get(URLS.PROFILE.ME);
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
    return apiCaller.get(URLS.PROFILE.BY_ID(userId));
};

/**
 * Get user profile by username
 */
export const getUserProfileByUsername = async (username) => {
    return apiCaller.get(URLS.PROFILE.BY_USERNAME(username));
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (profileData) => {
    return apiCaller.put(URLS.PROFILE.ME, profileData);
};

/**
 * Update profile picture
 */
export const updateProfilePicture = async (pictureUrl) => {
    return apiCaller.put(URLS.PROFILE.PICTURE, null, {
        params: { pictureUrl }
    });
};

/**
 * Update cover photo
 */
export const updateCoverPhoto = async (coverPhotoUrl) => {
    return apiCaller.put(URLS.PROFILE.COVER, null, {
        params: { coverPhotoUrl }
    });
};

/**
 * Search users by keyword
 */
export const searchUsers = async (keyword, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.PROFILE.SEARCH, {
        params: { keyword, page, size }
    });
};

export default {
    getMyProfile,
    getUserProfile,
    getUserProfileByUsername,
    updateMyProfile,
    updateProfilePicture,
    updateCoverPhoto,
    searchUsers
};

