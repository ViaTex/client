/**
 * Authentication API Service
 * Frontend API calls for authentication operations
 */

import axios, { AxiosInstance } from 'axios';
import {
  SignupFormData,
  LoginFormData,
  User,
  AuthResponse,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from '@/types/auth.types';

// ============================================================================
// API CLIENT SETUP
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Add access token to every request
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.accessToken
        : null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Handle auth errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('auth-storage')
          ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.refreshToken
          : null;

        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data.success) {
            // Update tokens in localStorage
            const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            authData.state.accessToken = response.data.data.accessToken;
            localStorage.setItem('auth-storage', JSON.stringify(authData));

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH SERVICE METHODS
// ============================================================================

export const authService = {
  /**
   * Sign up a new user
   */
  async signup(data: SignupFormData): Promise<{ user: User; accessToken: string; expiresIn: number }> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Signup failed');
      }

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  },

  /**
   * Login user
   */
  async login(data: LoginFormData): Promise<{ user: User; accessToken: string; expiresIn: number }> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Login failed');
      }

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Token refresh failed');
      }

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Token refresh failed';
      throw new Error(message);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw - always clear local state
    }
  },

  /**
   * Get current user
   */
  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: User;
        message: string;
      }>('/auth/me');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get user');
      }

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get user';
      throw new Error(message);
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to process request');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to process request';
      throw new Error(message);
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordFormData): Promise<void> {
    try {
      const response = await apiClient.post('/auth/reset-password', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Password reset failed';
      throw new Error(message);
    }
  },
};

export default authService;
