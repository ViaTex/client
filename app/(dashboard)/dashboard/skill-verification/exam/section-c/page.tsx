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
                setQuestion(questionPayload?.question_text || '')
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
        return <div className="p-8 text-sm text-[#9a734c]">Loading Section C...</div>
    }

    return (
        <div className="min-h-screen px-6 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                <h2 className="text-2xl font-extrabold tracking-tight">Section C: Logic</h2>
                <p className="text-sm text-[#9a734c] dark:text-gray-400 mt-2">
                    Explain your logic clearly. Use pseudocode if needed.
                </p>

                <div className="mt-6 rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4 text-sm text-[#1b140d]">
                    {question || 'Question unavailable. Please refresh.'}
                </div>

                <textarea
                    className="mt-5 w-full min-h-[200px] rounded-2xl border border-[#efe8df] bg-white px-4 py-3 text-sm font-mono text-[#1b140d] focus:outline-none focus:ring-2 focus:ring-[#ee8c2b]/40"
                    placeholder="Write your reasoning or pseudocode here..."
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                />

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
                        Submit Section C
                    </Button>
                </div>
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <button
                    type="button"
                    onClick={handleOpenChat}
                    className="h-14 w-14 rounded-full bg-[#ee8c2b] text-white shadow-lg flex items-center justify-center hover:bg-[#df7f1f]"
                    aria-label="Open AI assistant"
                >
                    <Sparkles className="w-6 h-6" />
                </button>
            </div>

            {isChatOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[320px] max-w-[90vw] rounded-2xl border border-[#efe8df] bg-white shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#efe8df]">
                        <p className="text-sm font-semibold text-[#1b140d]">AI Assistant</p>
                        <button type="button" onClick={() => setIsChatOpen(false)} aria-label="Close chat">
                            <X className="w-4 h-4 text-[#1b140d]" />
                        </button>
                    </div>

                    {showChatPenalty && (
                        <div className="px-4 py-2 text-xs text-[#7b4b1c] bg-[#fff3e8] border-b border-[#f1d4b8]">
                            Starting a conversation will deduct 0.5 marks from this question's score.
                        </div>
                    )}

                    <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-3 text-sm">
                        {chatMessages.length === 0 && (
                            <p className="text-xs text-[#9a734c]">Ask for guidance on a specific part you are stuck on.</p>
                        )}
                        {chatMessages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={
                                    message.role === 'user'
                                        ? 'bg-[#1b140d] text-white px-3 py-2 rounded-2xl ml-auto max-w-[85%]'
                                        : 'bg-[#fcfaf8] text-[#1b140d] px-3 py-2 rounded-2xl mr-auto max-w-[85%]'
                                }
                            >
                                {message.content}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="bg-[#fcfaf8] text-[#1b140d] px-3 py-2 rounded-2xl mr-auto max-w-[85%]">
                                Typing...
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[#efe8df] p-3 flex items-center gap-2">
                        <input
                            value={chatInput}
                            onChange={(event) => setChatInput(event.target.value)}
                            placeholder="Ask for a hint..."
                            className="flex-1 rounded-xl border border-[#efe8df] px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleSendChat}
                            className="rounded-xl bg-[#1b140d] text-white px-3 py-2 text-sm"
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
