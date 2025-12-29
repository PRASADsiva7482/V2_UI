import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { getMyProfile } from '../../services/api/profile';
import Avatar from '../common/Avatar';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user, keycloak } = useAuth();
    const { t } = useTranslation();
    const [currentProfile, setCurrentProfile] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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
                        className={`nav-btn ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                        onClick={handleProfileClick}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>{t('navbar.profile')}</span>
                    </button>

                    <button className="nav-btn" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                        </svg>
                        <span>{t('navbar.logout')}</span>
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
                            <div className="profile-dropdown-header">
                                <Avatar
                                    src={currentProfile?.profilePictureUrl}
                                    alt={currentProfile?.displayName || 'User'}
                                    size="medium"
                                />
                                <div className="dropdown-user-info">
                                    <div className="dropdown-name">{currentProfile?.displayName || user?.username || 'User'}</div>
                                    <div className="dropdown-username">@{currentProfile?.username || user?.username || 'username'}</div>
                                </div>
                            </div>

                            {currentProfile && (
                                <div className="profile-dropdown-details">
                                    {user?.email && (
                                        <div className="detail-item">
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                            </svg>
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{user.email}</span>
                                        </div>
                                    )}
                                    {currentProfile.bio && (
                                        <div className="detail-item">
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                            </svg>
                                            <span className="detail-label">Bio:</span>
                                            <span className="detail-value">{currentProfile.bio}</span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        <span className="detail-label">Followers:</span>
                                        <span className="detail-value">{currentProfile.followersCount || 0}</span>
                                    </div>
                                    <div className="detail-item">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                        </svg>
                                        <span className="detail-label">Following:</span>
                                        <span className="detail-value">{currentProfile.followingCount || 0}</span>
                                    </div>
                                </div>
                            )}

                            <div className="profile-dropdown-actions">
                                <button className="dropdown-action-btn" onClick={handleEditProfile}>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                    {t('profile.editProfile')}
                                </button>
                                <button className="dropdown-action-btn" onClick={handleProfileClick}>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                    View Profile
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
