import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import './NavbarSettings.css';

const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'tel', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
];

function NavbarSettings() {
    const { theme, toggleTheme } = useTheme();
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const isDark = theme === 'dark';

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    const filteredLanguages = useMemo(() => {
        if (!searchQuery) return LANGUAGES;
        const q = searchQuery.toLowerCase();
        return LANGUAGES.filter(l =>
            l.name.toLowerCase().includes(q) ||
            l.nativeName.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsLangOpen(false);
                setSearchQuery('');
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isLangOpen) {
                    setIsLangOpen(false);
                } else {
                    setIsOpen(false);
                }
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLangOpen]);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsLangOpen(false);
        setSearchQuery('');
        setIsOpen(false); // Optionally close whole dropdown
    };

    return (
        <div className="navbar-settings" ref={dropdownRef}>
            {/* Options trigger button */}
            <button
                className={`navbar-settings-btn ${isOpen ? 'active' : ''}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (isOpen) {
                        setIsLangOpen(false);
                        setSearchQuery('');
                    }
                }}
                aria-label="Settings"
                title="Settings"
                id="navbar-settings-btn"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="navbar-settings-dropdown" id="navbar-settings-dropdown">

                    {/* Theme Section */}
                    <div className="settings-section">
                        <div className="settings-theme-row" onClick={toggleTheme}>
                            <div className="settings-theme-info">
                                <div className={`settings-theme-icon ${isDark ? 'dark' : 'light'}`}>
                                    {isDark ? (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
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
                                <div className="settings-theme-text">
                                    <span className="settings-theme-label">Dark Mode</span>
                                </div>
                            </div>
                            <div className={`settings-toggle-track ${isDark ? 'active' : ''}`}>
                                <div className="settings-toggle-thumb" />
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="settings-divider" />

                    {/* Language Section */}
                    <div className="settings-section">
                        {!isLangOpen ? (
                            <div
                                className="settings-lang-header"
                                onClick={() => setIsLangOpen(true)}
                            >
                                <div className="settings-lang-current">
                                    <span className="settings-lang-flag">{currentLang.flag}</span>
                                    <span className="settings-lang-label">{currentLang.name}</span>
                                </div>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="settings-lang-chevron">
                                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                </svg>
                            </div>
                        ) : (
                            <div className="settings-lang-search-container">
                                <div className="settings-lang-search-box">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search language..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="settings-lang-close" onClick={() => setIsLangOpen(false)}>
                                        &times;
                                    </button>
                                </div>
                                <div className="settings-lang-list">
                                    {filteredLanguages.length > 0 ? (
                                        filteredLanguages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                className={`settings-lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                                                onClick={() => handleLanguageChange(lang.code)}
                                            >
                                                <span className="settings-lang-flag">{lang.flag}</span>
                                                <div className="settings-lang-info">
                                                    <span className="settings-lang-name">{lang.name}</span>
                                                </div>
                                                {i18n.language === lang.code && (
                                                    <svg className="settings-lang-check" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="settings-lang-none">No languages found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NavbarSettings;
