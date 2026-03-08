import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { cryptoAPI } from '../services/api';

const CryptoContext = createContext();

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

export const CryptoProvider = ({ children }) => {
  const [allCryptos, setAllCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marketDegraded, setMarketDegraded] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const allCryptosRef = useRef([]);
  const degradedRetryTimeoutRef = useRef(null);

  useEffect(() => {
    allCryptosRef.current = allCryptos;
  }, [allCryptos]);

  const fetchAllCryptos = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();
      const hasExistingData = allCryptosRef.current.length > 0;

      if (!forceRefresh && now - lastFetchTime < 5000) {
        return;
      }

      try {
        if (!hasExistingData) {
          setLoading(true);
        }

        const response = await cryptoAPI.getTopCryptos({
          force: forceRefresh,
          coldStart: !hasExistingData,
        });
        const dataSource = response.headers?.['x-data-source'];
        const coins = Array.isArray(response.data) ? response.data : [];
        const isDegradedEmpty = coins.length === 0 && dataSource === 'degraded-empty';

        if (isDegradedEmpty) {
          setMarketDegraded(true);
          setError('');
          if (!degradedRetryTimeoutRef.current) {
            degradedRetryTimeoutRef.current = setTimeout(() => {
              degradedRetryTimeoutRef.current = null;
              fetchAllCryptos(true);
            }, 8000);
          }
          return;
        }

        if (degradedRetryTimeoutRef.current) {
          clearTimeout(degradedRetryTimeoutRef.current);
          degradedRetryTimeoutRef.current = null;
        }

        const transformedData = coins.map((coin) => {
          const priceChange = Number.isFinite(coin.price_change_percentage_24h)
            ? coin.price_change_percentage_24h
            : 0;

          return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            current_price: coin.current_price,
            price_change_percentage_24h: priceChange,
            market_cap: coin.market_cap,
            market_cap_rank: coin.market_cap_rank,
            total_volume: coin.total_volume,
            marketCapB: coin.market_cap ? `$${(coin.market_cap / 1000000000).toFixed(2)}B` : '--',
            volumeM: coin.total_volume ? `$${(coin.total_volume / 1000000).toFixed(2)}M` : '--',
            formattedPrice: coin.current_price ? `$${coin.current_price.toLocaleString()}` : '$--',
            priceChangeFormatted: `${priceChange >= 0 ? '+' : '-'}${Math.abs(priceChange).toFixed(2)}%`,
          };
        });

        setAllCryptos(transformedData);
        setMarketDegraded(false);
        setError('');
        setLastFetchTime(now);
      } catch (fetchError) {
        console.error('Error fetching cryptocurrencies:', fetchError);
        setError('Failed to fetch cryptocurrency data. Please try again.');

        setTimeout(() => fetchAllCryptos(true), 10000);
      } finally {
        setLoading(false);
      }
    },
    [lastFetchTime]
  );

  useEffect(() => {
    fetchAllCryptos();
  }, [fetchAllCryptos]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchAllCryptos();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchAllCryptos]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastFetchTime > 30000) {
          fetchAllCryptos();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAllCryptos, lastFetchTime]);

  const value = {
    allCryptos,
    loading,
    error,
    marketDegraded,
    refresh: () => fetchAllCryptos(true),
    lastUpdated: lastFetchTime,
  };

  useEffect(
    () => () => {
      if (degradedRetryTimeoutRef.current) {
        clearTimeout(degradedRetryTimeoutRef.current);
      }
    },
    []
  );

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
};
