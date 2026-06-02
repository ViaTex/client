// ─────────────────────────────────────────────────────────────────────────────
// httpClient.ts
// Core axios instance + interceptors + generic reusable request helpers
//
// Usage (anywhere in the app — no need to repeat axios boilerplate):
//   import { getRequest, postRequest, patchRequest, putRequest, deleteRequest } from '@/lib/httpClient'
//
//   const profile = await getRequest('/student/profile')
//   const result  = await postRequest('/auth/login', { email, password })
//   const updated = await patchRequest('/student/profile', formData)
//   const file    = await postRequest('/student/resume/upload', form, { responseType: 'blob' })
// ─────────────────────────────────────────────────────────────────────────────

import axios, { AxiosRequestConfig } from 'axios'

// ── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/** localStorage keys — keep them in one place so they are easy to update */
export const AUTH_TOKEN_KEY    = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const USER_DATA_KEY     = 'user_data'
const TEMP_USER_DATA_KEY       = 'temp_user_data'
const TEMP_USER_TYPE_KEY       = 'temp_user_type'

// ── Axios Instance ────────────────────────────────────────────────────────────
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 45000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const _isNetworkError = (error: any): boolean =>
    !error.response &&
    (error.code === 'ERR_NETWORK' ||
        error.code === 'ERR_INTERNET_DISCONNECTED' ||
        (error.message && error.message.includes('Network Error')) ||
        (error.message && error.message.includes('fetch')))

const _retryRequest = async (
    originalRequest: any,
    retryCount = 0,
    maxRetries = 3,
): Promise<any> => {
    if (retryCount >= maxRetries) throw originalRequest

    // Exponential back-off: 1s, 2s, 4s
    await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000),
    )

    try {
        return await axiosInstance(originalRequest)
    } catch (error) {
        if (_isNetworkError(error)) {
            return _retryRequest(originalRequest, retryCount + 1, maxRetries)
        }
        throw error
    }
}

// ── Request interceptor — auto-attach token ───────────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(AUTH_TOKEN_KEY)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error),
)

// ── Response interceptor — retry + 401 redirect ───────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Network errors → retry with exponential back-off
        if (_isNetworkError(error) && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                return await _retryRequest(originalRequest)
            } catch {
                const networkError = new Error(
                    'Network connection failed. Please check your internet connection and try again.',
                ) as any
                networkError.code = 'NETWORK_ERROR'
                return Promise.reject(networkError)
            }
        }

        // 401 Unauthorized → clear storage and redirect to login
        if (typeof window !== 'undefined' && error?.response?.status === 401) {
            localStorage.removeItem(AUTH_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
            localStorage.removeItem(USER_DATA_KEY)
            localStorage.removeItem(TEMP_USER_DATA_KEY)
            localStorage.removeItem(TEMP_USER_TYPE_KEY)

            if (!window.location.pathname.startsWith('/auth/')) {
                window.location.href = `/auth/login?redirect=${encodeURIComponent(
                    window.location.pathname,
                )}`
            }
        }

        return Promise.reject(error)
    },
)

// ─────────────────────────────────────────────────────────────────────────────
// Generic Request Helpers
// Each helper returns `response.data` directly so callers don't need to
// unwrap `.data` themselves.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET request helper.
 * @example
 *   const profile = await getRequest<StudentProfile>('/student/profile')
 *   const jobs    = await getRequest('/jobs', { mine: true })
 */
export async function getRequest<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
): Promise<T> {
    const response = await axiosInstance.get<T>(endpoint, {
        params,
        ...config,
    })
    return response.data
}

/**
 * POST request helper.
 * @example
 *   const result = await postRequest('/auth/login', { email, password })
 *   // File upload — pass a FormData and override Content-Type via config:
 *   const upload = await postRequest('/student/resume/upload', formData, {
 *     headers: { 'Content-Type': 'multipart/form-data' },
 *     timeout: 60000,
 *   })
 */
export async function postRequest<T = any>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
): Promise<T> {
    const response = await axiosInstance.post<T>(endpoint, data, config)
    return response.data
}

/**
 * PATCH request helper.
 * @example
 *   const updated = await patchRequest('/student/profile', { bio: 'Hello' })
 */
export async function patchRequest<T = any>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
): Promise<T> {
    const response = await axiosInstance.patch<T>(endpoint, data, config)
    return response.data
}

/**
 * PUT request helper.
 * @example
 *   const job = await putRequest(`/jobs/${jobId}`, payload)
 */
export async function putRequest<T = any>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
): Promise<T> {
    const response = await axiosInstance.put<T>(endpoint, data, config)
    return response.data
}

/**
 * DELETE request helper.
 * @example
 *   await deleteRequest(`/jobs/${jobId}`)
 */
export async function deleteRequest<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig,
): Promise<T> {
    const response = await axiosInstance.delete<T>(endpoint, config)
    return response.data
}

// ── Token Utilities ───────────────────────────────────────────────────────────
export const tokenUtils = {
    set: (accessToken: string, refreshToken: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        }
    },
    clear: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
            localStorage.removeItem(USER_DATA_KEY)
        }
    },
    get: () =>
        typeof window !== 'undefined'
            ? localStorage.getItem(AUTH_TOKEN_KEY)
            : null,
}
