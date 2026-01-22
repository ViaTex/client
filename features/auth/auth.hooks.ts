'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from './auth.service';
import type { LoginCredentials, RegisterData } from './auth.types';
import { useAuth } from '@/lib/auth.context';

export const useLogin = () => {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await authService.login(credentials);
      await login(credentials); // Use context login method
      return result;
    },
  });
};

export const useRegister = () => {
  const { signup } = useAuth();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await authService.register(data);
      // Convert RegisterData to SignupFormData if needed
      await signup(data as any); // Use context signup method
      return result;
    },
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
  });
};
