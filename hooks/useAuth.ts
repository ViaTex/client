/**
 * Re-export useAuth from AuthProvider for backward compatibility.
 * All auth state is now managed via React Context (AuthProvider).
 */
export { useAuth } from '@/components/providers/auth-provider';
export type { User } from '@/types/auth';
