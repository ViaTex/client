// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts — Thin Barrel Re-export
// ─────────────────────────────────────────────────────────────────────────────

// ── Re-export all shared types ────────────────────────────────────────────────
import type {
    JobPayload,
    JobItem,
    JobApplicationItem,
    CorporateProfile,
    MentorProfile,
    SkillEvaluationItem,
    LoginResponse,
} from './types'
import { axiosInstance } from './httpClient'

// ── Re-export all shared types ────────────────────────────────────────────────────────────────
export type {
    JobPayload,
    JobItem,
    JobApplicationItem,
    CorporateProfile,
    MentorProfile,
    SkillEvaluationItem,
    LoginResponse,
} from './types'

export const apiClient = {
    // Auth
    login: async (data: { email: string; password: string; user_type?: string }) => {
        const response = await axiosInstance.post('/auth/login', data)
        const res = response.data
        const payload = res?.data || {}
        return {
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
            user_id: payload.user?.id,
            user_type: payload.user?.user_type,
            name: payload.user?.name,
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

    registerMentor: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.post(`/auth/register/mentor`, data)
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

    // Jobs
    createJob: async (data: JobPayload) => {
        const response = await axiosInstance.post('/jobs', data)
        return response.data as JobItem
    },

    getJobs: async (mine: boolean = false) => {
        const response = await axiosInstance.get('/jobs', { params: { mine } })
        return response.data as JobItem[]
    },

    getJobById: async (jobId: string) => {
        const response = await axiosInstance.get(`/jobs/${jobId}`)
        return response.data as JobItem
    },

    updateJob: async (jobId: string, data: Partial<JobPayload>) => {
        const response = await axiosInstance.put(`/jobs/${jobId}`, data)
        return response.data as JobItem
    },

    approveJob: async (jobId: string) => {
        const response = await axiosInstance.patch(`/jobs/${jobId}/approve`)
        return response.data as JobItem
    },

    getCorporateProfile: async () => {
        const response = await axiosInstance.get('/corporate/profile')
        return response.data as CorporateProfile
    },

    updateCorporateProfile: async (data: Partial<CorporateProfile>) => {
        const response = await axiosInstance.patch('/corporate/profile', data)
        return response.data as CorporateProfile
    },

    getMentorProfile: async () => {
        const response = await axiosInstance.get('/mentor/profile')
        return response.data as MentorProfile
    },

    updateMentorProfile: async (data: Partial<MentorProfile>) => {
        const response = await axiosInstance.patch('/mentor/profile', data)
        return response.data as MentorProfile
    },

    getMentorEvaluations: async () => {
        const response = await axiosInstance.get('/mentor/evaluations')
        return response.data as SkillEvaluationItem[]
    },

    createMentorEvaluation: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.post('/mentor/evaluations', data)
        return response.data as SkillEvaluationItem
    },

    uploadSectionA: async (formData: FormData) => {
        const response = await axiosInstance.post('/exams/section-a', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 120000,
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

    submitSectionBResponse: async (
        sessionId: string,
        payload: {
            response_id: string
            mcq_answers: { id: string; selected_option: string }[]
            long_answers: { id: string; answer: string }[]
        }
    ) => {
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

    chatExamResponse: async (
        sessionId: string,
        responseId: string,
        payload: { user_message: string; current_user_code_or_text: string }
    ) => {
        const response = await axiosInstance.post(
            `/exams/${sessionId}/responses/${responseId}/chat`,
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

    async uploadResume(
        file: File,
        onProgress?: (progress: number) => void,
    ): Promise<any> {
        const formData = new FormData()
        formData.append("file", file)

        const response = await axiosInstance.post(
            "/student/resume/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 180000,
                onUploadProgress: (progressEvent: any) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        )
                        onProgress(percentCompleted)
                    }
                },
            },
        )
        return response.data
    },

    async getResumeStatus(): Promise<any> {
        const response = await axiosInstance.get("/student/resume/status", {
            timeout: 45000,
        })
        return response.data
    },

    async getATSScore(jobDescription?: string): Promise<any> {
        const params = jobDescription ? { job_description: jobDescription } : {}
        const response = await axiosInstance.get(
            "/student/resume/ats-score",
            {
                params,
                timeout: 120000,
            },
        )
        return response.data
    }

}
// ── Re-export core HTTP helpers & axios instance ──────────────────────────────
export {
    axiosInstance,
    getRequest,
    postRequest,
    patchRequest,
    putRequest,
    deleteRequest,
    tokenUtils,
    AUTH_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
} from './httpClient'

// ── Re-export services for convenience ───────────────────────────────────────
export { authService }      from '@/services/auth.service'
export { studentService }   from '@/services/student.service'
export { jobService }       from '@/services/job.service'
export { corporateService } from '@/services/corporate.service'
export { mentorService }    from '@/services/mentor.service'
export { examService }      from '@/services/exam.service'
export { collegeService }   from '@/services/college.service'
