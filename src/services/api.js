import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_API_BASE_URL = isProduction
  ? 'https://signalcrypt-api.onrender.com/api'
  : 'http://localhost:5000/api';
const API_TIMEOUT_MS = 15000;
const COLD_START_TIMEOUT_MS = 70000;

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
  timeout: API_TIMEOUT_MS,
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
  register: (userData, config = {}) => api.post('/auth/register', userData, config),
  login: (userData, config = {}) => api.post('/auth/login', userData, config),
  me: (config = {}) => api.get('/auth/me', config),
};

export const cryptoAPI = {
  getTopCryptos: ({ force = false, coldStart = false } = {}) =>
    api.get('/crypto/top', {
      params: force ? { force: '1' } : undefined,
      timeout: coldStart ? COLD_START_TIMEOUT_MS : API_TIMEOUT_MS,
    }),
  getCoinDetail: (id) => api.get(`/crypto/coin/${id}`),
  addToWatchlist: (coinData) => api.post('/crypto/watchlist', coinData),
  removeFromWatchlist: (coinId) => api.delete(`/crypto/watchlist/${coinId}`),
  getWatchlist: () => api.get('/crypto/watchlist'),
};

export const systemAPI = {
  warmup: (coldStart = true) =>
    api.get('/health', {
      timeout: coldStart ? COLD_START_TIMEOUT_MS : API_TIMEOUT_MS,
    }),
};

export const apiTimeouts = {
  normal: API_TIMEOUT_MS,
  coldStart: COLD_START_TIMEOUT_MS,
};

export default api;
