import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartlib_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smartlib_token');
      const savedUser = localStorage.getItem('smartlib_user');
      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Verify with backend silently
          const res = await api.getMe().catch(() => null);
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('smartlib_user', JSON.stringify(res.user));
          }
        } catch (e) {
          console.error("Auth init error:", e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('smartlib_token', res.token);
      localStorage.setItem('smartlib_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('smartlib_token', res.token);
      localStorage.setItem('smartlib_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartlib_token');
    localStorage.removeItem('smartlib_user');
  };

  // Quick Switch for seamless demo/testing
  const switchDemoUser = async (role = 'student') => {
    if (role === 'admin') {
      return login('admin@smartlib.edu', 'admin123');
    } else {
      return login('aarav@student.edu', 'student123');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
