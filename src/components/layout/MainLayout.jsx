import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import './MainLayout.css';

function MainLayout({ children }) {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <RightSidebar />
        </div>
    );
}

export default MainLayout;
