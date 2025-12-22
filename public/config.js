// Keycloak Configuration
// Update these values based on your Keycloak server setup
window.config = {
    keycloak: {
        url: 'http://localhost:8080',
        realm: 'myrealm',
        clientId: 'myclient'
    },
    session: {
        // Token refresh settings
        tokenRefreshInterval: 60000, // Check token every 60 seconds (1 minute)
        tokenMinValidity: 70, // Refresh token if it expires in less than 70 seconds

        // Session timeout settings for social media app
        // Users need to login fresh every 3 months (90 days)
        // Session remains active even if tabs are closed
        // Only explicit logout or 3-month expiry requires re-login
        sessionTimeout: 90 * 24 * 60 * 60, // 90 days in seconds (7,776,000 seconds)

        // SSO Session Idle timeout (optional - how long session can be idle)
        // Set to null or 0 to disable idle timeout
        sessionIdleTimeout: null, // No idle timeout - session stays active

        // Remember me functionality
        rememberMe: true // Keep session alive across browser restarts
    },
    api: {
        baseUrl: 'http://localhost:2000/v-app'
    }
};
