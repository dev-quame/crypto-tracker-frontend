import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (isProduction ? 'https://crypto-tracker-api.onrender.com/api' : 'http://localhost:5000/api');

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
