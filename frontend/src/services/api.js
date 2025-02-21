import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const productivityService = {
    getDailySummary: () => apiClient.get('/daily-summary'),
    getCurrentSession: () => apiClient.get('/current-session'),
    startSession: (sessionName) => apiClient.post('/start-session', { session_name: sessionName }),
    endSession: () => apiClient.post('/end-session'),
    downloadReport: (reportId) => apiClient.get(`/download-report/${reportId}`, {
        responseType: 'blob'
    })
};