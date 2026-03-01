import { createContext, useContext, useState, useEffect, useRef } from 'react';
import keycloak from './keycloak';
import './AuthProvider.css';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const initialized = useRef(false);
    const refreshIntervalRef = useRef(null); // U-5: store interval ref for cleanup

    useEffect(() => {
        // Prevent double execution in strict mode
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        // Initialize Keycloak
        keycloak
            .init({
                onLoad: 'login-required',
                checkLoginIframe: false,
                pkceMethod: 'S256'
            })
            .then((auth) => {
                setAuthenticated(auth);

                if (auth) {
                    // Load user profile
                    keycloak.loadUserProfile().then((profile) => {
                        setUser(profile);
                    });

                    // U-20: REMOVED — Do NOT store keycloak object in localStorage.
                    // Keycloak tokens are sensitive and should not be in plaintext localStorage.
                    // Only store a simple flag.
                    localStorage.setItem('keycloak-authenticated', 'true');

                    // Setup token refresh using config values
                    const tokenRefreshInterval = window.config?.session?.tokenRefreshInterval || 60000;
                    const tokenMinValidity = window.config?.session?.tokenMinValidity || 70;

                    // U-5: Store interval reference so it can be cleaned up on unmount
                    refreshIntervalRef.current = setInterval(() => {
                        keycloak.updateToken(tokenMinValidity).then((refreshed) => {
                            if (refreshed) {
                                console.log('Token refreshed');
                            }
                        }).catch(() => {
                            console.error('Failed to refresh token');
                            logout();
                        });
                    }, tokenRefreshInterval);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error('Keycloak init failed:', error);
                setLoading(false);
            });

        // U-5: Cleanup interval on unmount to prevent memory leak
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, []);

    const login = () => {
        keycloak.login();
    };

    const logout = () => {
        // Clean up interval on logout
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
        localStorage.removeItem('keycloak-authenticated');
        keycloak.logout({
            redirectUri: window.location.origin
        });
    };

    const getToken = () => {
        return keycloak.token;
    };

    const hasRole = (role) => {
        return keycloak.hasRealmRole(role);
    };

    // U-11: Loading spinner uses CSS class instead of inline styles
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner"></div>
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                login,
                logout,
                getToken,
                hasRole,
                keycloak
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
