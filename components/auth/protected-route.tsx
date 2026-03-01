'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { UserType } from '@/types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** If specified, only these user types can access this route */
    allowedUserTypes?: UserType[];
}

/**
 * Wraps page content to enforce authentication and optional role-based access.
 * Shows a loading spinner while checking auth state.
 * Redirects to login if not authenticated.
 * Redirects to correct dashboard if user type doesn't match.
 */
export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Redirect to login with return URL
            const redirectUrl = encodeURIComponent(pathname);
            router.replace(`/auth/login?redirect=${redirectUrl}`);
            return;
        }

        // Check user type access
        if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
            // Redirect to their own dashboard
            router.replace(`/dashboard/${user.user_type}`);
        }
    }, [isLoading, isAuthenticated, user, allowedUserTypes, router, pathname]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Wrong user type
    if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
        return null;
    }

    return <>{children}</>;
}
