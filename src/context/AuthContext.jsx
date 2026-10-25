// src/context/AuthContext.jsx
// Provides authentication state throughout the app.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSession,
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from stored session
  useEffect(() => {
    const s = getSession();
    if (s) {
      const u = getCurrentUser();
      setSession(s);
      setUser(u);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const s = await loginService(email, password);
    const u = getCurrentUser();
    setSession(s);
    setUser(u);
    return s;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setSession(null);
    setUser(null);
  }, []);

  const register = useCallback(async (formData) => {
    const newUser = await registerService(formData);
    return newUser;
  }, []);

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, register, isAdmin, isMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
