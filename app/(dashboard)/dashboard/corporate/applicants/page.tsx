"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { apiClient, JobApplicationItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Code2,
    Download,
    FileText,
    Eye,
    IndianRupee,
    Mail,
    MoreHorizontal,
    Phone,
    Search,
    SlidersHorizontal,
    Star,
    TrendingUp,
    Trash2,
    Upload,
    UserRound,
    UserRoundCheck,
    XCircle,
} from "lucide-react"

type ApplicationStatus = "applied" | "shortlisted" | "selected" | "rejected"
type ColumnDateFilter = "all" | "7" | "30"

function formatCurrency(value?: number | string | null) {
    if (value == null) return "Not specified"
    const numericValue = typeof value === "string" ? Number(value) : value
    if (Number.isNaN(numericValue)) return String(value)
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(numericValue)
}

function formatSalaryRange(application: JobApplicationItem) {
    if (application.expected_salary != null && application.expected_salary !== "") {
        return formatCurrency(application.expected_salary)
    }

    const salaryMin = application.salary_min
    const salaryMax = application.salary_max
    const currency = application.salary_currency || "INR"

    if ((salaryMin == null || salaryMin === "") && (salaryMax == null || salaryMax === "")) {
        return "Not specified"
    }

    if (salaryMin != null && salaryMin !== "" && salaryMax != null && salaryMax !== "") {
        return `${formatCurrency(salaryMin)} - ${formatCurrency(salaryMax).replace(/^₹/, "")} ${currency}`
    }

    return `${formatCurrency(salaryMin ?? salaryMax)} ${currency}`
}

function formatDate(value?: string | null) {
    if (!value) return "Not specified"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function parseProgrammingLanguages(value?: string | null) {
    if (!value) return []
    return value
        .split(/[,;\n|]+/)
        .map((skill) => skill.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 6)
}

function getResumeFileName(url?: string | null) {
    if (!url) return "No resume attached"
    const cleanUrl = url.split("?")[0]
    const fileName = cleanUrl.split("/").filter(Boolean).pop()
    return fileName ? decodeURIComponent(fileName) : "Submitted resume"
}

function scoreTone(score?: number | string | null) {
    const numericScore = score == null || score === "" ? null : Number(score)
    if (numericScore == null || Number.isNaN(numericScore)) {
        return {
            value: null,
            label: "Not calculated",
            summary: "Ask the student to complete the assessment for a stronger decision.",
            textClass: "text-[#5f6f98] dark:text-[#94a3b8]",
            strokeClass: "border-[#cbd5e1] dark:border-[#334155]",
        }
    }
    if (numericScore >= 90) {
        return {
            value: Math.round(numericScore),
            label: "Excellent",
            summary: "Very strong match for the hiring pipeline.",
            textClass: "text-[#15803d] dark:text-[#4ade80]",
            strokeClass: "border-[#22c55e]",
        }
    }
    if (numericScore >= 75) {
        return {
            value: Math.round(numericScore),
            label: "Good",
            summary: "Good profile. Review resume and role fit before final action.",
            textClass: "text-[#f97316] dark:text-[#fb923c]",
            strokeClass: "border-[#f97316]",
        }
    }
    if (numericScore >= 50) {
        return {
            value: Math.round(numericScore),
            label: "Average",
            summary: "Moderate fit. Needs closer review before shortlisting.",
            textClass: "text-[#d97706] dark:text-[#fbbf24]",
            strokeClass: "border-[#fbbf24]",
        }
    }
    return {
        value: Math.round(numericScore),
        label: "Poor",
        summary: "Low match for this role based on current scoring.",
        textClass: "text-[#dc2626] dark:text-[#f87171]",
        strokeClass: "border-[#ef4444]",
    }
}

function reviewDecisionDisplay(status: string) {
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus === "shortlisted") {
        return {
            label: "Shortlisted",
            className: "border-[#bbf7d0] bg-[#dcfce7] text-[#166534] dark:border-[#14532d] dark:bg-[#13291d] dark:text-[#bbf7d0]",
        }
    }
    if (normalizedStatus === "selected") {
        return {
            label: "Selected",
            className: "border-[#bfdbfe] bg-[#dbeafe] text-[#1d4ed8] dark:border-[#1d4ed8] dark:bg-[#172554] dark:text-[#bfdbfe]",
        }
    }
    if (normalizedStatus === "rejected") {
        return {
            label: "Rejected",
            className: "border-[#fecaca] bg-[#fee2e2] text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#2b1515] dark:text-[#fecaca]",
        }
    }
    return null
}

function formatStatusLabel(status: string) {
    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { detail?: unknown } } }).response
        if (typeof response?.data?.detail === "string") return response.data.detail
    }

    return fallback
}

const statusOptions: Array<{
    value: ApplicationStatus
    label: string
    dotClass: string
    activeClass: string
    idleClass: string
}> = [
    {
        value: "applied",
        label: "Applied",
        dotClass: "bg-[#3b82f6]",
        activeClass: "border-[#3b82f6] bg-[#dbeafe] text-[#1d4ed8] dark:border-[#60a5fa] dark:bg-[#172554] dark:text-[#bfdbfe]",
        idleClass: "border-[#d7ddf8] bg-white text-[#1f2937] hover:border-[#a5b4fc] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white dark:hover:border-[#5b6fa6]",
    },
    {
        value: "shortlisted",
        label: "Shortlisted",
        dotClass: "bg-[#eab308]",
        activeClass: "border-[#eab308] bg-[#fef3c7] text-[#a16207] dark:border-[#facc15] dark:bg-[#3f2f10] dark:text-[#fde68a]",
        idleClass: "border-[#d7ddf8] bg-white text-[#1f2937] hover:border-[#a5b4fc] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white dark:hover:border-[#5b6fa6]",
    },
    {
        value: "selected",
        label: "Selected",
        dotClass: "bg-[#22c55e]",
        activeClass: "border-[#22c55e] bg-[#dcfce7] text-[#166534] dark:border-[#4ade80] dark:bg-[#183925] dark:text-[#bbf7d0]",
        idleClass: "border-[#d7ddf8] bg-white text-[#1f2937] hover:border-[#a5b4fc] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white dark:hover:border-[#5b6fa6]",
    },
    {
        value: "rejected",
        label: "Rejected",
        dotClass: "bg-[#ef4444]",
        activeClass: "border-[#ef4444] bg-[#fee2e2] text-[#b91c1c] dark:border-[#f87171] dark:bg-[#3b1717] dark:text-[#fecaca]",
        idleClass: "border-[#d7ddf8] bg-white text-[#1f2937] hover:border-[#a5b4fc] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white dark:hover:border-[#5b6fa6]",
    },
]

const pipelineStatuses: Array<{
    value: ApplicationStatus
    label: string
    icon: ReactNode
    iconWrapClass: string
    accentClass: string
    panelClass: string
    countClass: string
    emptyIconClass: string
    emptyTitle: string
    emptyCopy: string
}> = [
    {
        value: "applied",
        label: "Applied",
        icon: <FileText className="h-5 w-5" />,
        iconWrapClass: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50",
        accentClass: "border-blue-200 dark:border-blue-700/50 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-900/20 dark:via-blue-900/10 dark:to-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600/50 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-sm transition-all duration-200",
        panelClass: "bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/40 backdrop-blur-sm border border-blue-100 dark:border-blue-800/50",
        countClass: "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-400 dark:to-blue-500 shadow-sm",
        emptyIconClass: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 dark:from-blue-800/50 dark:to-blue-700/50 dark:text-blue-300",
        emptyTitle: "No candidates here",
        emptyCopy: "New applications will appear here.",
    },
    {
        value: "shortlisted",
        label: "Shortlisted",
        icon: <Star className="h-5 w-5" />,
        iconWrapClass: "bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 dark:from-amber-900/30 dark:to-orange-800/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50",
        accentClass: "border-amber-200 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-900/20 dark:via-amber-900/10 dark:to-orange-900/20 hover:border-amber-300 dark:hover:border-amber-600/50 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-sm transition-all duration-200",
        panelClass: "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-orange-950/40 backdrop-blur-sm border border-amber-100 dark:border-amber-800/50",
        countClass: "bg-gradient-to-r from-amber-500 to-orange-500 text-white dark:from-amber-400 dark:to-orange-400 shadow-sm",
        emptyIconClass: "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 dark:from-amber-800/50 dark:to-orange-700/50 dark:text-amber-300",
        emptyTitle: "Review pipeline",
        emptyCopy: "Move qualified candidates here for shortlisting.",
    },
    {
        value: "selected",
        label: "Selected",
        icon: <UserRoundCheck className="h-5 w-5" />,
        iconWrapClass: "bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 dark:from-green-900/30 dark:to-emerald-800/30 dark:text-green-300 border border-green-200 dark:border-green-700/50",
        accentClass: "border-green-200 dark:border-green-700/50 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-900/20 dark:via-green-900/10 dark:to-emerald-900/20 hover:border-green-300 dark:hover:border-green-600/50 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-sm transition-all duration-200",
        panelClass: "bg-gradient-to-br from-green-50/80 via-white to-emerald-50/80 dark:from-green-950/40 dark:via-green-900/30 dark:to-emerald-950/40 backdrop-blur-sm border border-green-100 dark:border-green-800/50",
        countClass: "bg-gradient-to-r from-green-500 to-emerald-500 text-white dark:from-green-400 dark:to-emerald-400 shadow-sm",
        emptyIconClass: "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 dark:from-green-800/50 dark:to-emerald-700/50 dark:text-green-300",
        emptyTitle: "No selected candidates",
        emptyCopy: "Selected applicants will appear here.",
    },
    {
        value: "rejected",
        label: "Rejected",
        icon: <XCircle className="h-5 w-5" />,
        iconWrapClass: "bg-gradient-to-br from-red-50 to-rose-100 text-red-600 dark:from-red-900/30 dark:to-rose-800/30 dark:text-red-300 border border-red-200 dark:border-red-700/50",
        accentClass: "border-red-200 dark:border-red-700/50 bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-red-900/20 dark:via-red-900/10 dark:to-rose-900/20 hover:border-red-300 dark:hover:border-red-600/50 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-sm transition-all duration-200",
        panelClass: "bg-gradient-to-br from-red-50/80 via-white to-rose-50/80 dark:from-red-950/40 dark:via-red-900/30 dark:to-rose-950/40 backdrop-blur-sm border border-red-100 dark:border-red-800/50",
        countClass: "bg-gradient-to-r from-red-500 to-rose-500 text-white dark:from-red-400 dark:to-rose-400 shadow-sm",
        emptyIconClass: "bg-gradient-to-br from-red-100 to-rose-100 text-red-600 dark:from-red-800/50 dark:to-rose-700/50 dark:text-red-300",
        emptyTitle: "No rejected candidates",
        emptyCopy: "Rejected applicants will appear here.",
    },
]

function SummaryCard({
    title,
    value,
    icon,
    tone,
}: {
    title: string
    value: number
    icon: ReactNode
    tone: string
}) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`min-h-[80px] rounded-xl border p-4 shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/40 backdrop-blur-sm ${tone}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
                    <p className="mt-2 text-xl font-bold leading-none text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-md shadow-black/10 dark:bg-white/10 dark:shadow-none border border-gray-200/50 dark:border-white/10">
                    {icon}
                </div>
            </div>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const tone =
        status === "selected"
            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border border-green-200 dark:border-green-700/50 shadow-sm"
            : status === "shortlisted"
              ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 shadow-sm"
              : status === "rejected"
                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 border border-red-200 dark:border-red-700/50 shadow-sm"
                : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 shadow-sm"
    return (
        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>
            {formatStatusLabel(status)}
        </span>
    )
}

function PipelineEmptyState({ column }: { column: (typeof pipelineStatuses)[number] }) {
    return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300/50 bg-gradient-to-br from-gray-50/50 to-white dark:border-gray-600/50 dark:from-gray-900/30 dark:to-gray-800/20 px-6 py-8 text-center backdrop-blur-sm">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-black/10 dark:shadow-none ${column.emptyIconClass}`}>
                {column.icon}
            </div>
            <p className="mt-4 text-sm font-bold text-gray-800 dark:text-gray-100">{column.emptyTitle}</p>
            <p className="mt-2 max-w-[240px] text-xs leading-5 text-gray-600 dark:text-gray-400">{column.emptyCopy}</p>
        </div>
    )
}

function ApplicantPipelineCard({
    application,
    onReview,
    onRequestMove,
    onRequestRemove,
    isMenuOpen,
    onToggleMenu,
}: {
    application: JobApplicationItem
    onReview: (application: JobApplicationItem) => void
    onRequestMove: (application: JobApplicationItem, status: ApplicationStatus) => void
    onRequestRemove: (application: JobApplicationItem) => void
    isMenuOpen: boolean
    onToggleMenu: () => void
}) {
    const moveTargets: ApplicationStatus[] = ["shortlisted", "selected", "rejected"]

    return (
        <article className="relative rounded-xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-lg shadow-black/5 dark:border-gray-700/50 dark:from-gray-900/40 dark:to-gray-800/30 dark:shadow-xl dark:shadow-black/40 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-2xl dark:hover:shadow-black/50 hover:-translate-y-1">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 shadow-md shadow-black/10 dark:shadow-none border border-blue-200/50 dark:border-blue-700/50">
                    <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {application.student_name || "Not specified"}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-gray-600 dark:text-gray-400">
                        {application.job_title || "Not specified"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onToggleMenu}
                    data-application-controls
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-gray-100 hover:shadow-md border border-gray-200/60 dark:border-gray-600/50"
                    aria-label="Applicant actions"
                    aria-expanded={isMenuOpen}
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            {isMenuOpen ? (
                <div data-application-controls className="mt-3 w-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-xl shadow-black/10 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/95 dark:shadow-black/40">
                    {/* View Details Section */}
                    <div className="p-1">
                        <button
                            type="button"
                            onClick={() => onReview(application)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-xs font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                        >
                            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            View Details
                        </button>
                    </div>
                    
                    {/* Pipeline Movement Section */}
                    <div className="border-t border-gray-100/50 dark:border-gray-700/50 p-1">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Move to Pipeline</p>
                        {moveTargets
                            .filter((status) => status !== application.status)
                            .map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => onRequestMove(application, status)}
                                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-xs font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                                >
                                    {status === "shortlisted" ? (
                                        <>
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                                <Star className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">Shortlisted</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Move to shortlisted stage</div>
                                            </div>
                                        </>
                                    ) : status === "selected" ? (
                                        <>
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                <UserRoundCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">Selected</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Move to selected stage</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">Rejected</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Move to rejected stage</div>
                                            </div>
                                        </>
                                    )}
                                </button>
                            ))}
                    </div>
                    
                    {/* Delete Section */}
                    {application.status === "applied" ? (
                        <div className="border-t border-gray-100/50 dark:border-gray-700/50 p-1">
                            <button
                                type="button"
                                onClick={() => onRequestRemove(application)}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Delete</div>
                                    <div className="text-xs text-red-500 dark:text-red-400">Remove from pipeline</div>
                                </div>
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={application.status} />
                <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:bg-gray-800/50 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                    {formatDate(application.created_at)}
                </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-gray-200/50 pt-3 text-xs font-medium text-gray-600 dark:border-gray-600/50 dark:text-gray-400">
                <p className="truncate">{application.student_email || application.student_phone || "Not specified"}</p>
                <p className="inline-flex max-w-full items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="truncate">{formatSalaryRange(application)}</span>
                </p>
            </div>
        </article>
    )
}

export default function CorporateApplicantsPage() {
    const [applications, setApplications] = useState<JobApplicationItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all_applications")
    const [selectedApplication, setSelectedApplication] = useState<JobApplicationItem | null>(null)
    const [draftStatus, setDraftStatus] = useState<ApplicationStatus>("applied")
    const [corporateNotes, setCorporateNotes] = useState("")
    const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [sendingOffer, setSendingOffer] = useState(false)
    const [activeSearchColumn, setActiveSearchColumn] = useState<ApplicationStatus | null>(null)
    const [activeFilterColumn, setActiveFilterColumn] = useState<ApplicationStatus | null>(null)
    const [activeColumnMenu, setActiveColumnMenu] = useState<ApplicationStatus | null>(null)
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null)
    const [pendingMove, setPendingMove] = useState<{ application: JobApplicationItem; status: ApplicationStatus } | null>(null)
    const [pendingRemove, setPendingRemove] = useState<JobApplicationItem | null>(null)
    const [removingApplicant, setRemovingApplicant] = useState(false)
    const [columnSearches, setColumnSearches] = useState<Record<ApplicationStatus, string>>({
        applied: "",
        shortlisted: "",
        selected: "",
        rejected: "",
    })
    const [columnDateFilters, setColumnDateFilters] = useState<Record<ApplicationStatus, ColumnDateFilter>>({
        applied: "all",
        shortlisted: "all",
        selected: "all",
        rejected: "all",
    })

    const currentBannerDate = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            }).format(new Date()),
        []
    )

    const cardContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    }

    const cardItemVariants: Variants = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    }

    useEffect(() => {
        const loadApplicants = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await apiClient.getCorporateApplicants()
                setApplications(data)
            } catch (error) {
                setError(getErrorMessage(error, "Failed to load applicants"))
            } finally {
                setLoading(false)
            }
        }

        loadApplicants()
    }, [])

    useEffect(() => {
        const closeOpenControls = (event: MouseEvent) => {
            const target = event.target
            if (target instanceof Element && target.closest("[data-application-controls]")) return

            setActiveColumnMenu(null)
            setActiveSearchColumn(null)
            setActiveFilterColumn(null)
            setActiveActionMenuId(null)
        }

        document.addEventListener("mousedown", closeOpenControls)
        return () => document.removeEventListener("mousedown", closeOpenControls)
    }, [])

    const filteredApplications = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        return applications.filter((application) => {
            if (statusFilter !== "all_applications" && application.status !== statusFilter) return false
            if (!query) return true
            return [
                application.student_name,
                application.student_email,
                application.student_phone,
                application.job_title,
                application.company_name,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        })
    }, [applications, searchTerm, statusFilter])

    const statusCounts = useMemo(
        () => ({
            all: applications.length,
            applied: applications.filter((item) => item.status === "applied").length,
            shortlisted: applications.filter((item) => item.status === "shortlisted").length,
            selected: applications.filter((item) => item.status === "selected").length,
            rejected: applications.filter((item) => item.status === "rejected").length,
        }),
        [applications]
    )

    const visibleApplicationsByStatus = useMemo(
        () =>
            pipelineStatuses.reduce(
                (groups, status) => {
                    const columnQuery = columnSearches[status.value].trim().toLowerCase()
                    const dateFilter = columnDateFilters[status.value]
                    const now = Date.now()
                    groups[status.value] = applications.filter((application) => {
                        if (application.status !== status.value) return false
                        if (!columnQuery) return true
                        return [
                            application.student_name,
                            application.student_email,
                            application.student_phone,
                            application.job_title,
                            application.company_name,
                        ]
                            .filter(Boolean)
                            .some((value) => String(value).toLowerCase().includes(columnQuery))
                    }).filter((application) => {
                        if (dateFilter === "all") return true
                        const createdAt = application.created_at ? new Date(application.created_at).getTime() : Number.NaN
                        if (Number.isNaN(createdAt)) return false
                        const days = dateFilter === "7" ? 7 : 30
                        return now - createdAt <= days * 24 * 60 * 60 * 1000
                    })
                    return groups
                },
                {} as Record<ApplicationStatus, JobApplicationItem[]>
            ),
        [applications, columnDateFilters, columnSearches]
    )

    const applicantGridClass = "grid grid-cols-[2.2fr_1.7fr_0.9fr_1.1fr_1.7fr_0.7fr] items-center"

    const openStatusModal = (application: JobApplicationItem) => {
        setActiveActionMenuId(null)
        setSelectedApplication(application)
        setDraftStatus((application.status as ApplicationStatus) || "applied")
        setCorporateNotes("")
        setOfferLetterFile(null)
        setSuccessMessage("")
    }

    const closeStatusModal = () => {
        setSelectedApplication(null)
        setCorporateNotes("")
        setOfferLetterFile(null)
        setUpdatingStatus(false)
        setSendingOffer(false)
    }

    const requestMove = (application: JobApplicationItem, status: ApplicationStatus) => {
        setActiveActionMenuId(null)
        setPendingMove({ application, status })
        setError("")
        setSuccessMessage("")
    }

    const requestRemove = (application: JobApplicationItem) => {
        setActiveActionMenuId(null)
        setPendingRemove(application)
        setError("")
        setSuccessMessage("")
    }

    const handleStatusUpdate = async () => {
        if (!selectedApplication) return
        setUpdatingStatus(true)
        setError("")
        setSuccessMessage("")
        try {
            const updated = await apiClient.updateCorporateApplicant(selectedApplication.id, { status: draftStatus })
            setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            setSelectedApplication(updated)
            setSuccessMessage(`Application status updated to ${formatStatusLabel(updated.status)}.`)
            closeStatusModal()
        } catch (error) {
            setError(getErrorMessage(error, "Failed to update application status"))
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleReviewDecision = async (status: ApplicationStatus) => {
        if (!selectedApplication) return
        setUpdatingStatus(true)
        setError("")
        setSuccessMessage("")
        try {
            const updated = await apiClient.updateCorporateApplicant(selectedApplication.id, { status })
            setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            setSelectedApplication(updated)
            setDraftStatus(status)
            setSuccessMessage(`Application moved to ${formatStatusLabel(updated.status)}.`)
            closeStatusModal()
        } catch (error) {
            setError(getErrorMessage(error, `Failed to ${status === "rejected" ? "reject" : "shortlist"} application`))
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleConfirmMove = async () => {
        if (!pendingMove) return
        setUpdatingStatus(true)
        setError("")
        setSuccessMessage("")
        try {
            const updated = await apiClient.updateCorporateApplicant(pendingMove.application.id, { status: pendingMove.status })
            setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            setPendingMove(null)
            setSuccessMessage(`Application moved to ${formatStatusLabel(updated.status)}.`)
        } catch (error) {
            setError(getErrorMessage(error, "Failed to move application"))
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleConfirmRemove = async () => {
        if (!pendingRemove) return
        setRemovingApplicant(true)
        setError("")
        setSuccessMessage("")
        try {
            await apiClient.deleteCorporateApplicant(pendingRemove.id)
            setApplications((current) => current.filter((item) => item.id !== pendingRemove.id))
            setPendingRemove(null)
            setSuccessMessage("Application removed.")
        } catch (error) {
            setError(getErrorMessage(error, "Failed to remove application"))
        } finally {
            setRemovingApplicant(false)
        }
    }

    const handleSendOfferLetter = async () => {
        if (!selectedApplication) return

        if (!offerLetterFile) {
            setError("Choose an offer letter PDF before sending.")
            return
        }

        if (offerLetterFile.type && offerLetterFile.type !== "application/pdf") {
            setError("Only PDF offer letters are supported.")
            return
        }

        if (offerLetterFile.size > 5 * 1024 * 1024) {
            setError("Offer letter PDF must be 5MB or smaller.")
            return
        }

        setSendingOffer(true)
        setError("")
        setSuccessMessage("")
        try {
            const updated = await apiClient.uploadCorporateOfferLetter(selectedApplication.id, offerLetterFile)
            setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            setSelectedApplication(updated)
            setOfferLetterFile(null)
            setSuccessMessage("Offer letter PDF sent to the student.")
        } catch (error) {
            setError(getErrorMessage(error, "Failed to send offer letter"))
        } finally {
            setSendingOffer(false)
        }
    }

    return (
        <div className="space-y-5 bg-[#f8fafc] text-[#0f172a] dark:bg-[#07101f]">
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-lg border border-[#dbe7ff] bg-[#eaf2ff] px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-[#273650] dark:bg-[#111a33] dark:shadow-[0_20px_34px_rgba(3,8,26,0.4)]"
            >
                <div className="space-y-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-normal text-[#020617] dark:text-white">Application Management</h1>
                            <ClipboardList className="h-6 w-6 text-[#8a4f5d] dark:text-[#f0b9c6]" />
                        </div>
                        <p className="mt-3 text-base font-medium text-[#123d72] dark:text-[#c8d7ff]">
                            Manage applications and move candidates through your hiring pipeline
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#9dccff] px-4 py-1.5 text-xs font-semibold text-[#073b73] dark:bg-[#203c67] dark:text-[#d9e8ff]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {currentBannerDate}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#d7f7d5] px-4 py-1.5 text-xs font-semibold text-[#10622a] dark:bg-[#183925] dark:text-[#b7efc5]">
                            <UserRoundCheck className="h-3.5 w-3.5" />
                            Talent Pipeline
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#dde7ff] px-4 py-1.5 text-xs font-semibold text-[#2348b8] dark:bg-[#243567] dark:text-[#bfd0ff]">
                            <Star className="h-3.5 w-3.5" />
                            Hiring Opportunities
                        </span>
                    </div>
                </div>
            </motion.section>
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="hidden"
            >
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[1.8rem] font-bold tracking-tight text-[#111827] dark:text-white">Application Management</h1>
                        <span className="text-[1.6rem]" aria-hidden="true">📋</span>
                    </div>
                    <p className="max-w-3xl text-[0.98rem] text-[#29476f] dark:text-[#c8d7ff]">
                        Manage job applications and offer letters
                        <span className="ml-2" aria-hidden="true">✨</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#8fc0f7]/70 px-4 py-2 text-[0.88rem] font-medium text-[#123d72] dark:bg-[#20376a] dark:text-[#d9e5ff]">
                            <CalendarDays className="h-4 w-4" />
                            {currentBannerDate}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#d8f3d9] px-4 py-2 text-[0.88rem] font-medium text-[#166534] dark:bg-[#183925] dark:text-[#b7efc5]">
                            <ClipboardList className="h-4 w-4" />
                            Talent Management
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#dfe8ff] px-4 py-2 text-[0.88rem] font-medium text-[#2348b8] dark:bg-[#243567] dark:text-[#bfd0ff]">
                            <ClipboardList className="h-4 w-4" />
                            Hiring Pipeline
                        </span>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="All Applications"
                        value={statusCounts.all}
                        icon={<UserRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                        tone="border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-700/50 dark:from-indigo-950/30 dark:to-purple-950/30"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Applied"
                        value={statusCounts.applied}
                        icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        tone="border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-700/50 dark:from-blue-950/30 dark:to-indigo-950/30"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Shortlisted"
                        value={statusCounts.shortlisted}
                        icon={<Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                        tone="border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-700/50 dark:from-amber-950/30 dark:to-orange-950/30"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Selected"
                        value={statusCounts.selected}
                        icon={<UserRoundCheck className="h-5 w-5 text-green-600 dark:text-green-400" />}
                        tone="border-green-200/60 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-700/50 dark:from-green-950/30 dark:to-emerald-950/30"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Rejected"
                        value={statusCounts.rejected}
                        icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                        tone="border-red-200/60 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-700/50 dark:from-red-950/30 dark:to-rose-950/30"
                    />
                </motion.div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
                className="hidden"
            >
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#97a3bf] dark:text-[#8fa0c9]" />
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by student name, job title, or email..."
                            className="h-12 rounded-[15px] border-[#2f64c8] bg-white pl-12 text-[0.96rem] text-[#1d2755] placeholder:text-[#8b97bf] focus-visible:ring-0 dark:border-[#4c73d4] dark:bg-[#1a213a] dark:text-white dark:placeholder:text-[#8e99bf]"
                        />
                    </div>
                    <div className="relative w-full lg:w-[300px]">
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                            className="h-12 w-full appearance-none rounded-[15px] border border-[#d7ddf8] bg-white pl-12 pr-4 text-[0.96rem] text-[#1d2755] outline-none transition focus:border-[#9cb7f4] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white"
                        >
                            <option value="all_applications">All Applications ({statusCounts.all})</option>
                            <option value="applied">Applied ({statusCounts.applied})</option>
                            <option value="shortlisted">Shortlisted ({statusCounts.shortlisted})</option>
                            <option value="selected">Selected ({statusCounts.selected})</option>
                            <option value="rejected">Rejected ({statusCounts.rejected})</option>
                        </select>
                        <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#97a3bf] dark:text-[#8fa0c9]" />
                    </div>
                </div>
            </motion.section>

            {loading ? <p className="text-sm text-[#5f6f98] dark:text-[#b8c5e6]">Loading applications...</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
                className="grid grid-cols-1 gap-4 xl:grid-cols-4"
            >
                {pipelineStatuses.map((column) => {
                    const columnApplications = visibleApplicationsByStatus[column.value]
                    return (
                        <div
                            key={column.value}
                            className={`flex h-[540px] flex-col rounded-xl border p-4 shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40 backdrop-blur-sm transition-all duration-200 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-3xl dark:hover:shadow-black/50 ${column.panelClass} ${column.accentClass}`}
                        >
                            <div className="relative mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ${column.iconWrapClass}`}>
                                        {column.icon}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{column.label}</h2>
                                        <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${column.countClass}`}>
                                            {columnApplications.length}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveColumnMenu((current) => (current === column.value ? null : column.value))}
                                    data-application-controls
                                    className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200 hover:shadow-md"
                                    aria-label={`${column.label} filter options`}
                                    aria-expanded={activeColumnMenu === column.value}
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                                {activeColumnMenu === column.value ? (
                                    <div data-application-controls className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/95 dark:shadow-black/50">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveSearchColumn(column.value)
                                                setActiveFilterColumn(null)
                                                setActiveColumnMenu(null)
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 hover:pl-5"
                                        >
                                            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            Search
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveFilterColumn(column.value)
                                                setActiveSearchColumn(null)
                                                setActiveColumnMenu(null)
                                            }}
                                            className="flex w-full items-center gap-3 border-t border-gray-100/50 px-4 py-3 text-left text-xs font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-800/50 hover:pl-5"
                                        >
                                            <SlidersHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            Filter
                                        </button>
                                        {columnSearches[column.value] || columnDateFilters[column.value] !== "all" ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setColumnSearches((current) => ({
                                                        ...current,
                                                        [column.value]: "",
                                                    }))
                                                    setColumnDateFilters((current) => ({
                                                        ...current,
                                                        [column.value]: "all",
                                                    }))
                                                    setActiveColumnMenu(null)
                                                }}
                                                className="flex w-full items-center gap-3 border-t border-gray-100/50 px-4 py-3 text-left text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 dark:border-gray-700/50 dark:text-red-400 dark:hover:bg-red-900/20 hover:pl-5"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Clear Filter
                                            </button>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                            {activeSearchColumn === column.value ? (
                                <div data-application-controls className="relative mb-4">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        value={columnSearches[column.value]}
                                        onChange={(event) =>
                                            setColumnSearches((current) => ({
                                                ...current,
                                                [column.value]: event.target.value,
                                            }))
                                        }
                                        placeholder={`Search ${column.label.toLowerCase()}...`}
                                        className="h-10 rounded-xl border-gray-200/60 bg-white/90 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus:border-gray-300 dark:border-gray-600/50 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-500 backdrop-blur-sm transition-all duration-200"
                                    />
                                </div>
                            ) : null}
                            {activeFilterColumn === column.value ? (
                                <div data-application-controls className="relative mb-4">
                                    <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <select
                                        value={columnDateFilters[column.value]}
                                        onChange={(event) =>
                                            setColumnDateFilters((current) => ({
                                                ...current,
                                                [column.value]: event.target.value as ColumnDateFilter,
                                            }))
                                        }
                                        className="h-10 w-full appearance-none rounded-xl border-gray-200/60 bg-white/90 pl-10 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-gray-300 dark:border-gray-600/50 dark:bg-gray-800/50 dark:text-gray-100 dark:focus:border-gray-500 backdrop-blur-sm"
                                    >
                                        <option value="all">All dates</option>
                                        <option value="7">Last 7 days</option>
                                        <option value="30">Last 30 days</option>
                                    </select>
                                </div>
                            ) : null}
                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                                {columnApplications.length === 0 ? (
                                    <PipelineEmptyState column={column} />
                                ) : (
                                    columnApplications.map((application) => (
                                        <ApplicantPipelineCard
                                            key={application.id}
                                            application={application}
                                            onReview={openStatusModal}
                                            onRequestMove={requestMove}
                                            onRequestRemove={requestRemove}
                                            isMenuOpen={activeActionMenuId === application.id}
                                            onToggleMenu={() =>
                                                setActiveActionMenuId((current) => (current === application.id ? null : application.id))
                                            }
                                        />
                                    ))
                                )}
                            </div>
                            {columnApplications.length > 2 ? (
                                <div className="mt-3 border-t border-gray-200/50 pt-3 text-center text-xs font-semibold text-gray-500 dark:border-gray-600/50 dark:text-gray-400">
                                    Scroll to view more
                                </div>
                            ) : null}
                        </div>
                    )
                })}
                <div className="hidden">
                    <div className={`${applicantGridClass} border-b border-[#e6ebf7] px-5 py-4 text-left dark:border-[#2a3969]`}>
                        <div className="pl-[4.25rem] text-[0.95rem] font-semibold text-[#111827] dark:text-white">Student</div>
                        <div className="text-[0.95rem] font-semibold text-[#111827] dark:text-white">Job Title</div>
                        <div className="text-[0.95rem] font-semibold text-[#111827] dark:text-white">Status</div>
                        <div className="pl-7 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Applied Date</div>
                        <div className="pl-7 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Expected Salary</div>
                        <div className="text-center text-[0.95rem] font-semibold text-[#111827] dark:text-white">Actions</div>
                    </div>

                    {filteredApplications.length === 0 ? (
                        <div className="px-5 py-10 text-center text-[0.96rem] text-[#5f6f98] dark:text-[#b8c5e6]">
                            No applications found yet.
                        </div>
                    ) : (
                        filteredApplications.map((application) => (
                            <div
                                key={application.id}
                                className={`${applicantGridClass} border-b border-[#edf1f8] px-5 py-5 dark:border-[#25345d]`}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9cc8f7] text-[#215ba3] dark:bg-[#2a4678] dark:text-[#cfe1ff]">
                                            <UserRound className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-[0.96rem] font-semibold text-[#111827] dark:text-white">
                                                {application.student_name || "Not specified"}
                                            </p>
                                            <p className="truncate text-[0.88rem] text-[#5f6f98] dark:text-[#b8c5e6]">
                                                {application.student_email || application.student_phone || "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pr-5 text-[0.96rem] leading-6 text-[#111827] dark:text-white">
                                    {application.job_title || "Not specified"}
                                </div>

                                <div>
                                    <StatusBadge status={application.status} />
                                </div>

                                <div className="inline-flex items-center gap-2 whitespace-nowrap text-[0.96rem] text-[#111827] dark:text-white">
                                    <CalendarDays className="h-3.5 w-3.5 text-[#97a3bf] dark:text-[#9ab1e8]" />
                                    <span>{formatDate(application.created_at)}</span>
                                </div>

                                <div className="inline-flex items-center gap-2 text-[0.96rem] leading-6 text-[#111827] dark:text-white">
                                    <IndianRupee className="h-3.5 w-3.5 shrink-0 text-[#97a3bf] dark:text-[#9ab1e8]" />
                                    <span>{formatSalaryRange(application)}</span>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => openStatusModal(application)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c9d7f1] text-[#2856b6] transition hover:bg-[#edf3ff] dark:border-[#395188] dark:text-[#bcd3ff] dark:hover:bg-[#1f2d5f]"
                                        aria-label="Review applicant"
                                    >
                                        <Eye className="h-4.5 w-4.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.section>

            {selectedApplication
                ? (() => {
                    const languages = parseProgrammingLanguages(selectedApplication.student_technical_skills)
                    const atsScore = scoreTone(selectedApplication.student_ats_score)
                    const dsScore = scoreTone(selectedApplication.student_des_score)
                    const currentDecision = reviewDecisionDisplay(selectedApplication.status)
                    const recommendation =
                        (atsScore.value ?? 0) >= 75 && (dsScore.value ?? 0) >= 50
                            ? {
                                label: "Shortlist",
                                className: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] dark:border-[#14532d] dark:bg-[#13291d] dark:text-[#bbf7d0]",
                                copy: "Strong hiring signal from resume score and DishaSetu score.",
                            }
                            : {
                                label: "Review carefully",
                                className: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412] dark:border-[#7c2d12] dark:bg-[#2b1d12] dark:text-[#fed7aa]",
                                copy: "Scores need HR review before moving this applicant ahead.",
                            }

                    return (
                        <Modal
                            isOpen={Boolean(selectedApplication)}
                            onClose={closeStatusModal}
                            title="Applicant Review"
                            maxWidth="2xl"
                            className="max-w-6xl dark:border-[#26364d] dark:bg-[#070d16]"
                        >
                            <div className="overflow-hidden rounded-xl border border-[#B7C8E8] bg-[#EDF3FF] text-[#111827] shadow-sm dark:border-[#34465f] dark:bg-[#07101a] dark:text-white dark:shadow-2xl dark:shadow-black/40">
                                <div className="grid gap-6 border-b border-[#B7C8E8] p-5 dark:border-[#26364d] dark:bg-[#07101a] lg:grid-cols-[1.25fr_1fr] lg:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-[#e8eef7] bg-[#edf5ff] text-4xl font-bold text-[#2856b6] dark:border-[#1d4ed8] dark:bg-[#111827] dark:text-[#60a5fa] dark:shadow-[0_0_28px_rgba(37,99,235,0.18)]">
                                            {(selectedApplication.student_name || "S").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 space-y-3">
                                            <div>
                                                <h3 className="truncate text-3xl font-bold text-[#14213d] dark:text-white">
                                                    {selectedApplication.student_name || "Not specified"}
                                                </h3>
                                                <div className="mt-2 inline-flex max-w-full rounded-md border border-[#bfdbfe] bg-[#dbeafe] px-3 py-1 text-sm font-semibold text-[#0f5ec7] dark:border-[#1e40af] dark:bg-[#0d1b2f] dark:text-[#3b82f6]">
                                                    <span className="truncate">{selectedApplication.job_title || "Role not specified"}</span>
                                                </div>
                                            </div>
                                            <div className="grid gap-2 text-sm font-medium text-[#475569] dark:text-[#cbd5e1]">
                                                <span className="inline-flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-[#64748b] dark:text-[#93a4bd]" />
                                                    {selectedApplication.student_email || "Email not specified"}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-[#64748b] dark:text-[#93a4bd]" />
                                                    {selectedApplication.student_phone || "Phone not specified"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-[#B7C8E8] border-[#B7C8E8] dark:divide-[#27384d] dark:border-[#27384d] lg:border-l lg:pl-8">
                                        {[
                                            ["Application ID", selectedApplication.id],
                                            ["Position Applied", selectedApplication.job_title || "Not specified"],
                                            ["Date Applied", formatDate(selectedApplication.created_at)],
                                            ["Status", formatStatusLabel(selectedApplication.status)],
                                            ["Company", selectedApplication.company_name || "Not specified"],
                                        ].map(([label, value]) => (
                                            <div key={label} className="grid grid-cols-[0.9fr_1.1fr] gap-4 py-3 text-sm">
                                                <span className="font-medium text-[#475569] dark:text-[#c6d1e1]">{label}</span>
                                                <span className="break-words font-semibold text-[#111827] dark:text-white">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-0 divide-y divide-[#B7C8E8] dark:divide-[#26364d] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                                    <section className="space-y-6 p-5 lg:p-6">
                                        <div>
                                            <div className="mb-5 flex items-center gap-3 text-[#0f5ec7] dark:text-[#3b82f6]">
                                                <IndianRupee className="h-6 w-6" />
                                                <h4 className="text-lg font-bold">Expected Salary</h4>
                                            </div>
                                            <p className="text-center text-3xl font-extrabold text-[#15803d] dark:text-[#4ade80]">
                                                {formatSalaryRange(selectedApplication)}
                                            </p>
                                            <p className="mt-1 text-center text-sm font-medium text-[#475569] dark:text-[#cbd5e1]">per annum</p>
                                        </div>

                                        <div className="border-t border-[#B7C8E8] pt-6 dark:border-[#26364d]">
                                            <div className="mb-5 flex items-center gap-3 text-[#0f5ec7] dark:text-[#3b82f6]">
                                                <Code2 className="h-6 w-6" />
                                                <h4 className="text-lg font-bold">Programming Languages</h4>
                                            </div>
                                            {languages.length > 0 ? (
                                                <div className="space-y-4">
                                                    {languages.map((language, index) => {
                                                        const percentage = [92, 88, 76, 72, 68, 45][index] ?? 60
                                                        const level = percentage >= 85 ? "Advanced" : percentage >= 65 ? "Intermediate" : "Basic"
                                                        return (
                                                            <div key={`${language}-${index}`} className="grid grid-cols-[0.7fr_1fr_0.8fr] items-center gap-3 text-sm">
                                                                <span className="truncate font-medium">{language}</span>
                                                                <span className="h-2 rounded-full bg-[#e5e7eb] dark:bg-[#1f2937]">
                                                                    <span
                                                                        className={`block h-2 rounded-full ${percentage < 50 ? "bg-[#f59e0b]" : "bg-[#16a34a]"}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </span>
                                                                <span className="text-right text-xs font-semibold text-[#475569] dark:text-[#cbd5e1]">{level}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="rounded-lg bg-[#f8fafc] p-4 text-sm font-medium text-[#64748b] dark:border dark:border-[#1f3146] dark:bg-[#0b1420] dark:text-[#cbd5e1]">
                                                    No programming languages shared.
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    <section className="space-y-6 p-5 lg:p-6">
                                        <div>
                                            <div className="mb-5 flex items-center gap-3 text-[#0f5ec7] dark:text-[#3b82f6]">
                                                <FileText className="h-6 w-6" />
                                                <h4 className="text-lg font-bold">Resume</h4>
                                            </div>
                                            <div className="flex items-center gap-4 rounded-lg border border-[#B7C8E8] bg-[#f8fafc] p-4 dark:border-[#2b4058] dark:bg-[#0b1420]">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#fee2e2] text-xs font-black text-[#dc2626] dark:bg-[#2a1114] dark:text-[#ff2d2d]">PDF</div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">{getResumeFileName(selectedApplication.resume_url)}</p>
                                                    <p className="mt-1 text-xs font-medium text-[#64748b] dark:text-[#cbd5e1]">Submitted resume file</p>
                                                </div>
                                                {selectedApplication.resume_url ? (
                                                    <a
                                                        href={selectedApplication.resume_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#cbd5e1] text-[#0f5ec7] hover:bg-[#eff6ff] dark:border-[#2b4058] dark:text-[#3b82f6] dark:hover:bg-[#0d1b2f]"
                                                        aria-label="Open submitted resume"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="border-t border-[#B7C8E8] pt-6 dark:border-[#26364d]">
                                            <div className="mb-5 flex items-center gap-3 text-[#0f5ec7] dark:text-[#3b82f6]">
                                                <TrendingUp className="h-6 w-6" />
                                                <h4 className="text-lg font-bold">ATS Score</h4>
                                            </div>
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`flex h-36 w-36 items-center justify-center rounded-full border-[14px] ${atsScore.strokeClass}`}>
                                                    <span className={`text-4xl font-extrabold ${atsScore.textClass}`}>
                                                        {atsScore.value ?? "--"}
                                                        <span className="text-base font-semibold text-[#64748b]">/100</span>
                                                    </span>
                                                </div>
                                                <p className={`mt-4 text-lg font-bold ${atsScore.textClass}`}>{atsScore.label}</p>
                                                <p className="mt-3 max-w-xs text-sm font-medium text-[#475569] dark:text-[#cbd5e1]">{atsScore.summary}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6 p-5 lg:p-6">
                                        <div>
                                            <div className="mb-5 flex items-center gap-3 text-[#0f5ec7] dark:text-[#3b82f6]">
                                                <ClipboardList className="h-6 w-6" />
                                                <h4 className="text-lg font-bold">DES Score</h4>
                                            </div>
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`flex h-36 w-36 items-center justify-center rounded-full border-[14px] ${dsScore.strokeClass}`}>
                                                    <span className={`text-4xl font-extrabold ${dsScore.textClass}`}>
                                                        {dsScore.value ?? "--"}
                                                        <span className="text-base font-semibold text-[#64748b]">/100</span>
                                                    </span>
                                                </div>
                                                <p className={`mt-4 text-lg font-bold ${dsScore.textClass}`}>{dsScore.label}</p>
                                                <p className="mt-3 max-w-xs text-sm font-medium text-[#475569] dark:text-[#cbd5e1]">{dsScore.summary}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-[#B7C8E8] p-4 dark:border-[#2b4058] dark:bg-[#0a121d]">
                                            <div className="mb-3 flex items-center gap-2 text-[#0f5ec7] dark:text-[#3b82f6]">
                                                <UserRoundCheck className="h-5 w-5" />
                                                <h4 className="font-bold">HR Recommendation</h4>
                                            </div>
                                            <div className={`rounded-lg border p-4 ${recommendation.className}`}>
                                                <div className="mb-2 flex items-center gap-2 text-base font-bold">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    {recommendation.label}
                                                </div>
                                                <p className="text-sm font-medium">{recommendation.copy}</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="flex flex-col gap-4 border-t border-[#B7C8E8] p-5 dark:border-[#26364d] dark:bg-[#07101a] lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#334155] dark:text-[#d7deea]">
                                        <span className="font-bold">Score Guide:</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />90 - 100 Excellent</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />75 - 89 Good</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />50 - 74 Average</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />0 - 49 Poor</span>
                                    </div>
                                    {currentDecision ? (
                                        <div className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-8 text-base font-bold ${currentDecision.className}`}>
                                            {currentDecision.label}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Button
                                                type="button"
                                                onClick={() => handleReviewDecision("shortlisted")}
                                                loading={updatingStatus}
                                                disabled={updatingStatus}
                                                className="rounded-lg bg-[#16a34a] px-8 text-white hover:bg-[#15803d] dark:border dark:border-[#22c55e]/50 dark:bg-[#0f6b2d] dark:hover:bg-[#15803d]"
                                            >
                                                Shortlist
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleReviewDecision("rejected")}
                                                loading={updatingStatus}
                                                disabled={updatingStatus}
                                                className="rounded-lg bg-[#dc2626] px-8 text-white hover:bg-[#b91c1c] dark:border dark:border-[#ef4444]/50 dark:bg-[#991b1b] dark:hover:bg-[#b91c1c]"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal>
                    )
                })()
                : null}

            {pendingMove ? (
                <Modal
                    isOpen={Boolean(pendingMove)}
                    onClose={() => {
                        if (!updatingStatus) setPendingMove(null)
                    }}
                    title={`Move to ${formatStatusLabel(pendingMove.status)}?`}
                    maxWidth="md"
                >
                    <div className="space-y-5">
                        <div className="rounded-lg border border-[#d7e3fb] bg-[#EDF3FF] p-4 text-center dark:border-[#344565] dark:bg-[#121c34]">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 dark:bg-[#1e2b49]">
                                {pendingMove.status === "shortlisted" ? (
                                    <Star className="h-6 w-6 text-[#f97316]" />
                                ) : pendingMove.status === "selected" ? (
                                    <UserRoundCheck className="h-6 w-6 text-[#16a34a]" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-[#ef4444]" />
                                )}
                            </div>
                            <p className="mt-4 text-base font-bold text-[#0f172a] dark:text-white">
                                Move {pendingMove.application.student_name || "this candidate"} to {formatStatusLabel(pendingMove.status)}?
                            </p>
                            <p className="mt-2 text-sm text-[#51627f] dark:text-[#a8b5cf]">
                                This will update the candidate stage and move the card to the {formatStatusLabel(pendingMove.status)} column.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPendingMove(null)}
                                disabled={updatingStatus}
                                className="rounded-xl px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmMove}
                                loading={updatingStatus}
                                className="rounded-xl bg-[#2856b6] px-6 text-white hover:bg-[#1d4d9e]"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

            {pendingRemove ? (
                <Modal
                    isOpen={Boolean(pendingRemove)}
                    onClose={() => {
                        if (!removingApplicant) setPendingRemove(null)
                    }}
                    title="Remove Application?"
                    maxWidth="md"
                >
                    <div className="space-y-5">
                        <div className="rounded-lg border border-[#fecdd3] bg-[#fff1f2] p-4 text-center dark:border-[#7f3844] dark:bg-[#2b1a1d]">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 dark:bg-white/10">
                                <Trash2 className="h-6 w-6 text-[#dc2626] dark:text-[#fca5a5]" />
                            </div>
                            <p className="mt-4 text-base font-bold text-[#0f172a] dark:text-white">
                                Remove {pendingRemove.student_name || "this candidate"}?
                            </p>
                            <p className="mt-2 text-sm text-[#51627f] dark:text-[#a8b5cf]">
                                This will remove the application from the pipeline.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPendingRemove(null)}
                                disabled={removingApplicant}
                                className="rounded-xl px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmRemove}
                                loading={removingApplicant}
                                className="rounded-xl bg-[#dc2626] px-6 text-white hover:bg-[#b91c1c]"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}
        </div>
    )
}
