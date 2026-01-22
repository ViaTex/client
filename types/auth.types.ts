/**
 * Frontend Authentication Types
 * Types used in React/Next.js frontend
 */

// ============================================================================
// ENUMS (Mirror from backend)
// ============================================================================

export enum Role {
  STUDENT = 'STUDENT',
  CORPORATE = 'CORPORATE',
  UNIVERSITY = 'UNIVERSITY',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  PENDING_EMAIL_VERIFICATION = 'PENDING_EMAIL_VERIFICATION',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse<T = User> {
  success: boolean;
  message: string;
  data?: {
    user: T;
    accessToken: string;
    expiresIn: number;
  };
  errors?: string[];
}

// ============================================================================
// AUTH CONTEXT TYPES
// ============================================================================

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  signup: (data: SignupFormData) => Promise<User>;
  login: (data: LoginFormData) => Promise<User>;
  logout: () => Promise<void>;
  handleLogout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<void>;

  // Utility methods
  clearError: () => void;
  hasRole: (role: Role | Role[]) => boolean;
  canAccess: (requiredRoles: Role[]) => boolean;
}

// ============================================================================
// ROLE & PERMISSIONS
// ============================================================================

export const ROLE_LABELS: Record<Role, string> = {
  [Role.STUDENT]: 'Student',
  [Role.CORPORATE]: 'Corporate',
  [Role.UNIVERSITY]: 'University',
  [Role.MENTOR]: 'Mentor',
  [Role.ADMIN]: 'Admin',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.STUDENT]: 'Student user - can apply to jobs and internships',
  [Role.CORPORATE]: 'Corporate user - can post jobs and manage hiring',
  [Role.UNIVERSITY]: 'University user - can manage TPO activities',
  [Role.MENTOR]: 'Mentor - can mentor students (requires approval)',
  [Role.ADMIN]: 'Admin user - full system access',
};

// Role hierarchy for authorization
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.STUDENT]: 1,
  [Role.CORPORATE]: 2,
  [Role.UNIVERSITY]: 2,
  [Role.MENTOR]: 3,
  [Role.ADMIN]: 100,
};

// Dashboard routes by role
export const ROLE_DASHBOARD_ROUTES: Record<Role, string> = {
  [Role.STUDENT]: '/dashboard/student',
  [Role.CORPORATE]: '/dashboard/corporate',
  [Role.UNIVERSITY]: '/dashboard/university',
  [Role.MENTOR]: '/dashboard/mentor',
  [Role.ADMIN]: '/dashboard/admin',
};

// ============================================================================
// PROTECTED ROUTE TYPES
// ============================================================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredStatus?: AccountStatus[];
  redirectTo?: string;
}

export interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role | Role[];
  fallback?: React.ReactNode;
}
