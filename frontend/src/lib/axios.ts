import axios from 'axios';
import { getValidToken } from './tokenRefresh';
import { getCsrfToken } from './csrfToken';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: '/'
});

// Add a request interceptor to add the token and CSRF token
axiosInstance.interceptors.request.use(
  async (config: any) => {
    try {
      // Get a valid token (will refresh if needed)
      const token = await getValidToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;

      // Add CSRF token for mutating requests (POST, PUT, DELETE, PATCH)
      if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
    } catch (error) {
      console.error('Error getting valid token:', error);
      // If we can't get a valid token, proceed without it
      // The server will return 401 and the response interceptor will handle it
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
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if the error is due to an expired token
        const isExpiredToken = error.response?.data?.code === 'TOKEN_EXPIRED';

        if (isExpiredToken) {
          // Try to get a valid token (will refresh if needed)
          await getValidToken();

          // Retry the original request with the new token
          return axiosInstance(originalRequest);
        } else {
          // For other auth errors, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If token refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
