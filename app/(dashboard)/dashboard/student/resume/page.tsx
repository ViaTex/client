"use client"

import { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AxiosError } from "axios"
import { motion } from "framer-motion"
import {
    AlertCircle,
    ArrowUpRight,
    BarChart3,
    Bot,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clipboard,
    Copy,
    Download,
    FileText,
    Gauge,
    Lightbulb,
    Loader2,
    Sparkles,
    Target,
    Upload,
    Wand2,
    X,
    Zap,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"]

interface ATSScore {
    ats_score: number
    overall_assessment: string
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    keyword_analysis?: {
        found_keywords: string[]
        missing_keywords: string[]
    }
    sections_analysis?: Record<string, string>
    formatting_score?: number
    content_score?: number
    keyword_score?: number
    extracted_skills?: {
        technical_skills?: string[]
        soft_skills?: string[]
        domain_skills?: string[]
        tools_platforms?: string[]
    }
}

interface ResumeStatus {
    has_resume: boolean
    resume_uploaded: boolean
    resume_filename?: string
    resume_path?: string
    filename?: string
    last_updated?: string
    resume_url?: string
    uploaded_at?: string
    can_upload: boolean
    can_calculate_ats: boolean
    ats_score?: number | null
    overall_assessment?: string | null
    strengths?: string[]
    weaknesses?: string[]
    recommendations?: string[]
    keyword_analysis?: {
        found_keywords: string[]
        missing_keywords: string[]
    }
    sections_analysis?: Record<string, string>
    formatting_score?: number | null
    content_score?: number | null
    keyword_score?: number | null
    extracted_skills?: ATSScore["extracted_skills"]
    ats_calculated_at?: string | null
}

type Impact = "High" | "Medium" | "Low"
type StatusTone = "good" | "warning" | "poor"

const cardClass = "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
const cardHeaderClass = "p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"
const primaryButtonClass = "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-sm hover:shadow-md"

const rewritePreview = `Professional Summary
Frontend engineer focused on building accessible, AI-assisted SaaS dashboards with React, Next.js, TypeScript, and Tailwind CSS. Strong track record turning complex workflows into clean product experiences with measurable usability improvements.

Experience
- Built responsive student dashboard modules for job discovery, resume analysis, and profile management using reusable component patterns.
- Improved resume optimization flow by adding ATS scoring, keyword insights, section-level recommendations, and actionable AI rewrite suggestions.
- Collaborated across product and engineering to ship mobile-friendly interfaces with consistent dark mode support.`

const formatDate = (value?: string | null) => {
    if (!value) return "Updated recently"
    return new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}

const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 75) return "Strong"
    if (score >= 60) return "Needs work"
    return "At risk"
}

const getScoreTone = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
}

const scoreStatus = (score: number): StatusTone => {
    if (score >= 75) return "good"
    if (score >= 55) return "warning"
    return "poor"
}

const toneClasses: Record<StatusTone, string> = {
    good: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    poor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resumeStatusWarning, setResumeStatusWarning] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [atsScore, setAtsScore] = useState<ATSScore | null>(null)
    const [isCalculatingATS, setIsCalculatingATS] = useState(false)
    const [jobDescription, setJobDescription] = useState("")
    const [resumeStatus, setResumeStatus] = useState<ResumeStatus | null>(null)
    const [loadingStatus, setLoadingStatus] = useState(true)
    const [showUploadSection, setShowUploadSection] = useState(false)
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
    const [subscriptionFeature, setSubscriptionFeature] = useState("this feature")
    const [showRewriteModal, setShowRewriteModal] = useState(false)

    useEffect(() => {
        fetchResumeStatus()
    }, [])

    const hasCachedATS = (status: ResumeStatus | null | undefined): status is ResumeStatus & { ats_score: number } => {
        return Boolean(status?.has_resume && typeof status.ats_score === "number")
    }

    const mapStatusToATSScore = (status: ResumeStatus): ATSScore => ({
        ats_score: status.ats_score ?? 0,
        overall_assessment: status.overall_assessment ?? "",
        strengths: status.strengths ?? [],
        weaknesses: status.weaknesses ?? [],
        recommendations: status.recommendations ?? [],
        keyword_analysis: status.keyword_analysis,
        sections_analysis: status.sections_analysis,
        formatting_score: status.formatting_score ?? undefined,
        content_score: status.content_score ?? undefined,
        keyword_score: status.keyword_score ?? undefined,
        extracted_skills: status.extracted_skills,
    })

    async function fetchResumeStatus(): Promise<ResumeStatus | null> {
        try {
            setResumeStatusWarning(null)
            const status = await apiClient.getResumeStatus()
            const statusData = status?.data ?? status
            setResumeStatus(statusData)

            if (hasCachedATS(statusData)) {
                setAtsScore(mapStatusToATSScore(statusData))
            }

            if (!statusData?.has_resume) {
                setShowUploadSection(true)
                setAtsScore(null)
            }

            return statusData
        } catch (error) {
            const axiosError = error as AxiosError<{ detail?: string }>
            const isTimeout = axiosError.code === "ECONNABORTED" || axiosError.message?.toLowerCase().includes("timeout")
            const message = isTimeout
                ? "Resume status is taking longer than expected. You can still upload a resume or try analyzing again in a moment."
                : axiosError.response?.data?.detail || "Unable to load your resume status right now. You can still use the upload flow."

            setResumeStatusWarning(message)
            setResumeStatus(null)
            setShowUploadSection(true)
            setAtsScore(null)
            return null
        } finally {
            setLoadingStatus(false)
        }
    }

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) return `File size exceeds 5MB limit. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`

        const extension = file.name.split(".").pop()?.toLowerCase()
        if (!extension || !ALLOWED_EXTENSIONS.includes(`.${extension}`)) return "Only PDF and DOCX files are allowed"
        if (!ALLOWED_TYPES.includes(file.type) && file.type !== "") return "Invalid file type. Only PDF and DOCX files are supported"

        return null
    }

    const handleFileSelect = (selectedFile: File) => {
        const validationError = validateFile(selectedFile)
        if (validationError) {
            setError(validationError)
            return
        }

        setFile(selectedFile)
        setError(null)
        setUploadSuccess(false)
        setUploadProgress(0)
        setAtsScore(null)
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(e.type === "dragenter" || e.type === "dragover")
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0])
    }, [])

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            await apiClient.uploadResume(file, (progress) => setUploadProgress(progress))
            setUploadSuccess(true)
            setUploadProgress(100)
            await fetchResumeStatus()
            setShowUploadSection(false)
        } catch (err) {
            const axiosError = err as AxiosError<{ detail: string }>
            const errorDetail = axiosError.response?.data?.detail || axiosError.message || "Failed to upload resume"
            const isTimeout = axiosError.code === "ECONNABORTED" || errorDetail.toLowerCase().includes("timeout")

            if (isTimeout) {
                const latestStatus = await fetchResumeStatus()

                if (latestStatus?.has_resume) {
                    setUploadSuccess(true)
                    setUploadProgress(100)
                    setShowUploadSection(false)
                    setResumeStatusWarning("Upload completed, but the server took longer than expected to respond. You can now calculate ATS score.")
                    return
                }

                setError("Resume upload is still processing or timed out. Please try again with a smaller PDF/DOCX, or retry in a moment.")
                return
            }

            if (axiosError.response?.status === 403 || errorDetail.includes("Contact HireKarma") || errorDetail.includes("subscription")) {
                setSubscriptionFeature("resume uploads")
                setShowSubscriptionModal(true)
            } else {
                setError(errorDetail)
            }
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    const handleCalculateATS = async () => {
        setIsCalculatingATS(true)
        setError(null)
        setResumeStatusWarning(null)

        try {
            const resumeAlreadyDetected = Boolean(resumeStatus?.has_resume || uploadSuccess)

            if (!resumeAlreadyDetected) {
                try {
                    const latestStatusResponse = await apiClient.getResumeStatus()
                    const latestStatus = latestStatusResponse?.data ?? latestStatusResponse
                    setResumeStatus(latestStatus)

                    if (!latestStatus?.has_resume) {
                        setShowUploadSection(true)
                        setError("Upload a resume before running ATS analysis.")
                        return
                    }
                } catch {
                    setResumeStatusWarning("Could not confirm your resume status, so ATS analysis will try the latest uploaded resume directly.")
                }
            }

            const result = await apiClient.getATSScore(jobDescription || undefined)
            const resultData = result?.data ?? result
            setAtsScore(resultData)

            try {
                await fetchResumeStatus()
            } catch {
                // fetchResumeStatus already owns the user-facing warning state.
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ detail: string }>
            const errorDetail = axiosError.response?.data?.detail || axiosError.message || "Failed to calculate ATS score"

            if (axiosError.response?.status === 403 || errorDetail.includes("Contact HireKarma") || errorDetail.includes("subscription")) {
                setSubscriptionFeature("ATS score calculation")
                setShowSubscriptionModal(true)
            } else {
                setError(errorDetail)
            }
        } finally {
            setIsCalculatingATS(false)
        }
    }

    const handleReset = () => {
        setFile(null)
        setUploadProgress(0)
        setUploadSuccess(false)
        setError(null)
        setAtsScore(null)
        setJobDescription("")
    }

    const getReadableFilename = (filename: string | undefined): string => {
        if (!filename) return "Resume.pdf"
        if (filename.includes("_")) {
            const parts = filename.split("_")
            const firstPart = parts[0]
            if (firstPart.includes("-") && firstPart.length >= 30) {
                const readableName = parts.slice(1).join("_")
                if (readableName) return readableName
            }
        }
        if (filename.includes("-") && filename.length > 30 && !filename.includes(".")) return "Resume.pdf"
        if (!filename.includes(".")) return `${filename}.pdf`
        return filename
    }

    const getResumeHref = (status: ResumeStatus | null): string | null => {
        const rawValue = status?.resume_url || status?.resume_path
        if (!rawValue?.trim()) return null

        const trimmed = rawValue.trim()
        if (/^(https?:\/\/|blob:)/i.test(trimmed)) return trimmed

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
        const backendBase = apiUrl.replace(/\/api\/v\d+\/?$/i, "").replace(/\/$/, "")

        if (trimmed.startsWith("/")) return `${backendBase}${trimmed}`
        if (/^(media|uploads?)\//i.test(trimmed)) return `${backendBase}/${trimmed}`
        return `https://${trimmed}`
    }

    const resumeFileName = getReadableFilename(resumeStatus?.resume_filename || resumeStatus?.filename)
    const resumeUploadedAt = resumeStatus?.uploaded_at || resumeStatus?.last_updated
    const resumeHref = getResumeHref(resumeStatus)
    const displayScore = atsScore?.ats_score ?? resumeStatus?.ats_score ?? null
    const hasATSResult = typeof displayScore === "number"
    const version = resumeStatus?.has_resume ? "v2" : "v1"

    const sectionScores = useMemo(() => {
        if (!atsScore?.sections_analysis) return []

        return Object.entries(atsScore.sections_analysis).map(([name, detail]) => {
            const normalizedName = name.toLowerCase()
            const score =
                normalizedName.includes("skill") || normalizedName.includes("keyword")
                    ? atsScore.keyword_score ?? atsScore.ats_score
                    : normalizedName.includes("format")
                        ? atsScore.formatting_score ?? atsScore.ats_score
                        : atsScore.content_score ?? atsScore.ats_score

            return {
                name,
                score,
                status: scoreStatus(score),
                detail,
            }
        })
    }, [atsScore])

    const foundKeywords = atsScore?.keyword_analysis?.found_keywords ?? []
    const missingKeywords = atsScore?.keyword_analysis?.missing_keywords ?? []
    const strengths = atsScore?.strengths ?? []
    const weaknesses = atsScore?.weaknesses ?? []
    const recommendations = atsScore?.recommendations?.length
        ? atsScore.recommendations.map((item, index) => ({
            problem: item,
            improvedText: item,
            impact: index === 0 ? "High" as Impact : index === 1 ? "Medium" as Impact : "Low" as Impact,
        }))
        : []

    const downloadReport = () => {
        const report = [
            "ATS Resume Optimization Report",
            hasATSResult ? `Score: ${displayScore}/100 - ${getScoreLabel(displayScore)}` : "Score: Not calculated yet",
            "",
            "Improvements",
            ...(recommendations.length ? recommendations.map((item) => `- ${item.problem}: ${item.improvedText}`) : ["- No ATS recommendations available yet."]),
            "",
            "Keywords",
            `Found: ${foundKeywords.length ? foundKeywords.join(", ") : "Not available"}`,
            `Missing: ${missingKeywords.length ? missingKeywords.join(", ") : "Not available"}`,
            "",
            "Section Feedback",
            ...(sectionScores.length ? sectionScores.map((item) => `- ${item.name}: ${item.score}/100 - ${item.detail}`) : ["- No section feedback available yet."]),
        ].join("\n")

        const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "ats-resume-report.txt"
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loadingStatus) {
        return <ResumeSkeleton />
    }

    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100 relative max-w-7xl mx-auto">
            <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 pt-1 sm:pt-6 lg:pt-0">
                <ResumeHeroCard
                    score={displayScore}
                    lastUpdated={formatDate(resumeStatus?.ats_calculated_at || resumeUploadedAt)}
                    version={version}
                    fileName={resumeStatus?.has_resume ? resumeFileName : "No resume uploaded yet"}
                    resumeHref={resumeHref}
                    onImprove={handleCalculateATS}
                    onRewrite={() => setShowRewriteModal(true)}
                    isAnalyzing={isCalculatingATS}
                    hasResume={Boolean(resumeStatus?.has_resume || uploadSuccess)}
                />

                {error && (
                    <Alert variant="destructive" className="text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {resumeStatusWarning && (
                    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-900/20 dark:text-yellow-200 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{resumeStatusWarning}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <UploadCard
                            file={file}
                            dragActive={dragActive}
                            uploadProgress={uploadProgress}
                            isUploading={isUploading}
                            uploadSuccess={uploadSuccess}
                            hasResume={Boolean(resumeStatus?.has_resume)}
                            showUploadSection={showUploadSection}
                            onDrag={handleDrag}
                            onDrop={handleDrop}
                            onFileInputChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            onUpload={handleUpload}
                            onReset={handleReset}
                            onToggleUpload={() => setShowUploadSection((value) => !value)}
                        />

                        <TargetingCard
                            jobDescription={jobDescription}
                            isCalculating={isCalculatingATS}
                            onChange={setJobDescription}
                            onAnalyze={handleCalculateATS}
                        />
                    </div>

                    <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                        <ATSScoreCard
                            score={displayScore}
                            formattingScore={atsScore?.formatting_score ?? null}
                            contentScore={atsScore?.content_score ?? null}
                            keywordScore={atsScore?.keyword_score ?? null}
                            isAnalyzing={isCalculatingATS}
                            hasATSResult={hasATSResult}
                        />

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            <StrengthWeaknessCard strengths={strengths} weaknesses={weaknesses} />
                            <RecommendationCard recommendations={recommendations} />
                        </div>

                        <KeywordAnalysisCard foundKeywords={foundKeywords} missingKeywords={missingKeywords} />
                        <SectionAnalysisCard sections={sectionScores} />

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            <SkillsCard skills={atsScore?.extracted_skills} />
                            <ReportCard
                                score={displayScore}
                                improvements={recommendations.length}
                                keywords={foundKeywords.length + missingKeywords.length}
                                sections={sectionScores.length}
                                onDownload={downloadReport}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <RewriteModal open={showRewriteModal} onClose={() => setShowRewriteModal(false)} content={rewritePreview} />
            <SubscriptionModal open={showSubscriptionModal} feature={subscriptionFeature} onClose={() => setShowSubscriptionModal(false)} />
        </div>
    )
}

function ResumeSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-4">
            <div className={`${cardClass} p-5`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-56 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-full max-w-xl rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-800" />)}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="lg:col-span-3 h-80 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
        </div>
    )
}

function ResumeHeroCard({
    score,
    lastUpdated,
    version,
    fileName,
    resumeHref,
    onImprove,
    onRewrite,
    isAnalyzing,
    hasResume,
}: {
    score: number | null
    lastUpdated: string
    version: string
    fileName: string
    resumeHref: string | null
    onImprove: () => void
    onRewrite: () => void
    isAnalyzing: boolean
    hasResume: boolean
}) {
    const hasScore = typeof score === "number"

    return (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {hasScore ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    {score} - {getScoreLabel(score)}
                                </Badge>
                            ) : (
                                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    ATS not calculated
                                </Badge>
                            )}
                            <Badge variant="outline">{version}</Badge>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{lastUpdated}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">AI Resume Optimization Assistant</h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                                Upload, score, rewrite, and tune your resume for targeted roles with ATS-aware recommendations.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={onRewrite} variant="outline" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Wand2 className="h-4 w-4 mr-2" />
                            Rewrite My Resume
                        </Button>
                        <Button onClick={onImprove} disabled={isAnalyzing || !hasResume} className={primaryButtonClass}>
                            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            {hasScore ? "Improve My Resume" : "Calculate ATS Score"}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricTile icon={FileText} label="Current resume" value={fileName} />
                <MetricTile icon={Target} label="Industry benchmark" value="75 avg / 90+ top candidates" />
                <MetricTile icon={ArrowUpRight} label="Score comparison" value={hasScore ? `${score}/100 current ATS score` : "Run ATS analysis to compare versions"} />
            </div>
            {resumeHref && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <Button variant="ghost" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300" onClick={() => window.open(resumeHref, "_blank", "noopener,noreferrer")}>
                        View current resume
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </motion.div>
    )
}

function MetricTile({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
    return (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/70 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{value}</p>
        </div>
    )
}

function UploadCard(props: {
    file: File | null
    dragActive: boolean
    uploadProgress: number
    isUploading: boolean
    uploadSuccess: boolean
    hasResume: boolean
    showUploadSection: boolean
    onDrag: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onUpload: () => void
    onReset: () => void
    onToggleUpload: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const {
        file,
        dragActive,
        uploadProgress,
        isUploading,
        uploadSuccess,
        hasResume,
        showUploadSection,
        onDrag,
        onDrop,
        onFileInputChange,
        onUpload,
        onReset,
        onToggleUpload,
    } = props

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">{hasResume ? "Resume uploaded" : "Upload resume"}</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">PDF or DOCX, max 5MB</p>
                        </div>
                    </div>
                    {hasResume && (
                        <Button variant="ghost" size="sm" onClick={onToggleUpload}>
                            {showUploadSection ? "Hide" : "Replace"}
                        </Button>
                    )}
                </div>
            </div>
            {(!hasResume || showUploadSection) && (
                <div className="p-4 sm:p-5 space-y-4">
                    <div
                        className={`rounded-lg border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-300 ${
                            dragActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                                : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        } ${file ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
                        onDragEnter={onDrag}
                        onDragLeave={onDrag}
                        onDragOver={onDrag}
                        onDrop={onDrop}
                        onClick={() => !isUploading && inputRef.current?.click()}
                    >
                        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={onFileInputChange} className="hidden" disabled={isUploading} />
                        <FileText className={`h-10 w-10 mx-auto mb-3 ${file ? "text-green-500" : "text-gray-400"}`} />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{file?.name || "Drop resume here"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "or click to browse files"}</p>
                    </div>
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Uploading</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2 overflow-hidden transition-all" />
                        </div>
                    )}
                    {uploadSuccess && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            Resume uploaded successfully.
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button onClick={onUpload} disabled={!file || isUploading || uploadSuccess} className={`flex-1 ${primaryButtonClass}`}>
                            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                            Upload
                        </Button>
                        {(file || uploadSuccess) && (
                            <Button onClick={onReset} variant="outline" disabled={isUploading}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function TargetingCard({ jobDescription, isCalculating, onChange, onAnalyze }: { jobDescription: string; isCalculating: boolean; onChange: (value: string) => void; onAnalyze: () => void }) {
    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Role targeting</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tailor feedback to a JD</p>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
                <Textarea
                    placeholder="Paste the job description for targeted keyword matching..."
                    value={jobDescription}
                    onChange={(e) => onChange(e.target.value)}
                    rows={6}
                    disabled={isCalculating}
                    className="resize-none text-sm"
                />
                <Button onClick={onAnalyze} disabled={isCalculating} className={`w-full ${primaryButtonClass}`}>
                    {isCalculating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Analyze Match
                </Button>
            </div>
        </div>
    )
}

function ATSScoreCard({
    score,
    formattingScore,
    contentScore,
    keywordScore,
    isAnalyzing,
    hasATSResult,
}: {
    score: number | null
    formattingScore: number | null
    contentScore: number | null
    keywordScore: number | null
    isAnalyzing: boolean
    hasATSResult: boolean
}) {
    const metrics = [
        { label: "Formatting", value: formattingScore },
        { label: "Content", value: contentScore },
        { label: "Keywords", value: keywordScore },
    ]

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Gauge className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Score Analysis</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current score compared with target hiring benchmarks.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 px-3 py-2">
                        <ArrowUpRight className={`h-4 w-4 ${hasATSResult ? "text-green-600 dark:text-green-400" : "text-gray-400"}`} />
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{hasATSResult ? "Live ATS data" : "Waiting for scan"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{hasATSResult ? "From latest analysis" : "Upload and calculate"}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 p-4 flex flex-col items-center justify-center">
                        <ScorePieChart score={score} />
                        <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs">
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2">
                                <p className="text-gray-500 dark:text-gray-400">Matched</p>
                                <p className="font-bold text-blue-600 dark:text-blue-400">{hasATSResult ? `${score}%` : "--"}</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2">
                                <p className="text-gray-500 dark:text-gray-400">Gap</p>
                                <p className="font-bold text-gray-700 dark:text-gray-200">{hasATSResult && typeof score === "number" ? `${100 - score}%` : "--"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Benchmark label="Average score" value="75" />
                            <Benchmark label="Top candidates" value="90+" />
                            <Benchmark label="Your readiness" value={hasATSResult && typeof score === "number" ? getScoreLabel(score) : "Not analyzed"} />
                        </div>
                        <div className="space-y-4">
                            {metrics.map((metric) => (
                                <div key={metric.label} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                                        <span className="font-semibold">{typeof metric.value === "number" ? `${metric.value}/100` : "--"}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.value ?? 0}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isAnalyzing && <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ScorePieChart({ score }: { score: number | null }) {
    const hasScore = typeof score === "number"
    const safeScore = hasScore ? Math.max(0, Math.min(100, score)) : 0
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (safeScore / 100) * circumference
    const gradientId = safeScore >= 80 ? "atsScoreGreen" : safeScore >= 60 ? "atsScoreAmber" : "atsScoreRed"
    const labelClass = hasScore ? getScoreTone(safeScore) : "text-gray-400 dark:text-gray-500"
    const badgeClass = !hasScore
        ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
        : safeScore >= 80
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : safeScore >= 60
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"

    return (
        <div className="relative w-44 h-44">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90 drop-shadow-sm" role="img" aria-label={hasScore ? `ATS score ${safeScore} out of 100` : "ATS score not calculated"}>
                <defs>
                    <linearGradient id="atsScoreGreen" x1="18" y1="18" x2="122" y2="122" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22c55e" />
                        <stop offset="0.55" stopColor="#06b6d4" />
                        <stop offset="1" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="atsScoreAmber" x1="18" y1="18" x2="122" y2="122" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f59e0b" />
                        <stop offset="0.55" stopColor="#eab308" />
                        <stop offset="1" stopColor="#22c55e" />
                    </linearGradient>
                    <linearGradient id="atsScoreRed" x1="18" y1="18" x2="122" y2="122" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ef4444" />
                        <stop offset="0.55" stopColor="#f97316" />
                        <stop offset="1" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="atsAccent" x1="26" y1="26" x2="114" y2="114" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8b5cf6" />
                        <stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    strokeWidth="18"
                    fill="none"
                    className="stroke-gray-200 dark:stroke-gray-800"
                />
                <motion.circle
                    cx="70"
                    cy="70"
                    r={radius}
                    strokeWidth="18"
                    fill="none"
                    strokeLinecap="round"
                    stroke={`url(#${gradientId})`}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className={`text-4xl font-bold ${labelClass}`}>{hasScore ? safeScore : "--"}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ATS Score</p>
                <Badge className={`mt-2 ${badgeClass}`}>
                    {hasScore ? getScoreLabel(safeScore) : "Not analyzed"}
                </Badge>
            </div>
        </div>
    )
}

function Benchmark({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/70 dark:bg-gray-800/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    )
}

function RecommendationCard({ recommendations }: { recommendations: { problem: string; improvedText: string; impact: Impact }[] }) {
    const [copied, setCopied] = useState<string | null>(null)

    const copyText = async (text: string, problem: string) => {
        await navigator.clipboard?.writeText(text)
        setCopied(problem)
        setTimeout(() => setCopied(null), 1400)
    }

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Smart AI Recommendations</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Actionable rewrites ready to use.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
                {!recommendations.length && (
                    <EmptyState
                        icon={Bot}
                        title="No AI recommendations yet"
                        description="Run ATS analysis after uploading a resume to generate live recommendations."
                    />
                )}
                {recommendations.map((item) => (
                    <div key={item.problem} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.problem}</p>
                                <Badge variant="outline" className="mt-1 text-[11px]">{item.impact} impact</Badge>
                            </div>
                            <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        </div>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800/70 p-3">{item.improvedText}</p>
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => copyText(item.improvedText, item.problem)}>
                                {copied === item.problem ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                Copy
                            </Button>
                            <Button size="sm" className={`flex-1 ${primaryButtonClass}`}>
                                <Clipboard className="h-4 w-4 mr-2" />
                                Auto Insert
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function KeywordAnalysisCard({ foundKeywords, missingKeywords }: { foundKeywords: string[]; missingKeywords: string[] }) {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'))
    }, [])

    const keywords = [
        ...foundKeywords.map((keyword, index) => ({ keyword, found: true, importance: index < 2 ? "High" : "Medium", where: "Skills or experience" })),
        ...missingKeywords.map((keyword, index) => ({ keyword, found: false, importance: index < 2 ? "High" : "Medium", where: index % 2 ? "Professional summary" : "Experience bullets" })),
    ]

    const keywordChartData = [
        { name: 'Found', value: foundKeywords.length, fill: '#22c55e' },
        { name: 'Missing', value: missingKeywords.length, fill: '#ef4444' },
    ]

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">Keyword Analysis</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{foundKeywords.length} found, {missingKeywords.length} missing.</p>
                        </div>
                    </div>
                    <Button className={primaryButtonClass}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Optimize Resume for Keywords
                    </Button>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
                <div className="h-48 w-full rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Keyword coverage</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{foundKeywords.length + missingKeywords.length} total</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={keywordChartData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#6b7280', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                                    borderRadius: '12px',
                                    color: isDarkMode ? '#f8fafc' : '#111827',
                                }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {keywordChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {!keywords.length && (
                        <div className="md:col-span-2">
                            <EmptyState
                                icon={Target}
                                title="No keyword data yet"
                                description="Paste a job description and calculate ATS score to see found and missing keywords."
                            />
                        </div>
                    )}
                    {keywords.map((item) => (
                        <div key={`${item.keyword}-${item.found}`} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 hover:shadow-sm transition-all">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    {item.found ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.keyword}</p>
                                </div>
                                <Badge className={item.importance === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}>
                                    {item.importance}
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Where to add: {item.where}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function SectionAnalysisCard({ sections }: { sections: { name: string; score: number; status: StatusTone; detail: string }[] }) {
    const [openSection, setOpenSection] = useState(sections[0]?.name || "")

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Interactive Section Analysis</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Scores, status, and focused fixes by resume section.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
                {!sections.length && (
                    <EmptyState
                        icon={BarChart3}
                        title="No section feedback yet"
                        description="ATS section analysis will appear here after the resume scan completes."
                    />
                )}
                {sections.map((section) => {
                    const isOpen = openSection === section.name
                    return (
                        <div key={section.name} className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <button type="button" onClick={() => setOpenSection(isOpen ? "" : section.name)} className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{section.name}</p>
                                        <Badge className={toneClasses[section.status]}>{section.status}</Badge>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${section.score}%` }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{section.score}/100</span>
                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className="px-3 pb-3 space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800/70 p-3">{section.detail}</p>
                                    <Button size="sm" className={primaryButtonClass}>
                                        <Wand2 className="h-4 w-4 mr-2" />
                                        Fix this section
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function StrengthWeaknessCard({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
    const rows = [
        ...strengths.map((text) => ({ text, tone: "good" as StatusTone, label: "Strong", impact: "High" })),
        ...weaknesses.map((text, index) => ({ text, tone: index === 0 ? "poor" as StatusTone : "warning" as StatusTone, label: index === 0 ? "Weak" : "Moderate", impact: index === 0 ? "High" : "Medium" })),
    ]

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Strengths and Weaknesses</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Impact-coded feedback at a glance.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
                {!rows.length && (
                    <EmptyState
                        icon={CheckCircle}
                        title="No strengths or weaknesses yet"
                        description="Analyze your uploaded resume to detect live strengths and improvement areas."
                    />
                )}
                {rows.map((row) => (
                    <div key={row.text} className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                        <span className={`mt-0.5 rounded-full p-1 ${toneClasses[row.tone]}`}>
                            {row.tone === "good" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        </span>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.label}</p>
                                <Badge variant="outline" className="text-[11px]">{row.impact} impact</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{row.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SkillsCard({ skills }: { skills?: ATSScore["extracted_skills"] }) {
    const groups = [
        { label: "Technical", values: skills?.technical_skills ?? [] },
        { label: "Soft skills", values: skills?.soft_skills ?? [] },
        { label: "Domain", values: skills?.domain_skills ?? [] },
        { label: "Tools", values: skills?.tools_platforms ?? [] },
    ].filter((group) => group.values.length > 0)

    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Extracted Skills</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Grouped for quick review.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
                {!groups.length && (
                    <EmptyState
                        icon={Sparkles}
                        title="No extracted skills yet"
                        description="Skills detected by ATS will appear here after analysis."
                    />
                )}
                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                            {group.values.map((skill) => (
                                <span key={skill} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function EmptyState({ icon: Icon, title, description }: { icon: ComponentType<{ className?: string }>; title: string; description: string }) {
    return (
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 p-4 text-center">
            <Icon className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500" />
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    )
}

function ReportCard({ score, improvements, keywords, sections, onDownload }: { score: number | null; improvements: number; keywords: number; sections: number; onDownload: () => void }) {
    return (
        <div className={cardClass}>
            <div className={cardHeaderClass}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                        <Download className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">ATS Report Preview</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Score, improvements, keywords, and section feedback.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/70 dark:bg-gray-800/40">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <ReportMetric label="Score" value={typeof score === "number" ? `${score}/100` : "Not ready"} />
                        <ReportMetric label="Improvements" value={String(improvements)} />
                        <ReportMetric label="Keywords" value={String(keywords)} />
                        <ReportMetric label="Sections" value={String(sections)} />
                    </div>
                </div>
                <Button onClick={onDownload} className={`w-full ${primaryButtonClass}`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download ATS Report
                </Button>
            </div>
        </div>
    )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    )
}

function RewriteModal({ open, onClose, content }: { open: boolean; onClose: () => void; content: string }) {
    const [copied, setCopied] = useState(false)

    if (!open) return null

    const copy = async () => {
        await navigator.clipboard?.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                <div className={cardHeaderClass}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Wand2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">AI Resume Rewrite</h2>
                                <p className="text-xs text-gray-600 dark:text-gray-400">ATS-optimized resume content preview.</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="p-4 sm:p-5 space-y-4">
                    <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 dark:bg-gray-800/70 p-4 text-sm text-gray-700 dark:text-gray-200 font-sans leading-relaxed">
                        {content}
                    </pre>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={copy} className={`flex-1 ${primaryButtonClass}`}>
                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy Optimized Version
                        </Button>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

function SubscriptionModal({ open, feature, onClose }: { open: boolean; feature: string; onClose: () => void }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                <div className={cardHeaderClass}>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Feature unavailable</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your current plan does not include {feature}.</p>
                </div>
                <div className="p-4 sm:p-5 flex justify-end">
                    <Button onClick={onClose} className={primaryButtonClass}>Got it</Button>
                </div>
            </div>
        </div>
    )
}
