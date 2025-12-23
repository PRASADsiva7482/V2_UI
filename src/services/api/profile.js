import api from '../../auth/api';

const BASE_URL = '/api/v1/profile';

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
    const response = await api.get(`${BASE_URL}/me`);
    return response.data;
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
    const response = await api.get(`${BASE_URL}/${userId}`);
    return response.data;
};

/**
 * Get user profile by username
 */
export const getUserProfileByUsername = async (username) => {
    const response = await api.get(`${BASE_URL}/username/${username}`);
    return response.data;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (profileData) => {
    const response = await api.put(`${BASE_URL}/me`, profileData);
    return response.data;
};

/**
 * Update profile picture
 */
export const updateProfilePicture = async (pictureUrl) => {
    const response = await api.put(`${BASE_URL}/me/picture`, null, {
        params: { pictureUrl }
    });
    return response.data;
};

/**
 * Update cover photo
 */
export const updateCoverPhoto = async (coverPhotoUrl) => {
    const response = await api.put(`${BASE_URL}/me/cover`, null, {
        params: { coverPhotoUrl }
    });
    return response.data;
};

export default {
    getMyProfile,
    getUserProfile,
    getUserProfileByUsername,
    updateMyProfile,
    updateProfilePicture,
    updateCoverPhoto
};
