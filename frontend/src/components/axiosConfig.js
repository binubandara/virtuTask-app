import axios from 'axios';

// Set the base URL for all API requests
// This should point to your login/registration backend
const instance = axios.create({
  baseURL: 'http://localhost:5001'
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

export default instance;