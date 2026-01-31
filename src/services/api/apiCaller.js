import api from '../../auth/api';

/**
 * Centralized API caller to handle all axios requests with common logic
 */
const apiCaller = {
    /**
     * Handle GET requests
     */
    get: async (url, config = {}) => {
        try {
            validateUrl(url);
            const response = await api.get(url, config);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Handle POST requests
     */
    post: async (url, data = {}, config = {}) => {
        try {
            validateUrl(url);
            const response = await api.post(url, data, config);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Handle PUT requests
     */
    put: async (url, data = {}, config = {}) => {
        try {
            validateUrl(url);
            const response = await api.put(url, data, config);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Handle DELETE requests
     */
    delete: async (url, config = {}) => {
        try {
            validateUrl(url);
            const response = await api.delete(url, config);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Handle File Upload (Multipart)
     */
    upload: async (url, formData, config = {}) => {
        try {
            validateUrl(url);
            const response = await api.post(url, formData, {
                ...config,
                headers: {
                    ...config?.headers,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }
};

/**
 * Validate URL before making request
 */
const validateUrl = (url) => {
    if (!url) {
        throw new Error('API URL is required');
    }
};

/**
 * Common response handler
 */
const handleResponse = (response) => {
    // Return only data as most services expect it
    return response.data;
};

/**
 * Common error handler
 */
const handleError = (error) => {
    // Log error for debugging (Interceptors already do some of this)
    console.error('API Caller Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
    });

    // We re-throw the error so call sites can handle specific cases if needed
    // or we could return a normalized error object
    throw error;
};

export default apiCaller;
