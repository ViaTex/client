import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

// Response interceptor to handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined' && error?.response?.status === 401) {
            // Clear all auth state and redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_data')
            localStorage.removeItem('temp_user_data')
            localStorage.removeItem('temp_user_type')
            // Only redirect if not already on the auth pages
            if (!window.location.pathname.startsWith('/auth/')) {
                window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
            }
        }
        return Promise.reject(error)
    }
)

export const apiClient = {
    // Auth
    login: async (data: { email: string; password: string; user_type: string }) => {
        const response = await axiosInstance.post('/auth/login', data)
        const res = response.data
        return {
            access_token: res.data?.access_token,
            refresh_token: res.data?.refresh_token,
            user_id: res.data?.user?.id,
            user_type: res.data?.user?.user_type,
            name: res.data?.user?.name,
        }
    },

    sendOtp: async (email: string) => {
        const response = await axiosInstance.post(`/auth/send-otp?email=${encodeURIComponent(email)}`)
        return response.data
    },

    logout: async () => {
        const response = await axiosInstance.post('/auth/logout')
        return response.data
    },

    registerStudent: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.post(`/auth/register/student`, data)
        return response.data
    },

    registerCorporate: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.post(`/auth/register/corporate`, data)
        return response.data
    },

    registerCollege: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.post(`/auth/register/college`, data)
        return response.data
    },

    // Student Profile
    getStudentProfile: async () => {
        const response = await axiosInstance.get('/student/profile')
        return response.data
    },

    updateStudentProfile: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.patch('/student/profile', data)
        return response.data
    },

    getStudentEducation: async () => {
        const response = await axiosInstance.get('/student/education')
        return response.data
    },

    addStudentEducation: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.post('/student/education', data)
        return response.data
    },

    updateStudentEducation: async (educationId: string, data: Record<string, unknown>) => {
        const response = await axiosInstance.patch(`/student/education/${educationId}`, data)
        return response.data
    },

    deleteStudentEducation: async (educationId: string) => {
        const response = await axiosInstance.delete(`/student/education/${educationId}`)
        return response.data
    },

    uploadSectionA: async (formData: FormData) => {
        const response = await axiosInstance.post('/exams/section-a', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getExamSessionStatus: async (sessionId: string) => {
        const response = await axiosInstance.get(`/exams/sessions/${sessionId}`)
        return response.data
    },

    getSectionBQuestion: async (sessionId: string) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/section-b/question`)
        return response.data
    },

    submitSectionBResponse: async (sessionId: string, payload: { response_id: string; user_response: string }) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/section-b/response`, payload)
        return response.data
    },

    getSectionCQuestion: async (sessionId: string) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/section-c/question`)
        return response.data
    },

    submitSectionCResponse: async (sessionId: string, payload: { response_id: string; user_response: string }) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/section-c/response`, payload)
        return response.data
    },

    getSectionDQuestion: async (sessionId: string) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/section-d/question`)
        return response.data
    },

    submitSectionDResponse: async (sessionId: string, formData: FormData) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/section-d/response`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    requestHint: async (
        sessionId: string,
        responseId: string,
        payload: { question_text: string; student_current_answer: string }
    ) => {
        const response = await axiosInstance.post(
            `/exams/sessions/${sessionId}/responses/${responseId}/hint`,
            payload
        )
        return response.data
    },

    abandonExam: async (sessionId: string) => {
        const response = await axiosInstance.post(`/exams/sessions/${sessionId}/abandon`)
        return response.data
    },

    // Token management
    setAuthTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken)
            localStorage.setItem('refresh_token', refreshToken)
        }
    },

    clearAuthTokens: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_data')
        }
    },
}
