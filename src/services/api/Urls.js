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
        FOLLOW_ACCEPT: (userId) => `${API_BASE}/users/${userId}/follow/accept`,
        FOLLOW_DECLINE: (userId) => `${API_BASE}/users/${userId}/follow/decline`,
        FOLLOW_REQUESTS: `${API_BASE}/users/follow-requests`,
        FOLLOW_REQUESTS_COUNT: `${API_BASE}/users/follow-requests/count`,
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
        PICTURE_UPLOAD: `${API_BASE}/profile/me/picture/upload`,
        PICTURE_DELETE: `${API_BASE}/profile/me/picture`,
        COVER: `${API_BASE}/profile/me/cover`,
        SEARCH: `${API_BASE}/profile/search`,
    },
    DISCOVERY: {
        BASE: `${API_BASE}/discovery`,
        TRENDING_POSTS: `${API_BASE}/discovery/trending/posts`,
        POPULAR_USERS: `${API_BASE}/discovery/popular/users`,
        STATS: `${API_BASE}/discovery/stats`,
        SUGGESTIONS: `${API_BASE}/discovery/suggestions/users`,
        FOR_YOU: `${API_BASE}/discovery/for-you`,
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
    },
    CHAT: {
        CONVERSATIONS: `${API_BASE}/chat/conversations`,
        CONVERSATION: (conversationId) => `${API_BASE}/chat/conversations/${conversationId}`,
        MESSAGES: (conversationId) => `${API_BASE}/chat/messages/${conversationId}`,
        MESSAGE: (messageId) => `${API_BASE}/chat/messages/${messageId}`,
        MEDIA_UPLOAD: `${API_BASE}/chat/media/upload`,
        SEND_MESSAGE: `${API_BASE}/chat/messages/send`,
    },
    EXPLORE: {
        FOR_YOU: `${API_BASE}/explore/for-you`,
        CATEGORIES: `${API_BASE}/explore/categories`,
        TRENDING: `${API_BASE}/explore/trending`,
        NEWS: `${API_BASE}/explore/news`,
        BREAKING_NEWS: `${API_BASE}/explore/news/breaking`,
        SEARCH: `${API_BASE}/explore/search`,
        TRENDING_POSTS: `${API_BASE}/explore/trending/posts`,
    },
    NOTIFICATIONS: {
        BASE: `${API_BASE}/notifications`,
        BY_TYPE: (type) => `${API_BASE}/notifications/type/${type}`,
        MENTIONS: `${API_BASE}/notifications/mentions`,
        UNREAD_COUNT: `${API_BASE}/notifications/unread-count`,
        UNSEEN_COUNT: `${API_BASE}/notifications/unseen-count`,
        MARK_ALL_READ: `${API_BASE}/notifications/mark-all-read`,
        MARK_ALL_SEEN: `${API_BASE}/notifications/mark-all-seen`,
        MARK_READ: (id) => `${API_BASE}/notifications/${id}/read`,
    },
    BOOKMARKS: {
        BASE: `${API_BASE}/bookmarks`,
        BY_POST: (postId) => `${API_BASE}/bookmarks/${postId}`,
        STATUS: (postId) => `${API_BASE}/bookmarks/${postId}/status`,
        COUNT: `${API_BASE}/bookmarks/count`,
    },
    POLLS: {
        VOTE: (pollId) => `${API_BASE}/polls/${pollId}/vote`,
        BY_POST: (postId) => `${API_BASE}/polls/post/${postId}`,
        BY_ID: (pollId) => `${API_BASE}/polls/${pollId}`,
    },
    LISTS: {
        BASE: `${API_BASE}/lists`,
        BY_ID: (listId) => `${API_BASE}/lists/${listId}`,
        USER_LISTS: (userId) => `${API_BASE}/lists/user/${userId}`,
        MEMBERS: (listId) => `${API_BASE}/lists/${listId}/members`,
        ADD_MEMBER: (listId, memberId) => `${API_BASE}/lists/${listId}/members/${memberId}`,
    },
    COMMUNITY_NOTES: {
        BY_POST: (postId) => `${API_BASE}/community-notes/post/${postId}`,
        APPROVED: (postId) => `${API_BASE}/community-notes/post/${postId}/approved`,
        VOTE: (noteId) => `${API_BASE}/community-notes/${noteId}/vote`,
    },
    SUBSCRIPTIONS: {
        BASE: `${API_BASE}/subscriptions`,
        BY_USER: (userId) => `${API_BASE}/subscriptions/${userId}`,
        STATUS: (userId) => `${API_BASE}/subscriptions/${userId}/status`,
    },
    STORIES: {
        BASE: `${API_BASE}/stories`,
        MINE: `${API_BASE}/stories/me`,
        FEED: `${API_BASE}/stories/feed`,
        VIEW: (storyId) => `${API_BASE}/stories/${storyId}/view`,
        DELETE: (storyId) => `${API_BASE}/stories/${storyId}`,
    },
    VERIFICATION: {
        REQUEST: `${API_BASE}/verification/request`,
        REQUESTS: `${API_BASE}/verification/requests`,
        STATUS: `${API_BASE}/verification/status`,
    },
    ANALYTICS: {
        DASHBOARD: `${API_BASE}/analytics/dashboard`,
    },
    MUSIC: {
        SHARE: `${API_BASE}/music/share`,
        ME: `${API_BASE}/music/me`,
        RECENT: `${API_BASE}/music/recent`,
        USER: (userId) => `${API_BASE}/music/user/${userId}`,
        POST: (postId) => `${API_BASE}/music/post/${postId}`,
        DELETE: (id) => `${API_BASE}/music/${id}`
    },
    MODERATION: {
        REPORT: `${API_BASE}/moderation/report`,
        SCAN: `${API_BASE}/moderation/scan`,
        PENDING: `${API_BASE}/moderation/pending`,
        POST: (postId) => `${API_BASE}/moderation/post/${postId}`
    },
    WATCH_PARTY: {
        CREATE: `${API_BASE}/watch-party`,
        ACTIVE: `${API_BASE}/watch-party/active`,
        POPULAR: `${API_BASE}/watch-party/popular`,
        ME: `${API_BASE}/watch-party/me`,
        JOIN: (id) => `${API_BASE}/watch-party/${id}/join`,
        LEAVE: (id) => `${API_BASE}/watch-party/${id}/leave`,
        END: (id) => `${API_BASE}/watch-party/${id}/end`
    },
    LOCATION: {
        NEARBY: `${API_BASE}/location/nearby`
    },
    GAMIFICATION: {
        STATS: `${API_BASE}/gamification/stats`,
        USER_STATS: (userId) => `${API_BASE}/gamification/stats/${userId}`,
        ACTION: `${API_BASE}/gamification/action`
    },
    TRANSLATION: {
        TRANSLATE: `${API_BASE}/translate`,
        DETECT: `${API_BASE}/translate/detect`
    },
    SETTINGS: {
        BASE: `${API_BASE}/settings`,
        ME: `${API_BASE}/settings/me`
    },
    SPACES: {
        BASE: `${API_BASE}/spaces`,
        CREATE: `${API_BASE}/spaces/create`,
        ACTIVE: `${API_BASE}/spaces/active`,
        JOIN: (spaceId) => `${API_BASE}/spaces/${spaceId}/join`,
        LEAVE: (spaceId) => `${API_BASE}/spaces/${spaceId}/leave`,
        END: (spaceId) => `${API_BASE}/spaces/${spaceId}/end`
    }
};

export default URLS;
