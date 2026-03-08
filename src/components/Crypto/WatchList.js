import { useCrypto } from '../../context/CryptoContext';
import { cryptoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SKELETON_ITEMS = Array.from({ length: 5 }, (_, index) => index);

const formatPrice = (value) => {
  if (!Number.isFinite(value)) {
    return '$--';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value);
};

const Watchlist = () => {
  const { allCryptos, loading: cryptoLoading } = useCrypto();
  const { isAuthenticated, user, removeFromLocalWatchlist } = useAuth();

  const watchlistCoins = allCryptos.filter((crypto) =>
    user?.watchlist?.some((entry) => entry.coinId === crypto.id)
  );

  const removeFromWatchlist = async (coinId) => {
    try {
      await cryptoAPI.removeFromWatchlist(coinId);
      removeFromLocalWatchlist(coinId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="watchlist-panel">
        <header className="watchlist-head">
          <h3>Watchlist</h3>
        </header>
        <p className="watchlist-empty">Sign in to build and manage your watchlist.</p>
      </section>
    );
  }

  if (cryptoLoading) {
    return (
      <section className="watchlist-panel" aria-live="polite">
        <header className="watchlist-head">
          <h3>Watchlist</h3>
        </header>
        <ul className="watchlist-list" aria-hidden="true">
          {SKELETON_ITEMS.map((index) => (
            <li key={`watchlist-skeleton-${index}`} className="watchlist-item watchlist-skeleton">
              <div className="skeleton-line is-mid" />
              <div className="skeleton-line is-small" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="watchlist-panel">
      <header className="watchlist-head">
        <h3>Your Watchlist</h3>
        <span className="watchlist-count">{watchlistCoins.length}</span>
      </header>

      {watchlistCoins.length === 0 ? (
        <div className="watchlist-empty-state">
          <p>No coins added yet.</p>
          <p>Select assets from the market list to monitor them here.</p>
        </div>
      ) : (
        <ul className="watchlist-list" aria-label="Tracked coins">
          {watchlistCoins.map((coin, index) => {
            const priceChange = Number.isFinite(coin.price_change_percentage_24h)
              ? coin.price_change_percentage_24h
              : 0;

            return (
              <li key={coin.id} className="watchlist-item" style={{ '--stagger-index': index }}>
                <div className="watchlist-coin">
                  <img src={coin.image} alt={coin.name} className="watchlist-image" loading="lazy" />

                  <div>
                    <p className="watchlist-name">{coin.name}</p>
                    <p className="watchlist-symbol">{coin.symbol.toUpperCase()}</p>
                  </div>
                </div>

                <div className="watchlist-value">
                  <p>{formatPrice(coin.current_price)}</p>
                  <p className={priceChange >= 0 ? 'is-up' : 'is-down'}>
                    {priceChange >= 0 ? '+' : '-'}{Math.abs(priceChange).toFixed(2)}%
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromWatchlist(coin.id)}
                  className="watchlist-remove"
                  aria-label={`Remove ${coin.name} from watchlist`}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default Watchlist;
