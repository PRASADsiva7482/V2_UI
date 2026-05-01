import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { getUnseenCount } from '../../services/api/notifications';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [notifBadge, setNotifBadge] = useState(0);
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef(null);

    useEffect(() => {
        loadNotifBadge();
        const interval = setInterval(loadNotifBadge, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close "More" popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) {
                setMoreOpen(false);
            }
        };
        if (moreOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [moreOpen]);

    const loadNotifBadge = async () => {
        try {
            const data = await getUnseenCount();
            setNotifBadge(data?.unseenCount || 0);
        } catch {
            // Silently fail - badge is non-critical
        }
    };

    const isActive = (path) => location.pathname === path;

    const goTo = (path) => {
        navigate(path);
        setMoreOpen(false);
    };

    // Nav items shown in the desktop sidebar
    const mainItems = [
        {
            label: t('navbar.home', 'Home'),
            path: '/',
            active: isActive('/') || isActive('/home'),
            icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
        },
        {
            label: t('navbar.explore', 'Explore'),
            path: '/explore',
            active: isActive('/explore'),
            icon: <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />,
        },
        {
            label: t('navbar.notifications', 'Notifications'),
            path: '/notifications',
            active: isActive('/notifications'),
            badge: notifBadge,
            onClick: () => { navigate('/notifications'); setNotifBadge(0); },
            icon: <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2zM4.372 16l.928-7.276C5.678 5.707 8.523 4 12 4s6.321 1.707 6.7 4.724L19.628 16H4.372z" />,
        },
        {
            label: t('navbar.connect', 'Connect'),
            path: '/connections?tab=followers',
            active: location.pathname.startsWith('/connections'),
            icon: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
        },
        {
            label: t('navbar.messages', 'Messages'),
            path: '/chat',
            active: isActive('/chat'),
            icon: <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />,
        },
        {
            label: t('navbar.bookmarks', 'Bookmarks'),
            path: '/bookmarks',
            active: isActive('/bookmarks'),
            icon: <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />,
        },
        {
            label: t('navbar.profile', 'Profile'),
            path: '/profile/me',
            active: location.pathname.startsWith('/profile'),
            icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
        },
        {
            label: t('navbar.analytics', 'Analytics'),
            path: '/analytics',
            active: isActive('/analytics'),
            icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />,
        },
    ];

    // First 4 tabs pinned on mobile, rest go in "More"
    const mobilePrimary = mainItems.slice(0, 4);
    const mobileMore = mainItems.slice(4);

    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Desktop/tablet sidebar menu — all items visible */}
                <div className="navbar-menu desktop-menu">
                    {mainItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-btn ${item.active ? 'active' : ''}`}
                            onClick={item.onClick || (() => navigate(item.path))}
                        >
                            <div style={{ position: 'relative', display: 'inline-flex' }}>
                                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                                    {item.icon}
                                </svg>
                                {item.badge > 0 && (
                                    <span className="notif-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                )}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Mobile bottom tab bar — only 4 + More */}
                <div className="navbar-menu mobile-menu">
                    {mobilePrimary.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-btn ${item.active ? 'active' : ''}`}
                            onClick={item.onClick || (() => navigate(item.path))}
                        >
                            <div style={{ position: 'relative', display: 'inline-flex' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                    {item.icon}
                                </svg>
                                {item.badge > 0 && (
                                    <span className="notif-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                )}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}

                    {/* More button */}
                    <div className="more-wrapper" ref={moreRef}>
                        <button
                            className={`nav-btn ${moreOpen ? 'active' : ''}`}
                            onClick={() => setMoreOpen((v) => !v)}
                            aria-label="More options"
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                            </svg>
                            <span>More</span>
                        </button>

                        {/* More popup */}
                        {moreOpen && (
                            <div className="more-popup">
                                <div className="more-popup-header">
                                    <span>More options</span>
                                    <button className="more-popup-close" onClick={() => setMoreOpen(false)} aria-label="Close">✕</button>
                                </div>
                                <div className="more-popup-items">
                                    {mobileMore.map((item) => (
                                        <button
                                            key={item.path}
                                            className={`more-popup-item ${item.active ? 'active' : ''}`}
                                            onClick={() => goTo(item.path)}
                                        >
                                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                                {item.icon}
                                            </svg>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
