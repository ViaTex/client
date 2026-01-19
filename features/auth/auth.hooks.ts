'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from './auth.service';
import type { LoginCredentials, RegisterData } from './auth.types';
import { useAuthStore } from '@/store/auth.store';

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
    },
  });
};

export const useRegister = () => {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (response) => {
      setUser(response.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });
};
