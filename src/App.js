import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CryptoProvider } from './context/CryptoContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CryptoList from './components/Crypto/CryptoList';
import Watchlist from './components/Crypto/WatchList';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [activeTab, setActiveTab] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');

    const handleViewportChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <section className="app-loading" aria-live="polite">
          <div className="app-loading-spinner" aria-hidden="true" />
          <p className="app-loading-copy">Loading your dashboard...</p>
        </section>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <section className="auth-stage">
          <div className="auth-stage-copy enter-rise">
            <p className="auth-stage-kicker">SignalCrypt</p>
            <h1>Trade with clearer context.</h1>
            <p>
              Monitor market movement, build a focused watchlist, and stay locked on the assets that
              matter most to your strategy.
            </p>
          </div>

          {authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
          )}
        </section>
      </Layout>
    );
  }

  return (
    <CryptoProvider>
      <Layout>
        <section className="dashboard-shell">
          <header className="dashboard-hero enter-rise">
            <p className="dashboard-kicker">Live Market Feed</p>
            <h1>Premium Crypto Monitoring</h1>
            <p className="dashboard-subtitle">
              Real-time pricing, fast watchlist management, and clean signal-first visibility.
            </p>
          </header>

          {isMobile ? (
            <section className="dashboard-mobile enter-rise delay-1" aria-label="Mobile dashboard sections">
              <div className="dashboard-tabs" role="tablist" aria-label="Dashboard views">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'all'}
                  className={`dashboard-tab ${activeTab === 'all' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  Market
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'watchlist'}
                  className={`dashboard-tab ${activeTab === 'watchlist' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('watchlist')}
                >
                  Watchlist
                </button>
              </div>

              <div className="dashboard-mobile-panel">{activeTab === 'all' ? <CryptoList /> : <Watchlist />}</div>
            </section>
          ) : (
            <section className="dashboard-layout">
              <div className="dashboard-main enter-rise delay-1">
                <CryptoList />
              </div>
              <aside className="dashboard-aside enter-rise delay-2">
                <Watchlist />
              </aside>
            </section>
          )}
        </section>
      </Layout>
    </CryptoProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
