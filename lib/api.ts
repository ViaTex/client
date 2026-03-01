import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    TokenRefreshResponse,
    UserResponse,
    OTPVerifyRequest,
    OTPVerifyResponse,
    OTPResendRequest,
} from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ============= Axios Instance =============

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Required for HttpOnly refresh token cookies
});

// ============= Token Storage (access token only) =============

let accessToken: string | null = null;

export function getAccessToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('access_token');
    }
    return accessToken;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('access_token', token);
        } else {
            localStorage.removeItem('access_token');
        }
    }
}

export function clearTokens() {
    accessToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
    }
}

// ============= Request Interceptor =============

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============= Response Interceptor (Auto Token Refresh) =============

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only attempt refresh on 401 errors, not on login/register/refresh endpoints
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/register') &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.post<TokenRefreshResponse>('/auth/refresh');
                const newToken = data.access_token;
                setAccessToken(newToken);
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                // Dispatch a custom event so AuthProvider can react
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ============= API Client =============

export const apiClient = {
    // ----- Registration -----
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    // ----- OTP Verification -----
    verifyOtp: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
        const response = await api.post<OTPVerifyResponse>('/auth/verify-otp', data);
        return response.data;
    },

    resendOtp: async (data: OTPResendRequest): Promise<{ message: string; detail?: string }> => {
        const response = await api.post('/auth/resend-otp', data);
        return response.data;
    },

    // ----- Login -----
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await api.post<TokenResponse>('/auth/login', data);
        // Store access token (refresh token is set as HttpOnly cookie by backend)
        setAccessToken(response.data.access_token);
        return response.data;
    },

    // ----- Token Refresh -----
    refreshToken: async (): Promise<TokenRefreshResponse> => {
        const response = await api.post<TokenRefreshResponse>('/auth/refresh');
        setAccessToken(response.data.access_token);
        return response.data;
    },

    // ----- Logout -----
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Even if API call fails, clear local state
        } finally {
            clearTokens();
        }
    },

    // ----- Get Current User -----
    getMe: async (): Promise<UserResponse> => {
        const response = await api.get<UserResponse>('/auth/me');
        return response.data;
    },

    // ----- Password Reset -----
    requestPasswordReset: async (email: string): Promise<{ message: string; detail?: string }> => {
        const response = await api.post('/auth/password-reset/request', { email });
        return response.data;
    },

    confirmPasswordReset: async (data: {
        user_id: string;
        otp_code: string;
        new_password: string;
    }): Promise<{ message: string; detail?: string }> => {
        const response = await api.post('/auth/password-reset/confirm', data);
        return response.data;
    },

    // ----- OAuth -----
    getGoogleLoginUrl: () => `${BASE_URL}/auth/oauth/google/login`,
    getLinkedInLoginUrl: () => `${BASE_URL}/auth/oauth/linkedin/login`,

    // ----- Generic Authenticated Request -----
    get: <T = unknown>(url: string) => api.get<T>(url).then((r) => r.data),
    post: <T = unknown>(url: string, data?: unknown) => api.post<T>(url, data).then((r) => r.data),
    put: <T = unknown>(url: string, data?: unknown) => api.put<T>(url, data).then((r) => r.data),
    patch: <T = unknown>(url: string, data?: unknown) => api.patch<T>(url, data).then((r) => r.data),
    delete: <T = unknown>(url: string) => api.delete<T>(url).then((r) => r.data),
};

export default api;
