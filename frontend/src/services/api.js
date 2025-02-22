import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDev ? 'http://127.0.0.1:5000' : 'http://localhost:5000';

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

// Request interceptor to set custom timeouts
apiClient.interceptors.request.use(config => {
    // Check if endpoint has custom timeout
    const path = config.url?.replace(API_BASE_URL, '');
    if (path && endpointTimeouts[path]) {
        config.timeout = endpointTimeouts[path];
    }
    return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        
        // Custom error messages based on error type
        let errorMessage = 'An unexpected error occurred';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Backend server is not responding. Please check if the server is running.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.response) {
            errorMessage = error.response.data?.message || error.message;
        }
        
        // Enhance error object with custom message
        error.userMessage = errorMessage;
        return Promise.reject(error);
    }
);

// Health check method
const checkBackendHealth = async () => {
    try {
        const response = await apiClient.get('/test');
        return response.status === 200;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};

export const productivityService = {
    checkBackendHealth,
    getDailySummary: () => apiClient.get('/daily-summary'),
    getCurrentSession: () => apiClient.get('/current-session'),
    startSession: (sessionName) => apiClient.post('/start-session', { session_name: sessionName }),
    endSession: () => apiClient.post('/end-session'),
    downloadReport: (reportId) => apiClient.get(`/download-report/${reportId}`, {
        responseType: 'blob',
        timeout: 60000 // 1 minute timeout for report download
    }),
    testConnection: () => apiClient.get('/test')
};