"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Camera, Circle, Mic, StopCircle, Timer, Video } from 'lucide-react'

function formatElapsed(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Narrow types for Web Speech API (Chrome / Edge) — not in all TS lib.dom builds */
type ExamSpeechRecognition = {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    onresult: ((ev: ExamSpeechRecognitionResultEvent) => void) | null
    onend: (() => void) | null
}

type ExamSpeechRecognitionResultEvent = {
    resultIndex: number
    results: {
        length: number
        [index: number]: {
            isFinal: boolean
            0: { transcript: string }
        }
    }
}

function getSpeechRecognitionCtor(): (new () => ExamSpeechRecognition) | null {
    if (typeof window === 'undefined') return null
    const w = window as unknown as {
        SpeechRecognition?: new () => ExamSpeechRecognition
        webkitSpeechRecognition?: new () => ExamSpeechRecognition
    }
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export default function SectionAPage() {
    const router = useRouter()
    const { user } = useAuth()
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<BlobPart[]>([])
    const transcriptFinalRef = useRef('')
    const isRecordingRef = useRef(false)
    const recognitionRef = useRef<ExamSpeechRecognition | null>(null)

    const [isRequestingPermission, setIsRequestingPermission] = useState(true)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [liveTranscript, setLiveTranscript] = useState('')
    const [speechSupported, setSpeechSupported] = useState(false)

    useEffect(() => {
        setSpeechSupported(!!getSpeechRecognitionCtor())
    }, [])

    useEffect(() => {
        isRecordingRef.current = isRecording
    }, [isRecording])

    useEffect(() => {
        if (!isRecording) return
        const id = window.setInterval(() => {
            setElapsedSeconds((sec) => sec + 1)
        }, 1000)
        return () => window.clearInterval(id)
    }, [isRecording])

    useEffect(() => {
        if (!isRecording) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop()
                } catch {
                    /* ignore */
                }
                recognitionRef.current = null
            }
            return
        }

        const Ctor = getSpeechRecognitionCtor()
        if (!Ctor) return

        const recognition = new Ctor()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: ExamSpeechRecognitionResultEvent) => {
            let interim = ''
            let newFinal = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const piece = event.results[i][0]?.transcript ?? ''
                if (event.results[i].isFinal) {
                    newFinal += piece + ' '
                } else {
                    interim += piece
                }
            }
            if (newFinal) {
                transcriptFinalRef.current += newFinal
            }
            setLiveTranscript((transcriptFinalRef.current + interim).trim())
        }

        recognition.onend = () => {
            if (isRecordingRef.current && recognitionRef.current === recognition) {
                try {
                    recognition.start()
                } catch {
                    /* restart may fail if already running */
                }
            }
        }

        recognitionRef.current = recognition
        try {
            recognition.start()
        } catch {
            /* ignore */
        }

        return () => {
            if (recognitionRef.current === recognition) {
                try {
                    recognition.stop()
                } catch {
                    /* ignore */
                }
                recognitionRef.current = null
            }
        }
    }, [isRecording])

    useEffect(() => {
        const initMedia = async () => {
            try {
                setIsRequestingPermission(true)
                setPermissionError(null)
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                streamRef.current = stream

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play().catch(() => null)
                }
            } catch {
                setPermissionError('Camera/microphone permission is required to continue this section.')
            } finally {
                setIsRequestingPermission(false)
            }
        }

        initMedia()

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
    }, [])

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
        if (isSubmitting) {
            return
        }
        const studentId = user?.id || ''
        if (!studentId) {
            setActionError('Student identity is missing. Please refresh and try again.')
            return
        }

        setIsSubmitting(true)
        setActionError(null)

        try {
            const blob = isRecording ? await stopRecording() : recordedBlob
            if (!blob) {
                setActionError('Please record your intro before proceeding to the next section.')
                return
            }

            const formData = new FormData()
            const fileName = `section-a-intro-${Date.now()}.webm`
            formData.append('media_file', new File([blob], fileName, { type: blob.type || 'video/webm' }))
            formData.append('student_id', studentId)
            formData.append('exam_level', 'smart_talent')

            const response = await apiClient.uploadSectionA(formData)
            const sessionId = String(response?.session_id || '')

            if (!sessionId) {
                throw new Error('Exam session id missing in response')
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('active_exam_session_id', sessionId)
            }

            router.replace('/dashboard/skill-verification/exam/section-b')
        } catch {
            setActionError('Unable to upload intro section right now. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col w-full max-w-none box-border px-4 py-4 text-white sm:px-6 lg:px-8 lg:py-6">
            <div className="grid w-full min-h-0 flex-1 grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-4 lg:gap-6 items-stretch lg:h-full min-h-0">
                <div className="lg:col-span-5 min-w-0 min-h-0 lg:h-full flex flex-col rounded-[1.5rem] border border-[#22315F] bg-[#121C46] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-[#A855F7]">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Section A: Introduction</h2>
                            <p className="text-sm text-[#A8B3CF]">
                                Record a 5-10 minute self-introduction to begin the evaluator.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#22315F] bg-[#1A275A] p-4 md:p-5">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#A855F7]">Recording Checklist</h3>
                        <ul className="space-y-2 text-sm text-[#D8E1FF]">
                            <li>Keep your face centered and clearly visible.</li>
                            <li>Cover background, skills, projects, and career goals.</li>
                            <li>Ensure your microphone captures your voice clearly.</li>
                        </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
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

                        {isRecording && (
                            <div
                                className="inline-flex items-center gap-2 rounded-xl border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-4 py-2"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                <Timer className="h-5 w-5 shrink-0 text-[#A855F7]" aria-hidden />
                                <span className="font-mono text-lg font-bold tabular-nums text-white">
                                    {formatElapsed(elapsedSeconds)}
                                </span>
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!isRecording && !recordedBlob)}
                            loading={isSubmitting}
                            className="rounded-xl bg-[#243B85] text-white hover:bg-[#2D4AA3]"
                        >
                            Continue to Section B
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

                        {isRecording && (
                            <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-white shadow-lg backdrop-blur-sm">
                                <Timer className="h-4 w-4 text-[#A855F7]" aria-hidden />
                                <span className="font-mono text-sm font-bold tabular-nums tracking-wide">
                                    {formatElapsed(elapsedSeconds)}
                                </span>
                            </div>
                        )}

                        {isRequestingPermission && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <p className="text-white font-semibold text-sm">Requesting camera and microphone access...</p>
                            </div>
                        )}

                        {isRecording && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-white" />
                                Recording
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section
                className="mt-4 shrink-0 rounded-[1.5rem] border border-[#22315F] bg-[#121C46] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-5 lg:mt-6"
                aria-label="Live transcript"
            >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#A855F7]">
                        Live transcript
                    </h3>
                    {!speechSupported && (
                        <span className="text-[11px] text-[#94A3B8]">
                            Live captions need Chrome or Edge
                        </span>
                    )}
                </div>
                <div
                    className="max-h-[min(220px,32vh)] min-h-[100px] overflow-y-auto rounded-xl border border-[#22315F] bg-[#1A275A] p-4 text-sm leading-relaxed text-[#E2E8F0]"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions text"
                >
                    {liveTranscript ? (
                        <p className="whitespace-pre-wrap">{liveTranscript}</p>
                    ) : (
                        <p className="text-[#A8B3CF]">
                            {isRecording
                                ? speechSupported
                                    ? 'Listening… speak clearly toward your microphone.'
                                    : 'Speech-to-text is not available in this browser.'
                                : 'When you start recording, what you say will appear here (Chrome / Edge).'}
                        </p>
                    )}
                </div>
            </section>
        </div>
    )
}
