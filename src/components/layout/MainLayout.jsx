import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import './MainLayout.css';

function MainLayout({ children }) {
    const location = useLocation();
    const isSettingsPage = location.pathname.startsWith('/settings');

    return (
        <div className={`app-container ${isSettingsPage ? 'full-width-content' : ''}`}>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            {!isSettingsPage && <RightSidebar />}
        </div>
    );
}

export default MainLayout;
