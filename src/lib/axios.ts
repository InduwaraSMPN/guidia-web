import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: '/'
});

// Add a request interceptor to add the token
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Try to verify the token first
          await verifyToken(token);
          // If verification succeeds, retry the original request
          return axiosInstance(error.config);
        } catch (verifyError) {
          // Only remove token and redirect if verification fails
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        }
      } else {
        // No token found, redirect to login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
