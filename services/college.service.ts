import { axiosInstance, getRequest } from '@/lib/httpClient'

export type CollegeKpis = {
    total_students: { value: number; growth_percentage: number }
    verified_students: { value: number; verification_rate: number }
    placed_students: { value: number; placement_percentage: number }
    average_des: { value: number }
    active_recruiters: { value: number }
    upcoming_interviews: { value: number }
}

export type CollegeOverview = {
    kpis: CollegeKpis
    des_distribution: { bucket: string; count: number }[]
    verification_funnel: { stage: string; count: number }[]
    placement_funnel: { stage: string; count: number }[]
    department_analytics: {
        department: string
        student_count: number
        average_des: number
        verification_percentage: number
        placement_percentage: number
    }[]
    top_hiring_companies: {
        company: string
        students_hired: number
        average_des: number
        placement_contribution: number
    }[]
    monthly_placement_trends: { month: string; placements: number }[]
    mentor_analytics: {
        mentor: string
        assigned: number
        completed: number
        pending: number
        average_score: number
        verification_success_rate: number
    }[]
    skills_demand: { skill: string; demand: number }[]
    notifications: CollegeNotification[]
    ai_insights: CollegeInsight[]
}

export type CollegeStudent = {
    id: string
    name: string
    roll_number?: string | null
    email: string
    department: string
    year: string
    des_score: number
    ats_score?: number | null
    profile_completion: number
    verification_status: string
    placement_status: string
}

export type Paginated<T> = {
    data: T[]
    total: number
    skip: number
    limit: number
    count: number
}

export type CollegeInsight = {
    type: string
    title: string
    description: string
    metric: number
}

export type CollegeNotification = {
    id: string
    type: string
    title: string
    description: string
    created_at?: string | null
    read: boolean
}

export type CollegeMetricMap = Record<string, number>
export type ApiRecord = Record<string, unknown>

export const collegeService = {
    getOverview: () => getRequest<CollegeOverview>('/college/overview'),
    getStudents: (params: Record<string, string | number | boolean | undefined | null>) =>
        getRequest<Paginated<CollegeStudent>>('/college/students', params),
    getStudentDetail: (studentId: string) => getRequest<ApiRecord>(`/college/students/${studentId}`),
    getVerification: () => getRequest<ApiRecord>('/college/verification'),
    getPlacements: (params?: Record<string, string | undefined | null>) =>
        getRequest<ApiRecord>('/college/placements', params),
    getRecruiters: () => getRequest<ApiRecord>('/college/recruiters'),
    getJobs: (params: Record<string, string | number | undefined | null>) =>
        getRequest<Paginated<ApiRecord>>('/college/jobs', params),
    getNotifications: (params?: Record<string, string | undefined | null>) =>
        getRequest<{ unread_count: number; notifications: CollegeNotification[] }>('/college/notifications', params),
    downloadReport: async (reportType: string, format: 'csv' | 'excel' | 'pdf' = 'csv') => {
        const response = await axiosInstance.get<Blob>(`/college/reports/${reportType}`, {
            params: { format },
            responseType: 'blob',
        })
        return response.data
    },
}
