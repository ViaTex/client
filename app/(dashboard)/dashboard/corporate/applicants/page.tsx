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
    FileText,
    Eye,
    IndianRupee,
    Search,
    SlidersHorizontal,
    Upload,
    UserRound,
    UserRoundCheck,
    XCircle,
} from "lucide-react"

type ApplicationStatus = "applied" | "shortlisted" | "selected" | "rejected"

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

function formatStatusLabel(status: string) {
    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
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
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`rounded-[20px] border p-4 shadow-[0_10px_24px_rgba(77,101,156,0.10)] dark:shadow-[0_14px_28px_rgba(3,8,26,0.34)] ${tone}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[0.95rem] font-medium text-[#33496e] dark:text-[#d7e1ff]">{title}</p>
                    <p className="mt-2 text-[1.7rem] font-bold leading-none text-[#111827] dark:text-white">{value}</p>
                </div>
                <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:bg-white/10 dark:shadow-none"
                >
                    {icon}
                </motion.div>
            </div>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const tone =
        status === "selected"
            ? "bg-[#dcfce7] text-[#166534] dark:bg-[#183925] dark:text-[#b7efc5]"
            : status === "shortlisted"
              ? "bg-[#f3e8ff] text-[#7e22ce] dark:bg-[#2f1d4b] dark:text-[#dfb8ff]"
              : status === "rejected"
                ? "bg-[#ffedd5] text-[#c2410c] dark:bg-[#3a2617] dark:text-[#fdba74]"
                : "bg-[#dfeafe] text-[#2856b6] dark:bg-[#1c2c5c] dark:text-[#bcd3ff]"
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
            {formatStatusLabel(status)}
        </span>
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
            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load applicants")
            } finally {
                setLoading(false)
            }
        }

        loadApplicants()
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

    const applicantGridClass = "grid grid-cols-[2.2fr_1.7fr_0.9fr_1.1fr_1.7fr_0.7fr] items-center"

    const openStatusModal = (application: JobApplicationItem) => {
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
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to update application status")
        } finally {
            setUpdatingStatus(false)
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
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to send offer letter")
        } finally {
            setSendingOffer(false)
        }
    }

    return (
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-[24px] border border-[#8fbfff] bg-[#edf3ff] px-5 py-6 shadow-[0_18px_34px_rgba(92,134,198,0.18)] dark:border-[#35518a] dark:bg-[#131d3f] dark:shadow-[0_20px_34px_rgba(3,8,26,0.4)]"
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
                        icon={<ClipboardList className="h-7 w-7 text-[#4b5563] dark:text-[#dbe7ff]" />}
                        tone="border-[#dbe5f7] bg-white dark:border-[#2e426f] dark:bg-[#131d3f]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Applied"
                        value={statusCounts.applied}
                        icon={<CalendarDays className="h-7 w-7 text-[#2563eb] dark:text-[#8fb5ff]" />}
                        tone="border-[#cfe0fd] bg-[#edf3ff] dark:border-[#34528c] dark:bg-[#172552]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Shortlisted"
                        value={statusCounts.shortlisted}
                        icon={<UserRoundCheck className="h-7 w-7 text-[#9333ea] dark:text-[#dfb8ff]" />}
                        tone="border-[#ead9fb] bg-[#faf2ff] dark:border-[#62408c] dark:bg-[#2a1e52]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Selected"
                        value={statusCounts.selected}
                        icon={<CheckCircle2 className="h-7 w-7 text-[#16a34a] dark:text-[#9ae6b4]" />}
                        tone="border-[#d8efdc] bg-[#effcf4] dark:border-[#2e6c4d] dark:bg-[#18382d]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Rejected"
                        value={statusCounts.rejected}
                        icon={<XCircle className="h-7 w-7 text-[#ea580c] dark:text-[#fdba74]" />}
                        tone="border-[#f5dfcb] bg-[#fff7ee] dark:border-[#74492d] dark:bg-[#342316]"
                    />
                </motion.div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
                className="rounded-[22px] border border-[#d7ddf8] bg-white p-4 shadow-[0_12px_28px_rgba(121,144,198,0.12)] dark:border-[#2b3458] dark:bg-[#131d3f] dark:shadow-[0_14px_28px_rgba(3,8,26,0.42)]"
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
                className="overflow-hidden rounded-[22px] border border-[#d7ddf8] bg-white shadow-[0_12px_28px_rgba(121,144,198,0.12)] dark:border-[#2b3458] dark:bg-[#131d3f] dark:shadow-[0_14px_28px_rgba(3,8,26,0.42)]"
            >
                <div className="min-w-[1080px]">
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

            {selectedApplication ? (
                <Modal
                    isOpen={Boolean(selectedApplication)}
                    onClose={closeStatusModal}
                    title="Update Application Status"
                    maxWidth="2xl"
                >
                    <div className="space-y-6">
                        <div className="border-b border-[#e6ebf7] pb-4 dark:border-[#2a3969]">
                            <p className="text-[1.05rem] font-medium text-[#4b5563] dark:text-[#c7d2fe]">
                                {selectedApplication.student_name || "Not specified"} - {selectedApplication.job_title || "Not specified"}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[1rem] font-semibold text-[#374151] dark:text-white">Application Status</p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {statusOptions.map((option) => {
                                    const isActive = draftStatus === option.value
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setDraftStatus(option.value)}
                                            className={`flex items-center gap-4 rounded-[14px] border px-4 py-4 text-left text-[1rem] font-semibold transition ${isActive ? option.activeClass : option.idleClass}`}
                                        >
                                            <span className={`h-4 w-4 rounded-full ${option.dotClass}`} />
                                            <span>{option.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[1rem] font-semibold text-[#374151] dark:text-white">Corporate Notes</p>
                            <div className="rounded-[14px] border border-[#d7ddf8] bg-white dark:border-[#3b456b] dark:bg-[#1a213a]">
                                <div className="flex items-start gap-3 p-4">
                                    <FileText className="mt-1 h-5 w-5 shrink-0 text-[#9aa4b8] dark:text-[#8fa0c9]" />
                                    <textarea
                                        value={corporateNotes}
                                        onChange={(event) => setCorporateNotes(event.target.value)}
                                        placeholder="Add notes about the candidate..."
                                        className="min-h-[140px] w-full resize-none bg-transparent text-[0.98rem] text-[#1f2937] outline-none placeholder:text-[#8b97bf] dark:text-white dark:placeholder:text-[#8e99bf]"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {selectedApplication.resume_url ? (
                                    <a
                                        href={selectedApplication.resume_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex text-sm font-medium text-[#2856b6] hover:underline dark:text-[#bcd3ff]"
                                    >
                                        Open submitted resume
                                    </a>
                                ) : (
                                    <span className="text-sm text-[#5f6f98] dark:text-[#b8c5e6]">No resume attached</span>
                                )}
                                {selectedApplication.offer_letter_sent_at ? (
                                    <span className="text-xs font-medium text-[#166534] dark:text-[#bbf7d0]">
                                        Offer sent on {formatDate(selectedApplication.offer_letter_sent_at)}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[1rem] font-semibold text-[#374151] dark:text-white">Offer Letter</p>
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed border-[#c9d7f1] bg-[#f8fbff] px-5 py-8 text-center transition hover:border-[#2856b6] hover:bg-[#edf3ff] dark:border-[#3b456b] dark:bg-[#1a213a] dark:hover:border-[#6b8de8]">
                                <Upload className="h-8 w-8 text-[#2856b6] dark:text-[#bcd3ff]" />
                                <span className="text-[0.98rem] font-semibold text-[#1f2937] dark:text-white">
                                    {offerLetterFile ? offerLetterFile.name : "Choose offer letter PDF"}
                                </span>
                                <span className="text-xs text-[#5f6f98] dark:text-[#b8c5e6]">
                                    PDF only, maximum 5MB
                                </span>
                                <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    className="sr-only"
                                    onChange={(event) => setOfferLetterFile(event.target.files?.[0] || null)}
                                />
                            </label>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {selectedApplication.offer_letter ? (
                                    <a
                                        href={selectedApplication.offer_letter}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex text-sm font-medium text-[#2856b6] hover:underline dark:text-[#bcd3ff]"
                                    >
                                        Open sent offer PDF
                                    </a>
                                ) : (
                                    <span className="text-sm text-[#5f6f98] dark:text-[#b8c5e6]">No offer PDF sent yet</span>
                                )}
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={handleSendOfferLetter}
                                        loading={sendingOffer}
                                        disabled={!offerLetterFile || sendingOffer}
                                        className="rounded-xl bg-[#16a34a] px-5 text-white hover:bg-[#15803d]"
                                    >
                                        Send Offer PDF
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[#e6ebf7] pt-5 dark:border-[#2a3969] sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeStatusModal}
                                className="rounded-xl px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleStatusUpdate}
                                loading={updatingStatus}
                                className="rounded-xl bg-[#2856b6] px-6 text-white hover:bg-[#1d4d9e]"
                            >
                                Update Status
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}
        </div>
    )
}
