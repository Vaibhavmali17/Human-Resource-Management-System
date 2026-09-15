import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [portalRole, setPortalRole] = useState('EMPLOYEE'); // 'EMPLOYEE' or 'ADMIN'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCapsLockCheck = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      
      const roles = user.roles || [];
      const isAdmin = roles.includes('ROLE_ADMIN');
      const isEmployee = roles.includes('ROLE_EMPLOYEE');

      if (portalRole === 'ADMIN') {
        if (!isAdmin) {
          setError('Login failed: Access denied. Account does not have HR / Admin privileges.');
          setLoading(false);
          return;
        }
        navigate('/admin');
      } else {
        // EMPLOYEE Portal tab
        if (isAdmin && !isEmployee) {
          setError('Login failed: Account is HR / Admin. Please switch to HR / Admin Portal tab above.');
          setLoading(false);
          return;
        }
        navigate('/employee');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Login failed. Please check credentials.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Network Error: Cannot connect to Spring Boot server at http://localhost:8080. Please ensure the backend is running.';
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Branded Left Panel */}
      <div className="login-brand-panel">
        <div className="brand-blob brand-blob-1"></div>
        <div className="brand-blob brand-blob-2"></div>
        <div className="brand-content">
          <div className="brand-logo-container">
            <svg className="brand-logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="brand-title">HRM Portal</h1>
          <p className="brand-tagline">HR made simple</p>
          <div className="brand-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Enterprise Resource Management
          </div>

          {/* Feature Chips */}
          <div className="brand-feature-list">
            <div className="brand-feature-chip">
              <div className="feature-chip-icon-wrapper">
                <svg className="feature-chip-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="feature-chip-text">
                <span className="feature-chip-title">AI Assistance</span>
                <span className="feature-chip-desc">Context-aware Gemini intelligence</span>
              </div>
            </div>

            <div className="brand-feature-chip">
              <div className="feature-chip-icon-wrapper">
                <svg className="feature-chip-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="feature-chip-text">
                <span className="feature-chip-title">Automated Workflows</span>
                <span className="feature-chip-desc">Instant onboarding & leave approvals</span>
              </div>
            </div>

            <div className="brand-feature-chip">
              <div className="feature-chip-icon-wrapper">
                <svg className="feature-chip-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="feature-chip-text">
                <span className="feature-chip-title">Enterprise Security</span>
                <span className="feature-chip-desc">Role-based JWT & encrypted sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Right Panel */}
      <div className="login-form-panel">
        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-card-title">Welcome Back</h2>
              <p className="login-card-subtitle">Sign in to manage your resource workspace</p>
            </div>

            {/* Segmented Pill Portal Switcher */}
            <div className={`portal-segmented-control ${portalRole === 'ADMIN' ? 'is-admin' : 'is-employee'}`}>
              <div className="segmented-indicator"></div>
              <button
                type="button"
                className={`segmented-tab ${portalRole === 'EMPLOYEE' ? 'active' : ''}`}
                onClick={() => { setPortalRole('EMPLOYEE'); setError(''); }}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Employee Portal</span>
              </button>
              <button
                type="button"
                className={`segmented-tab ${portalRole === 'ADMIN' ? 'active' : ''}`}
                onClick={() => { setPortalRole('ADMIN'); setError(''); }}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>HR / Admin Portal</span>
              </button>
            </div>

            {/* Error Alert Box */}
            {error && (
              <div className="login-error-alert">
                <span className="login-error-icon">⚠️</span>
                <div>{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="login-input-group">
                <div className="floating-input-wrapper">
                  <input
                    id="username-input"
                    type="text"
                    required
                    className="floating-input has-left-icon"
                    placeholder=" "
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                  <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <label htmlFor="username-input" className="floating-label has-left-icon">
                    {portalRole === 'ADMIN' ? 'HR / Admin Username' : 'Employee Username'}
                  </label>
                </div>
              </div>

              <div className="login-input-group">
                <div className="floating-input-wrapper">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="floating-input has-left-icon has-right-icon"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleCapsLockCheck}
                    onKeyUp={handleCapsLockCheck}
                    disabled={loading}
                  />
                  <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <label htmlFor="password-input" className="floating-label has-left-icon">
                    Password
                  </label>
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.017 19.017 0 014.2-4.9m3.3-2.1A9.97 9.97 0 0112 5c7 0 10 7 10 7a18.97 18.97 0 01-2.9 3.8m-4.2-2.1a3 3 0 11-4.24-4.24M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {capsLockOn && (
                  <div className="caps-lock-warning">
                    <svg className="caps-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Caps Lock is ON</span>
                  </div>
                )}
              </div>

              {/* Form Extra Options (Remember Me) */}
              <div className="login-form-options">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    className="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="32" strokeDashoffset="10" />
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign In as {portalRole === 'ADMIN' ? 'HR / Admin' : 'Employee'}</span>
                  </>
                )}
              </button>
            </form>

            {portalRole === 'ADMIN' ? (
              <p className="login-footer-text">
                Don't have HR access? Contact your system administrator.
              </p>
            ) : (
              <p className="login-footer-text">
                Don't have an account?{' '}
                <Link to="/register" className="login-link">
                  Register here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
