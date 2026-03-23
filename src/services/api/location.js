import apiCaller from './apiCaller';
import URLS from './Urls';

// Location endpoints
export const getNearbyFeed = (lat, lng, radiusKm = 10, limit = 20) => {
    return apiCaller.get(`${URLS.LOCATION.NEARBY}?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}&limit=${limit}`);
};
