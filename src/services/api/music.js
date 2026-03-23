import apiCaller from './apiCaller';
import URLS from './Urls';

// Music Sharing endpoints
export const shareMusic = (musicData) => {
    return apiCaller.post(URLS.MUSIC.SHARE, musicData);
};

export const getMyMusicShares = () => {
    return apiCaller.get(URLS.MUSIC.ME);
};

export const getRecentMusicShares = () => {
    return apiCaller.get(URLS.MUSIC.RECENT);
};

export const getUserMusicShares = (userId) => {
    return apiCaller.get(URLS.MUSIC.USER(userId));
};

export const deleteMusicShare = (id) => {
    return apiCaller.delete(URLS.MUSIC.DELETE(id));
};
