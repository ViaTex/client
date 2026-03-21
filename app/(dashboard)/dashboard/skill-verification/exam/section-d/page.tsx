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
                setQuestion(questionPayload?.question_text || '')
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
        <div className="min-h-screen px-6 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-5 bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-2xl bg-[#ee8c2b]/15 text-[#ee8c2b] flex items-center justify-center">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Section D: Debugging</h2>
                            <p className="text-sm text-[#9a734c] dark:text-gray-400">
                                Explain how you would debug and resolve the scenario below.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#fcfaf8] dark:bg-white/5 border border-[#efe8df] dark:border-gray-800 p-4 text-sm text-[#1b140d]">
                        {question || 'Question unavailable. Please refresh.'}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        {!isRecording ? (
                            <Button onClick={startRecording} className="bg-[#ee8c2b] hover:bg-[#df7f1f] text-white rounded-xl">
                                <Circle className="w-4 h-4 mr-2" />
                                Start Recording
                            </Button>
                        ) : (
                            <Button onClick={stopRecording} variant="outline" className="rounded-xl border-[#ee8c2b] text-[#ee8c2b] hover:bg-[#ee8c2b]/10">
                                <StopCircle className="w-4 h-4 mr-2" />
                                Stop Recording
                            </Button>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!isRecording && !recordedBlob)}
                            loading={isSubmitting}
                            className="bg-[#1b140d] hover:bg-[#2b2017] text-white rounded-xl"
                        >
                            Submit & Finish
                        </Button>
                    </div>

                    {(permissionError || actionError) && (
                        <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">
                            {permissionError || actionError}
                        </p>
                    )}
                </div>

                <div className="xl:col-span-7 bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-4 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                    <div className="h-full min-h-[420px] rounded-2xl bg-[#1b140d] overflow-hidden relative border border-black/10">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                        <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-black/45 px-3 py-1.5 rounded-full">
                            <Camera className="w-3.5 h-3.5" />
                            Live Preview
                        </div>

                        <div className="absolute right-4 top-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-black/45 px-3 py-1.5 rounded-full">
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
