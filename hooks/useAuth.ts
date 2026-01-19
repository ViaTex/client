'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentUser } from '@/features/auth/auth.hooks';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      useAuthStore.getState().setUser(currentUser);
    }
  }, [currentUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
