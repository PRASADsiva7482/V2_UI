import axios from 'axios';
import keycloak from './keycloak';
import EncryptionUtils from '../services/utils/EncryptionUtils';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: window.config?.api?.baseUrl || 'http://localhost:2000/v-app',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Paths to skip encryption (Media, auth, etc.)
const SKIP_ENCRYPTION_PATHS = [
    '/media/',
    '/swagger-ui',
    '/api-docs',
    '/error'
];

/**
 * Check if a URL should bypass encryption
 */
const shouldSkipEncryption = (url) => {
    if (!url) return true;
    const isEnabled = window.config?.api?.payloadEncryptionEnabled;
    if (!isEnabled) return true;

    return SKIP_ENCRYPTION_PATHS.some(path => url.includes(path));
};

/**
 * Helper to decrypt response data
 */
const decryptResponseData = (response) => {
    if (!response) return;

    if (response.data && typeof response.data === 'string' && !shouldSkipEncryption(response.config?.url)) {
        try {
            const decrypted = EncryptionUtils.decrypt(response.data);
            if (decrypted) {
                // Try to parse as JSON if it looks like one
                if (decrypted.trim().startsWith('{') || decrypted.trim().startsWith('[')) {
                    response.data = JSON.parse(decrypted);
                } else {
                    response.data = decrypted;
                }
                console.log('Decrypted data for:', response.config?.url);
            }
        } catch (e) {
            console.warn('Failed to decrypt or parse response:', e.message, 'Data:', response.data);
        }
    }
};

// Request interceptor to add Authorization header and handle encryption
api.interceptors.request.use(
    (config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
            console.log('API Request:', config.method.toUpperCase(), config.url);
        } else {
            console.warn('No Keycloak token available');
        }

        // Encrypt body for POST/PUT/PATCH/DELETE if not skipped
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase()) && config.data) {
            if (!shouldSkipEncryption(config.url)) {
                // If it's multipart/form-data, we skip encryption (files)
                const isMultipart = config.headers['Content-Type']?.includes('multipart/form-data');
                if (!isMultipart) {
                    console.log(`[Encryption] Encrypting ${config.method.toUpperCase()} request body for:`, config.url);
                    const jsonBody = typeof config.data === 'object' ? JSON.stringify(config.data) : config.data;
                    config.data = EncryptionUtils.encrypt(jsonBody);
                    // When sending raw encrypted string, we should use text/plain or stay as json
                    // The backend filter reads the whole stream, so we're good.
                }
            }
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh and decryption
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.config.url, response.status);
        decryptResponseData(response);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Decrypt error response if available
        if (error.response) {
            decryptResponseData(error.response);
        }

        // Log error details for debugging
        if (error.response) {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error('Network Error:', error.message);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshed = await keycloak.updateToken(5);

                if (refreshed) {
                    // Update the authorization header with new token
                    originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                console.error('Token refresh failed, redirecting to login');
                keycloak.login();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
