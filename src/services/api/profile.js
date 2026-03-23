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
 * Upload profile picture (multipart file upload)
 * Server handles: saving file, deleting old pic, updating DB
 */
export const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCaller.upload(URLS.PROFILE.PICTURE_UPLOAD, formData);
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async () => {
    return apiCaller.delete(URLS.PROFILE.PICTURE_DELETE);
};

/**
 * Update profile picture (URL-based — legacy)
 */
export const updateProfilePictureUrl = async (pictureUrl) => {
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

/**
 * Pin a post to the user's profile
 */
export const pinPost = async (postId) => {
    return apiCaller.put(`${URLS.PROFILE.ME}/pin/${postId}`);
};

/**
 * Unpin the currently pinned post
 */
export const unpinPost = async () => {
    return apiCaller.delete(`${URLS.PROFILE.ME}/pin`);
};

export default {
    getMyProfile,
    getUserProfile,
    getUserProfileByUsername,
    updateMyProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    updateProfilePictureUrl,
    updateCoverPhoto,
    searchUsers,
    pinPost,
    unpinPost
};
