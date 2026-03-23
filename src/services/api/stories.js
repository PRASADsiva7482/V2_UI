import apiCaller from './apiCaller';
import { URLS } from './Urls';

export const createStory = async (mediaUrl, mediaType = 'IMAGE', caption = '') => {
    return apiCaller.post(URLS.STORIES.BASE, { mediaUrl, mediaType, caption });
};
export const getMyStories = async () => apiCaller.get(URLS.STORIES.MINE);
export const getFeedStories = async () => apiCaller.get(URLS.STORIES.FEED);
export const viewStory = async (storyId) => apiCaller.post(URLS.STORIES.VIEW(storyId));
export const deleteStory = async (storyId) => apiCaller.delete(URLS.STORIES.DELETE(storyId));
