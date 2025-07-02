// src/data/Services/Interceptor.js
import axios from 'axios';
import { showLoader, hideLoader } from '../Helpers/LoaderHelper';

const Api = axios.create({
  baseURL: 'https://localhost:7273/api',
  withCredentials: true,
});

let activeRequests = 0;
let isRefreshing = false;
let failedQueue = [];
let scheduledRefreshTimeout = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const scheduleTokenRefresh = () => {
  const rememberMe = localStorage.getItem('rememberCredentials');
  const expires = localStorage.getItem('expires');

  if (!rememberMe || !expires) return;

  const expiryTime = new Date(expires).getTime();
  const now = Date.now();
  const refreshTime = expiryTime - now - 5 * 60 * 1000; // 5 minutes before expiry

  if (refreshTime <= 0) return; // Already expired or too close to expiry

  if (scheduledRefreshTimeout) clearTimeout(scheduledRefreshTimeout);

  scheduledRefreshTimeout = setTimeout(() => {
    refreshAccessToken();
  }, refreshTime);
};

const refreshAccessToken = async () => {
  const remember = localStorage.getItem('rememberCredentials');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!remember || !refreshToken) return;

  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const response = await axios.post(
      `${Api.defaults.baseURL}/Auth/refresh-token`,
      JSON.stringify(refreshToken),
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    );

    const result = response?.data?.data;
    if (!result || !result.token) {
      console.error('No token returned in response data:', response?.data);
      throw new Error('Invalid refresh token response structure');
    }

    const { token, refreshToken: newRefreshToken, expires } = result;

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken || refreshToken);
    localStorage.setItem('expires', expires);

    scheduleTokenRefresh(); // If you’ve implemented scheduled refresh
    processQueue(null, token);

    return token;
  } catch (err) {
    console.error('Token refresh failed', err);
    processQueue(err, null);
    localStorage.clear();
    window.location.href = '/login';
    throw err;
  } finally {
    isRefreshing = false;
  }
};


// Request Interceptor
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const expires = localStorage.getItem('expires');
    const rememberMe = localStorage.getItem('rememberCredentials');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';

    // Enforce HTTPS
    if (!config.url.startsWith('https://')) {
      config.url = config.url.replace(/^http:/, 'https:');
    }

    // Auto-refresh check: if within 5 min of expiry and rememberMe is enabled
    if (expires && rememberMe) {
      const expiryTime = new Date(expires).getTime();
      const now = Date.now();
      if (expiryTime - now <= 5 * 60 * 1000) {
        refreshAccessToken();
      }
    }

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
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) hideLoader();

    return response.data;
  },
  async (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) hideLoader();

    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const remember = localStorage.getItem('rememberCredentials');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!remember || !refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              resolve(Api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      try {
        await refreshAccessToken();
        const token = localStorage.getItem('token');
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return Api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
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

scheduleTokenRefresh(); // Trigger initial scheduling on load

export default Api;
