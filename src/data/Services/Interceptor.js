import axios from 'axios';

const Api = axios.create({
  baseURL: 'https://localhost:7273/api',
});

// Request Interceptor
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
Api.interceptors.response.use(
  (response) => {
    // Always return the data (even if success: false) so caller can handle it
    return response.data;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn('Unauthorized access. Redirecting to login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return; // Stop further handling
    }

    if (status === 500) {
      // Throw only for actual server errors
      return Promise.reject({
        message: error.response?.data.message || 'Internal Server Error',
        success: false,
        status: 500,
        details: error.response?.data || null,
      });
    }

    // For other non-200 errors, return the backend response data (not throw)
    return Promise.resolve(error.response?.data || { success: false, message: 'Unknown error' });
  }
);

export default Api;
