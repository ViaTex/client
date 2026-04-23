import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export interface JobPayload {
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
    location: string
    remote_work?: boolean
    travel_required?: boolean
    mode_of_work?: 'onsite' | 'remote' | 'hybrid'
    salary_min?: number
    salary_max?: number
    salary_currency?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    experience_min?: number
    experience_max?: number
    education_level?: string[]
    education_degree?: string[]
    education_branch?: string[]
    skills_required?: string[]
    certifications_required?: string
    application_deadline?: string
    max_applications?: number
    number_of_openings?: number
    industry?: string
    selection_process?: string
    campus_drive_date?: string
    service_agreement_details?: string
    expiration_date?: string
    perks_and_benefits?: string
    eligibility_criteria?: string
    company_name?: string
    company_logo?: string
    company_website?: string
    company_address?: string
    company_size?: string
    company_type?: string
    company_founded?: number
    company_description?: string
    contact_person?: string
    contact_designation?: string
    min_des_score?: number
    max_des_score?: number
    ongoing_project_title?: string
    ongoing_project_description?: string
}

export interface JobItem extends JobPayload {
    id: string
    status: string
    max_applications: number
    current_applications: number
    created_at: string
    is_public?: boolean
}

export interface CorporateProfile {
    id: string
    email: string
    name?: string
    bio?: string
    company_name?: string
    phone?: string
    contact_person?: string
    contact_designation?: string
    website_url?: string
    industry?: string
    company_size?: string
    founded_year?: number
    company_type?: string
    description?: string
    address?: string
}

export interface MentorProfile {
    id: string
    user_id: string
    email: string
    name: string
    phone?: string
    current_role?: string
    expertise_areas: string[]
    experience_years?: number
    motivation?: string
    average_rating: number
}

export interface SkillEvaluationItem {
    evaluation_id: string
    mentor_id: string
    student_id: string
    project_id?: string | null
    status: string
    proposed_slots: string[]
    confirmed_slot?: string | null
    viva_meeting_link?: string | null
    score_technical?: number | null
    score_practical?: number | null
    score_communication?: number | null
    score_originality?: number | null
    total_score?: number | null
    verdict?: string | null
    feedback_strengths?: string | null
    feedback_improvements?: string | null
    student_rating_of_mentor?: number | null
    student_technical_issues?: string | null
    created_at: string
    updated_at?: string | null
}

export interface ExamReviewAssignmentItem {
    session_id: string
    student_id: string
    mentor_id?: string | null
    status: string
    assigned_at?: string | null
    completed_at?: string | null
    created_at: string
    updated_at?: string | null
}

export interface ExamReviewResponsePayload {
    response_id: string
    section_type: string
    question_text: unknown
    user_response: unknown
    video_url?: string | null
    transcript?: string | null
    ai_score?: number | null
    ai_feedback?: unknown
    mentor_score?: number | null
    mentor_feedback?: unknown
}

export interface ExamReviewStudentPayload {
    student_id: string
    name: string
    technical_skills?: string | null
    resume_url?: string | null
}

export interface ExamReviewAssignmentDetail {
    session_id: string
    current_step: string
    exam_level: string
    student: ExamReviewStudentPayload
    section_a: ExamReviewResponsePayload
    section_d: ExamReviewResponsePayload
}

export interface MentorSectionScorePayload {
    score: number
    feedback: {
        strengths: string[]
        behavioral_analysis: string
        areas_for_improvement: string[]
    }
    topic_scores?: Record<string, number>
}

export interface MentorExamReviewScorePayload {
    section_a: MentorSectionScorePayload
    section_d: MentorSectionScorePayload
}

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

    getMentorExamReviews: async (status?: string) => {
        const response = await axiosInstance.get('/mentor/exam-reviews', {
            params: status ? { status } : undefined,
        })
        return response.data as ExamReviewAssignmentItem[]
    },

    getMentorExamReviewDetail: async (sessionId: string) => {
        const response = await axiosInstance.get(`/mentor/exam-reviews/${sessionId}`)
        return response.data as ExamReviewAssignmentDetail
    },

    submitMentorExamReviewScore: async (sessionId: string, payload: MentorExamReviewScorePayload) => {
        const response = await axiosInstance.post(`/mentor/exam-reviews/${sessionId}/score`, payload)
        return response.data
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
                timeout: 60000,
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
        const response = await axiosInstance.get("/student/resume/status")
        return response.data
    },

    async getATSScore(jobDescription?: string): Promise<any> {
        const params = jobDescription ? { job_description: jobDescription } : {}
        const response = await axiosInstance.get(
            "/student/resume/ats-score",
            { params },
        )
        return response.data
    }

}
