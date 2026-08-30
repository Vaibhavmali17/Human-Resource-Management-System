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
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          username: decoded.sub,
          userId: decoded.userId,
          roles: decoded.roles || [],
        });
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      const token = data.accessToken;
      localStorage.setItem('token', token);
      const decoded = decodeToken(token);
      const loggedUser = {
        username: decoded.sub,
        userId: decoded.userId,
        roles: decoded.roles || [],
      };
      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const registerUser = async (username, password, email, role) => {
    return await authService.register(username, password, email, role);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, register: registerUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
