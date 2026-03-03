import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUserProfile, updateMyProfile } from '../services/api/profile';
import { getUserPosts } from '../services/api/posts';
import { followUser, unfollowUser, getFollowStatus } from '../services/api/follows';
import { formatNumber } from '../services/utils/formatters';
import { useToast } from '../components/common/Toast';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import PostCard from '../components/posts/PostCard';
import './Profile.css';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [followStatus, setFollowStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [following, setFollowing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        displayName: '',
        username: '',
        bio: ''
    });

    // U-4: Reset page state when userId changes
    useEffect(() => {
        setPage(0);
        setPosts([]);
        setHasMore(true);
        loadProfile();
        loadFollowStatus();
    }, [userId]);

    // U-3: Separate effect to load posts whenever page OR userId changes
    // This fixes the stale closure where loadPosts() was called after setPage()
    // but used the OLD page value.
    useEffect(() => {
        loadPosts(page);
    }, [userId, page]);

    useEffect(() => {
        if (isEditMode && profile?.isOwnProfile) {
            setEditing(true);
            setEditForm({
                displayName: profile.displayName || '',
                username: profile.username || '',
                bio: profile.bio || ''
            });
        } else {
            setEditing(false);
        }
    }, [isEditMode, profile]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile(userId);
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFollowStatus = async () => {
        try {
            const status = await getFollowStatus(userId);
            setFollowStatus(status);
        } catch (error) {
            console.error('Error loading follow status:', error);
        }
    };

    // U-3: Now accepts page as parameter to avoid stale closure
    const loadPosts = async (currentPage) => {
        try {
            setLoadingPosts(true);
            const response = await getUserPosts(userId, { page: currentPage, size: 20 });
            setPosts(prev => currentPage === 0 ? response.content : [...prev, ...response.content]);
            setHasMore(!response.last);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleFollow = async () => {
        if (following) return;

        try {
            setFollowing(true);
            if (followStatus?.isFollowing) {
                await unfollowUser(userId);
                setFollowStatus(prev => ({ ...prev, isFollowing: false }));
                setProfile(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
            } else {
                await followUser(userId);
                setFollowStatus(prev => ({ ...prev, isFollowing: true }));
                setProfile(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            // U-9: Use toast instead of alert()
            showToast('Failed to update follow status', 'error');
        } finally {
            setFollowing(false);
        }
    };

    const handlePostUpdate = useCallback((postId, updates) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === postId ? { ...post, ...updates } : post
            )
        );
    }, []);

    const handlePostDeleted = useCallback((postId) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    }, []);

    const handleSaveProfile = async () => {
        if (saving) return;

        try {
            setSaving(true);
            const updatedProfile = await updateMyProfile(editForm);
            setProfile(updatedProfile);
            setEditing(false);
            searchParams.delete('edit');
            setSearchParams(searchParams);
            // U-9: Use toast instead of alert()
            showToast(t('profile.updateSuccess'), 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(t('profile.updateError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        searchParams.delete('edit');
        setSearchParams(searchParams);
        setEditForm({
            displayName: profile?.displayName || '',
            username: profile?.username || '',
            bio: profile?.bio || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-error">
                <h2>Profile not found</h2>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-cover">
                    {profile.coverPictureUrl && (
                        <img src={profile.coverPictureUrl} alt="Cover" />
                    )}
                </div>

                <div className="profile-info-section">
                    <div className="profile-avatar-wrapper">
                        <Avatar
                            src={profile.profilePictureUrl}
                            alt={profile.displayName}
                            size="xlarge"
                        />
                    </div>

                    <div className="profile-actions">
                        {profile.isOwnProfile && !editing && (
                            <Button
                                onClick={() => {
                                    setEditing(true);
                                    setSearchParams({ edit: 'true' });
                                }}
                                variant="secondary"
                            >
                                {t('profile.editProfile')}
                            </Button>
                        )}
                        {editing && (
                            <div className="edit-actions">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    variant="primary"
                                >
                                    {saving ? 'Saving...' : t('profile.saveProfile')}
                                </Button>
                                <Button
                                    onClick={handleCancelEdit}
                                    variant="secondary"
                                >
                                    {t('profile.cancelEdit')}
                                </Button>
                            </div>
                        )}
                        {!profile.isOwnProfile && followStatus && (
                            <Button
                                onClick={handleFollow}
                                disabled={following}
                                variant={followStatus.isFollowing ? 'secondary' : 'primary'}
                            >
                                {followStatus.isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        )}
                    </div>

                    <div className="profile-details">
                        {editing ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label htmlFor="displayName">{t('profile.displayName')}</label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        value={editForm.displayName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Your display name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">{t('profile.username')}</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={editForm.username}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="@username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bio">{t('profile.bio')}</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={editForm.bio}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        placeholder="Tell us about yourself..."
                                        rows="4"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="profile-name">{profile.displayName}</h1>
                                <p className="profile-username">@{profile.username}</p>

                                {profile.bio && (
                                    <p className="profile-bio">{profile.bio}</p>
                                )}
                            </>
                        )}

                        <div className="profile-stats">
                            <button className="stat-item">
                                <span className="stat-value">{formatNumber(profile.postsCount)}</span>
                                <span className="stat-label">Posts</span>
                            </button>
                            <button className="stat-item">
                                <span className="stat-value">{formatNumber(profile.followersCount)}</span>
                                <span className="stat-label">Followers</span>
                            </button>
                            <button className="stat-item">
                                <span className="stat-value">{formatNumber(profile.followingCount)}</span>
                                <span className="stat-label">Following</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    <button className="tab active">Posts</button>
                </div>

                <div className="profile-posts">
                    {loadingPosts && page === 0 ? (
                        <div className="loading-posts">Loading posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="no-posts">
                            <p>No posts yet</p>
                        </div>
                    ) : (
                        <>
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onPostUpdate={handlePostUpdate}
                                    onPostDeleted={handlePostDeleted}
                                />
                            ))}
                            {hasMore && (
                                <button
                                    className="load-more-btn"
                                    onClick={() => {
                                        // U-3: Just increment page — the useEffect[page] handles loading
                                        setPage(prev => prev + 1);
                                    }}
                                    disabled={loadingPosts}
                                >
                                    {loadingPosts ? 'Loading...' : 'Load more'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
