'use client';

import { useAuth as useAuthContext } from '@/lib/auth.context';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated } = useAuthContext();

  return {
    user,
    isLoading,
    isAuthenticated,
  };
};
