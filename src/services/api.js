import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const LOCAL_API_BASE_URL = 'http://localhost:5000/api';
const PROD_API_CANDIDATES = [
  process.env.REACT_APP_API_BASE_URL,
  'https://crytpto-tracker-api.onrender.com/api',
  'https://crypto-tracker-api.onrender.com/api',
].filter(Boolean);

let currentApiCandidateIndex = 0;
const getActiveApiBaseUrl = () => {
  if (!isProduction) {
    return LOCAL_API_BASE_URL;
  }
  return PROD_API_CANDIDATES[currentApiCandidateIndex];
};

const api = axios.create({
  baseURL: getActiveApiBaseUrl(),
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestConfig = error.config || {};
    const canFailOver =
      isProduction &&
      currentApiCandidateIndex < PROD_API_CANDIDATES.length - 1 &&
      !requestConfig.__apiFailoverAttempted &&
      (error.code === 'ERR_NETWORK' ||
        error.response?.status === 404 ||
        error.response?.status === 502 ||
        error.response?.status === 503);

    if (canFailOver) {
      currentApiCandidateIndex += 1;
      const nextBaseUrl = getActiveApiBaseUrl();

      api.defaults.baseURL = nextBaseUrl;
      requestConfig.baseURL = nextBaseUrl;
      requestConfig.__apiFailoverAttempted = true;

      return api(requestConfig);
    }

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
