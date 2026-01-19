import axios from '@/lib/axios';
import type { LoginCredentials, RegisterData, AuthResponse } from './auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post('/api/auth/logout');
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await axios.get<AuthResponse['user']>('/api/auth/me');
    return response.data;
  },
};
