"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
    const didFetchRef = useRef(false)
    const [questionPayload, setQuestionPayload] = useState<{
        mcqs: { id: string; question: string; options: string[] }[]
        long_questions: { id: string; question: string }[]
    } | null>(null)
    const [responseId, setResponseId] = useState('')
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({})
    const [longAnswers, setLongAnswers] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            if (didFetchRef.current) return
            didFetchRef.current = true
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

                const payload = await apiClient.getSectionBQuestion(sessionId)
                const nextPayload = payload?.question_payload || null
                setQuestionPayload(nextPayload)
                setResponseId(payload?.response_id || '')
                if (!nextPayload) {
                    setError('Unable to load Section B. Please try again.')
                }
            } catch {
                setError('Unable to load Section B. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        init()
    }, [router])

    const handleSubmit = async () => {
        if (!responseId || !questionPayload) {
            setError('Unable to submit Section B. Please refresh and try again.')
            return
        }
        if (typeof window === 'undefined') return
        const sessionId = localStorage.getItem('active_exam_session_id')
        if (!sessionId) {
            router.replace('/dashboard/skill-verification')
            return
        }

        const missingMcq = questionPayload.mcqs.some((item) => !mcqAnswers[item.id])
        const missingLong = questionPayload.long_questions.some((item) => !longAnswers[item.id]?.trim())
        if (missingMcq || missingLong) {
            setError('Please answer all questions before continuing.')
            return
        }

        setIsSubmitting(true)
        setError(null)
        try {
            await apiClient.submitSectionBResponse(sessionId, {
                response_id: responseId,
                mcq_answers: questionPayload.mcqs.map((item) => ({
                    id: item.id,
                    selected_option: mcqAnswers[item.id],
                })),
                long_answers: questionPayload.long_questions.map((item) => ({
                    id: item.id,
                    answer: longAnswers[item.id] || '',
                })),
            })
            router.replace('/dashboard/skill-verification/exam/section-c')
        } catch {
            setError('Unable to submit Section B. Please try again.')
        } finally {
            setIsSubmitting(false)
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
                    Answer all questions below before submitting this section.
                </p>

                <div className="mt-6 space-y-6">
                    {questionPayload?.mcqs?.map((item, index) => (
                        <div key={item.id} className="rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4">
                            <p className="text-sm font-semibold text-[#1b140d]">MCQ {index + 1}</p>
                            <p className="mt-2 text-sm text-[#1b140d]">{item.question}</p>
                            <div className="mt-3 grid gap-2">
                                {item.options.map((option) => (
                                    <label key={option} className="flex items-center gap-2 text-sm text-[#1b140d]">
                                        <input
                                            type="radio"
                                            name={`mcq-${item.id}`}
                                            value={option}
                                            checked={mcqAnswers[item.id] === option}
                                            onChange={() =>
                                                setMcqAnswers((prev) => ({
                                                    ...prev,
                                                    [item.id]: option,
                                                }))
                                            }
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {questionPayload?.long_questions?.map((item, index) => (
                        <div key={item.id} className="rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4">
                            <p className="text-sm font-semibold text-[#1b140d]">Long Answer {index + 1}</p>
                            <p className="mt-2 text-sm text-[#1b140d]">{item.question}</p>
                            <textarea
                                className="mt-3 w-full min-h-[160px] rounded-2xl border border-[#efe8df] bg-white px-4 py-3 text-sm text-[#1b140d] focus:outline-none focus:ring-2 focus:ring-[#ee8c2b]/40"
                                placeholder="Write your answer here..."
                                value={longAnswers[item.id] || ''}
                                onChange={(event) =>
                                    setLongAnswers((prev) => ({
                                        ...prev,
                                        [item.id]: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    ))}
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
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
        </div>
    )
}
