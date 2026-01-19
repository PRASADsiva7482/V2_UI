// Keycloak Configuration
// Update these values based on your Keycloak server setup

// Auto-detect current host (works with localhost, LAN IP, and VPN IP)
const currentHost = window.location.hostname;
const protocol = window.location.protocol;

// Network configuration
// When accessing from other devices, use these IPs:
// - Local Network (Wi-Fi): 192.168.31.139
// - Tailscale VPN: 100.122.105.63
// - Localhost: localhost or 127.0.0.1

window.config = {
    keycloak: {
        // Use current host for Keycloak URL (works for localhost, LAN, and VPN)
        url: `${protocol}//${currentHost}:8080`,
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
        // Use current host for API URL (works for localhost, LAN, and VPN)
        baseUrl: `${protocol}//${currentHost}:2000/v-app`,
        mediaBaseUrl: `${protocol}//${currentHost}:2000`

    }
};
