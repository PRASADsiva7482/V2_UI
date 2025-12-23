import Navbar from './Navbar';
import './MainLayout.css';

function MainLayout({ children }) {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;
