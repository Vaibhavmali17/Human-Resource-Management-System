import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, updateUserMustChangePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setSuccess(typeof res === 'string' ? res : 'Password updated successfully!');
      if (updateUserMustChangePassword) {
        updateUserMustChangePassword(false);
      }
      setTimeout(() => {
        const isAdmin = user?.roles?.includes('ROLE_ADMIN');
        navigate(isAdmin ? '/admin' : '/employee');
      }, 1200);
    } catch (err) {
      console.error('Password change error:', err);
      let errorMsg = 'Failed to change password. Please check your current password.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0b1329',
      color: '#f8fafc',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        backgroundColor: '#111c44',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#38bdf8', textAlign: 'center' }}>
          Change Password Required
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.75rem', textAlign: 'center' }}>
          Your account requires a password change before continuing to your dashboard.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            color: '#86efac',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            ✓ {success} Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Current (Temporary) Password
            </label>
            <input 
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#0b1329',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.5rem' }}>
              New Password
            </label>
            <input 
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#0b1329',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Confirm New Password
            </label>
            <input 
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#0b1329',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
            }}
          >
            {loading ? 'Updating Password...' : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
