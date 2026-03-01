import apiCaller from './apiCaller';

const BASE_URL = '/api/v1/settings';

export const getUserSettings = async () => {
    return apiCaller.get(BASE_URL);
};

export const updateUserSettings = async (settingsDto) => {
    return apiCaller.put(BASE_URL, settingsDto);
};

export const deleteUserAccount = async () => {
    return apiCaller.delete(`${BASE_URL}/account`);
};

export default {
    getUserSettings,
    updateUserSettings,
    deleteUserAccount
};
