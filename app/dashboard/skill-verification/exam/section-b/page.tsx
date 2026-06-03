"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { examService } from '@/services/exam.service'
import { Sparkles, X } from 'lucide-react'

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
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
    const [chatInput, setChatInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [showChatPenalty, setShowChatPenalty] = useState(false)

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
                const status = await examService.getSessionStatus(sessionId)
                const expectedRoute = stepToRoute[status?.current_step]
                if (expectedRoute && expectedRoute !== '/dashboard/skill-verification/exam/section-b') {
                    router.replace(expectedRoute)
                    return
                }

                const payload = await examService.getSectionBQuestion(sessionId)
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
            await examService.submitSectionBResponse(sessionId, {
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

    const handleOpenChat = () => {
        if (!responseId) {
            return
        }
        const penaltyKey = `exam_chat_penalty_${responseId}`
        const hasPenalty = typeof window !== 'undefined' && localStorage.getItem(penaltyKey)
        if (!hasPenalty) {
            setShowChatPenalty(true)
            if (typeof window !== 'undefined') {
                localStorage.setItem(penaltyKey, '1')
            }
        }
        setIsChatOpen(true)
    }

    const handleSendChat = async () => {
        const trimmed = chatInput.trim()
        if (!trimmed || !responseId || isChatLoading) {
            return
        }

        const currentWork = JSON.stringify({
            mcq_answers: mcqAnswers,
            long_answers: longAnswers,
        })

        setChatInput('')
        setChatMessages((prev) => [...prev, { role: 'user', content: trimmed }])
        setIsChatLoading(true)

        try {
            const result = await examService.chatExamResponse(
                localStorage.getItem('active_exam_session_id') || '',
                responseId,
                {
                    user_message: trimmed,
                    current_user_code_or_text: currentWork,
                }
            )
            const reply = result?.reply || 'I could not generate a response. Try a smaller question.'
            setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        } catch {
            setChatMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Unable to reach the assistant right now.' },
            ])
        } finally {
            setIsChatLoading(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-sm text-[#A8B3CF]">Loading Section B...</div>
    }

    return (
        <div className="min-h-screen w-full max-w-none box-border px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
            <div className="w-full max-w-none rounded-[1.5rem] border border-[#22315F] bg-[#121C46] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] md:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">Section B: Fundamentals</h2>
                <p className="mt-2 text-sm text-[#A8B3CF]">
                    Answer all questions below before submitting this section.
                </p>

                <div className="mt-6 space-y-6">
                    {questionPayload?.mcqs?.map((item, index) => (
                        <div key={item.id} className="rounded-2xl border border-[#22315F] bg-[#1A275A] p-4">
                            <p className="text-sm font-semibold text-[#A855F7]">MCQ {index + 1}</p>
                            <p className="mt-2 text-sm text-[#E2E8F0]">{item.question}</p>
                            <div className="mt-3 grid gap-2">
                                {item.options.map((option) => (
                                    <label key={option} className="flex items-center gap-2 text-sm text-[#D8E1FF]">
                                        <input
                                            type="radio"
                                            name={`mcq-${item.id}`}
                                            value={option}
                                            checked={mcqAnswers[item.id] === option}
                                            className="h-4 w-4 border-[#51629A] bg-[#0F172A] text-[#A855F7] focus:ring-[#7C3AED] focus:ring-offset-0"
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
                        <div key={item.id} className="rounded-2xl border border-[#22315F] bg-[#1A275A] p-4">
                            <p className="text-sm font-semibold text-[#A855F7]">Long Answer {index + 1}</p>
                            <p className="mt-2 text-sm text-[#E2E8F0]">{item.question}</p>
                            <textarea
                                className="mt-3 w-full min-h-[160px] rounded-2xl border border-[#22315F] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] placeholder:text-[#7F8DB3] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
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
                    <p className="mt-4 text-sm font-medium text-red-300">{error}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        className="rounded-xl bg-[#243B85] text-white hover:bg-[#2D4AA3]"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        Submit Section B
                    </Button>
                </div>
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <button
                    type="button"
                    onClick={handleOpenChat}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-lg hover:from-[#6D28D9] hover:to-[#9333EA]"
                    aria-label="Open AI assistant"
                >
                    <Sparkles className="w-6 h-6" />
                </button>
            </div>

            {isChatOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[320px] max-w-[90vw] overflow-hidden rounded-2xl border border-[#22315F] bg-[#121C46] shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#22315F] px-4 py-3">
                        <p className="text-sm font-semibold text-white">AI Assistant</p>
                        <button type="button" onClick={() => setIsChatOpen(false)} aria-label="Close chat">
                            <X className="w-4 h-4 text-[#A8B3CF]" />
                        </button>
                    </div>

                    {showChatPenalty && (
                        <div className="border-b border-[#5B21B6] bg-[#3B1D73] px-4 py-2 text-xs text-[#E9D5FF]">
                            Starting a conversation will deduct 0.5 marks from this question's score.
                        </div>
                    )}

                    <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-3 text-sm">
                        {chatMessages.length === 0 && (
                            <p className="text-xs text-[#A8B3CF]">Ask for guidance on a specific part you are stuck on.</p>
                        )}
                        {chatMessages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={
                                    message.role === 'user'
                                        ? 'ml-auto max-w-[85%] rounded-2xl bg-[#7C3AED] px-3 py-2 text-white'
                                        : 'mr-auto max-w-[85%] rounded-2xl bg-[#1A275A] px-3 py-2 text-[#E2E8F0]'
                                }
                            >
                                {message.content}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="mr-auto max-w-[85%] rounded-2xl bg-[#1A275A] px-3 py-2 text-[#E2E8F0]">
                                Typing...
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 border-t border-[#22315F] p-3">
                        <input
                            value={chatInput}
                            onChange={(event) => setChatInput(event.target.value)}
                            placeholder="Ask for a hint..."
                            className="flex-1 rounded-xl border border-[#22315F] bg-[#0F172A] px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#7F8DB3] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                        />
                        <button
                            type="button"
                            onClick={handleSendChat}
                            className="rounded-xl bg-[#243B85] px-3 py-2 text-sm text-white"
                            disabled={isChatLoading}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
