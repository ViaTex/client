// Frontend user type categories
export type UserType = 'student' | 'corporate' | 'college' | 'mentor' | 'admin';

// Backend role values
export type BackendRole = 'Student' | 'Mentor' | 'TPO' | 'Corporate HR';

// Backend account type values
export type BackendAccountType = 'Individual' | 'Institutional';

// ============= Mapping Helpers =============

// Map frontend user_type to backend role + account_type
export const USER_TYPE_TO_BACKEND: Record<Exclude<UserType, 'admin'>, { role: BackendRole; account_type: BackendAccountType }> = {
    student: { role: 'Student', account_type: 'Individual' },
    corporate: { role: 'Corporate HR', account_type: 'Institutional' },
    college: { role: 'TPO', account_type: 'Institutional' },
    mentor: { role: 'Mentor', account_type: 'Individual' },
};

// Map backend role to frontend user_type
export const BACKEND_ROLE_TO_USER_TYPE: Record<BackendRole, UserType> = {
    'Student': 'student',
    'Mentor': 'mentor',
    'TPO': 'college',
    'Corporate HR': 'corporate',
};

// ============= Registration =============

export interface RegisterRequest {
    email: string;
    phone_number: string;
    password: string;
    account_type: BackendAccountType;
    role: BackendRole;
}

export interface RegisterResponse {
    user_id: string;
    email: string;
    phone_number: string;
    message: string;
}

// ============= OTP Verification =============

export interface OTPVerifyRequest {
    user_id: string;
    email_otp: string;
    phone_otp: string;
}

export interface OTPVerifyResponse {
    success: boolean;
    message: string;
    access_token?: string;
    token_type: string;
}

export interface OTPResendRequest {
    user_id: string;
    type: 'email' | 'phone' | 'both';
}

// ============= Login =============

export interface LoginRequest {
    email: string;
    password: string;
}

// ============= Token & User Response =============

export interface UserResponse {
    id: string;
    email: string;
    phone_number: string;
    account_type: BackendAccountType;
    role: BackendRole;
    email_verified: boolean;
    phone_verified: boolean;
    account_status: string;
    last_login_at: string | null;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: UserResponse;
}

export interface TokenRefreshResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

// ============= Password Reset =============

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    user_id: string;
    otp_code: string;
    new_password: string;
}

// ============= Frontend User (derived from backend) =============

export interface User {
    id: string;
    email: string;
    phone_number: string;
    user_type: UserType;
    role: BackendRole;
    account_type: BackendAccountType;
    email_verified: boolean;
    phone_verified: boolean;
    account_status: string;
    last_login_at: string | null;
    created_at: string;
}

// Helper to convert backend UserResponse to frontend User
export function toFrontendUser(backendUser: UserResponse): User {
    return {
        ...backendUser,
        user_type: BACKEND_ROLE_TO_USER_TYPE[backendUser.role] || 'student',
    };
}
