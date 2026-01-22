/**
 * Protected Routes & Guards
 * Components for role-based access control and route protection
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth.context';
import { ProtectedRouteProps, RoleGuardProps, Role, ROLE_DASHBOARD_ROUTES } from '@/types/auth.types';

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================

/**
 * Wrap routes that require authentication
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredStatus,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, canAccess, hasStatus } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  useEffect(() => {
    setIsCheckingAuth(false);

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    if (requiredRoles && !canAccess(requiredRoles)) {
      router.push('/unauthorized');
      return;
    }

    // Check account status if specified
    if (requiredStatus && !hasStatus(requiredStatus)) {
      router.push('/account-pending');
      return;
    }
  }, [isAuthenticated, user, requiredRoles, requiredStatus, canAccess, hasStatus, router, redirectTo]);

  if (isCheckingAuth || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}

// ============================================================================
// ROLE GUARD COMPONENT
// ============================================================================

/**
 * Conditionally render content based on user role
 * Shows fallback if user doesn't have required role
 */
export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { hasRole } = useAuth();

  const hasAccess = hasRole(requiredRoles);

  if (!hasAccess) {
    return fallback || <div className="p-4 text-center text-red-600">Access denied</div>;
  }

  return <>{children}</>;
}

// ============================================================================
// ROLE-BASED REDIRECT COMPONENT
// ============================================================================

/**
 * Redirects authenticated users to their role-specific dashboard
 */
export function RoleBasedRedirect() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      const dashboardRoute = ROLE_DASHBOARD_ROUTES[user.role];
      router.push(dashboardRoute || '/dashboard');
    }

    setIsChecking(false);
  }, [isAuthenticated, user, router]);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return null;
}

// ============================================================================
// GUEST ONLY ROUTE COMPONENT
// ============================================================================

/**
 * Routes that should only be accessible by non-authenticated users
 * Redirects authenticated users to dashboard
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    setIsChecking(false);

    if (isAuthenticated && user) {
      const dashboardRoute = ROLE_DASHBOARD_ROUTES[user.role];
      router.push(dashboardRoute || '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// ============================================================================
// ADMIN ONLY COMPONENT
// ============================================================================

/**
 * Component that only renders for ADMIN users
 */
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRoles={Role.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// ============================================================================
// STUDENT ONLY COMPONENT
// ============================================================================

/**
 * Component that only renders for STUDENT users
 */
export function StudentOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRoles={Role.STUDENT} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// ============================================================================
// CORPORATE ONLY COMPONENT
// ============================================================================

/**
 * Component that only renders for CORPORATE users
 */
export function CorporateOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRoles={Role.CORPORATE} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// ============================================================================
// UNIVERSITY ONLY COMPONENT
// ============================================================================

/**
 * Component that only renders for UNIVERSITY users
 */
export function UniversityOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRoles={Role.UNIVERSITY} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// ============================================================================
// MENTOR ONLY COMPONENT
// ============================================================================

/**
 * Component that only renders for MENTOR users
 */
export function MentorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRoles={Role.MENTOR} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
