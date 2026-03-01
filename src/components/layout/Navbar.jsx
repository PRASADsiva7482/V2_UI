import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { getMyProfile } from '../../services/api/profile';
import { getUnseenCount } from '../../services/api/notifications';
import Avatar from '../common/Avatar';
import NavbarSettings from './NavbarSettings';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user, keycloak } = useAuth();
    const { t } = useTranslation();
    const [currentProfile, setCurrentProfile] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifBadge, setNotifBadge] = useState(0);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        loadCurrentProfile();
        loadNotifBadge();
        // Poll unseen count every 30 seconds
        const interval = setInterval(loadNotifBadge, 30000);
        return () => clearInterval(interval);
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

    const loadNotifBadge = async () => {
        try {
            const data = await getUnseenCount();
            setNotifBadge(data?.unseenCount || 0);
        } catch (error) {
            // Silently fail - badge is non-critical
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

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-header">
                    <div className="navbar-logo" onClick={() => navigate('/')}>
                        <svg viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                {/* Gradient for Narayana (Vertical V) - Golden/Saffron to Blue */}
                                <linearGradient id="narayanaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                                    <stop offset="30%" style={{ stopColor: '#FF9933', stopOpacity: 1 }} />
                                    <stop offset="70%" style={{ stopColor: '#1DA1F2', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#0A4D8C', stopOpacity: 1 }} />
                                </linearGradient>
                                {/* Gradient for Shiva (Horizontal lines) - White to Ash */}
                                <linearGradient id="shivaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.9 }} />
                                    <stop offset="50%" style={{ stopColor: '#E0E0E0', stopOpacity: 0.8 }} />
                                    <stop offset="100%" style={{ stopColor: '#CCCCCC', stopOpacity: 0.7 }} />
                                </linearGradient>
                                {/* Sacred glow effect */}
                                <filter id="sacredGlow">
                                    <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Main V shape - Narayana's Urdhva Pundra (Vertical mark) */}
                            <g filter="url(#sacredGlow)">
                                {/* Outer V */}
                                <path
                                    d="M10 8 L24 40 L38 8"
                                    stroke="url(#narayanaGradient)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                                {/* Inner highlight */}
                                <path
                                    d="M13 11 L24 36 L35 11"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            </g>

                            {/* Shiva's Tripundra (Three horizontal lines) */}
                            <g opacity="0.85">
                                {/* Top line */}
                                <line
                                    x1="14" y1="14" x2="34" y2="14"
                                    stroke="url(#shivaGradient)"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                                {/* Middle line */}
                                <line
                                    x1="16" y1="20" x2="32" y2="20"
                                    stroke="url(#shivaGradient)"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                                {/* Bottom line */}
                                <line
                                    x1="18" y1="26" x2="30" y2="26"
                                    stroke="url(#shivaGradient)"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                            </g>

                            {/* Sacred bindu (dot) at apex - representing the divine point */}
                            <circle
                                cx="24" cy="5" r="2.5"
                                fill="#FFD700"
                                opacity="0.9"
                                filter="url(#sacredGlow)"
                            />

                            {/* Small decorative dots (representing sacred ash) */}
                            <circle cx="20" cy="30" r="0.8" fill="rgba(255,255,255,0.5)" />
                            <circle cx="28" cy="30" r="0.8" fill="rgba(255,255,255,0.5)" />
                        </svg>
                    </div>
                    <NavbarSettings />
                </div>

                <div className="navbar-menu">
                    <button
                        className={`nav-btn ${isActive('/') || isActive('/home') ? 'active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M12 9c-2.49 0-4.5 2.01-4.5 4.5S9.51 18 12 18s4.5-2.01 4.5-4.5S14.49 9 12 9zm0 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 11 12 11s2.5 1.12 2.5 2.5S13.38 16 12 16z" />
                            <path d="M12 5c-4.27 0-8.1 2.48-10 6 1.9 3.52 5.73 6 10 6s8.1-2.48 10-6c-1.9-3.52-5.73-6-10-6zm0 10c-2.21 0-4-4 1.79-4 4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                        </svg>
                        <span>{t('navbar.home')}</span>
                    </button>

                    <button
                        className={`nav-btn ${isActive('/explore') ? 'active' : ''}`}
                        onClick={() => navigate('/explore')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
                        </svg>
                        <span>{t('navbar.explore', 'Explore')}</span>
                    </button>

                    <button
                        className={`nav-btn ${isActive('/notifications') ? 'active' : ''}`}
                        onClick={() => {
                            navigate('/notifications');
                            setNotifBadge(0);
                        }}
                    >
                        <div style={{ position: 'relative', display: 'inline-flex' }}>
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                                <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2zM4.372 16l.928-7.276C5.678 5.707 8.523 4 12 4s6.321 1.707 6.7 4.724L19.628 16H4.372z" />
                            </svg>
                            {notifBadge > 0 && (
                                <span className="notif-badge">{notifBadge > 99 ? '99+' : notifBadge}</span>
                            )}
                        </div>
                        <span>{t('navbar.notifications', 'Notifications')}</span>
                    </button>

                    <button
                        className={`nav-btn ${location.pathname.startsWith('/connections') ? 'active' : ''}`}
                        onClick={() => navigate('/connections?tab=followers')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        <span>{t('navbar.connect')}</span>
                    </button>

                    <button
                        className={`nav-btn ${isActive('/chat') ? 'active' : ''}`}
                        onClick={() => navigate('/chat')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                        </svg>
                        <span>{t('navbar.messages', 'Messages')}</span>
                    </button>

                    <button
                        className={`nav-btn ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                        onClick={handleProfileClick}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>{t('navbar.profile')}</span>
                    </button>

                </div>

                <div className="profile-section" ref={profileMenuRef}>
                    <button
                        className="profile-btn"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <Avatar
                            src={currentProfile?.profilePictureUrl}
                            alt={currentProfile?.displayName || user?.username || 'User'}
                            size="small"
                        />
                        <div className="profile-info">
                            <div className="profile-name">{currentProfile?.displayName || user?.username || 'User'}</div>
                            <div className="profile-username">@{currentProfile?.username || user?.username || 'username'}</div>
                        </div>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="dropdown-icon">
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>

                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-header" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                                <Avatar
                                    src={currentProfile?.profilePictureUrl}
                                    alt={currentProfile?.displayName || 'User'}
                                    size="medium"
                                />
                                <div className="dropdown-user-info">
                                    <div className="dropdown-name">{currentProfile?.displayName || user?.username || 'User'}</div>
                                    <div className="dropdown-username">@{currentProfile?.username || user?.username || 'username'}</div>
                                </div>
                                <button className="dropdown-edit-btn" onClick={(e) => { e.stopPropagation(); handleEditProfile(); }} title="Edit Profile">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="profile-dropdown-actions">
                                <button className="dropdown-action-btn logout-btn" onClick={handleLogout}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                    </svg>
                                    Log out @{currentProfile?.username || user?.username || 'username'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
