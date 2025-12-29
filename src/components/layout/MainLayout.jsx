import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import './MainLayout.css';

function MainLayout({ children }) {
    return (
        <div className="app-container">
            {/* Global top-right controls */}
            <div className="global-controls">
                <ThemeToggle />
                <LanguageSwitcher />
            </div>

            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <RightSidebar />
        </div>
    );
}

export default MainLayout;

