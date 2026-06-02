// ─────────────────────────────────────────────────────────────────────────────
// auth.service.ts — Authentication & Registration
// ─────────────────────────────────────────────────────────────────────────────
import { getRequest, postRequest, tokenUtils } from '@/lib/httpClient'
import type { LoginResponse } from '@/lib/types'

export const authService = {
    /**
     * Login with email + password.
     * Automatically stores tokens via tokenUtils if you pass storeTokens = true.
     */
    login: async (
        data: { email: string; password: string; user_type?: string },
        storeTokens = false,
    ): Promise<LoginResponse> => {
        const res = await postRequest<{ data: any }>('/auth/login', data)
        const payload = res?.data || {}
        const result: LoginResponse = {
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
            user_id: payload.user?.id,
            user_type: payload.user?.user_type,
            name: payload.user?.name,
        }
        if (storeTokens) {
            tokenUtils.set(result.access_token, result.refresh_token)
        }
        return result
    },

    /** Send OTP to email for verification */
    sendOtp: (email: string) =>
        postRequest(`/auth/send-otp?email=${encodeURIComponent(email)}`),

    /** Logout current session */
    logout: () => postRequest('/auth/logout'),

    /** Register a student account */
    registerStudent: (data: Record<string, unknown>) =>
        postRequest('/auth/register/student', data),

    /** Register a corporate account */
    registerCorporate: (data: Record<string, unknown>) =>
        postRequest('/auth/register/corporate', data),

    /** Register a mentor account */
    registerMentor: (data: Record<string, unknown>) =>
        postRequest('/auth/register/mentor', data),

    /** Register a college account */
    registerCollege: (data: Record<string, unknown>) =>
        postRequest('/auth/register/college', data),

    /** Verify OTP */
    verifyOtp: (email: string, otp: string) =>
        postRequest('/auth/verify-otp', { email, otp }),

    /** Token helpers re-exported for convenience */
    setTokens: tokenUtils.set,
    clearTokens: tokenUtils.clear,
    getToken: tokenUtils.get,
}
