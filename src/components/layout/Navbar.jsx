import './Navbar.css';
import { LogOut, User, Bell, Search } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="navbar-right">
                <button className="icon-btn" title="Notifications">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                <div className="user-menu">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.username || 'User'}
                            </span>
                            <span className="user-role">
                                {user?.email || 'user@example.com'}
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
