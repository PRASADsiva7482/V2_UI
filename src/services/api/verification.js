import apiCaller from './apiCaller';
import { URLS } from './Urls';

export const submitVerificationRequest = async (fullName, category, reason) => {
    return apiCaller.post(URLS.VERIFICATION.REQUEST, { fullName, category, reason });
};
export const getMyVerificationRequests = async () => apiCaller.get(URLS.VERIFICATION.REQUESTS);
export const getVerificationStatus = async () => apiCaller.get(URLS.VERIFICATION.STATUS);
