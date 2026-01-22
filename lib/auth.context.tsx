/**
 * Authentication Context Provider
 * Provides global auth state and methods to all components
 * Replaces Zustand with Context API
 */

'use client';

import React, { createContext, useContext, useEffect, useCallback, useState, useMemo } from 'react';
import authService from '@/lib/auth.service';
import {
  SignupFormData,
  LoginFormData,
  Role,
  AccountStatus,
  AuthContextType,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from '@/types/auth.types';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// CONTEXT SETUP
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const STORAGE_KEY = 'auth-storage';

const loadFromStorage = (): Partial<AuthState> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  return {};
};

const saveToStorage = (state: Partial<AuthState>) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const dataToStore = {
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      tokenExpiresAt: state.tokenExpiresAt,
      isAuthenticated: state.isAuthenticated,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error saving auth to storage:', error);
  }
};

const clearStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
};

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = loadFromStorage();
    return {
      user: stored.user || null,
      isAuthenticated: stored.isAuthenticated || false,
      accessToken: stored.accessToken || null,
      refreshToken: stored.refreshToken || null,
      tokenExpiresAt: stored.tokenExpiresAt || null,
      isLoading: true,
      error: null,
    };
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // ====================================================================
  // STATE UPDATERS
  // ====================================================================

  const setUser = useCallback((user: User | null) => {
    setState((prev) => {
      const newState = {
        ...prev,
        user,
        isAuthenticated: !!user,
      };
      saveToStorage(newState);
      return newState;
    });
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string, expiresIn: number) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    setState((prev) => {
      const newState = {
        ...prev,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        isAuthenticated: true,
      };
      saveToStorage(newState);
      return newState;
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    clearStorage();
  }, []);

  // ====================================================================
  // INITIALIZATION - Check if user is already logged in
  // ====================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const stored = loadFromStorage();
        
        // If we have stored auth data, restore it
        if (stored.user && stored.accessToken) {
          // Check if token is expired
          if (stored.tokenExpiresAt && Date.now() >= stored.tokenExpiresAt) {
            // Token expired, clear auth state
            logout();
            setState((prev) => ({ ...prev, isLoading: false }));
            setIsInitialized(true);
            return;
          }

          // Token is still valid, restore user state
          setState((prev) => ({
            ...prev,
            user: stored.user,
            isAuthenticated: true,
            accessToken: stored.accessToken,
            refreshToken: stored.refreshToken || null,
            tokenExpiresAt: stored.tokenExpiresAt || null,
            isLoading: false,
          }));
        } else {
          // No stored auth data, user is not authenticated
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  // ====================================================================
  // AUTH METHODS
  // ====================================================================

  const signup = useCallback(
    async (data: SignupFormData) => {
      try {
        setLoading(true);
        clearError();

        const result = await authService.signup(data);

        // Set user and tokens
        setUser(result.user);
        setTokens(result.accessToken, '', result.expiresIn);

        // No error after successful signup
        setError(null);
        return result.user; // Return user for redirect
      } catch (error: any) {
        const errorMessage = error.message || 'Signup failed';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setUser, setTokens, setError]
  );

  const login = useCallback(
    async (data: LoginFormData) => {
      try {
        setLoading(true);
        clearError();

        const result = await authService.login(data);

        // Set user and tokens
        setUser(result.user);
        setTokens(result.accessToken, '', result.expiresIn);

        setError(null);
        return result.user; // Return user for redirect
      } catch (error: any) {
        const errorMessage = error.message || 'Login failed';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setUser, setTokens, setError]
  );

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      setLoading(false);
    }
  }, [setLoading, logout]);

  const refreshToken = useCallback(async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await authService.refreshToken(state.refreshToken);
      setTokens(result.accessToken, state.refreshToken, result.expiresIn);
    } catch (error: any) {
      setError(error.message || 'Token refresh failed');
      logout();
      throw error;
    }
  }, [state.refreshToken, setTokens, setError, logout]);

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        clearError();
        await authService.forgotPassword(email);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to process request';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setError]
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        setLoading(true);
        clearError();
        await authService.resetPassword(data);
      } catch (error: any) {
        const errorMessage = error.message || 'Password reset failed';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setError]
  );

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  const isTokenExpired = useCallback(() => {
    if (!state.tokenExpiresAt) return true;
    return Date.now() >= state.tokenExpiresAt;
  }, [state.tokenExpiresAt]);

  const shouldRefreshToken = useCallback(() => {
    if (!state.tokenExpiresAt) return true;
    const fiveMinutesInMs = 5 * 60 * 1000;
    return Date.now() >= state.tokenExpiresAt - fiveMinutesInMs;
  }, [state.tokenExpiresAt]);

  const hasRole = useCallback(
    (role: Role | Role[]) => {
      if (!state.user) return false;
      if (Array.isArray(role)) {
        return role.includes(state.user.role);
      }
      return state.user.role === role;
    },
    [state.user]
  );

  const hasStatus = useCallback(
    (status: AccountStatus | AccountStatus[]) => {
      if (!state.user) return false;
      if (Array.isArray(status)) {
        return status.includes(state.user.status);
      }
      return state.user.status === status;
    },
    [state.user]
  );

  const canAccess = useCallback(
    (requiredRoles: Role[]) => {
      return hasRole(requiredRoles);
    },
    [hasRole]
  );

  const contextValue: AuthContextType = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      signup,
      login,
      logout: handleLogout,
      handleLogout,
      refreshToken,
      forgotPassword,
      resetPassword,
      clearError,
      hasRole,
      canAccess,
    }),
    [
      state.user,
      state.isAuthenticated,
      state.isLoading,
      state.error,
      signup,
      login,
      handleLogout,
      refreshToken,
      forgotPassword,
      resetPassword,
      clearError,
      hasRole,
      canAccess,
    ]
  );

  if (!isInitialized) {
    return <div>Loading...</div>; // Or return a loading component
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ============================================================================
// CUSTOM HOOK TO USE AUTH CONTEXT
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;
