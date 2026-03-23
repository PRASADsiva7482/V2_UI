import apiCaller from './apiCaller';
import URLS from './Urls';

// Watch Parties endpoints
export const createWatchParty = (partyData) => {
    return apiCaller.post(URLS.WATCH_PARTY.CREATE, partyData);
};

export const getActiveWatchParties = () => {
    return apiCaller.get(URLS.WATCH_PARTY.ACTIVE);
};

export const getMyWatchParties = () => {
    return apiCaller.get(URLS.WATCH_PARTY.ME);
};

export const joinWatchParty = (partyId) => {
    return apiCaller.post(URLS.WATCH_PARTY.JOIN(partyId));
};

export const leaveWatchParty = (partyId) => {
    return apiCaller.post(URLS.WATCH_PARTY.LEAVE(partyId));
};

export const endWatchParty = (partyId) => {
    return apiCaller.post(URLS.WATCH_PARTY.END(partyId));
};
