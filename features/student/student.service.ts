/**
 * Student API service – profile, applications, jobs
 */

import axiosInstance from '@/lib/axios'
import type {
  StudentProfile,
  StudentApplication,
  Job,
  SkillItem,
  ProjectItem,
  JobPreferences,
} from './student.types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface JobsListResponse {
  jobs: Job[]
  total: number
}

export const studentService = {
  async getMe(): Promise<StudentProfile> {
    const res = await axiosInstance.get<ApiResponse<StudentProfile>>('/students/me')
    return res.data.data
  },

  async updateMe(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const res = await axiosInstance.patch<ApiResponse<StudentProfile>>('/students/me', data)
    return res.data.data
  },

  async getMyApplications(): Promise<StudentApplication[]> {
    const res = await axiosInstance.get<ApiResponse<StudentApplication[]>>(
      '/students/me/applications'
    )
    return res.data.data
  },

  async apply(jobId: string): Promise<StudentApplication> {
    const res = await axiosInstance.post<ApiResponse<StudentApplication>>(
      '/students/me/applications',
      { jobId }
    )
    return res.data.data
  },

  async acceptOrDeclineOffer(applicationId: string, applicationStatus: 'accepted' | 'declined') {
    const res = await axiosInstance.patch<ApiResponse<StudentApplication>>(
      `/students/me/applications/${applicationId}`,
      { applicationStatus }
    )
    return res.data.data
  },

  async requestSkillVerification(_payload: { skillName: string; projectTitle?: string }) {
    await axiosInstance.post('/students/me/skill-verification-request', _payload)
  },
}

export const jobsService = {
  async list(params?: { status?: string; limit?: number; offset?: number }): Promise<JobsListResponse> {
    const res = await axiosInstance.get<ApiResponse<JobsListResponse>>('/jobs', { params })
    return res.data.data
  },

  async getById(id: string): Promise<Job> {
    const res = await axiosInstance.get<ApiResponse<Job>>(`/jobs/${id}`)
    return res.data.data
  },
}
