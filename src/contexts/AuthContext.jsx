import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await apiService.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Suppress error log since 401 is expected if not logged in
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await apiService.login(credentials);
      setUser(userData.user);
      setIsAuthenticated(true);
      return userData.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const newUser = await apiService.signup(userData);
      setUser(newUser.user);
      setIsAuthenticated(true);
      return newUser.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    apiService.removeToken();
  }, []);

  // 30 minutes of inactivity auto-logout tracking
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);

      // Set timeout for 30 minutes (30 * 60 * 1000 ms)
      timeoutId = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000);
    };

    if (isAuthenticated) {
      // Add event listeners for user activity
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('mousedown', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('touchstart', resetTimer);

      resetTimer(); // Initialize timer
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isAuthenticated, logout]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};






