import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getNotifications,
    getMentions,
    getUnreadCount,
    markAllAsRead,
    markAllAsSeen,
    markNotificationAsRead
} from '../services/api/notifications';
import './Notifications.css';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'mentions', label: 'Mentions' },
];

// Notification type icons and colors
const NOTIFICATION_ICONS = {
    LIKE: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#F91880">
                <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
            </svg>
        ),
        color: '#F91880',
        label: 'liked your post',
    },
    COMMENT: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#1DA1F2">
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.862 4.394-2.428 6.019l-4.517 4.685c-.405.42-1.06.434-1.468.031L12 19.029l-1.838 1.836c-.408.403-1.063.389-1.468-.031L4.18 16.15C2.614 14.524 1.751 12.38 1.751 10zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 1.74.68 3.4 1.905 4.631l3.517 3.648L12 15.453l2.826 2.826 3.517-3.648C19.57 13.4 20.25 11.74 20.25 10c0-3.39-2.75-6.13-6.13-6.13H9.756z" />
            </svg>
        ),
        color: '#1DA1F2',
        label: 'commented on your post',
    },
    FOLLOW: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#1DA1F2">
                <path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zM8.84 6.368c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.085-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" />
            </svg>
        ),
        color: '#1DA1F2',
        label: 'followed you',
    },
    MENTION: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#794BC4">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91-.79-.78-2.09-.79-2.91-.09zM12 15.5c.83-.83 1.5-1.5 1.5-1.5 1.5-3 0-6-3-9-3 3-4.5 6-3 9 0 0 .67.67 1.5 1.5L5 22h10l3-7z" />
            </svg>
        ),
        color: '#794BC4',
        label: 'mentioned you in a post',
    },
    REPOST: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#00BA7C">
                <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
            </svg>
        ),
        color: '#00BA7C',
        label: 'reposted your post',
    },
    REPLY: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#1DA1F2">
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.862 4.394-2.428 6.019l-4.517 4.685c-.405.42-1.06.434-1.468.031L12 19.029l-1.838 1.836c-.408.403-1.063.389-1.468-.031L4.18 16.15C2.614 14.524 1.751 12.38 1.751 10z" />
            </svg>
        ),
        color: '#1DA1F2',
        label: 'replied to your comment',
    },
    SYSTEM: {
        icon: (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#8B98A5">
                <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2z" />
            </svg>
        ),
        color: '#8B98A5',
        label: 'System notification',
    },
};

function Notifications() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        loadNotifications(true);
        loadUnreadCount();
        // Mark as seen when visiting notifications page
        markAllAsSeen().catch(() => { });
    }, []);

    useEffect(() => {
        loadNotifications(true);
    }, [activeTab]);

    const loadNotifications = async (reset = false) => {
        const currentPage = reset ? 0 : page;
        if (reset) {
            setLoading(true);
            setPage(0);
        } else {
            setLoadingMore(true);
        }

        try {
            let response;
            if (activeTab === 'mentions') {
                response = await getMentions({ page: currentPage, size: 20 });
            } else {
                response = await getNotifications({ page: currentPage, size: 20 });
            }

            const data = response?.content || response || [];
            const isLast = response?.last ?? true;

            if (reset) {
                setNotifications(Array.isArray(data) ? data : []);
            } else {
                setNotifications(prev => [...prev, ...(Array.isArray(data) ? data : [])]);
            }

            setHasMore(!isLast);
            if (!reset) setPage(prev => prev + 1);
        } catch (error) {
            console.error('Error loading notifications:', error);
            if (reset) setNotifications([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data?.unreadCount || 0);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to the relevant content
        if (notification.referenceType === 'POST' && notification.referenceId) {
            // Navigate to post (could be extended later)
            navigate('/home');
        } else if (notification.type === 'FOLLOW' && notification.senderId) {
            navigate(`/profile/${notification.senderId}`);
        } else if (notification.senderUsername) {
            navigate(`/profile/${notification.senderId}`);
        }
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffSecs < 60) return `${diffSecs}s`;
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHrs < 24) return `${diffHrs}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getNotificationConfig = (type) => {
        return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.SYSTEM;
    };

    const getNotificationText = (notification) => {
        const config = getNotificationConfig(notification.type);
        const sender = notification.senderDisplayName || notification.senderUsername || 'Someone';

        if (notification.message) {
            return notification.message;
        }

        return `${sender} ${config.label}`;
    };

    const renderHeader = () => (
        <div className="notifications-header">
            <div className="notifications-header-top">
                <h1 className="notifications-title">Notifications</h1>
                <div className="notifications-header-actions">
                    {unreadCount > 0 && (
                        <button
                            className="notifications-mark-read-btn"
                            onClick={handleMarkAllRead}
                            title="Mark all as read"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </button>
                    )}
                    <button
                        className="notifications-settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Notification settings"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.54c-.05.2.04.41.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.12-.26.33-.21.53l.58 2.54-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.58-2.36c-.11-.17-.32-.25-.52-.21l-2.54.59-2.17-2.17.58-2.54c.05-.2-.04-.41-.21-.53L1.75 13.46v-2.92l2.36-1.57c.17-.12.26-.33.21-.53l-.58-2.54 2.17-2.17 2.54.59c.2.04.41-.04.52-.21l1.58-2.36zm1.46 2l-1.3 1.95c-.56.83-1.55 1.22-2.5.98L6.49 6.2l-.42.42.49 2.21c.18.9-.18 1.84-.97 2.39l-1.96 1.3v.6l1.96 1.3c.79.55 1.15 1.49.97 2.39l-.49 2.21.42.42 2.21-.49c.95-.24 1.94.15 2.5.98l1.3 1.95h.6l1.3-1.95c.56-.83 1.55-1.22 2.5-.98l2.21.49.42-.42-.49-2.21c-.18-.9.18-1.84.97-2.39l1.96-1.3v-.6l-1.96-1.3c-.79-.55-1.15-1.49-.97-2.39l.49-2.21-.42-.42-2.21.49c-.95.24-1.94-.15-2.5-.98L12.6 3.75h-.6zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="notifications-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`notifications-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                        id={`notifications-tab-${tab.key}`}
                    >
                        <span className="notifications-tab-label">{tab.label}</span>
                        {activeTab === tab.key && <div className="notifications-tab-indicator" />}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderNotification = (notification) => {
        const config = getNotificationConfig(notification.type);

        return (
            <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
            >
                {/* Unread dot */}
                {!notification.isRead && (
                    <div className="notification-unread-dot" />
                )}

                {/* Type icon */}
                <div className="notification-icon">
                    {config.icon}
                </div>

                {/* Content */}
                <div className="notification-content">
                    {/* Sender avatar */}
                    {notification.senderProfilePictureUrl ? (
                        <img
                            src={notification.senderProfilePictureUrl}
                            alt={notification.senderDisplayName}
                            className="notification-avatar"
                        />
                    ) : notification.senderId && (
                        <div className="notification-avatar notification-avatar-placeholder">
                            {(notification.senderDisplayName || notification.senderUsername || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Text */}
                    <div className="notification-text">
                        <p className="notification-message">
                            {notification.senderDisplayName && (
                                <span className="notification-sender-name">
                                    {notification.senderDisplayName}
                                </span>
                            )}{' '}
                            {config.label}
                        </p>

                        {/* Reference content preview */}
                        {notification.referenceContent && (
                            <p className="notification-reference">
                                {notification.referenceContent}
                            </p>
                        )}

                        {/* Custom message (e.g., comment text) */}
                        {notification.message && notification.type !== 'SYSTEM' && (
                            <p className="notification-custom-message">
                                {notification.message}
                            </p>
                        )}

                        {/* System message */}
                        {notification.type === 'SYSTEM' && notification.message && (
                            <p className="notification-system-message">
                                {notification.message}
                            </p>
                        )}
                    </div>

                    {/* Timestamp */}
                    <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                    </span>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="notifications-loading">
                    <div className="notifications-spinner"></div>
                    <p>Loading notifications...</p>
                </div>
            );
        }

        if (notifications.length === 0) {
            return (
                <div className="notifications-empty">
                    <div className="notifications-empty-icon">
                        {activeTab === 'mentions' ? (
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                <path d="M12.05 2.75c-3.94 0-7.14 3.2-7.14 7.14v.34c0 1.03.22 2.05.62 2.98l.95 2.2c.19.44.29.92.29 1.4v.78c0 1.52 1.23 2.75 2.75 2.75h.75v-7.14c0-1.04.84-1.88 1.88-1.88h1.5c1.04 0 1.88.84 1.88 1.88v7.14h.75c1.52 0 2.75-1.23 2.75-2.75v-.78c0-.48.1-.96.29-1.4l.95-2.2c.4-.93.62-1.95.62-2.98v-.34c0-3.94-3.2-7.14-7.14-7.14z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2z" />
                            </svg>
                        )}
                    </div>
                    <h3>
                        {activeTab === 'mentions'
                            ? 'Nothing to see here — yet'
                            : 'No notifications yet'}
                    </h3>
                    <p>
                        {activeTab === 'mentions'
                            ? "When someone mentions you, you'll find it here."
                            : "When someone interacts with your posts, you'll see it here."}
                    </p>
                </div>
            );
        }

        return (
            <div className="notifications-list">
                {notifications.map(notification => renderNotification(notification))}

                {hasMore && (
                    <button
                        className="notifications-load-more"
                        onClick={() => {
                            setPage(prev => prev + 1);
                            loadNotifications(false);
                        }}
                        disabled={loadingMore}
                    >
                        {loadingMore ? (
                            <>
                                <div className="notifications-spinner-small"></div>
                                Loading...
                            </>
                        ) : (
                            'Load more'
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="notifications-page" id="notifications-page">
            {renderHeader()}
            <div className="notifications-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Notifications;
