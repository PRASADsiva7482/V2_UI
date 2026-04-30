import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUserProfile, getUserProfileByUsername, updateMyProfile, uploadProfilePicture, deleteProfilePicture, pinPost, unpinPost } from '../services/api/profile';
import { getUserPosts } from '../services/api/posts';
import { followUser, unfollowUser, getFollowStatus } from '../services/api/follows';
import { getUserGamificationStats } from '../services/api/gamification';
import { formatNumber } from '../services/utils/formatters';
import { useToast } from '../components/common/Toast';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import VerificationBadge from '../components/common/VerificationBadge';
import PostCard from '../components/posts/PostCard';
import './Profile.css';

function Profile() {
    const { userId, username: usernameParam } = useParams();
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

    // Profile picture state
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [removePic, setRemovePic] = useState(false);
    const fileInputRef = useRef(null);
    const [showAvatarViewer, setShowAvatarViewer] = useState(false);

    // Gamification & Pinned Post state
    const [gamificationStats, setGamificationStats] = useState(null);
    const [pinnedPost, setPinnedPost] = useState(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        displayName: '',
        username: '',
        bio: '',
        phoneNumber: '',
        nickname: '',
        website: '',
        verificationTier: 'NONE'
    });

    // If navigated via username route (/profile/u/:username), resolve to userId first
    useEffect(() => {
        if (usernameParam && !userId) {
            (async () => {
                try {
                    setLoading(true);
                    const profileData = await getUserProfileByUsername(usernameParam);
                    if (profileData && profileData.userId) {
                        // Redirect to the userId-based route
                        navigate(`/profile/${profileData.userId}`, { replace: true });
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error resolving username:', error);
                    setLoading(false);
                }
            })();
        }
    }, [usernameParam, userId, navigate]);

    // U-4: Reset page state when userId changes
    useEffect(() => {
        if (!userId) return; // Don't load if we only have username (will redirect)
        setPage(0);
        setPosts([]);
        setHasMore(true);
        loadProfile();
        loadFollowStatus();
        loadGamificationStats();
    }, [userId]);

    // U-3: Separate effect to load posts whenever page OR userId changes
    // This fixes the stale closure where loadPosts() was called after setPage()
    // but used the OLD page value.
    useEffect(() => {
        if (!userId) return; // Don't load if we only have username (will redirect)
        loadPosts(page);
    }, [userId, page]);

    useEffect(() => {
        if (isEditMode && profile?.isOwnProfile) {
            setEditing(true);
            setEditForm({
                displayName: profile.displayName || '',
                username: profile.username || '',
                bio: profile.bio || '',
                phoneNumber: profile.phoneNumber || '',
                nickname: profile.nickname || '',
                website: profile.website || '',
                verificationTier: profile.verificationTier || 'NONE'
            });
            // Reset pic state when entering edit mode
            setProfilePicFile(null);
            setProfilePicPreview(null);
            setRemovePic(false);
        } else {
            setEditing(false);
        }
    }, [isEditMode, profile]);

    // Cleanup preview URL on unmount or change
    useEffect(() => {
        return () => {
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
            }
        };
    }, [profilePicPreview]);

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

    const loadGamificationStats = async () => {
        try {
            const data = await getUserGamificationStats(userId);
            setGamificationStats(data);
        } catch (error) {
            console.error('Error loading gamification stats:', error);
        }
    };

    // Find and set the pinned post whenever posts or profile changes
    useEffect(() => {
        if (profile?.pinnedPostId && posts.length > 0) {
            const found = posts.find(p => p.id === profile.pinnedPostId);
            setPinnedPost(found || null);
        } else {
            setPinnedPost(null);
        }
    }, [profile?.pinnedPostId, posts]);

    const handlePinPost = async (postId) => {
        try {
            await pinPost(postId);
            setProfile(prev => ({ ...prev, pinnedPostId: postId }));
            showToast('Post pinned to your profile!', 'success');
        } catch (err) {
            console.error('Failed to pin post:', err);
            showToast('Failed to pin post', 'error');
        }
    };

    const handleUnpinPost = async () => {
        try {
            await unpinPost();
            setProfile(prev => ({ ...prev, pinnedPostId: null }));
            setPinnedPost(null);
            showToast('Post unpinned', 'success');
        } catch (err) {
            console.error('Failed to unpin post:', err);
            showToast('Failed to unpin post', 'error');
        }
    };

    const handleFollow = async () => {
        if (following) return;

        try {
            setFollowing(true);
            if (followStatus?.isFollowing || followStatus?.isFollowRequestPending) {
                // Unfollow or cancel pending request
                await unfollowUser(userId);
                if (followStatus?.isFollowing) {
                    setFollowStatus(prev => ({ ...prev, isFollowing: false, isFollowRequestPending: false }));
                    setProfile(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
                } else {
                    setFollowStatus(prev => ({ ...prev, isFollowRequestPending: false }));
                }
            } else {
                const result = await followUser(userId);
                if (result?.status === 'PENDING') {
                    // Follow request sent (private account)
                    setFollowStatus(prev => ({ ...prev, isFollowRequestPending: true }));
                    showToast('Follow request sent', 'success');
                } else {
                    // Instant follow (public account)
                    setFollowStatus(prev => ({ ...prev, isFollowing: true }));
                    setProfile(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            const errMsg = error?.response?.data?.message || 'Failed to update follow status';
            showToast(errMsg, 'error');
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

    // Profile picture handlers
    const handleProfilePicClick = () => {
        if (editing) {
            if (fileInputRef.current) fileInputRef.current.click();
        } else {
            setShowAvatarViewer(true);
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Please select a valid image file (JPG, PNG, GIF, or WEBP)', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be under 5MB', 'error');
            return;
        }

        // Set preview
        if (profilePicPreview) {
            URL.revokeObjectURL(profilePicPreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setProfilePicFile(file);
        setProfilePicPreview(previewUrl);
        setRemovePic(false);
    };

    const handleRemoveProfilePic = () => {
        setRemovePic(true);
        setProfilePicFile(null);
        if (profilePicPreview) {
            URL.revokeObjectURL(profilePicPreview);
            setProfilePicPreview(null);
        }
    };

    const getDisplayedAvatar = () => {
        if (removePic) return null;
        if (profilePicPreview) return profilePicPreview;
        return profile?.profilePictureUrl;
    };

    const handleSaveProfile = async () => {
        if (saving) return;

        try {
            setSaving(true);

            // Upload new profile picture if selected
            if (profilePicFile) {
                try {
                    const updatedProfileFromPic = await uploadProfilePicture(profilePicFile);
                    setProfile(prev => ({ ...prev, profilePictureUrl: updatedProfileFromPic.profilePictureUrl }));
                } catch (error) {
                    console.error('Error uploading profile picture:', error);
                    showToast('Failed to upload profile picture', 'error');
                    setSaving(false);
                    return;
                }
            } else if (removePic && profile?.profilePictureUrl) {
                // Delete profile picture
                try {
                    await deleteProfilePicture();
                    setProfile(prev => ({ ...prev, profilePictureUrl: null }));
                } catch (error) {
                    console.error('Error deleting profile picture:', error);
                    showToast('Failed to remove profile picture', 'error');
                    setSaving(false);
                    return;
                }
            }

            // Update text fields
            const updatedProfile = await updateMyProfile(editForm);
            setProfile(updatedProfile);
            setEditing(false);
            searchParams.delete('edit');
            setSearchParams(searchParams);

            // Reset pic state
            setProfilePicFile(null);
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
                setProfilePicPreview(null);
            }
            setRemovePic(false);

            // Notify other components (TopBar) to refresh profile data
            window.dispatchEvent(new CustomEvent('profileUpdated'));

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
            bio: profile?.bio || '',
            phoneNumber: profile?.phoneNumber || '',
            nickname: profile?.nickname || '',
            website: profile?.website || '',
            verificationTier: profile?.verificationTier || 'NONE'
        });
        // Reset pic state
        setProfilePicFile(null);
        if (profilePicPreview) {
            URL.revokeObjectURL(profilePicPreview);
            setProfilePicPreview(null);
        }
        setRemovePic(false);
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
                    <div className={`profile-avatar-wrapper ${editing ? 'profile-avatar-editable' : ''}`} onClick={!editing ? handleProfilePicClick : undefined}>
                        <Avatar
                            src={getDisplayedAvatar()}
                            alt={profile.displayName}
                            size="xlarge"
                            onClick={editing ? handleProfilePicClick : undefined}
                        />
                        {editing && (
                            <>
                                <div className="profile-avatar-overlay" onClick={handleProfilePicClick}>
                                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        <circle cx="18" cy="18" r="6" fill="var(--primary-color)" />
                                        <path d="M18 15.5v5M15.5 18h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <span className="profile-avatar-overlay-text">
                                        {t('profile.profilePicture', 'Change Photo')}
                                    </span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleProfilePicChange}
                                    className="profile-pic-input"
                                    id="profile-pic-upload"
                                />
                                {(profilePicPreview || (!removePic && profile?.profilePictureUrl)) && (
                                    <button
                                        className="profile-pic-remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveProfilePic();
                                        }}
                                        title="Remove profile picture"
                                        type="button"
                                    >
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
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
                                    {saving
                                        ? profilePicFile
                                            ? 'Uploading pic...'
                                            : 'Saving...'
                                        : t('profile.saveProfile')}
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
                                variant={followStatus.isFollowing ? 'secondary' : followStatus.isFollowRequestPending ? 'secondary' : 'primary'}
                                className={followStatus.isFollowRequestPending ? 'follow-requested-btn' : ''}
                            >
                                {followStatus.isFollowing
                                    ? 'Following'
                                    : followStatus.isFollowRequestPending
                                        ? 'Requested'
                                        : profile.isPrivate
                                            ? 'Request'
                                            : 'Follow'}
                            </Button>
                        )}
                    </div>

                    <div className="profile-details">
                        {editing ? (
                            <div className="edit-form edit-form-compact">
                                <div className="edit-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="displayName">{t('profile.displayName')}</label>
                                        <input type="text" id="displayName" name="displayName" value={editForm.displayName} onChange={handleInputChange} className="form-input" placeholder="Display name" maxLength={50} />
                                        <span className="form-char-count">{editForm.displayName.length}/50</span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="username">{t('profile.username')}</label>
                                        <div className="form-input-prefix-wrap">
                                            <span className="form-input-prefix">@</span>
                                            <input type="text" id="username" name="username" value={editForm.username} onChange={handleInputChange} className="form-input form-input-with-prefix" placeholder="username" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="nickname">Nickname</label>
                                        <input type="text" id="nickname" name="nickname" value={editForm.nickname} onChange={handleInputChange} className="form-input" placeholder="Optional nickname" maxLength={30} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="verificationTier">Verification Badge</label>
                                        <select id="verificationTier" name="verificationTier" value={editForm.verificationTier} onChange={handleInputChange} className="form-input">
                                            <option value="NONE">None</option>
                                            <option value="BLUE">Blue (Verified)</option>
                                            <option value="GOLD">Gold (Business)</option>
                                            <option value="GREY">Grey (Official)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">Phone</label>
                                        <input type="tel" id="phoneNumber" name="phoneNumber" value={editForm.phoneNumber} onChange={handleInputChange} className="form-input" placeholder="+1 (555) 123-4567" />
                                    </div>
                                    <div className="form-group form-group-full">
                                        <label htmlFor="website">Website</label>
                                        <input type="url" id="website" name="website" value={editForm.website} onChange={handleInputChange} className="form-input" placeholder="https://yoursite.com" />
                                    </div>
                                    <div className="form-group form-group-full">
                                        <label htmlFor="bio">{t('profile.bio')}</label>
                                        <textarea id="bio" name="bio" value={editForm.bio} onChange={handleInputChange} className="form-textarea" placeholder="Tell us about yourself..." rows="3" maxLength={160} />
                                        <span className="form-char-count">{editForm.bio.length}/160</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="profile-name">
                                    {profile.displayName}
                                    <VerificationBadge tier={profile.verificationTier} size={22} />
                                    {profile.isPrivate && (
                                        <span className="profile-private-badge" title="Private Account">
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                                            </svg>
                                        </span>
                                    )}
                                </h1>
                                <p className="profile-username">@{profile.username}</p>

                                {profile.bio && (
                                    <p className="profile-bio">{profile.bio}</p>
                                )}

                                {/* Follow Requests Badge (own private profile) */}
                                {profile.isOwnProfile && profile.isPrivate && profile.pendingFollowRequestsCount > 0 && (
                                    <button
                                        className="profile-follow-requests-badge"
                                        onClick={() => navigate('/notifications?tab=requests')}
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        {profile.pendingFollowRequestsCount} follow request{profile.pendingFollowRequestsCount > 1 ? 's' : ''}
                                    </button>
                                )}

                                {!profile.isProfileRestricted && (
                                    <div className="profile-meta-info">
                                        {profile.phoneNumber && (
                                            <span className="profile-meta-item">
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                                {profile.phoneNumber}
                                            </span>
                                        )}
                                        {profile.website && (
                                            <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="profile-meta-item profile-meta-link">
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
                                                {profile.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        )}
                                        {profile.createdAt && (
                                            <span className="profile-meta-item">
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" /></svg>
                                                Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
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
                {/* Private profile restriction message */}
                {profile.isProfileRestricted && (
                    <div className="profile-restricted-banner">
                        <div className="restricted-icon">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        </div>
                        <h3>This Account is Private</h3>
                        <p>Follow this account to see their photos and videos.</p>
                    </div>
                )}

                {/* Show content only if not restricted */}
                {!profile.isProfileRestricted && (
                    <>
                        {/* Gamification Widget */}
                        {gamificationStats && (
                            <div className="profile-gamification-widget">
                                <div className="gamification-streak">
                                    <span className="streak-fire">{gamificationStats.currentStreak > 0 ? '🔥' : '💤'}</span>
                                    <span className="streak-count">{gamificationStats.currentStreak}-day streak</span>
                                </div>
                                <div className="gamification-stats-row">
                                    <div className="gamification-stat">
                                        <span className="gamification-value">Lv.{gamificationStats.level}</span>
                                        <span className="gamification-label">Level</span>
                                    </div>
                                    <div className="gamification-stat">
                                        <span className="gamification-value">{formatNumber(gamificationStats.xpPoints)}</span>
                                        <span className="gamification-label">XP</span>
                                    </div>
                                    <div className="gamification-stat">
                                        <span className="gamification-value">{gamificationStats.longestStreak}</span>
                                        <span className="gamification-label">Best Streak</span>
                                    </div>
                                    <div className="gamification-stat">
                                        <span className="gamification-value">{gamificationStats.totalActiveDays}</span>
                                        <span className="gamification-label">Active Days</span>
                                    </div>
                                </div>
                                {gamificationStats.badges && gamificationStats.badges.filter(b => b.earned).length > 0 && (
                                    <div className="gamification-badges">
                                        {gamificationStats.badges.filter(b => b.earned).map((badge, i) => (
                                            <span key={i} className="gamification-badge" title={`${badge.name}: ${badge.description}`}>
                                                {badge.icon}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {gamificationStats.levelProgress !== undefined && (
                                    <div className="gamification-progress">
                                        <div className="gamification-progress-bar">
                                            <div className="gamification-progress-fill" style={{ width: `${gamificationStats.levelProgress}%` }} />
                                        </div>
                                        <span className="gamification-progress-label">{gamificationStats.levelProgress}% to next level</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="profile-tabs">
                            <button className="tab active">Posts</button>
                        </div>

                        <div className="profile-posts">
                            {/* Pinned Post */}
                            {pinnedPost && (
                                <div className="pinned-post-section">
                                    <div className="pinned-post-label">
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
                                        Pinned
                                        {profile.isOwnProfile && (
                                            <button className="unpin-btn" onClick={handleUnpinPost}>Unpin</button>
                                        )}
                                    </div>
                                    <PostCard
                                        post={pinnedPost}
                                        onPostUpdate={handlePostUpdate}
                                        onPostDeleted={handlePostDeleted}
                                    />
                                </div>
                            )}

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
                                            showPinAction={profile.isOwnProfile}
                                            isPinned={post.id === profile?.pinnedPostId}
                                            onPinPost={() => handlePinPost(post.id)}
                                            onUnpinPost={handleUnpinPost}
                                        />
                                    ))}
                                    {hasMore && (
                                        <button
                                            className="load-more-btn"
                                            onClick={() => {
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
                    </>
                )}
            </div>

            {/* Avatar Viewer Lightbox */}
            {showAvatarViewer && (
                <div className="avatar-viewer-overlay" onClick={() => setShowAvatarViewer(false)}>
                    <button className="avatar-viewer-close" onClick={() => setShowAvatarViewer(false)} title="Close">
                        ×
                    </button>



                    <div className="avatar-viewer-content" onClick={(e) => e.stopPropagation()}>
                        <Avatar
                            src={getDisplayedAvatar()}
                            alt={profile.displayName}
                            className="avatar-viewer-image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
