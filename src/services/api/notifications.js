import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Get all notifications (paginated)
 */
export const getNotifications = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.NOTIFICATIONS.BASE, {
        params: { page, size }
    });
};

/**
 * Get notifications by type (LIKE, COMMENT, FOLLOW, MENTION, REPOST, REPLY, SYSTEM)
 */
export const getNotificationsByType = async (type, { page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.NOTIFICATIONS.BY_TYPE(type), {
        params: { page, size }
    });
};

/**
 * Get mentions
 */
export const getMentions = async ({ page = 0, size = 20 } = {}) => {
    return apiCaller.get(URLS.NOTIFICATIONS.MENTIONS, {
        params: { page, size }
    });
};

/**
 * Get unread count
 */
export const getUnreadCount = async () => {
    return apiCaller.get(URLS.NOTIFICATIONS.UNREAD_COUNT);
};

/**
 * Get unseen count (for bell badge)
 */
export const getUnseenCount = async () => {
    return apiCaller.get(URLS.NOTIFICATIONS.UNSEEN_COUNT);
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
    return apiCaller.put(URLS.NOTIFICATIONS.MARK_ALL_READ);
};

/**
 * Mark all notifications as seen
 */
export const markAllAsSeen = async () => {
    return apiCaller.put(URLS.NOTIFICATIONS.MARK_ALL_SEEN);
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
    return apiCaller.put(URLS.NOTIFICATIONS.MARK_READ(notificationId));
};

export default {
    getNotifications,
    getNotificationsByType,
    getMentions,
    getUnreadCount,
    getUnseenCount,
    markAllAsRead,
    markAllAsSeen,
    markNotificationAsRead
};
