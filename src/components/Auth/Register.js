import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { register, serverWarming } = useAuth();

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.username.trim().length < 3) {
      setMessage('Username must be at least 3 characters.');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage('');

    const result = await register(formData.username, formData.email, formData.password);

    if (result.success) {
      setMessage('Registration successful. Building your workspace...');
    } else {
      setMessage(result.error);
    }

    setLoading(false);
  };

  return (
    <article className="auth-card enter-rise delay-1" aria-label="Register">
      <div className="auth-card-head">
        <h2>Create account</h2>
        <p>Start tracking assets with your own watchlist.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="field-group" htmlFor="register-username">
          <span>Username</span>
          <input
            id="register-username"
            type="text"
            name="username"
            placeholder="Trading handle"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </label>

        <label className="field-group" htmlFor="register-email">
          <span>Email</span>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>

        <label className="field-group" htmlFor="register-password">
          <span>Password</span>
          <input
            id="register-password"
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </label>

        <label className="field-group" htmlFor="register-confirm-password">
          <span>Confirm password</span>
          <input
            id="register-confirm-password"
            type="password"
            name="confirmPassword"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
          {loading ? (serverWarming ? 'Waking server...' : 'Creating account...') : 'Create account'}
        </button>
      </form>

      {message && (
        <p className={`auth-message ${message.toLowerCase().includes('successful') ? 'is-success' : 'is-error'}`}>
          {message}
        </p>
      )}

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="link-button">
          Sign in
        </button>
      </p>
    </article>
  );
};

export default Register;
