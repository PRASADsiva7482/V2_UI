import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="theme-toggle-track">
                <div className={`theme-toggle-slider ${isDark ? 'dark' : 'light'}`}>
                    {isDark ? (
                        // Moon icon for dark mode
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        // Sun icon for light mode
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
                            <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
                            <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
            </div>
        </button>
    );
}

export default ThemeToggle;
