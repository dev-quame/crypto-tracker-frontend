import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login } = useAuth();

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setMessage('Login successful. Preparing your dashboard...');
    } else {
      setMessage(result.error);
    }

    setLoading(false);
  };

  return (
    <article className="auth-card enter-rise delay-1" aria-label="Login">
      <div className="auth-card-head">
        <h2>Welcome back</h2>
        <p>Sign in to continue tracking market movement.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="field-group" htmlFor="login-email">
          <span>Email</span>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>

        <label className="field-group" htmlFor="login-password">
          <span>Password</span>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {message && (
        <p className={`auth-message ${message.toLowerCase().includes('successful') ? 'is-success' : 'is-error'}`}>
          {message}
        </p>
      )}

      <p className="auth-switch">
        New here?{' '}
        <button type="button" onClick={onSwitchToRegister} className="link-button">
          Create an account
        </button>
      </p>
    </article>
  );
};

export default Login;
