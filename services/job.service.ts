// ─────────────────────────────────────────────────────────────────────────────
// job.service.ts — Jobs CRUD + Applications
// ─────────────────────────────────────────────────────────────────────────────
import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from '@/lib/httpClient'
import type { JobApplicationItem, JobItem, JobPayload } from '@/lib/types'

export const jobService = {
    /** Create a new job posting */
    create: (data: JobPayload): Promise<JobItem> =>
        postRequest<JobItem>('/jobs', data),

    /**
     * Fetch job listings.
     * @param mine - If true, only returns jobs owned by the current user
     */
    getAll: (mine = false): Promise<JobItem[]> =>
        getRequest<JobItem[]>('/jobs', { mine }),

    /** Get a single job by ID */
    getById: (jobId: string): Promise<JobItem> =>
        getRequest<JobItem>(`/jobs/${jobId}`),

    /** Update an existing job */
    update: (jobId: string, data: Partial<JobPayload>): Promise<JobItem> =>
        putRequest<JobItem>(`/jobs/${jobId}`, data),

    /** Delete a job posting */
    remove: (jobId: string): Promise<{ message: string; id: string }> =>
        deleteRequest(`/jobs/${jobId}`),

    /**
     * Apply to a job (student only).
     */
    apply: (
        jobId: string,
        data?: { expected_salary?: number; cover_letter?: string },
    ): Promise<JobApplicationItem> =>
        postRequest<JobApplicationItem>(`/jobs/${jobId}/apply`, data || {}),

    /** Get all applications for the current student */
    getMyApplications: (): Promise<JobApplicationItem[]> =>
        getRequest<JobApplicationItem[]>('/jobs/applications/me'),

    /** Approve a job (admin/college) */
    approve: (jobId: string): Promise<JobItem> =>
        patchRequest<JobItem>(`/jobs/${jobId}/approve`),
}
