import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { getMyProfile } from '../../services/api/profile';
import { searchPosts } from '../../services/api/posts';
import Avatar from '../common/Avatar';
import NavbarSettings from './NavbarSettings';
import SearchBox from '../search/SearchBox';
import CreatePostModal from '../posts/CreatePostModal';
import './TopBar.css';

function TopBar() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [currentProfile, setCurrentProfile] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        loadCurrentProfile();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadCurrentProfile = async () => {
        try {
            const profile = await getMyProfile();
            setCurrentProfile(profile);
        } catch (error) {
            console.error('Error loading current profile:', error);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleProfileClick = () => {
        if (currentProfile) {
            navigate(`/profile/${currentProfile.userId}`);
            setShowProfileMenu(false);
        }
    };

    const handleEditProfile = () => {
        if (currentProfile) {
            navigate(`/profile/${currentProfile.userId}?edit=true`);
            setShowProfileMenu(false);
        }
    };

    const handleSearch = async (query, filter) => {
        if (!query.trim()) return;
        console.log('🔍 Search initiated:', { query, filter });
        try {
            if (filter === 'users') {
                const { searchUsers } = await import('../../services/api/profile');
                const results = await searchUsers(query, { page: 0, size: 20 });
                console.log('👥 User search results:', results);
            } else if (filter === 'posts') {
                const results = await searchPosts(query, { page: 0, size: 20 });
                console.log('📝 Post search results:', results);
            } else if (filter === 'all') {
                const { searchUsers } = await import('../../services/api/profile');
                const [userResults, postResults] = await Promise.all([
                    searchUsers(query, { page: 0, size: 10 }),
                    searchPosts(query, { page: 0, size: 10 })
                ]);
                console.log('🔍 Combined search results:', { userResults, postResults });
            }
        } catch (error) {
            console.error('❌ Search error:', error);
        }
    };

    const handlePostCreated = (newPost) => {
        setShowCreatePost(false);
        // Dispatch event so Home page can pick it up
        window.dispatchEvent(new CustomEvent('newPostCreated', { detail: newPost }));
    };

    return (
        <>
            <header className="topbar" id="topbar">
                <div className="topbar-content">
                    {/* Left: Logo */}
                    <div className="topbar-left">
                        <div className="topbar-logo" onClick={() => navigate('/')}>
                            <svg viewBox="0 0 48 48" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="topNarayanaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                                        <stop offset="30%" style={{ stopColor: '#FF9933', stopOpacity: 1 }} />
                                        <stop offset="70%" style={{ stopColor: '#1DA1F2', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#0A4D8C', stopOpacity: 1 }} />
                                    </linearGradient>
                                    <linearGradient id="topShivaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.9 }} />
                                        <stop offset="50%" style={{ stopColor: '#E0E0E0', stopOpacity: 0.8 }} />
                                        <stop offset="100%" style={{ stopColor: '#CCCCCC', stopOpacity: 0.7 }} />
                                    </linearGradient>
                                    <filter id="topGlow">
                                        <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <g filter="url(#topGlow)">
                                    <path d="M10 8 L24 40 L38 8" stroke="url(#topNarayanaGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    <path d="M13 11 L24 36 L35 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </g>
                                <g opacity="0.85">
                                    <line x1="14" y1="14" x2="34" y2="14" stroke="url(#topShivaGrad)" strokeWidth="2.2" strokeLinecap="round" />
                                    <line x1="16" y1="20" x2="32" y2="20" stroke="url(#topShivaGrad)" strokeWidth="2.2" strokeLinecap="round" />
                                    <line x1="18" y1="26" x2="30" y2="26" stroke="url(#topShivaGrad)" strokeWidth="2.2" strokeLinecap="round" />
                                </g>
                                <circle cx="24" cy="5" r="2.5" fill="#FFD700" opacity="0.9" filter="url(#topGlow)" />
                                <circle cx="20" cy="30" r="0.8" fill="rgba(255,255,255,0.5)" />
                                <circle cx="28" cy="30" r="0.8" fill="rgba(255,255,255,0.5)" />
                            </svg>
                        </div>
                    </div>

                    {/* Center spacer */}
                    <div className="topbar-spacer"></div>

                    {/* Right: New Post, Search, Settings, Options, Profile */}
                    <div className="topbar-right">
                        {/* New Post Button */}
                        <button
                            className="topbar-new-post-btn"
                            onClick={() => setShowCreatePost(true)}
                            title="Create new post"
                            id="topbar-new-post-btn"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                            <span className="topbar-new-post-label">New Post</span>
                        </button>

                        {/* Search */}
                        <div className="topbar-search-wrapper">
                            <SearchBox onSearch={handleSearch} />
                        </div>

                        {/* Mobile search toggle */}
                        <button
                            className="topbar-mobile-search"
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                            title="Search"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
                            </svg>
                        </button>

                        {/* Settings gear */}
                        <button
                            className="topbar-icon-btn"
                            onClick={() => navigate('/settings')}
                            title="Settings"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                        </button>

                        {/* Options (Theme/Language) */}
                        <NavbarSettings />

                        {/* Profile */}
                        <div className="topbar-profile" ref={profileMenuRef}>
                            <button
                                className="topbar-profile-btn"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <Avatar
                                    src={currentProfile?.profilePictureUrl}
                                    alt={currentProfile?.displayName || user?.username || 'User'}
                                    size="small"
                                />
                            </button>

                            {showProfileMenu && (
                                <div className="topbar-profile-dropdown">
                                    <div className="topbar-dropdown-header" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                                        <Avatar
                                            src={currentProfile?.profilePictureUrl}
                                            alt={currentProfile?.displayName || 'User'}
                                            size="medium"
                                        />
                                        <div className="topbar-dropdown-info">
                                            <div className="topbar-dropdown-name">{currentProfile?.displayName || user?.username || 'User'}</div>
                                            <div className="topbar-dropdown-username">@{currentProfile?.username || user?.username || 'username'}</div>
                                        </div>
                                        <button className="topbar-dropdown-edit" onClick={(e) => { e.stopPropagation(); handleEditProfile(); }} title="Edit Profile">
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="topbar-dropdown-actions">
                                        <button className="topbar-dropdown-action logout" onClick={handleLogout}>
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                            </svg>
                                            Log out @{currentProfile?.username || user?.username || 'username'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Dropdown */}
                {showMobileSearch && (
                    <div className="topbar-mobile-search-panel">
                        <SearchBox onSearch={(q, f) => { handleSearch(q, f); setShowMobileSearch(false); }} />
                    </div>
                )}
            </header>

            {/* Create Post Modal */}
            {showCreatePost && (
                <CreatePostModal
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={handlePostCreated}
                />
            )}
        </>
    );
}

export default TopBar;
