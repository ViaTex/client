// ─────────────────────────────────────────────────────────────────────────────
// mentor.service.ts — Mentor Profile & Skill Evaluations
// ─────────────────────────────────────────────────────────────────────────────
import { getRequest, patchRequest, postRequest } from '@/lib/httpClient'
import type { MentorProfile, SkillEvaluationItem } from '@/lib/types'

export const mentorService = {
    /** Get the current mentor's profile */
    getProfile: (): Promise<MentorProfile> =>
        getRequest<MentorProfile>('/mentor/profile'),

    /** Update the current mentor's profile */
    updateProfile: (data: Partial<MentorProfile>): Promise<MentorProfile> =>
        patchRequest<MentorProfile>('/mentor/profile', data),

    /** Get all skill evaluations assigned to the current mentor */
    getEvaluations: (): Promise<SkillEvaluationItem[]> =>
        getRequest<SkillEvaluationItem[]>('/mentor/evaluations'),

    /** Create a new skill evaluation */
    createEvaluation: (data: Record<string, unknown>): Promise<SkillEvaluationItem> =>
        postRequest<SkillEvaluationItem>('/mentor/evaluations', data),
}
