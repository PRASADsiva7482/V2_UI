import axios from 'axios';
import keycloak from './keycloak';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: window.config?.api?.baseUrl || 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    (config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

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
                keycloak.login();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
