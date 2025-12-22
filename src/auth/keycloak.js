import Keycloak from 'keycloak-js';

// Initialize Keycloak instance using config from window.config
// Session settings (token refresh, session timeout, etc.) are configured in:
// - /public/config.js (client-side settings)
// - Keycloak Admin Console (server-side settings must match)
// See SESSION_CONFIG.md for detailed documentation
const keycloak = new Keycloak({
    url: window.config?.keycloak?.url || 'http://localhost:8080',
    realm: window.config?.keycloak?.realm || 'your-realm',
    clientId: window.config?.keycloak?.clientId || 'your-client-id'
});

export default keycloak;
