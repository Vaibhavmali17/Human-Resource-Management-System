import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const mustChange = localStorage.getItem('mustChangePassword') === 'true';
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          username: decoded.sub,
          userId: decoded.userId,
          roles: decoded.roles || [],
          mustChangePassword: mustChange,
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('mustChangePassword');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      const token = data.accessToken;
      const mustChange = !!data.mustChangePassword;
      localStorage.setItem('token', token);
      localStorage.setItem('mustChangePassword', mustChange ? 'true' : 'false');
      const decoded = decodeToken(token);
      const loggedUser = {
        username: decoded.sub,
        userId: decoded.userId,
        roles: decoded.roles || [],
        mustChangePassword: mustChange,
      };
      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateUserMustChangePassword = (val) => {
    localStorage.setItem('mustChangePassword', val ? 'true' : 'false');
    setUser((prev) => (prev ? { ...prev, mustChangePassword: val } : null));
  };

  const registerUser = async (username, password, email, role, onboardingData = {}) => {
    return await authService.register(username, password, email, role, onboardingData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mustChangePassword');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, register: registerUser, logout: logoutUser, updateUserMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
