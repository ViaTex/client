"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { Camera, Circle, Mic, StopCircle, Video } from 'lucide-react'

const stepToRoute: Record<string, string> = {
    SECTION_A: '/dashboard/skill-verification/exam/section-a',
    SECTION_B: '/dashboard/skill-verification/exam/section-b',
    SECTION_C: '/dashboard/skill-verification/exam/section-c',
    SECTION_D: '/dashboard/skill-verification/exam/section-d',
    COMPLETED: '/dashboard/skill-verification',
    ABANDONED: '/dashboard/skill-verification',
}

export default function SectionDPage() {
    const router = useRouter()
    const didFetchRef = useRef(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<BlobPart[]>([])

    const [question, setQuestion] = useState('')
    const [responseId, setResponseId] = useState('')
    const [isRequestingPermission, setIsRequestingPermission] = useState(true)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

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
                if (expectedRoute && expectedRoute !== '/dashboard/skill-verification/exam/section-d') {
                    router.replace(expectedRoute)
                    return
                }

                const questionPayload = await apiClient.getSectionDQuestion(sessionId)
                const rawQuestion = questionPayload?.question_text
                const questionText =
                    typeof rawQuestion === 'string'
                        ? rawQuestion
                        : typeof rawQuestion?.prompt_text === 'string'
                        ? rawQuestion.prompt_text
                        : ''
                setQuestion(questionText)
                setResponseId(questionPayload?.response_id || '')

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    streamRef.current = stream
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                        await videoRef.current.play().catch(() => null)
                    }
                } catch {
                    setPermissionError('Camera/microphone permission is required to continue this section.')
                }
            } catch {
                setActionError('Unable to load Section D. Please try again.')
            } finally {
                setIsRequestingPermission(false)
            }
        }

        init()

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
            }
            const stream = streamRef.current
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }
        }
    }, [router])

    const startRecording = () => {
        const stream = streamRef.current
        if (!stream) {
            setActionError('Unable to access media stream. Please allow camera and microphone access.')
            return
        }

        setActionError(null)
        setRecordedBlob(null)
        chunksRef.current = []

        const supportedMimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        const mimeType = supportedMimeTypes.find((type) => MediaRecorder.isTypeSupported(type))
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

        recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                chunksRef.current.push(event.data)
            }
        }

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
            setRecordedBlob(blob.size > 0 ? blob : null)
            setIsRecording(false)
        }

        mediaRecorderRef.current = recorder
        recorder.start()
        setIsRecording(true)
    }

    const stopRecording = async () => {
        const recorder = mediaRecorderRef.current
        if (!recorder || recorder.state === 'inactive') {
            return recordedBlob
        }

        return await new Promise<Blob | null>((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
                const nextBlob = blob.size > 0 ? blob : null
                setRecordedBlob(nextBlob)
                setIsRecording(false)
                resolve(nextBlob)
            }
            recorder.stop()
        })
    }

    const handleSubmit = async () => {
        if (!responseId) {
            setActionError('Missing response id for Section D.')
            return
        }
        if (typeof window === 'undefined') return
        const sessionId = localStorage.getItem('active_exam_session_id')
        if (!sessionId) {
            router.replace('/dashboard/skill-verification')
            return
        }

        setIsSubmitting(true)
        setActionError(null)

        try {
            const blob = isRecording ? await stopRecording() : recordedBlob
            if (!blob) {
                setActionError('Please record your explanation before submitting.')
                return
            }

            const formData = new FormData()
            const fileName = `section-d-debug-${Date.now()}.webm`
            formData.append('media_file', new File([blob], fileName, { type: blob.type || 'video/webm' }))
            formData.append('response_id', responseId)

            await apiClient.submitSectionDResponse(sessionId, formData)

            localStorage.setItem('skill_verification_under_review', '1')
            router.replace('/dashboard/skill-verification')
        } catch {
            setActionError('Unable to submit Section D. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col w-full max-w-none box-border px-4 py-4 text-white sm:px-6 lg:px-8 lg:py-6">
            <div className="grid w-full min-h-0 flex-1 grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-4 lg:gap-6 items-stretch lg:h-full">
                <div className="lg:col-span-5 min-w-0 min-h-0 lg:h-full flex flex-col rounded-[1.5rem] border border-[#22315F] bg-[#121C46] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-[#A855F7]">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Section D: Debugging</h2>
                            <p className="text-sm text-[#A8B3CF]">
                                Explain how you would debug and resolve the scenario below.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#22315F] bg-[#1A275A] p-4 text-sm text-[#E2E8F0]">
                        {question || 'Question unavailable. Please refresh.'}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        {!isRecording ? (
                            <Button onClick={startRecording} className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white hover:from-[#6D28D9] hover:to-[#9333EA]">
                                <Circle className="w-4 h-4 mr-2" />
                                Start Recording
                            </Button>
                        ) : (
                            <Button onClick={stopRecording} variant="outline" className="rounded-xl border-[#7C3AED] bg-transparent text-[#C4B5FD] hover:bg-[#7C3AED]/10 hover:text-white">
                                <StopCircle className="w-4 h-4 mr-2" />
                                Stop Recording
                            </Button>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!isRecording && !recordedBlob)}
                            loading={isSubmitting}
                            className="rounded-xl bg-[#243B85] text-white hover:bg-[#2D4AA3]"
                        >
                            Submit & Finish
                        </Button>
                    </div>

                    {(permissionError || actionError) && (
                        <p className="mt-4 text-sm font-medium text-red-300">
                            {permissionError || actionError}
                        </p>
                    )}
                </div>

                <div className="lg:col-span-7 min-w-0 min-h-0 lg:h-full flex flex-col rounded-[1.5rem] border border-[#22315F] bg-[#121C46] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] md:p-6">
                    <div className="relative min-h-[min(420px,40vh)] flex-1 overflow-hidden rounded-2xl border border-[#2B3B73] bg-[#0F172A] lg:min-h-0">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#111827]/75 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                            <Camera className="w-3.5 h-3.5" />
                            Live Preview
                        </div>

                        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#111827]/75 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                            <Mic className="w-3.5 h-3.5" />
                            Audio On
                        </div>

                        {isRequestingPermission && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <p className="text-white font-semibold text-sm">Requesting camera and microphone access...</p>
                            </div>
                        )}

                        {isRecording && (
                            <div className="absolute left-4 bottom-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-red-500 px-3 py-1.5 rounded-full animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white" />
                                Recording
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
