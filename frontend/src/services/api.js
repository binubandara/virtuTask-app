// src/services/api.js
import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDev ? 'http://127.0.0.1:5000' : 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNREFUSED') {
            console.error('Backend server not responding');
        }
        return Promise.reject(error);
    }
);

export const productivityService = {
    getDailySummary: () => apiClient.get('/daily-summary'),
    getCurrentSession: () => apiClient.get('/current-session'),
    startSession: (sessionName) => apiClient.post('/start-session', { session_name: sessionName }),
    endSession: () => apiClient.post('/end-session'),
    downloadReport: (reportId) => apiClient.get(`/download-report/${reportId}`, {
        responseType: 'blob'
    }),
    testConnection: () => apiClient.get('/test')
};