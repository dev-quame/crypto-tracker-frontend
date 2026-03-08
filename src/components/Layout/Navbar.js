import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="topbar-wrap">
      <nav className="topbar" aria-label="Primary">
        <div className="topbar-brand">
          <span className="brand-mark" aria-hidden="true">
            SC
          </span>
          <div className="brand-copy">
            <strong>SignalCrypt</strong>
            <span>Signal-driven market awareness</span>
          </div>
        </div>

        <div className="topbar-aSCions">
          {isAuthenticated ? (
            <>
              <p className="topbar-user">
                Signed in as <span>{user?.username}</span>
              </p>
              <button type="button" onClick={logout} className="btn btn-ghost">
                Sign out
              </button>
            </>
          ) : (
            <p className="topbar-note">Sign in to personalize your watchlist.</p>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
