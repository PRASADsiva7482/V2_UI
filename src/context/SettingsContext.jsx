import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getUserSettings } from '../services/api/settings';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { i18n } = useTranslation();
    const { setTheme } = useTheme(); // wait, ThemeContext doesn't expose setTheme directly, just toggleTheme.

    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadSettings = async () => {
            try {
                setLoading(true);
                const data = await getUserSettings();
                setSettings(data);

                // Apply language
                if (data?.displayLanguage && data.displayLanguage !== i18n.language) {
                    i18n.changeLanguage(data.displayLanguage);
                }

                // Apply appearance details to body class
                document.documentElement.setAttribute('data-font-size', data?.fontSize || 'DEFAULT');

                if (data?.reduceMotion) {
                    document.documentElement.classList.add('reduce-motion');
                } else {
                    document.documentElement.classList.remove('reduce-motion');
                }

                if (data?.appearanceTheme) {
                    const themeValue = data.appearanceTheme === 'DARK' ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', themeValue);
                    localStorage.setItem('theme', themeValue);
                }

            } catch (error) {
                console.error("Failed to load user settings:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [isAuthenticated, user?.username, i18n]);

    const updateContextSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));

        // Immediate apply if accessibility/display options are changed
        if (newSettings.displayLanguage) {
            i18n.changeLanguage(newSettings.displayLanguage);
        }
        if (newSettings.fontSize) {
            document.documentElement.setAttribute('data-font-size', newSettings.fontSize);
        }
        if (newSettings.reduceMotion !== undefined) {
            if (newSettings.reduceMotion) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        }
        if (newSettings.appearanceTheme) {
            const themeValue = newSettings.appearanceTheme === 'DARK' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', themeValue);
            localStorage.setItem('theme', themeValue);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateContextSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
