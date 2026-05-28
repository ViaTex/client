// ─────────────────────────────────────────────────────────────────────────────
// exam.service.ts — Skill Verification Exam (Sections A–D, hints, chat)
// ─────────────────────────────────────────────────────────────────────────────
import { getRequest, postRequest } from '@/lib/httpClient'

export const examService = {
    // ── Section A ─────────────────────────────────────────────────────────────

    /**
     * Upload Section A (document/file based).
     * Sends as multipart/form-data automatically.
     */
    uploadSectionA: (formData: FormData) =>
        postRequest('/exams/section-a', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
        }),

    // ── Session ───────────────────────────────────────────────────────────────

    /** Get the current status of an exam session */
    getSessionStatus: (sessionId: string) =>
        getRequest(`/exams/sessions/${sessionId}`),

    /** Abandon an in-progress exam session */
    abandon: (sessionId: string) =>
        postRequest(`/exams/sessions/${sessionId}/abandon`),

    // ── Section B ─────────────────────────────────────────────────────────────

    /** Fetch (or generate) the Section B question for a session */
    getSectionBQuestion: (sessionId: string) =>
        postRequest(`/exams/sessions/${sessionId}/section-b/question`),

    /** Submit Section B answers */
    submitSectionBResponse: (
        sessionId: string,
        payload: {
            response_id: string
            mcq_answers: { id: string; selected_option: string }[]
            long_answers: { id: string; answer: string }[]
        },
    ) => postRequest(`/exams/sessions/${sessionId}/section-b/response`, payload),

    // ── Section C ─────────────────────────────────────────────────────────────

    /** Fetch (or generate) the Section C question for a session */
    getSectionCQuestion: (sessionId: string) =>
        postRequest(`/exams/sessions/${sessionId}/section-c/question`),

    /** Submit Section C answer */
    submitSectionCResponse: (
        sessionId: string,
        payload: { response_id: string; user_response: string },
    ) => postRequest(`/exams/sessions/${sessionId}/section-c/response`, payload),

    // ── Section D ─────────────────────────────────────────────────────────────

    /** Fetch (or generate) the Section D question for a session */
    getSectionDQuestion: (sessionId: string) =>
        postRequest(`/exams/sessions/${sessionId}/section-d/question`),

    /**
     * Submit Section D response (file-based).
     * Sends as multipart/form-data automatically.
     */
    submitSectionDResponse: (sessionId: string, formData: FormData) =>
        postRequest(`/exams/sessions/${sessionId}/section-d/response`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // ── AI Assistance ─────────────────────────────────────────────────────────

    /**
     * Request an AI hint for the current question.
     */
    requestHint: (
        sessionId: string,
        responseId: string,
        payload: { question_text: string; student_current_answer: string },
    ) =>
        postRequest(
            `/exams/sessions/${sessionId}/responses/${responseId}/hint`,
            payload,
        ),

    /**
     * Chat with the AI assistant about the current exam question.
     */
    chatExamResponse: (
        sessionId: string,
        responseId: string,
        payload: { user_message: string; current_user_code_or_text: string },
    ) =>
        postRequest(
            `/exams/${sessionId}/responses/${responseId}/chat`,
            payload,
        ),
}
