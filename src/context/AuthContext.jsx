import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, notificationsAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('foodrescue_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('foodrescue_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Sync state to localStorage
  const setAuthSession = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('foodrescue_token', newToken);
    } else {
      localStorage.removeItem('foodrescue_token');
    }
    if (newUser) {
      localStorage.setItem('foodrescue_user', JSON.stringify(newUser));
      setUnreadNotifications(newUser.unread_notifications || 0);
    } else {
      localStorage.removeItem('foodrescue_user');
      setUnreadNotifications(0);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('foodrescue_token');
      if (storedToken) {
        try {
          const res = await authAPI.me();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            setUnreadNotifications(res.data.user.unread_notifications || 0);
            localStorage.setItem('foodrescue_user', JSON.stringify(res.data.user));
          }
        } catch {
          setAuthSession(null, null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.success && res.data) {
      setAuthSession(res.data.user, res.data.token);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.success && res.data) {
      setAuthSession(res.data.user, res.data.token);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthSession(null, null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        setUnreadNotifications(res.data.user.unread_notifications || 0);
        localStorage.setItem('foodrescue_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        loading,
        unreadNotifications,
        setUnreadNotifications,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
