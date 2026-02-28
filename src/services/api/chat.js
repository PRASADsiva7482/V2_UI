import apiCaller from './apiCaller';
import URLS from './Urls';

/**
 * Chat REST API service.
 * Used ONLY for initial load & CRUD operations.
 * 🚫 No polling, no "check for updates" calls.
 */

/**
 * Get all conversations for the current user.
 * Called ONCE on initial chat screen load.
 */
export const getConversations = () => {
    return apiCaller.get(URLS.CHAT.CONVERSATIONS);
};

/**
 * Get a specific conversation by ID.
 */
export const getConversation = (conversationId) => {
    return apiCaller.get(URLS.CHAT.CONVERSATION(conversationId));
};

/**
 * Start a new 1:1 conversation (or return existing).
 */
export const startConversation = (recipientUserId) => {
    return apiCaller.post(URLS.CHAT.CONVERSATIONS, { recipientUserId });
};

/**
 * Get paginated message history for a conversation.
 * Called ONCE per conversation open + on scroll-up for older messages.
 */
export const getMessages = (conversationId, page = 0, size = 30) => {
    return apiCaller.get(
        `${URLS.CHAT.MESSAGES(conversationId)}?page=${page}&size=${size}`
    );
};

/**
 * Edit a message.
 */
export const editMessage = (messageId, newContent) => {
    return apiCaller.put(URLS.CHAT.MESSAGE(messageId), newContent);
};

/**
 * Delete a message (soft delete).
 */
export const deleteMessage = (messageId) => {
    return apiCaller.delete(URLS.CHAT.MESSAGE(messageId));
};

/**
 * Upload a media file for chat.
 * Returns { fileUrl, fileName, fileType, fileSize, thumbnailUrl, mediaId }
 */
export const uploadChatMedia = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCaller.upload(URLS.CHAT.MEDIA_UPLOAD, formData);
};

/**
 * Send a message with attachments via REST (for media messages).
 * Used when the message includes file attachments.
 */
export const sendMessageWithMedia = (request) => {
    return apiCaller.post(URLS.CHAT.SEND_MESSAGE, request);
};
