import axios from 'axios';
import keycloak from './keycloak';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: window.config?.api?.baseUrl || 'http://localhost:2000/v-app',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    (config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
            console.log('API Request:', config.method.toUpperCase(), config.url);
        } else {
            console.warn('No Keycloak token available');
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.config.url, response.status);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

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
