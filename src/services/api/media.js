import apiCaller from './apiCaller';
import { URLS } from './Urls';
import api from '../../auth/api';

/**
 * Upload a single media file
 * @param {File} file - The file to upload
 * @returns {Promise} Media response with id and URL
 */
export const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCaller.upload(URLS.MEDIA.UPLOAD, formData);
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
    return apiCaller.upload(URLS.MEDIA.UPLOAD_MULTIPLE, formData);
};

/**
 * Get media by ID
 * @param {number} mediaId - Media ID
 * @returns {Promise} Media object
 */
export const getMediaById = async (mediaId) => {
    return apiCaller.get(URLS.MEDIA.BY_ID(mediaId));
};

/**
 * Get all media for a post
 * @param {number} postId - Post ID
 * @returns {Promise} Array of media objects
 */
export const getMediaByPost = async (postId) => {
    return apiCaller.get(URLS.MEDIA.POST_MEDIA(postId));
};

/**
 * Delete media by ID
 * @param {number} mediaId - Media ID
 * @returns {Promise}
 */
export const deleteMedia = async (mediaId) => {
    return apiCaller.delete(URLS.MEDIA.BY_ID(mediaId));
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

export default {
    uploadMedia,
    uploadMultipleMedia,
    getMediaById,
    getMediaByPost,
    deleteMedia,
    getMediaUrl
};
