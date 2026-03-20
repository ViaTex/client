"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { apiClient } from '@/lib/api'

const stepToRoute: Record<string, string> = {
    SECTION_A: '/dashboard/skill-verification/exam/section-a',
    SECTION_B: '/dashboard/skill-verification/exam/section-b',
    SECTION_C: '/dashboard/skill-verification/exam/section-c',
    SECTION_D: '/dashboard/skill-verification/exam/section-d',
    COMPLETED: '/dashboard/skill-verification',
    ABANDONED: '/dashboard/skill-verification',
}

export default function SectionBPage() {
    const router = useRouter()
    const [question, setQuestion] = useState('')
    const [responseId, setResponseId] = useState('')
    const [answer, setAnswer] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hint, setHint] = useState<string | null>(null)
    const [showHintModal, setShowHintModal] = useState(false)

    useEffect(() => {
        const init = async () => {
            if (typeof window === 'undefined') return
            const sessionId = localStorage.getItem('active_exam_session_id')
            if (!sessionId) {
                router.replace('/dashboard/skill-verification')
                return
            }

            try {
                const status = await apiClient.getExamSessionStatus(sessionId)
                const expectedRoute = stepToRoute[status?.current_step]
                if (expectedRoute && expectedRoute !== '/dashboard/skill-verification/exam/section-b') {
                    router.replace(expectedRoute)
                    return
                }

                const questionPayload = await apiClient.getSectionBQuestion(sessionId)
                setQuestion(questionPayload?.question_text || '')
                setResponseId(questionPayload?.response_id || '')
            } catch {
                setError('Unable to load Section B. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        init()
    }, [router])

    const handleSubmit = async () => {
        if (!responseId || !answer.trim()) {
            setError('Please provide your response before continuing.')
            return
        }
        if (typeof window === 'undefined') return
        const sessionId = localStorage.getItem('active_exam_session_id')
        if (!sessionId) {
            router.replace('/dashboard/skill-verification')
            return
        }

        setIsSubmitting(true)
        setError(null)
        try {
            await apiClient.submitSectionBResponse(sessionId, {
                response_id: responseId,
                user_response: answer,
            })
            router.replace('/dashboard/skill-verification/exam/section-c')
        } catch {
            setError('Unable to submit Section B. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRequestHint = async () => {
        if (typeof window === 'undefined') return
        const sessionId = localStorage.getItem('active_exam_session_id')
        if (!sessionId || !responseId) {
            return
        }

        try {
            const result = await apiClient.requestHint(sessionId, responseId, {
                question_text: question,
                student_current_answer: answer,
            })
            setHint(result?.hint || 'No hint available at the moment.')
        } catch {
            setHint('Unable to retrieve a hint right now.')
        } finally {
            setShowHintModal(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-sm text-[#9a734c]">Loading Section B...</div>
    }

    return (
        <div className="min-h-screen px-6 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                <h2 className="text-2xl font-extrabold tracking-tight">Section B: Fundamentals</h2>
                <p className="text-sm text-[#9a734c] dark:text-gray-400 mt-2">
                    Answer the question below in your own words.
                </p>

                <div className="mt-6 rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4 text-sm text-[#1b140d]">
                    {question || 'Question unavailable. Please refresh.'}
                </div>

                <textarea
                    className="mt-5 w-full min-h-[180px] rounded-2xl border border-[#efe8df] bg-white px-4 py-3 text-sm text-[#1b140d] focus:outline-none focus:ring-2 focus:ring-[#ee8c2b]/40"
                    placeholder="Write your answer here..."
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                />

                {hint && (
                    <div className="mt-4 rounded-2xl border border-[#fde7d0] bg-[#fff6eb] px-4 py-3 text-sm text-[#7b4b1c]">
                        Hint: {hint}
                    </div>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => setShowHintModal(true)}
                    >
                        Request Hint
                    </Button>
                    <Button
                        className="bg-[#1b140d] hover:bg-[#2b2017] text-white rounded-xl"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        Submit Section B
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={showHintModal}
                onClose={() => setShowHintModal(false)}
                title="Use a Hint?"
                maxWidth="md"
            >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Using a hint will deduct 0.5 marks from this question&apos;s score. Do you want to reveal the hint?
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button className="bg-[#ee8c2b] hover:bg-[#df7f1f] text-white rounded-xl" onClick={handleRequestHint}>
                        Reveal Hint
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowHintModal(false)}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
