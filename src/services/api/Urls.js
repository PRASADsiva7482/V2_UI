const API_BASE = '/api/v1';

export const URLS = {
    POSTS: {
        BASE: `${API_BASE}/posts`,
        TIMELINE: `${API_BASE}/feed/timeline`,
        EXPLORE: `${API_BASE}/feed/explore`,
        USER_POSTS: (userId) => `${API_BASE}/posts/user/${userId}`,
        BY_ID: (postId) => `${API_BASE}/posts/${postId}`,
        SEARCH: `${API_BASE}/posts/search`,
        VIEW: (postId) => `${API_BASE}/posts/${postId}/view`,
        LIKE: (postId) => `${API_BASE}/posts/${postId}/like`,
        LIKES: (postId) => `${API_BASE}/posts/${postId}/likes`,
        COMMENTS: (postId) => `${API_BASE}/posts/${postId}/comments`,
    },
    COMMENTS: {
        BASE: `${API_BASE}/comments`,
        BY_ID: (commentId) => `${API_BASE}/comments/${commentId}`,
        REPLY: (commentId) => `${API_BASE}/comments/${commentId}/reply`,
        REPLIES: (commentId) => `${API_BASE}/comments/${commentId}/replies`,
        LIKE: (commentId) => `${API_BASE}/comments/${commentId}/like`,
        LIKES: (commentId) => `${API_BASE}/comments/${commentId}/likes`,
    },
    USERS: {
        BASE: `${API_BASE}/users`,
        FOLLOW: (userId) => `${API_BASE}/users/${userId}/follow`,
        FOLLOWERS: (userId) => `${API_BASE}/users/${userId}/followers`,
        FOLLOWING: (userId) => `${API_BASE}/users/${userId}/following`,
        FOLLOW_STATUS: (userId) => `${API_BASE}/users/${userId}/follow-status`,
    },
    PROFILE: {
        BASE: `${API_BASE}/profile`,
        ME: `${API_BASE}/profile/me`,
        BY_ID: (userId) => `${API_BASE}/profile/${userId}`,
        BY_USERNAME: (username) => `${API_BASE}/profile/username/${username}`,
        PICTURE: `${API_BASE}/profile/me/picture`,
        COVER: `${API_BASE}/profile/me/cover`,
        SEARCH: `${API_BASE}/profile/search`,
    },
    DISCOVERY: {
        BASE: `${API_BASE}/discovery`,
        TRENDING_POSTS: `${API_BASE}/discovery/trending/posts`,
        POPULAR_USERS: `${API_BASE}/discovery/popular/users`,
        STATS: `${API_BASE}/discovery/stats`,
        SUGGESTIONS: `${API_BASE}/discovery/suggestions/users`,
    },
    MEDIA: {
        BASE: `${API_BASE}/media`,
        UPLOAD: `${API_BASE}/media/upload`,
        UPLOAD_MULTIPLE: `${API_BASE}/media/upload/multiple`,
        BY_ID: (mediaId) => `${API_BASE}/media/${mediaId}`,
        POST_MEDIA: (postId) => `${API_BASE}/media/post/${postId}`,
    },
    HASHTAGS: {
        BASE: `${API_BASE}/hashtags`,
        SEARCH: `${API_BASE}/hashtags/search`,
        TRENDING: `${API_BASE}/hashtags/trending`,
        TOP: `${API_BASE}/hashtags/top`,
        BY_NAME: (tagName) => `${API_BASE}/hashtags/${tagName}`,
        POSTS: (tagName) => `${API_BASE}/hashtags/${tagName}/posts`,
    }
};

export default URLS;
