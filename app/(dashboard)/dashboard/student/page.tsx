"use client"

import { motion } from 'framer-motion'
import {
    Lock,
    Pencil,
    Check,
    Star,
    BadgeCheck,
    ChevronRight,
    Database,
    Paintbrush,
    Code,
    Zap,
    Wallet,
    Award,
    AlertCircle,
    X,
    ArrowRight,
    User,
    Video,
    Mic,
    Circle,
    StopCircle,
    Camera,
    ArrowLeft
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface StudentProfile {
    id?: string
    name?: string
    email?: string
    education?: Array<{
        id?: string
        level?: string
        custom_level?: string
        institution?: string
        start_date?: string
        end_date?: string
        score?: string
        description?: string
    }>
    technical_skills?: string
    soft_skills?: string
    city?: string
    state?: string
    bio?: string
    current_des_score?: number
    badge?: string
}

type EducationEntry = {
    institution?: string
    level?: string
}

type DashboardView = 'dashboard' | 'intro' | 'section-b'

const updateDashboardTitle = (title?: string) => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('dashboard:title-change', { detail: { title } }))
}

type IntroRecordingPanelProps = {
    studentId: string
    onSectionComplete: (examSessionId: string) => void
    onEndExam: (examSessionId?: string) => void
}

function IntroRecordingPanel({ studentId, onSectionComplete, onEndExam }: IntroRecordingPanelProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<BlobPart[]>([])

    const [isRequestingPermission, setIsRequestingPermission] = useState(true)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [examSessionId, setExamSessionId] = useState<string | null>(null)

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

    const handleNext = async () => {
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
            formData.append('exam_level', 'section_1')

            const response = await apiClient.uploadSectionIntro(formData)
            const createdExamSessionId = String(response?.exam_session_id || '')

            if (!createdExamSessionId) {
                throw new Error('Exam session id missing in response')
            }

            setExamSessionId(createdExamSessionId)
            onSectionComplete(createdExamSessionId)
        } catch {
            setActionError('Unable to upload intro section right now. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEndExam = async () => {
        setIsSubmitting(true)
        setActionError(null)

        try {
            if (isRecording) {
                await stopRecording()
            }

            try {
                if (studentId) {
                    await apiClient.endExamSession({
                        student_id: studentId,
                        exam_session_id: examSessionId || undefined,
                        status: 'aborted',
                        increment_attempt: true,
                    })
                }
            } catch {
                // Keep UX resilient even if end endpoint is not ready.
            }

            onEndExam(examSessionId || undefined)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
        >
            <div className="xl:col-span-5 bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-[#ee8c2b]/15 text-[#ee8c2b] flex items-center justify-center">
                        <Video className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Section 1: Introduction Video</h2>
                        <p className="text-sm text-[#9a734c] dark:text-gray-400">Share a concise intro to begin your Smart Talent Evaluator attempt.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-[#fcfaf8] dark:bg-white/5 border border-[#efe8df] dark:border-gray-800 p-4 md:p-5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#9a734c] dark:text-gray-400 mb-3">Recording Checklist</h3>
                    <ul className="space-y-2 text-sm text-[#1b140d]/80 dark:text-gray-300">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-[#ee8c2b]" /> Keep your face centered and clearly visible.</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-[#ee8c2b]" /> Mention your background, skills, and goals in 30-60 seconds.</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-[#ee8c2b]" /> Ensure your microphone captures your voice clearly.</li>
                    </ul>
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
                        onClick={handleNext}
                        disabled={isSubmitting || (!isRecording && !recordedBlob)}
                        loading={isSubmitting}
                        className="bg-[#1b140d] hover:bg-[#2b2017] text-white rounded-xl"
                    >
                        Next (Complete Section A)
                    </Button>

                    <Button
                        onClick={handleEndExam}
                        disabled={isSubmitting}
                        variant="destructive"
                        className="rounded-xl"
                    >
                        End Exam
                    </Button>
                </div>

                {(permissionError || actionError) && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">{permissionError || actionError}</p>
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
        </motion.div>
    )
}

export default function StudentDashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [showToast, setShowToast] = useState(false)
    const [dashboardView, setDashboardView] = useState<DashboardView>('dashboard')
    const [activeExamSessionId, setActiveExamSessionId] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true)
                const data = await apiClient.getStudentProfile()
                setProfile(data)
                const hasEducation = Array.isArray(data?.education)
                    && data.education.some((entry: EducationEntry) => entry?.institution && entry?.level)
                if (!hasEducation || !data?.technical_skills) {
                    setTimeout(() => setShowToast(true), 1500)
                }
            } catch {
                // Backend unreachable or profile not found — skip nudge; profile page will handle its own errors
                setTimeout(() => setShowToast(true), 1500)
            } finally {
                setProfileLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const desScore = Math.max(0, Math.min(10, Number(profile?.current_des_score ?? 0)))
    const desScoreDisplay = desScore.toFixed(2)
    const scoreStroke = `${Math.round((desScore / 10) * 282)} 282`
    const locationLabel = [profile?.city, profile?.state].filter(Boolean).join(', ')
    const coreSkills = [
        ...(profile?.technical_skills ? profile.technical_skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
        ...(profile?.soft_skills ? profile.soft_skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ].slice(0, 3)
    const studentId = profile?.id || user?.id || ''

    useEffect(() => {
        if (dashboardView === 'intro') {
            updateDashboardTitle('Do an intro')
            return
        }
        if (dashboardView === 'section-b') {
            updateDashboardTitle('Section B')
            return
        }
        updateDashboardTitle()
    }, [dashboardView])

    useEffect(() => {
        return () => updateDashboardTitle()
    }, [])

    const handleSectionAComplete = (examSessionId: string) => {
        setActiveExamSessionId(examSessionId)
        setDashboardView('section-b')
    }

    const handleEndExam = () => {
        setDashboardView('dashboard')
        setActiveExamSessionId(null)
        router.replace('/dashboard/student')
    }

    if (dashboardView === 'intro') {
        return (
            <div className="w-full font-sans text-[#1b140d] dark:text-gray-100 relative">
                <div className="mb-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setDashboardView('dashboard')}
                        className="rounded-xl text-[#1b140d] dark:text-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
                <IntroRecordingPanel
                    studentId={studentId}
                    onSectionComplete={handleSectionAComplete}
                    onEndExam={handleEndExam}
                />
            </div>
        )
    }

    if (dashboardView === 'section-b') {
        return (
            <div className="w-full font-sans text-[#1b140d] dark:text-gray-100 relative">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]"
                >
                    <h2 className="text-2xl font-extrabold tracking-tight mb-2">Section A Completed</h2>
                    <p className="text-sm text-[#9a734c] dark:text-gray-400 mb-6">
                        Your introduction video is saved. The next section flow can now continue using this exam session.
                    </p>
                    {activeExamSessionId && (
                        <p className="text-xs font-mono bg-[#fcfaf8] dark:bg-white/5 border border-[#efe8df] dark:border-gray-800 rounded-xl px-3 py-2 inline-block mb-6">
                            exam_session_id: {activeExamSessionId}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                        <Button className="bg-[#ee8c2b] hover:bg-[#df7f1f] text-white rounded-xl">Proceed to Section B</Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => setDashboardView('dashboard')}>Go to Dashboard</Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="w-full font-sans text-[#1b140d] dark:text-gray-100 relative">
            
            {/* Profile Incomplete Toast/Badge */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-10 right-10 z-[100] max-w-sm w-full"
                    >
                        <div className="bg-[#1b140d] dark:bg-amber-100 dark:text-[#1b140d] text-white p-5 rounded-3xl shadow-2xl border border-white/10 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="p-2 bg-[#ee8c2b] rounded-xl text-white">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <button onClick={() => setShowToast(false)} className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-black">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-tight">Setup your profile</h4>
                                <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Please complete your profile to unlock all features and start applying.</p>
                            </div>
                            <Link 
                                href="/dashboard/student/profile" 
                                className="bg-[#ee8c2b] dark:bg-[#ee8c2b] text-white py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm"
                            >
                                Setup Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* Left Column (3 Columns Wide) */}
                <div className="xl:col-span-3 flex flex-col gap-6">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar placeholder (no photo URL in profile yet) */}
                            <div className="w-24 h-24 rounded-full bg-[#ee8c2b]/10 flex items-center justify-center mb-4 ring-4 ring-[#ee8c2b]/10">
                                <User className="w-12 h-12 text-[#ee8c2b]" />
                            </div>
                            {profileLoading ? (
                                <>
                                    <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
                                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-3" />
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold">{profile?.name || 'Not available'}</h3>
                                    <p className="text-sm text-[#9a734c] font-medium mb-1">{profile?.email || 'Not available'}</p>
                                    {profile?.id && (
                                        <p className="text-xs text-[#9a734c]/70 font-mono mb-3">ID: DS-{profile.id.slice(-6).toUpperCase()}</p>
                                    )}
                                    {Array.isArray(profile?.education) && profile.education.length > 0 && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            {(() => {
                                                const primary = profile.education[0]
                                                const levelLabel = primary?.level === 'Other'
                                                    ? primary?.custom_level || 'Other'
                                                    : primary?.level
                                                return [levelLabel, primary?.institution].filter(Boolean).join(' · ')
                                            })()}
                                        </p>
                                    )}
                                </>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#ee8c2b]/10 text-[#ee8c2b] rounded-full text-xs font-bold uppercase tracking-wider">
                                <Award className="w-4 h-4" />
                                {profile?.badge || 'No Badge Yet'}
                            </div>
                        </div>
                    </motion.div>

                    {/* Earnings Potli */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-white to-orange-50/50 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:from-[#221910] dark:to-orange-900/10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[#1b140d]/60 dark:text-gray-400 text-sm font-semibold uppercase tracking-tight">Earnings Potli</p>
                            <Wallet className="w-5 h-5 text-[#ee8c2b]" />
                        </div>
                        {locationLabel ? (
                            <p className="text-2xl font-bold mb-1">{locationLabel}</p>
                        ) : (
                            <p className="text-sm text-gray-500 mb-1">Location not available</p>
                        )}
                        {coreSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {coreSkills.map((skill, idx) => (
                                    <span key={`${skill}-${idx}`} className="text-xs font-semibold px-2 py-1 rounded-full bg-[#ee8c2b]/10 text-[#ee8c2b]">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No skills available</p>
                        )}
                    </motion.div>

                    {/* Skill Badhao */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#ee8c2b]" />
                            Skill Badhao
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                    <Code className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold group-hover:text-[#ee8c2b] transition-colors">Frontend Dev</p>
                                    <p className="text-xs text-gray-500">2 weeks • Micro</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                    <Paintbrush className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold group-hover:text-[#ee8c2b] transition-colors">UI Design Kit</p>
                                    <p className="text-xs text-gray-500">3 weeks • Micro</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold group-hover:text-[#ee8c2b] transition-colors">SQL Basics</p>
                                    <p className="text-xs text-gray-500">1 week • Micro</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Center Column (6 Columns Wide) */}
                <div className="xl:col-span-6 flex flex-col gap-6">
                    {/* DES Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800 relative overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-48 h-48">
                                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="#f3ede7" strokeWidth="8" strokeLinecap="round" className="dark:stroke-gray-800"></circle>
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="#ee8c2b" strokeWidth="8" strokeDasharray={scoreStroke} strokeLinecap="round"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-4xl font-black text-[#ee8c2b]">{desScoreDisplay}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">of 10.00</p>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <h2 className="text-2xl font-bold">DES Score</h2>
                                    {profile?.badge && (
                                        <span className="bg-[#ee8c2b]/20 text-[#ee8c2b] text-[10px] font-bold px-2 py-0.5 rounded uppercase">{profile.badge}</span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    {profile?.bio || 'Profile bio not available.'}
                                </p>
                                <div className="flex justify-center md:justify-start">
                                    <Button
                                        type="button"
                                        size="xl"
                                        onClick={() => setDashboardView('intro')}
                                        className="rounded-2xl bg-black hover:bg-neutral-900 text-white font-bold flex items-center gap-2"
                                    >
                                        <Star className="w-4 h-4" />
                                        <Star className="w-4 h-4" />
                                        Score sudhare
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Score Insights */}
                        <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                            <div className="p-4 rounded-2xl bg-[#fcfaf8] dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[#ee8c2b] mb-1">
                                    <BadgeCheck className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Badge</span>
                                </div>
                                <p className="text-sm font-semibold">{profile?.badge || 'Not assigned'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#fcfaf8] dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[#ee8c2b] mb-1">
                                    <Star className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Core Skill</span>
                                </div>
                                <p className="text-sm font-semibold">{coreSkills[0] || 'Not available'}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                        <div className="space-y-8 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#221910] border-4 border-[#ee8c2b]"></div>
                                <p className="text-sm font-bold">Earned &quot;Responsive King&quot; Badge</p>
                                <p className="text-xs text-gray-500">2 hours ago • Module: Advanced CSS</p>
                            </div>
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#221910] border-4 border-gray-200 dark:border-gray-700"></div>
                                <p className="text-sm font-bold">Applied to &apos;Stark Industries&apos; Intern</p>
                                <p className="text-xs text-gray-500">Yesterday • 4:30 PM</p>
                            </div>
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#221910] border-4 border-gray-200 dark:border-gray-700"></div>
                                <p className="text-sm font-bold">Completed &apos;JS Algorithms&apos; Course</p>
                                <p className="text-xs text-gray-500">3 days ago • Skill Verified</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (3 Columns Wide) */}
                <div className="xl:col-span-3 flex flex-col gap-6">
                    {/* Learning Roadmap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <h3 className="text-lg font-bold mb-6">Learning Roadmap</h3>
                        <div className="flex flex-col gap-1">
                            {/* Step 1 */}
                            <div className="flex gap-4 pb-8 border-l-2 border-[#ee8c2b] ml-3 relative">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#ee8c2b] flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white font-bold" />
                                </div>
                                <div className="pl-4 -mt-1">
                                    <p className="text-sm font-bold">Skill Verified</p>
                                    <p className="text-xs text-[#ee8c2b] font-medium">Completed</p>
                                </div>
                            </div>
                            {/* Step 2 */}
                            <div className="flex gap-4 pb-8 border-l-2 border-[#ee8c2b]/30 ml-3 relative">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#ee8c2b] flex items-center justify-center">
                                    <Pencil className="w-3 h-3 text-white" />
                                </div>
                                <div className="pl-4 -mt-1">
                                    <p className="text-sm font-bold">Project Done</p>
                                    <p className="text-xs text-[#ee8c2b] font-medium">In Progress</p>
                                </div>
                            </div>
                            {/* Step 3 */}
                            <div className="flex gap-4 ml-3 relative">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="pl-4 -mt-1">
                                    <p className="text-sm font-bold text-gray-400">Platinum Badge</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Locked</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase text-gray-400">Notifications</h3>
                            <span className="text-[10px] font-bold text-[#ee8c2b] bg-[#ee8c2b]/10 px-2 py-0.5 rounded-full">3 New</span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 rounded-2xl bg-[#ee8c2b]/5 border border-[#ee8c2b]/10">
                                <p className="text-xs font-bold leading-tight">Your application for Stark Industries was viewed.</p>
                                <p className="text-[10px] text-gray-400 mt-1">10m ago</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                                <p className="text-xs font-medium leading-tight text-gray-600 dark:text-gray-300">New micro-internship: Video Editing for Social Media.</p>
                                <p className="text-[10px] text-gray-400 mt-1">1h ago</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                                <p className="text-xs font-medium leading-tight text-gray-600 dark:text-gray-300">Community: 5 people liked your recent project post.</p>
                                <p className="text-[10px] text-gray-400 mt-1">4h ago</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-[#ee8c2b] transition-colors">
                            View All Notifications
                        </button>
                    </motion.div>
                </div>

            </div>
        </div>
    )
}
