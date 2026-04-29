"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { Sparkles, X } from 'lucide-react'

const stepToRoute: Record<string, string> = {
    SECTION_A: '/dashboard/skill-verification/exam/section-a',
    SECTION_B: '/dashboard/skill-verification/exam/section-b',
    SECTION_C: '/dashboard/skill-verification/exam/section-c',
    SECTION_D: '/dashboard/skill-verification/exam/section-d',
    COMPLETED: '/dashboard/skill-verification',
    ABANDONED: '/dashboard/skill-verification',
}

export default function SectionCPage() {
    const router = useRouter()
    const didFetchRef = useRef(false)
    const [question, setQuestion] = useState('')
    const [responseId, setResponseId] = useState('')
    const [answer, setAnswer] = useState('')
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
                const status = await apiClient.getExamSessionStatus(sessionId)
                const expectedRoute = stepToRoute[status?.current_step]
                if (expectedRoute && expectedRoute !== '/dashboard/skill-verification/exam/section-c') {
                    router.replace(expectedRoute)
                    return
                }

                const questionPayload = await apiClient.getSectionCQuestion(sessionId)
                const rawQuestion = questionPayload?.question_text
                const questionText =
                    typeof rawQuestion === 'string'
                        ? rawQuestion
                        : typeof rawQuestion?.prompt_text === 'string'
                        ? rawQuestion.prompt_text
                        : ''
                setQuestion(questionText)
                setResponseId(questionPayload?.response_id || '')
            } catch {
                setError('Unable to load Section C. Please try again.')
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
            await apiClient.submitSectionCResponse(sessionId, {
                response_id: responseId,
                user_response: answer,
            })
            router.replace('/dashboard/skill-verification/exam/section-d')
        } catch {
            setError('Unable to submit Section C. Please try again.')
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

        const sessionId = localStorage.getItem('active_exam_session_id') || ''

        setChatInput('')
        setChatMessages((prev) => [...prev, { role: 'user', content: trimmed }])
        setIsChatLoading(true)

        try {
            const result = await apiClient.chatExamResponse(sessionId, responseId, {
                user_message: trimmed,
                current_user_code_or_text: answer,
            })
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
        return <div className="p-8 text-sm text-[#A8B3CF]">Loading Section C...</div>
    }

    return (
        <div className="min-h-screen w-full max-w-none box-border px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
            <div className="w-full max-w-none rounded-[1.5rem] border border-[#22315F] bg-[#121C46] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] md:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">Section C: Logic</h2>
                <p className="mt-2 text-sm text-[#A8B3CF]">
                    Explain your logic clearly. Use pseudocode if needed.
                </p>

                <div className="mt-6 rounded-2xl border border-[#22315F] bg-[#1A275A] p-4 text-sm text-[#E2E8F0]">
                    {question || 'Question unavailable. Please refresh.'}
                </div>

                <textarea
                    className="mt-5 w-full min-h-[200px] rounded-2xl border border-[#22315F] bg-[#0F172A] px-4 py-3 text-sm font-mono text-[#E2E8F0] placeholder:text-[#7F8DB3] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                    placeholder="Write your reasoning or pseudocode here..."
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                />

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
                        Submit Section C
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
