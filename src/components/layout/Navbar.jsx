import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getUnseenCount } from '../../services/api/notifications';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [notifBadge, setNotifBadge] = useState(0);

    useEffect(() => {
        loadNotifBadge();
        const interval = setInterval(loadNotifBadge, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifBadge = async () => {
        try {
            const data = await getUnseenCount();
            setNotifBadge(data?.unseenCount || 0);
        } catch (error) {
            // Silently fail - badge is non-critical
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-menu">
                    <button
                        className={`nav-btn ${isActive('/') || isActive('/home') ? 'active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
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
                        className={`nav-btn ${isActive('/spaces') ? 'active' : ''}`}
                        onClick={() => navigate('/spaces')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1.02 1.15V12c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92v-.08c.07-.61-.41-1.15-1.02-1.15z"/>
                        </svg>
                        <span>Spaces</span>
                    </button>

                    <button
                        className={`nav-btn ${isActive('/lists') ? 'active' : ''}`}
                        onClick={() => navigate('/lists')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                        </svg>
                        <span>Lists</span>
                    </button>

                    <button
                        className={`nav-btn ${isActive('/bookmarks') ? 'active' : ''}`}
                        onClick={() => navigate('/bookmarks')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                        </svg>
                        <span>{t('navbar.bookmarks', 'Bookmarks')}</span>
                    </button>

                    <button
                        className={`nav-btn ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                        onClick={() => navigate('/profile/me')}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>{t('navbar.profile')}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
