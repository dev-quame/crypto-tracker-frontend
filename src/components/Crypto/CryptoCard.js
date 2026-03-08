import { useMemo, useState } from 'react';
import { cryptoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const formatCompactCurrency = (value, maximumFractionDigits = 2) => {
  if (!Number.isFinite(value)) {
    return '--';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits,
  }).format(value);
};

const formatFullCurrency = (value) => {
  if (!Number.isFinite(value)) {
    return '$--';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value);
};

const CryptoCard = ({ crypto, index = 0 }) => {
  const { isAuthenticated, user, addToLocalWatchlist } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isInWatchlist = useMemo(() => {
    return user?.watchlist?.some((item) => item.coinId === crypto.id) || false;
  }, [crypto.id, user?.watchlist]);

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      setFeedback('Sign in to add coins to your watchlist.');
      return;
    }

    if (isInWatchlist) {
      return;
    }

    setIsSaving(true);
    setFeedback('');

    try {
      await cryptoAPI.addToWatchlist({
        coinId: crypto.id,
        coinName: crypto.name,
      });

      addToLocalWatchlist(crypto.id, crypto.name);
      setFeedback('Added to watchlist.');
    } catch (error) {
      if (error.response?.status === 400) {
        setFeedback('Already in watchlist.');
      } else {
        setFeedback('Could not add coin right now.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const priceChange = Number.isFinite(crypto.price_change_percentage_24h)
    ? crypto.price_change_percentage_24h
    : 0;
  const isPositive = priceChange >= 0;
  const rank = Number.isFinite(crypto.market_cap_rank) ? `#${crypto.market_cap_rank}` : '#--';

  return (
    <article className="coin-card" style={{ '--stagger-index': index }}>
      <header className="coin-header">
        <div className="coin-identity">
          <img
            src={crypto.image || 'https://via.placeholder.com/48'}
            alt={crypto.name}
            className="coin-image"
            loading="lazy"
            onError={(event) => {
              event.target.onerror = null;
              event.target.src = 'https://via.placeholder.com/48';
            }}
          />

          <div>
            <h3>{crypto.name || 'Unknown Coin'}</h3>
            <p>{(crypto.symbol || '').toUpperCase()}</p>
          </div>
        </div>

        <span className="coin-rank">{rank}</span>
      </header>

      <div className="coin-price-block">
        <p className="coin-price">{formatFullCurrency(crypto.current_price)}</p>
        <p className={`coin-change ${isPositive ? 'is-up' : 'is-down'}`}>
          {isPositive ? '+' : '-'}{Math.abs(priceChange).toFixed(2)}%
        </p>
      </div>

      <dl className="coin-stats">
        <div>
          <dt>Market Cap</dt>
          <dd>{formatCompactCurrency(crypto.market_cap)}</dd>
        </div>
        <div>
          <dt>24h Volume</dt>
          <dd>{formatCompactCurrency(crypto.total_volume)}</dd>
        </div>
      </dl>

      {isAuthenticated && (
        <button
          type="button"
          onClick={handleAddToWatchlist}
          disabled={isSaving || isInWatchlist}
          className={`btn coin-action ${isInWatchlist ? 'is-added' : ''} ${isSaving ? 'is-busy' : ''}`}
        >
          {isSaving ? 'Adding...' : isInWatchlist ? 'In watchlist' : 'Add to watchlist'}
        </button>
      )}

      {feedback && <p className="coin-feedback">{feedback}</p>}
    </article>
  );
};

export default CryptoCard;
