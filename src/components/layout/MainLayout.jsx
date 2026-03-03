import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TopBar from './TopBar';
import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import './MainLayout.css';

function MainLayout({ children }) {
    const location = useLocation();
    const { t } = useTranslation();
    const isSettingsPage = location.pathname.startsWith('/settings');

    useEffect(() => {
        const path = location.pathname;
        let title = 'V.com';

        if (path === '/' || path === '/home') {
            title = `${t('navbar.home', 'Home')} / V.com`;
        } else if (path.startsWith('/explore')) {
            title = `${t('navbar.explore', 'Explore')} / V.com`;
        } else if (path.startsWith('/notifications')) {
            title = `${t('navbar.notifications', 'Notifications')} / V.com`;
        } else if (path.startsWith('/connections')) {
            title = `${t('navbar.connect', 'Connect')} / V.com`;
        } else if (path.startsWith('/messages') || path.startsWith('/chat')) {
            title = `${t('navbar.messages', 'Messages')} / V.com`;
        } else if (path.startsWith('/profile')) {
            title = `${t('navbar.profile', 'Profile')} / V.com`;
        } else if (path.startsWith('/settings')) {
            title = `Settings / V.com`;
        }

        document.title = title;
    }, [location.pathname, t]);

    return (
        <div className="app-wrapper">
            <TopBar />
            <div className={`app-container ${isSettingsPage ? 'full-width-content' : ''}`}>
                <Navbar />
                <main className="main-content">
                    {children}
                </main>
                {!isSettingsPage && <RightSidebar />}
            </div>
        </div>
    );
}

export default MainLayout;
