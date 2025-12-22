import { createContext, useContext, useState, useEffect, useRef } from 'react';
import keycloak from './keycloak';

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

    useEffect(() => {
        // Prevent double execution in strict mode
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        // Initialize Keycloak
        keycloak
            .init({
                onLoad: 'login-required', // Redirects to login if not authenticated
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
                    localStorage.setItem('keycloak-authenticated', 'true');
                    localStorage.setItem('keycloak-obj', JSON.stringify(keycloak));

                    // Setup token refresh using config values
                    const tokenRefreshInterval = window.config?.session?.tokenRefreshInterval || 60000;
                    const tokenMinValidity = window.config?.session?.tokenMinValidity || 70;

                    setInterval(() => {
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
    }, []);

    const login = () => {
        keycloak.login();
    };

    const logout = () => {
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

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5rem',
                color: '#6366f1'
            }}>
                Loading...
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
