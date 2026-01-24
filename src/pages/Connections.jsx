import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthProvider';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../services/api/follows';
import { getPopularUsers, getSmartSuggestions } from '../services/api/discovery';
import { getMyProfile } from '../services/api/profile';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import './Connections.css';

function Connections() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'followers');
    const [currentProfile, setCurrentProfile] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [followingState, setFollowingState] = useState({});
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadCurrentProfile();
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab') || 'followers';
        setActiveTab(tab);
        setPage(0);
        setHasMore(true);
    }, [searchParams]);

    useEffect(() => {
        if (currentProfile) {
            loadData();
        }
    }, [activeTab, currentProfile, page]);

    const loadCurrentProfile = async () => {
        try {
            const profile = await getMyProfile();
            setCurrentProfile(profile);
        } catch (error) {
            console.error('Error loading current profile:', error);
        }
    };

    const loadData = async () => {
        if (!currentProfile) return;

        setLoading(true);
        try {
            if (activeTab === 'followers') {
                const response = await getFollowers(currentProfile.userId, { page, size: 20 });
                if (page === 0) {
                    setFollowers(response.content || []);
                } else {
                    setFollowers(prev => [...prev, ...(response.content || [])]);
                }
                setHasMore(!response.last);

                // Initialize following state from backend
                const state = {};
                (response.content || []).forEach(user => {
                    state[user.userId] = user.isFollowing || false;
                });
                setFollowingState(prev => ({ ...prev, ...state }));
            } else if (activeTab === 'following') {
                const response = await getFollowing(currentProfile.userId, { page, size: 20 });
                if (page === 0) {
                    setFollowing(response.content || []);
                } else {
                    setFollowing(prev => [...prev, ...(response.content || [])]);
                }
                setHasMore(!response.last);

                // All following users are followed by definition
                const state = {};
                (response.content || []).forEach(user => {
                    state[user.userId] = true;
                });
                setFollowingState(prev => ({ ...prev, ...state }));
            } else if (activeTab === 'suggestions') {
                // Use smart suggestions instead of general popular users
                const response = await getSmartSuggestions(50);
                setSuggestions(response || []);

                // Initialize following state from backend
                const state = {};
                (response || []).forEach(user => {
                    state[user.userId] = user.isFollowing || false;
                });
                setFollowingState(prev => ({ ...prev, ...state }));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    const handleFollowToggle = async (userId) => {
        const isCurrentlyFollowing = followingState[userId];

        try {
            // Optimistic update
            setFollowingState(prev => ({
                ...prev,
                [userId]: !isCurrentlyFollowing
            }));

            if (isCurrentlyFollowing) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }

            // Update counts in the lists
            if (activeTab === 'followers') {
                setFollowers(prev => prev.map(user =>
                    user.userId === userId
                        ? { ...user, isFollowing: !isCurrentlyFollowing }
                        : user
                ));
            } else if (activeTab === 'following' && isCurrentlyFollowing) {
                // Remove from following list if unfollowed
                setFollowing(prev => prev.filter(user => user.userId !== userId));
            } else if (activeTab === 'suggestions') {
                setSuggestions(prev => prev.map(user =>
                    user.userId === userId
                        ? { ...user, isFollowing: !isCurrentlyFollowing }
                        : user
                ));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            // Revert on error
            setFollowingState(prev => ({
                ...prev,
                [userId]: isCurrentlyFollowing
            }));
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const loadMore = () => {
        if (!loading && hasMore && activeTab !== 'suggestions') {
            setPage(prev => prev + 1);
        }
    };

    const renderUserCard = (user) => {
        const isOwnProfile = currentProfile?.userId === user.userId;
        const isFollowingUser = followingState[user.userId] || false;

        return (
            <div key={user.userId} className="user-card">
                <div className="user-card-main">
                    <div className="user-card-content" onClick={() => handleUserClick(user.userId)}>
                        <Avatar
                            src={user.profilePictureUrl}
                            alt={user.displayName || user.username}
                            size="large"
                        />
                        <div className="user-card-info">
                            <div className="user-card-header">
                                <div className="user-card-names">
                                    <h3 className="user-card-name">{user.displayName || user.username}</h3>
                                    <span className="user-card-username">@{user.username}</span>
                                </div>
                            </div>
                            {user.bio && <p className="user-card-bio">{user.bio}</p>}
                            {activeTab === 'suggestions' && user.suggestionReason && (
                                <div className="user-card-reason">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                    </svg>
                                    <span>{user.suggestionReason}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {!isOwnProfile && (
                        <div className="user-card-action">
                            <Button
                                variant={isFollowingUser ? 'secondary' : 'primary'}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollowToggle(user.userId);
                                }}
                                className={`follow-btn ${isFollowingUser ? 'following' : ''}`}
                            >
                                {isFollowingUser ? (
                                    <>
                                        <span className="following-text">{t('connections.buttons.following')}</span>
                                        <span className="unfollow-text">{t('connections.buttons.unfollow')}</span>
                                    </>
                                ) : (
                                    t('connections.buttons.follow')
                                )}
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        );
    };

    const getCurrentList = () => {
        switch (activeTab) {
            case 'followers':
                return followers;
            case 'following':
                return following;
            case 'suggestions':
                return suggestions;
            default:
                return [];
        }
    };

    const currentList = getCurrentList();

    return (
        <div className="connections-container">
            <div className="connections-header">
                <h1 className="connections-title">{t('connections.title')}</h1>
                <p className="connections-subtitle">{t('connections.subtitle')}</p>
            </div>

            <div className="connections-tabs">
                <button
                    className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                    onClick={() => handleTabChange('followers')}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    <span>{t('connections.tabs.followers')}</span>
                    {currentProfile && (
                        <span className="tab-count">{currentProfile.followersCount || 0}</span>
                    )}
                </button>

                <button
                    className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => handleTabChange('following')}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span>{t('connections.tabs.following')}</span>
                    {currentProfile && (
                        <span className="tab-count">{currentProfile.followingCount || 0}</span>
                    )}
                </button>

                <button
                    className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
                    onClick={() => handleTabChange('suggestions')}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <span>{t('connections.tabs.suggestions')}</span>
                </button>
            </div>

            <div className="connections-content">
                {loading && page === 0 ? (
                    <div className="connections-loading">
                        <div className="loading-spinner"></div>
                        <p>{t('connections.loading')}</p>
                    </div>
                ) : currentList.length === 0 ? (
                    <div className="connections-empty">
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" opacity="0.3">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        <h3>{t(`connections.empty.${activeTab}.title`)}</h3>
                        <p>{t(`connections.empty.${activeTab}.message`)}</p>
                    </div>
                ) : (
                    <>
                        <div className="users-list">
                            {currentList.map(renderUserCard)}
                        </div>
                        {hasMore && activeTab !== 'suggestions' && (
                            <div className="connections-load-more">
                                <Button
                                    variant="secondary"
                                    onClick={loadMore}
                                    disabled={loading}
                                >
                                    {loading ? t('connections.loading') : t('connections.buttons.loadMore')}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Connections;
