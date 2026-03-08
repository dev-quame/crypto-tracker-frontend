import { useMemo, useState } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import CryptoCard from './CryptoCard';

const SKELETON_CARDS = Array.from({ length: 8 }, (_, index) => index);

const CryptoList = () => {
  const { allCryptos, loading, error, marketDegraded, refresh, lastUpdated } = useCrypto();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isAwaitingMarketData = marketDegraded && allCryptos.length === 0;

  const filteredCryptos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return allCryptos;
    }

    return allCryptos.filter((crypto) => {
      return (
        crypto.name.toLowerCase().includes(normalizedSearch) ||
        crypto.symbol.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [allCryptos, searchTerm]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 280);
    }
  };

  if (loading) {
    return (
      <section className="market-section" aria-live="polite">
        <header className="market-header">
          <div className="market-title-block">
            <p className="section-kicker">Market Overview</p>
            <h2>Top Cryptocurrencies</h2>
            <p className="market-meta">Syncing live market feed...</p>
          </div>
        </header>
        <div className="crypto-grid">
          {SKELETON_CARDS.map((index) => (
            <article key={`skeleton-${index}`} className="coin-card coin-card-skeleton" aria-hidden="true">
              <div className="skeleton-line is-wide" />
              <div className="skeleton-line is-mid" />
              <div className="skeleton-line is-mid" />
              <div className="skeleton-line is-small" />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="status-card is-error" aria-live="assertive">
        <p>{error}</p>
        <button type="button" onClick={handleRefresh} className="btn btn-primary">
          Retry
        </button>
      </section>
    );
  }

  const formattedUpdate =
    lastUpdated > 0
      ? new Intl.DateTimeFormat(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(lastUpdated)
      : 'Waiting for first sync';

  return (
    <section className="market-section">
      <header className="market-header">
        <div className="market-title-block">
          <p className="section-kicker">Market Overview</p>
          <h2>Top Cryptocurrencies</h2>
          {isAwaitingMarketData ? (
            <p className="market-meta">Feed is syncing with the market provider. Retrying automatically...</p>
          ) : (
            <p className="market-meta">
              Showing {filteredCryptos.length} of {allCryptos.length} assets. Last update: {formattedUpdate}
            </p>
          )}
        </div>

        <div className="market-controls">
          <label className="search-field" htmlFor="crypto-search">
            <span className="sr-only">Search coins</span>
            <input
              id="crypto-search"
              type="text"
              placeholder="Search by name or symbol"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={handleRefresh}
            className={`btn btn-secondary ${isRefreshing ? 'is-busy' : ''}`}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh prices'}
          </button>
        </div>
      </header>

      {isAwaitingMarketData ? (
        <div className="status-card" aria-live="polite">
          <p>Live market data is temporarily unavailable. We are retrying in the background.</p>
          <button type="button" onClick={handleRefresh} className="btn btn-secondary">
            Retry now
          </button>
        </div>
      ) : filteredCryptos.length === 0 ? (
        <div className="status-card">
          <p>
            {searchTerm
              ? `No results for "${searchTerm}". Try another search term.`
              : 'No assets available right now. Try refreshing in a moment.'}
          </p>
        </div>
      ) : (
        <div className="crypto-grid">
          {filteredCryptos.map((crypto, index) => (
            <CryptoCard key={crypto.id} crypto={crypto} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CryptoList;
