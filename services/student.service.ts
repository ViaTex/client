// ─────────────────────────────────────────────────────────────────────────────
// student.service.ts — Student Profile, Education & Resume
// ─────────────────────────────────────────────────────────────────────────────
import { deleteRequest, getRequest, patchRequest, postRequest } from '@/lib/httpClient'

export const studentService = {
    // ── Profile ──────────────────────────────────────────────────────────────

    /** Get the current student's profile */
    getProfile: () => getRequest('/student/profile'),

    /** Update the current student's profile */
    updateProfile: (data: Record<string, unknown>) =>
        patchRequest('/student/profile', data),

    // ── Education ────────────────────────────────────────────────────────────

    /** Get all education entries for the current student */
    getEducation: () => getRequest('/student/education'),

    /** Add a new education entry */
    addEducation: (data: Record<string, unknown>) =>
        postRequest('/student/education', data),

    /** Update an existing education entry by ID */
    updateEducation: (educationId: string, data: Record<string, unknown>) =>
        patchRequest(`/student/education/${educationId}`, data),

    /** Delete an education entry by ID */
    deleteEducation: (educationId: string) =>
        deleteRequest(`/student/education/${educationId}`),

    // ── Resume ───────────────────────────────────────────────────────────────

    /**
     * Upload a resume file.
     * @param file - The resume File object
     * @param onProgress - Optional upload progress callback (0–100)
     */
    uploadResume: (file: File, onProgress?: (progress: number) => void) => {
        const formData = new FormData()
        formData.append('file', file)
        return postRequest('/student/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
            onUploadProgress: (progressEvent: any) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                    )
                    onProgress(percent)
                }
            },
        })
    },

    /** Get the current processing status of the uploaded resume */
    getResumeStatus: () => getRequest('/student/resume/status'),

    /**
     * Get ATS score for the current student's resume.
     * @param jobDescription - Optional job description to compare against
     */
    getATSScore: (jobDescription?: string) =>
        getRequest(
            '/student/resume/ats-score',
            jobDescription ? { job_description: jobDescription } : undefined,
        ),
}
