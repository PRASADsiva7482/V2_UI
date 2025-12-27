import api from '../../auth/api';

/**
 * Upload a single media file
 * @param {File} file - The file to upload
 * @returns {Promise} Media response with id and URL
 */
export const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/v1/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload multiple media files (up to 4)
 * @param {File[]} files - Array of files to upload
 * @returns {Promise} Response with array of media objects
 */
export const uploadMultipleMedia = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await api.post('/api/v1/media/upload/multiple', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get media by ID
 * @param {number} mediaId - Media ID
 * @returns {Promise} Media object
 */
export const getMediaById = async (mediaId) => {
    const response = await api.get(`/api/v1/media/${mediaId}`);
    return response.data;
};

/**
 * Get all media for a post
 * @param {number} postId - Post ID
 * @returns {Promise} Array of media objects
 */
export const getMediaByPost = async (postId) => {
    const response = await api.get(`/api/v1/media/post/${postId}`);
    return response.data;
};

/**
 * Delete media by ID
 * @param {number} mediaId - Media ID
 * @returns {Promise}
 */
export const deleteMedia = async (mediaId) => {
    const response = await api.delete(`/api/v1/media/${mediaId}`);
    return response.data;
};

/**
 * Get media file URL
 * @param {string} mediaType - 'images' or 'videos'
 * @param {string} filename - File name
 * @returns {string} Full URL to the media file
 */
export const getMediaUrl = (mediaType, filename) => {
    return `${api.defaults.baseURL}/api/v1/media/${mediaType}/${filename}`;
};
