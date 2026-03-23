import apiCaller from './apiCaller';
import { URLS } from './Urls';

/** Create a new list */
export const createList = async (name, description = '', isPrivate = false) => {
    return apiCaller.post(URLS.LISTS.BASE, { name, description, isPrivate });
};

/** Get my lists */
export const getMyLists = async () => {
    return apiCaller.get(URLS.LISTS.BASE);
};

/** Get a user's public lists */
export const getUserLists = async (userId) => {
    return apiCaller.get(URLS.LISTS.USER_LISTS(userId));
};

/** Delete a list */
export const deleteList = async (listId) => {
    return apiCaller.delete(URLS.LISTS.BY_ID(listId));
};

/** Add a member to a list */
export const addListMember = async (listId, memberId) => {
    return apiCaller.post(URLS.LISTS.ADD_MEMBER(listId, memberId));
};

/** Remove a member from a list */
export const removeListMember = async (listId, memberId) => {
    return apiCaller.delete(URLS.LISTS.ADD_MEMBER(listId, memberId));
};

/** Get list members */
export const getListMembers = async (listId) => {
    return apiCaller.get(URLS.LISTS.MEMBERS(listId));
};
