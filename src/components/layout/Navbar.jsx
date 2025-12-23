import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </div>

                <div className="navbar-menu">
                    <button className="nav-btn active" onClick={() => navigate('/')}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M12 9c-2.49 0-4.5 2.01-4.5 4.5S9.51 18 12 18s4.5-2.01 4.5-4.5S14.49 9 12 9zm0 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 11 12 11s2.5 1.12 2.5 2.5S13.38 16 12 16z" />
                            <path d="M12 5c-4.27 0-8.1 2.48-10 6 1.9 3.52 5.73 6 10 6s8.1-2.48 10-6c-1.9-3.52-5.73-6-10-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                        </svg>
                        <span>Home</span>
                    </button>

                    <button className="nav-btn" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>

                <button className="profile-btn">
                    <div className="profile-avatar">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
