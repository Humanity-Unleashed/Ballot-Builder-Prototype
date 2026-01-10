/**
 * Auth Context
 *
 * Provides authentication state and methods throughout the app.
 *
 * @example
 * // In a component:
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Check auth state
 * if (!isAuthenticated) {
 *   return <LoginScreen />;
 * }
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, User, getAccessToken, clearTokens } from '@/services/api';

// ===========================================
// Types
// ===========================================

interface AuthContextType {
  /** Current user or null if not authenticated */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Register a new user */
  register: (email: string, password: string) => Promise<void>;
  /** Login an existing user */
  login: (email: string, password: string) => Promise<void>;
  /** Logout the current user */
  logout: () => Promise<void>;
  /** Refresh user data */
  refreshUser: () => Promise<void>;
}

// ===========================================
// Context
// ===========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===========================================
// Provider
// ===========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      // Token invalid or expired, clear it
      await clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = useCallback(async (email: string, password: string) => {
    const response = await authApi.register(email, password);
    setUser(response.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // If refresh fails, user might need to re-login
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    register,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===========================================
// Hook
// ===========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
