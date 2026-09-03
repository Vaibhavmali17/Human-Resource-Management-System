import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [portalRole, setPortalRole] = useState('EMPLOYEE'); // 'EMPLOYEE' or 'ADMIN'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(username, password);
      
      const roles = user.roles || [];
      const isAdmin = roles.includes('ROLE_ADMIN');
      const isEmployee = roles.includes('ROLE_EMPLOYEE');

      if (portalRole === 'ADMIN') {
        if (!isAdmin) {
          setError('Login failed: Access denied. Account does not have HR / Admin privileges.');
          return;
        }
        navigate('/admin');
      } else {
        // EMPLOYEE Portal tab
        if (isAdmin && !isEmployee) {
          setError('Login failed: Account is HR / Admin. Please switch to HR / Admin Portal tab above.');
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
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    background: 'radial-gradient(circle at top, #1e293b, #0f172a)',
    color: '#f8fafc',
    fontFamily: "'Outfit', 'Inter', sans-serif"
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem',
    background: 'rgba(30, 41, 59, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    textAlign: 'center',
    color: portalRole === 'ADMIN' ? '#f43f5e' : '#38bdf8',
    transition: 'all 0.3s ease'
  };

  const subtitleStyle = {
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
    textAlign: 'center'
  };

  const tabContainerStyle = {
    display: 'flex',
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '1.75rem',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  const getTabStyle = (role) => ({
    flex: 1,
    padding: '0.6rem 0.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: portalRole === role 
      ? (role === 'ADMIN' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'linear-gradient(135deg, #0284c7, #0369a1)')
      : 'transparent',
    color: portalRole === role ? '#ffffff' : '#94a3b8',
    boxShadow: portalRole === role ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none'
  });

  const inputGroupStyle = {
    marginBottom: '1.25rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#cbd5e1',
    marginBottom: '0.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    background: portalRole === 'ADMIN' 
      ? 'linear-gradient(135deg, #e11d48, #be123c)' 
      : 'linear-gradient(135deg, #38bdf8, #0369a1)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1.5rem',
    boxShadow: portalRole === 'ADMIN'
      ? '0 4px 12px rgba(225, 29, 72, 0.3)'
      : '0 4px 12px rgba(56, 189, 248, 0.3)',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>HRM Portal</h2>
        <p style={subtitleStyle}>Sign in to manage your resource workspace</p>
        
        {/* Portal Switcher Tabs */}
        <div style={tabContainerStyle}>
          <button 
            type="button" 
            style={getTabStyle('EMPLOYEE')} 
            onClick={() => { setPortalRole('EMPLOYEE'); setError(''); }}
          >
            Employee Portal
          </button>
          <button 
            type="button" 
            style={getTabStyle('ADMIN')} 
            onClick={() => { setPortalRole('ADMIN'); setError(''); }}
          >
            HR / Admin Portal
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>{portalRole === 'ADMIN' ? 'HR / Admin Username' : 'Employee Username'}</label>
            <input 
              type="text" 
              required 
              style={inputStyle} 
              placeholder={portalRole === 'ADMIN' ? 'e.g. admin' : 'e.g. john_doe'}
              onFocus={(e) => e.target.style.borderColor = portalRole === 'ADMIN' ? '#f43f5e' : '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              required 
              style={inputStyle}
              placeholder="••••••••"
              onFocus={(e) => e.target.style.borderColor = portalRole === 'ADMIN' ? '#f43f5e' : '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Sign In as {portalRole === 'ADMIN' ? 'HR / Admin' : 'Employee'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
          Don't have an account? <Link to="/register" style={{ color: portalRole === 'ADMIN' ? '#fb923c' : '#38bdf8', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

