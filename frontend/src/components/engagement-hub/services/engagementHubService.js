import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDev ? 'http://127.0.0.1:5002' : 'http://localhost:5002';

// Logger helper
const logger = {
    info: (message, data) => {
        console.info(`[ENGAGEMENT HUB API INFO] ${message}`, data || '');
    },
    debug: (message, data) => {
        console.debug(`[ENGAGEMENT HUB API DEBUG] ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[ENGAGEMENT HUB API ERROR] ${message}`, error || '');
    },
    warn: (message, data) => {
        console.warn(`[ENGAGEMENT HUB API WARN] ${message}`, data || '');
    }
};

logger.info(`Engagement Hub API client initialized with base URL: ${API_BASE_URL}`);

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/engagement-hub`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds
});

// Get auth token from local storage or cookies
const getAuthToken = () => {
    return localStorage.getItem('userToken');
};

// Request interceptor to log requests and add auth token
apiClient.interceptors.request.use(config => {
    // Add authorization header with token
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request details
    logger.info(`REQUEST: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
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
        
        // Log successful response
        logger.info(`RESPONSE SUCCESS: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        
        return response;
    },
    error => {
        // Calculate request duration if possible
        let duration = 0;
        if (error.config?.metadata?.startTime) {
            duration = new Date() - error.config.metadata.startTime;
        }
        
        // Log error details
        logger.error(`RESPONSE ERROR: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'unknown'} (${duration}ms)`, {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Redirect to login page or show login modal
            window.location.href = '/login';
        }
        
        // Custom error messages based on error type
        let errorMessage = 'An unexpected error occurred with the Engagement Hub';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Engagement Hub server is not responding. Please check if the server is running.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Engagement Hub request timed out. Please try again.';
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.message;
        }
        
        // Enhance error object with custom message
        error.userMessage = errorMessage;
        return Promise.reject(error);
    }
);

export const engagementHubService = {
    // Get the current status of the engagement hub
    getHubStatus: async () => {
        logger.debug('Calling getHubStatus API');
        try {
            const response = await apiClient.get('/status');
            logger.debug('Hub status received', response.data);
            return response.data;
        } catch (error) {
            logger.error('Failed to get hub status', error);
            throw error;
        }
    },
    
    // Update the hub status (enable/disable)
    updateHubStatus: async (isEnabled) => {
        logger.debug(`Calling updateHubStatus API with status: ${isEnabled}`);
        try {
            const response = await apiClient.post('/status', { isEnabled });
            logger.debug('Hub status updated successfully', response.data);
            return response.data;
        } catch (error) {
            logger.error('Failed to update hub status', error);
            throw error;
        }
    },
    
    // Update the current play time (for pausing/resuming)
    updatePlayTime: async (playedSeconds) => {
        logger.debug(`Calling updatePlayTime API with seconds played: ${playedSeconds}`);
        try {
            const response = await apiClient.post('/play-time', { playedSeconds });
            logger.debug('Play time updated successfully', response.data);
            return response.data;
        } catch (error) {
            logger.error('Failed to update play time', error);
            throw error;
        }
    },
    
    // Test the connection to the engagement hub backend
    testConnection: async () => {
        logger.debug('Testing connection to Engagement Hub API');
        try {
            // Using the root endpoint of the API
            const testClient = axios.create({
                baseURL: API_BASE_URL,
                timeout: 5000,
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
            });
            const response = await testClient.get('/');
            logger.debug('Connection test successful', response.data);
            return true;
        } catch (error) {
            logger.error('Connection test failed', error);
            return false;
        }
    }
};