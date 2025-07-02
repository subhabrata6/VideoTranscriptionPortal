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

// Request Interceptor
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';

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

    // Refresh token on 401
    if ((status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
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
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          Api.baseURL + '/Auth/refresh-token',
          JSON.stringify(refreshToken),
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        console.log("Refresh token called successfully", res.data);
        const { token, refreshToken: newRefreshToken, expires } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken || refreshToken);
        localStorage.setItem('expires', expires);

        processQueue(null, token);

        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return Api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
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

export default Api;
