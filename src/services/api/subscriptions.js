import apiCaller from './apiCaller';
import { URLS } from './Urls';

/** Subscribe to a user's notifications */
export const subscribeToUser = async (userId) => {
    return apiCaller.post(URLS.SUBSCRIPTIONS.BY_USER(userId));
};

/** Unsubscribe from a user's notifications */
export const unsubscribeFromUser = async (userId) => {
    return apiCaller.delete(URLS.SUBSCRIPTIONS.BY_USER(userId));
};

/** Check subscription status */
export const getSubscriptionStatus = async (userId) => {
    return apiCaller.get(URLS.SUBSCRIPTIONS.STATUS(userId));
};

/** Get my subscriptions */
export const getMySubscriptions = async () => {
    return apiCaller.get(URLS.SUBSCRIPTIONS.BASE);
};
