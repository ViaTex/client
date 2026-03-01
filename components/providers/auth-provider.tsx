'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, getAccessToken, setAccessToken, clearTokens } from '@/lib/api';
import { User, toFrontendUser, BACKEND_ROLE_TO_USER_TYPE } from '@/types/auth';
import type { UserResponse, TokenResponse } from '@/types/auth';

// ============= Context Types =============

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (tokenResponse: TokenResponse) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============= Provider =============

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const initializedRef = useRef(false);

    const isAuthenticated = !!user;

    // Initialize auth state on mount
    const initializeAuth = useCallback(async () => {
        // Prevent double-initialization in StrictMode
        if (initializedRef.current) return;
        initializedRef.current = true;

        const token = getAccessToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        // Check if token is expired by decoding payload
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;

            if (payload.exp <= now) {
                // Token expired - try refresh
                try {
                    await apiClient.refreshToken();
                    const userData = await apiClient.getMe();
                    setUser(toFrontendUser(userData));
                } catch {
                    clearTokens();
                    setUser(null);
                }
            } else {
                // Token still valid - load user from stored data or fetch
                const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch {
                        // Stored data corrupt - fetch from API
                        const userData = await apiClient.getMe();
                        const frontendUser = toFrontendUser(userData);
                        setUser(frontendUser);
                        localStorage.setItem('user_data', JSON.stringify(frontendUser));
                    }
                } else {
                    try {
                        const userData = await apiClient.getMe();
                        const frontendUser = toFrontendUser(userData);
                        setUser(frontendUser);
                        localStorage.setItem('user_data', JSON.stringify(frontendUser));
                    } catch {
                        clearTokens();
                        setUser(null);
                    }
                }
            }
        } catch {
            // Invalid token format
            clearTokens();
            setUser(null);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Listen for forced logout events from API interceptor
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            router.push('/auth/login');
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [router]);

    // Called after successful login
    const login = useCallback((tokenResponse: TokenResponse) => {
        setAccessToken(tokenResponse.access_token);
        const frontendUser = toFrontendUser(tokenResponse.user);
        setUser(frontendUser);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(frontendUser));
        }
    }, []);

    // Called to logout
    const logout = useCallback(async () => {
        await apiClient.logout();
        setUser(null);
        router.push('/auth/login');
    }, [router]);

    // Refresh user data from API
    const refreshUser = useCallback(async () => {
        try {
            const userData = await apiClient.getMe();
            const frontendUser = toFrontendUser(userData);
            setUser(frontendUser);
            if (typeof window !== 'undefined') {
                localStorage.setItem('user_data', JSON.stringify(frontendUser));
            }
        } catch {
            // If refresh fails, the interceptor will handle token refresh or logout
        }
    }, []);

    const getToken = useCallback(() => getAccessToken(), []);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        getToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============= Hook =============

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
