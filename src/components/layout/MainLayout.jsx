import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TopBar from './TopBar';
import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import useMediaAutoStop, { pauseAllMedia } from '../../hooks/useMediaAutoStop';
import './MainLayout.css';

function MainLayout({ children }) {
    const location = useLocation();
    const { t } = useTranslation();
    const isSettingsPage = location.pathname.startsWith('/settings');
    const isChatPage = location.pathname.startsWith('/chat') || location.pathname.startsWith('/messages');
    const isFullWidthPage = isSettingsPage || isChatPage;
    const mediaAutoStopRef = useMediaAutoStop();

    // Pause all media when navigating to a different page
    useEffect(() => {
        pauseAllMedia();
    }, [location.pathname]);

    useEffect(() => {
        const path = location.pathname;
        let title = 'v.com';

        // if (path === '/' || path === '/home') {
        //     title = `${t('navbar.home', 'Home')} / v.com`;
        // } else if (path.startsWith('/explore')) {
        //     title = `${t('navbar.explore', 'Explore')} / v.com`;
        // } else if (path.startsWith('/notifications')) {
        //     title = `${t('navbar.notifications', 'Notifications')} / v.com`;
        // } else if (path.startsWith('/connections')) {
        //     title = `${t('navbar.connect', 'Connect')} / v.com`;
        // } else if (path.startsWith('/messages') || path.startsWith('/chat')) {
        //     title = `${t('navbar.messages', 'Messages')} / v.com`;
        // } else if (path.startsWith('/profile')) {
        //     title = `${t('navbar.profile', 'Profile')} / v.com`;
        // } else if (path.startsWith('/settings')) {
        //     title = `Settings / v.com`;
        // }

        if (path && path !== '/') {
            const route = path.split('/')[1]; // first path segment
            title = `${t(`navbar.${route}`, route.charAt(0).toUpperCase() + route.slice(1))} / v.com`;
        } else {
            title = `${t('navbar.home', 'Home')} / v.com`;
        }

        document.title = title;
    }, [location.pathname, t]);

    return (
        <div className="app-wrapper" ref={mediaAutoStopRef}>
            <TopBar />
            <div className={`app-container ${isFullWidthPage ? 'full-width-content' : ''}`}>
                <Navbar />
                <main className="main-content">
                    {children}
                </main>
                {!isFullWidthPage && <RightSidebar />}
            </div>
        </div>
    );
}

export default MainLayout;
