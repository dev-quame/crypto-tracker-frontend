import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_API_BASE_URL = isProduction
  ? 'https://signalcrypt-api.onrender.com/api'
  : 'http://localhost:5000/api';

const normalizeApiBaseUrl = (rawUrl) => {
  const sanitized = String(rawUrl || '').trim().replace(/\/+$/, '');

  if (!sanitized) {
    return DEFAULT_API_BASE_URL;
  }

  if (sanitized.endsWith('/api')) {
    return sanitized;
  }

  return `${sanitized}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  me: () => api.get('/auth/me'),
};

export const cryptoAPI = {
  getTopCryptos: () => api.get('/crypto/top'),
  getCoinDetail: (id) => api.get(`/crypto/coin/${id}`),
  addToWatchlist: (coinData) => api.post('/crypto/watchlist', coinData),
  removeFromWatchlist: (coinId) => api.delete(`/crypto/watchlist/${coinId}`),
  getWatchlist: () => api.get('/crypto/watchlist'),
};

export default api;
