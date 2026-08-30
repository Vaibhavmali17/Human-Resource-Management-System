import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_EMPLOYEE');
  // Onboarding fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const onboardingData = role === 'ROLE_EMPLOYEE' ? {
        firstName,
        lastName,
        phone,
        department,
        designation,
        dateOfJoining: dateOfJoining || null,
        address
      } : {};
      await register(username, password, email, role, onboardingData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    padding: '40px 16px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    background: 'radial-gradient(circle at top, #1e293b, #0f172a)',
    color: '#f8fafc',
    fontFamily: "'Outfit', 'Inter', sans-serif"
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textAlign: 'center',
    background: 'linear-gradient(to right, #38bdf8, #22c55e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const subtitleStyle = {
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '2rem',
    textAlign: 'center'
  };

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
    background: 'linear-gradient(135deg, #22c55e, #15803d)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)',
    transition: 'transform 0.1s, opacity 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Register Account</h2>
        <p style={subtitleStyle}>Join the team management portal</p>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '0.75rem', color: '#86efac', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username</label>
            <input 
              type="text" 
              required 
              style={inputStyle} 
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              required 
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              required 
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Access Role</label>
            <select 
              style={inputStyle}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ROLE_EMPLOYEE">Employee (ESS)</option>
              <option value="ROLE_ADMIN">Admin (HR)</option>
            </select>
          </div>

          {role === 'ROLE_EMPLOYEE' && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#38bdf8' }}>Employee Profile Onboarding</h3>
              
              <div style={inputGroupStyle}>
                <label style={labelStyle}>First Name</label>
                <input 
                  type="text" 
                  required 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Last Name</label>
                <input 
                  type="text" 
                  required 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Phone Number</label>
                <input 
                  type="text" 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  placeholder="e.g. +1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Department</label>
                <input 
                  type="text" 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Designation</label>
                <input 
                  type="text" 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  placeholder="e.g. Software Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Date of Joining</label>
                <input 
                  type="date" 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Address</label>
                <input 
                  type="text" 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  placeholder="e.g. 123 Main St, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" style={buttonStyle}>
            Create Account
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
          Already have an account? <Link to="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
