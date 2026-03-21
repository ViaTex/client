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
        <div className="flex min-h-0 flex-1 flex-col w-full max-w-none box-border px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="grid w-full min-h-0 flex-1 grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-4 lg:gap-6 items-stretch lg:h-full min-h-0">
                <div className="lg:col-span-5 min-w-0 min-h-0 lg:h-full flex flex-col bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-2xl bg-[#ee8c2b]/15 text-[#ee8c2b] flex items-center justify-center">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Section A: Introduction</h2>
                            <p className="text-sm text-[#9a734c] dark:text-gray-400">
                                Record a 5-10 minute self-introduction to begin the evaluator.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#fcfaf8] dark:bg-white/5 border border-[#efe8df] dark:border-gray-800 p-4 md:p-5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#9a734c] dark:text-gray-400 mb-3">Recording Checklist</h3>
                        <ul className="space-y-2 text-sm text-[#1b140d]/80 dark:text-gray-300">
                            <li>Keep your face centered and clearly visible.</li>
                            <li>Cover background, skills, projects, and career goals.</li>
                            <li>Ensure your microphone captures your voice clearly.</li>
                        </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
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

                        {isRecording && (
                            <div
                                className="inline-flex items-center gap-2 rounded-xl border border-[#ee8c2b]/35 bg-[#ee8c2b]/10 px-4 py-2"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                <Timer className="h-5 w-5 shrink-0 text-[#ee8c2b]" aria-hidden />
                                <span className="font-mono text-lg font-bold tabular-nums text-[#1b140d] dark:text-white">
                                    {formatElapsed(elapsedSeconds)}
                                </span>
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!isRecording && !recordedBlob)}
                            loading={isSubmitting}
                            className="bg-[#1b140d] hover:bg-[#2b2017] text-white rounded-xl"
                        >
                            Continue to Section B
                        </Button>
                    </div>

                    {(permissionError || actionError) && (
                        <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">
                            {permissionError || actionError}
                        </p>
                    )}
                </div>

                <div className="lg:col-span-7 min-w-0 min-h-0 lg:h-full flex flex-col bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-4 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                    <div className="min-h-[min(420px,40vh)] flex-1 lg:min-h-0 rounded-2xl bg-[#1b140d] overflow-hidden relative border border-black/10">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                        <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-black/45 px-3 py-1.5 rounded-full">
                            <Camera className="w-3.5 h-3.5" />
                            Live Preview
                        </div>

                        <div className="absolute right-4 top-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-black/45 px-3 py-1.5 rounded-full">
                            <Mic className="w-3.5 h-3.5" />
                            Audio On
                        </div>

                        {isRecording && (
                            <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-white shadow-lg backdrop-blur-sm">
                                <Timer className="h-4 w-4 text-[#f2b261]" aria-hidden />
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
                className="mt-4 shrink-0 rounded-[1.5rem] border border-[#efe8df] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-[#221910] md:p-5 lg:mt-6"
                aria-label="Live transcript"
            >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#9a734c] dark:text-gray-400">
                        Live transcript
                    </h3>
                    {!speechSupported && (
                        <span className="text-[11px] text-stone-500 dark:text-gray-500">
                            Live captions need Chrome or Edge
                        </span>
                    )}
                </div>
                <div
                    className="max-h-[min(220px,32vh)] min-h-[100px] overflow-y-auto rounded-xl bg-[#fcfaf8] p-4 text-sm leading-relaxed text-[#1b140d] dark:bg-white/5 dark:text-gray-200"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions text"
                >
                    {liveTranscript ? (
                        <p className="whitespace-pre-wrap">{liveTranscript}</p>
                    ) : (
                        <p className="text-[#9a734c]/90 dark:text-gray-500">
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
