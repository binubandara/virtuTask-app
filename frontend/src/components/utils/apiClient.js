import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 seconds
});

// Get auth token from local storage
const getAuthToken = () => {
  return localStorage.getItem('userToken') || 
         localStorage.getItem('token') || 
         localStorage.getItem('authToken') || '';
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(config => {
  // Add authorization header with token
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 unauthorized errors (token issues)
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;