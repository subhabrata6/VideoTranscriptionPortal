import axios from 'axios';
import { showLoader, hideLoader } from '../Helpers/LoaderHelper';

const Api = axios.create({
  baseURL: 'https://localhost:7273/api',
});

let activeRequests = 0; // Tracks the number of active API calls

// Request Interceptor
Api.interceptors.request.use(
  (config) => {
    // Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';

    // Show loader
    activeRequests++;
    showLoader();

    return config;
  },
  (error) => {
    hideLoader();
    return Promise.reject(error);
  }
);

// Response Interceptor
Api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1); // Decrement and avoid negative count
    if (activeRequests === 0) hideLoader();

    // Return the backend response data directly
    return response.data;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) hideLoader();

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn('Unauthorized access. Redirecting to login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return; // Prevent further error handling
    }

    if (status === 500) {
      return Promise.reject({
        message: error.response?.data.message || 'Internal Server Error',
        success: false,
        status: 500,
        details: error.response?.data || null,
      });
    }

    return Promise.resolve(error.response?.data || { success: false, message: 'Unknown error' });
  }
);

export default Api;
