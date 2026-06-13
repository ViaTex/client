// ─────────────────────────────────────────────────────────────────────────────
// corporate.service.ts — Corporate Profile & Applicant Management
// ─────────────────────────────────────────────────────────────────────────────
import { deleteRequest, getRequest, patchRequest, postRequest } from '@/lib/httpClient'
import type { CorporateProfile, JobApplicationItem } from '@/lib/types'

export const corporateService = {
    /** Get the current corporate user's profile */
    getProfile: (): Promise<CorporateProfile> =>
        getRequest<CorporateProfile>('/corporate/profile'),

    /** Update the current corporate user's profile */
    updateProfile: (data: Partial<CorporateProfile>): Promise<CorporateProfile> =>
        patchRequest<CorporateProfile>('/corporate/profile', data),

    /** Get all applicants for jobs posted by this corporate */
    getApplicants: (): Promise<JobApplicationItem[]> =>
        getRequest<JobApplicationItem[]>('/corporate/applicants'),

    /** Update a specific applicant's status or offer letter URL */
    updateApplicant: (
        applicationId: string,
        data: { status?: string; offer_letter?: string; cover_letter?: string },
    ): Promise<JobApplicationItem> =>
        patchRequest<JobApplicationItem>(
            `/corporate/applicants/${applicationId}`,
            data,
        ),

    /** Remove an applicant record */
    deleteApplicant: (
        applicationId: string,
    ): Promise<{ message: string; id: string }> =>
        deleteRequest(`/corporate/applicants/${applicationId}`),

    /** Schedule a new interview for a candidate */
    scheduleInterview: (data: {
        job_application_id: string;
        student_id: string;
        proposed_slots?: string[];
        duration_minutes?: number;
        meeting_link?: string;
        interview_type?: string;
    }): Promise<any> => postRequest('/interviews', data),

    /**
     * Upload an offer letter PDF/file for a specific applicant.
     * Sends as multipart/form-data automatically.
     */
    uploadOfferLetter: (
        applicationId: string,
        file: File,
    ): Promise<JobApplicationItem> => {
        const formData = new FormData()
        formData.append('file', file)
        return postRequest<JobApplicationItem>(
            `/corporate/applicants/${applicationId}/offer-letter`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            },
        )
    },
}
