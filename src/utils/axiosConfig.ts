// src/utils/axiosConfig.ts
import axios from 'axios';
import { API_BASE_URL, getToken, isTokenExpired, removeToken } from '../config/api';

// Create axios instance - API_BASE_URL already includes the full URL (e.g., http://localhost:3004)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor - Add token to headers and check expiration
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    // Check if token is expired before making request
    if (token && isTokenExpired(token)) {
      removeToken();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signin") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error('Token expired'));
    }

    // Add token to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401/403 responses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        removeToken();
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signin") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


