import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, systemAPI, apiTimeouts } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverWarming, setServerWarming] = useState(false);
  const token = localStorage.getItem('token');

  const warmServer = async () => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    setServerWarming(true);
    try {
      await systemAPI.warmup(true);
    } catch (error) {
      // Best-effort warmup. The follow-up request still tries.
    } finally {
      setServerWarming(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.me({ timeout: apiTimeouts.coldStart });
        setUser(res.data.user); 
      } catch (err) {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          await warmServer();
          try {
            const retryRes = await authAPI.me({ timeout: apiTimeouts.coldStart });
            setUser(retryRes.data.user);
          } catch (retryErr) {
            console.error('Failed to validate token:', retryErr);
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  useEffect(() => {
    warmServer();
  }, []);

  const login = async (email, password) => {
    try {
      await warmServer();
      const response = await authAPI.login(
        { email, password },
        { timeout: apiTimeouts.coldStart }
      );
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      const isLikelyColdStartIssue =
        error.code === 'ERR_NETWORK' || !error.response || error.response.status >= 500;

      return {
        success: false,
        error: isLikelyColdStartIssue
          ? 'Server is waking up. Please retry in a few seconds.'
          : error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      await warmServer();
      const response = await authAPI.register(
        { username, email, password },
        { timeout: apiTimeouts.coldStart }
      );
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      const isLikelyColdStartIssue =
        error.code === 'ERR_NETWORK' || !error.response || error.response.status >= 500;

      return {
        success: false,
        error: isLikelyColdStartIssue
          ? 'Server is waking up. Please retry in a few seconds.'
          : error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const addToLocalWatchlist = (coinId, coinName) => {
    setUser(prev => {
      if (!prev) return prev;
      const exists = prev.watchlist?.some(w => w.coinId === coinId);
      if (exists) return prev;
      return { 
        ...prev, 
        watchlist: [...(prev.watchlist || []), { coinId, coinName }] 
      };
    });
  };

  const removeFromLocalWatchlist = (coinId) => {
    setUser(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        watchlist: (prev.watchlist || []).filter(w => w.coinId !== coinId) 
      };
    });
  };

  const value = {
    user,
    addToLocalWatchlist,
    removeFromLocalWatchlist,
    login,
    register,
    logout,
    serverWarming,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
