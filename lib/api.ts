// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts — Thin Barrel Re-export
// ─────────────────────────────────────────────────────────────────────────────

// ── Re-export all shared types ────────────────────────────────────────────────
export type {
    JobPayload,
    JobItem,
    JobApplicationItem,
    CorporateProfile,
    MentorProfile,
    SkillEvaluationItem,
    LoginResponse,
} from './types'

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
