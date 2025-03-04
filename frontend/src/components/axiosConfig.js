// axiosConfig.js
import axios from 'axios';

// Create axios instance with default config
const instance = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 10000 // Add timeout to avoid long waits if server is down
});

// Add a request interceptor to attach the auth token to all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle connection errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle connection errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout: Server is not responding');
        error.message = 'Server is not responding. Please try again later.';
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('Network error: Cannot connect to server');
        error.message = 'Cannot connect to authentication server. Please check if the server is running.';
      }
    } else {
      // Log detailed information about server errors
      console.error('Server error details:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
        method: error.config.method
      });
    }
    
    return Promise.reject(error);
  }
);

export default instance;