import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDev ? 'http://127.0.0.1:5000' : 'http://localhost:5000';

// Logger helper
const logger = {
    info: (message, data) => {
        console.info(`[API INFO] ${message}`, data || '');
    },
    debug: (message, data) => {
        console.debug(`[API DEBUG] ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[API ERROR] ${message}`, error || '');
    },
    warn: (message, data) => {
        console.warn(`[API WARN] ${message}`, data || '');
    }
};

logger.info(`API client initialized with base URL: ${API_BASE_URL}`);

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    // Increase timeout for end session and report download
    timeout: 30000 // 30 seconds
});

// Custom timeout configurations for specific endpoints
const endpointTimeouts = {
    '/end-session': 60000, // 1 minute for session end
    '/download-report': 60000 // 1 minute for report download
};

// Request interceptor to set custom timeouts, add auth token, and log requests
apiClient.interceptors.request.use(config => {
    // Check if endpoint has custom timeout
    const path = config.url?.replace(API_BASE_URL, '');
    
    if (path && endpointTimeouts[path]) {
        config.timeout = endpointTimeouts[path];
        logger.debug(`Using custom timeout for ${path}: ${endpointTimeouts[path]}ms`);
    }
    
    // Add auth token to requests
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request details
    logger.info(`REQUEST: ${config.method?.toUpperCase()} ${path}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
        timeout: config.timeout
    });
    
    // Record request start time for performance tracking
    config.metadata = { startTime: new Date() };
    
    return config;
});

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
    response => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime;
        const path = response.config.url?.replace(API_BASE_URL, '');
        
        // Log successful response
        logger.info(`RESPONSE SUCCESS: ${response.config.method?.toUpperCase()} ${path} (${duration}ms)`, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data instanceof Blob ? 'Blob data' : response.data
        });
        
        return response;
    },
    error => {
        // Calculate request duration if possible
        let duration = 0;
        if (error.config?.metadata?.startTime) {
            duration = new Date() - error.config.metadata.startTime;
        }
        
        const path = error.config?.url?.replace(API_BASE_URL, '') || 'unknown';
        
        // Log error details
        logger.error(`RESPONSE ERROR: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${path} (${duration}ms)`, {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Handle 401 unauthorized errors (token issues)
        if (error.response?.status === 401) {
            logger.warn('Authentication error - redirecting to login');
            // Clear local storage
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            // Redirect to login page if we're in a browser environment
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        
        // Custom error messages based on error type
        let errorMessage = 'An unexpected error occurred';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Backend server is not responding. Please check if the server is running.';
            logger.error('Connection refused - server may be down');
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timed out. Please try again.';
            logger.error(`Request timeout after ${duration}ms`);
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.message;
            logger.error(`Server returned error ${error.response.status}: ${errorMessage}`);
        }
        
        // Enhance error object with custom message
        error.userMessage = errorMessage;
        return Promise.reject(error);
    }
);

// Health check method
const checkBackendHealth = async () => {
    logger.info('Performing backend health check');
    try {
        const response = await apiClient.get('/test');
        const isHealthy = response.status === 200;
        logger.info(`Health check result: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
        return isHealthy;
    } catch (error) {
        logger.error('Health check failed:', error);
        return false;
    }
};

// Token verification with Python backend
const verifyToken = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    logger.debug('Verifying token with productivity backend');
    try {
        const response = await apiClient.post('/verify-token', { token });
        logger.debug('Token verification successful', response.data);
        return response.data;
    } catch (error) {
        logger.error('Token verification failed', error);
        throw error;
    }
};

export const productivityService = {
    checkBackendHealth,
    verifyToken,
    
    getDailySummary: async () => {
        logger.debug('Calling getDailySummary API');
        try {
            const response = await apiClient.get('/daily-summary');
            logger.debug('Daily summary data received', response.data);
            return response;
        } catch (error) {
            logger.error('Failed to get daily summary', error);
            throw error;
        }
    },
    
    getCurrentSession: async () => {
        logger.debug('Calling getCurrentSession API');
        try {
            const response = await apiClient.get('/current-session');
            logger.debug('Current session data received', response.data);
            return response;
        } catch (error) {
            logger.error('Failed to get current session', error);
            throw error;
        }
    },
    
    startSession: async (sessionName) => {
        logger.debug(`Calling startSession API with name: ${sessionName}`);
        try {
            const response = await apiClient.post('/start-session', { session_name: sessionName });
            logger.debug('Session started successfully', response.data);
            return response;
        } catch (error) {
            logger.error('Failed to start session', error);
            throw error;
        }
    },
    
    endSession: async () => {
        logger.debug('Calling endSession API');
        try {
            const response = await apiClient.post('/end-session');
            logger.debug('Session ended successfully', response.data);
            return response;
        } catch (error) {
            logger.error('Failed to end session', error);
            throw error;
        }
    },
    
    downloadReport: async (reportId) => {
        logger.debug(`Calling downloadReport API for report ID: ${reportId}`);
        try {
            const response = await apiClient.get(`/download-report/${reportId}`, {
                responseType: 'blob',
                timeout: 60000 // 1 minute timeout for report download
            });
            logger.debug(`Report downloaded successfully, content type: ${response.headers['content-type']}`);
            return response;
        } catch (error) {
            logger.error(`Failed to download report ${reportId}`, error);
            throw error;
        }
    },
    
    testConnection: async () => {
        logger.debug('Calling testConnection API');
        try {
            const response = await apiClient.get('/test');
            logger.debug('Test connection successful', response.data);
            return response;
        } catch (error) {
            logger.error('Test connection failed', error);
            throw error;
        }
    },

    getPrivacySettings: async () => {
        logger.debug('Calling getPrivacySettings API');
        try {
            const response = await apiClient.get('/privacy-settings');
            logger.debug('Privacy settings retrieved', response.data);
            return response.data;
        } catch (error) {
            logger.error('Failed to get privacy settings', error);
            throw error;
        }
    },
    
    updatePrivacySettings: async (settings) => {
        logger.debug('Calling updatePrivacySettings API', settings);
        try {
            const response = await apiClient.post('/privacy-settings', settings);
            logger.debug('Privacy settings updated successfully', response.data);
            return response.data;
        } catch (error) {
            logger.error('Failed to update privacy settings', error);
            throw error;
        }
    }
};