"use client"

import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { JobItem } from "@/lib/api"
import { jobService } from "@/services/job.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, MoreVertical, Plus, Briefcase, MapPin, IndianRupee, Clock, Clock3, Building, Users, CalendarDays, BadgeCheck, GraduationCap, Globe, Contact, FileText, BookOpen, ClipboardList, CheckSquare, Gift, ShieldCheck, FolderKanban, FileBadge2, Download, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { JobCard } from "@/components/ui/job-card"
import { JobDetails } from "@/components/ui/job-details"

function getErrorMessage(detail: unknown, fallback: string) {
    if (typeof detail === "string" && detail.trim()) return detail
    if (Array.isArray(detail)) {
        const messages = detail
            .map((item) => {
                if (typeof item === "string") return item
                if (item && typeof item === "object" && "msg" in item && typeof (item as { msg?: unknown }).msg === "string") {
                    return (item as { msg: string }).msg
                }
                return null
            })
            .filter((value): value is string => Boolean(value))
        if (messages.length) return messages.join(", ")
    }
    if (detail && typeof detail === "object" && "msg" in detail && typeof (detail as { msg?: unknown }).msg === "string") {
        return (detail as { msg: string }).msg
    }
    return fallback
}

function getJobCompletionPercent(job: JobItem) {
    const checks = [
        Boolean(job.title?.trim()),
        Boolean(job.description?.trim()),
        Boolean(job.requirements?.trim()),
        Boolean(job.responsibilities?.trim()),
        Boolean(job.location?.trim()),
        Boolean(job.job_type?.trim()),
        Boolean(job.mode_of_work?.trim()),
        typeof job.salary_min === "number",
        typeof job.salary_max === "number",
        typeof job.experience_min === "number",
        typeof job.experience_max === "number",
        Boolean(job.skills_required?.length),
        Boolean(job.company_name?.trim()),
        Boolean(job.company_website?.trim()),
        Boolean(job.company_description?.trim()),
        Boolean(job.contact_person?.trim()),
        Boolean(job.selection_process?.trim()),
        Boolean(job.application_deadline),
    ]

    const completed = checks.filter(Boolean).length
    return Math.round((completed / checks.length) * 100)
}

function buildJobDownloadLines(job: JobItem) {
    return [
        `Job Title: ${job.title}`,
        `Company Name: ${formatValue(job.company_name)}`,
        `Location: ${formatValue(job.location)}`,
        `Job Type: ${formatLabel(job.job_type)}`,
        `Work Mode: ${formatLabel(job.mode_of_work ?? "onsite")}`,
        `Status: ${formatLabel(job.status)}`,
        `Salary Range: ${formatSalary(job)}`,
        `Experience: ${job.experience_min ?? 0} - ${job.experience_max ?? "Any"} Years`,
        `Openings: ${formatValue(job.number_of_openings)}`,
        `Applications: ${formatApplications(job.current_applications, job.max_applications)}`,
        "",
        "Job Description",
        job.description || "Not specified",
        "",
        "Requirements",
        job.requirements || "Not specified",
        "",
        "Responsibilities",
        job.responsibilities || "Not specified",
        "",
        "Selection Process",
        job.selection_process || "Not specified",
        "",
        "Eligibility Criteria",
        job.eligibility_criteria || "Not specified",
        "",
        "Company Description",
        job.company_description || "Not specified",
    ]
}

function wrapPdfLine(text: string, maxLength: number) {
    if (!text.trim()) return [""]

    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word
        if (candidate.length <= maxLength) {
            currentLine = candidate
            continue
        }

        if (currentLine) lines.push(currentLine)

        if (word.length <= maxLength) {
            currentLine = word
            continue
        }

        let remaining = word
        while (remaining.length > maxLength) {
            lines.push(remaining.slice(0, maxLength))
            remaining = remaining.slice(maxLength)
        }
        currentLine = remaining
    }

    if (currentLine) lines.push(currentLine)
    return lines
}

function escapePdfText(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildSimplePdf(lines: string[]) {
    const pageWidth = 595
    const pageHeight = 842
    const margin = 48
    const fontSize = 12
    const lineHeight = 18
    const usableChars = 78
    const wrappedLines = lines.flatMap((line) => wrapPdfLine(line, usableChars))
    const linesPerPage = Math.max(1, Math.floor((pageHeight - margin * 2) / lineHeight))
    const pages: string[][] = []

    for (let index = 0; index < wrappedLines.length; index += linesPerPage) {
        pages.push(wrappedLines.slice(index, index + linesPerPage))
    }

    const objects: string[] = []
    objects.push("<< /Type /Catalog /Pages 2 0 R >>")

    const pageObjectIds = pages.map((_, index) => 3 + index * 2)
    const contentObjectIds = pages.map((_, index) => 4 + index * 2)

    objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`)

    pages.forEach((pageLines, index) => {
        const pageObjectId = pageObjectIds[index]
        const contentObjectId = contentObjectIds[index]
        const contentCommands = [
            "BT",
            `/F1 ${fontSize} Tf`,
            `${margin} ${pageHeight - margin} Td`,
            ...pageLines.map((line, lineIndex) => `${lineIndex === 0 ? "" : `0 -${lineHeight} Td `}(${escapePdfText(line)}) Tj`).filter(Boolean),
            "ET",
        ].join("\n")

        objects[pageObjectId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectId} 0 R >>`
        objects[contentObjectId - 1] = `<< /Length ${contentCommands.length} >>\nstream\n${contentCommands}\nendstream`
    })

    let pdf = "%PDF-1.4\n"
    const offsets: number[] = [0]

    objects.forEach((object, index) => {
        offsets.push(pdf.length)
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    })

    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n`
    pdf += "0000000000 65535 f \n"
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
    })
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

    return new Blob([pdf], { type: "application/pdf" })
}

function formatLabel(value?: string | null) {
    if (!value) return "Not specified"
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatValue(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return "Not specified"
    return String(value)
}

function formatList(values?: string[] | null) {
    if (!values?.length) return "Not specified"
    return values.join(", ")
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

function formatBoolean(value?: boolean | null) {
    if (value === null || value === undefined) return "Not specified"
    return value ? "Yes" : "No"
}

function formatApplications(current?: number | null, max?: number | null) {
    const safeCurrent = typeof current === "number" && Number.isFinite(current) ? current : 0
    const safeMax = typeof max === "number" && Number.isFinite(max) ? max : 0
    return `${safeCurrent} / ${safeMax}`
}

function getDeadlineMeta(value?: string | null, emptyLabel = "No deadline") {
    const formattedDate = formatDate(value)
    if (!value) {
        return {
            label: emptyLabel,
            value: emptyLabel,
            cardClass: "border-[#d8e1f2] bg-[#edf3ff] text-[#42548d] dark:border-[#3a4778] dark:bg-[#182554] dark:text-[#c7d2f4]",
            blockClass: "border-[#d8e1f2] bg-[#edf3ff] text-[#42548d] dark:border-[#3a4778] dark:bg-[#182554] dark:text-[#c7d2f4]",
        }
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return {
            label: "Invalid date",
            value: formattedDate,
            cardClass: "border-[#ffd7a8] bg-[#fff7ed] text-[#b45309] dark:border-[#8a4c16] dark:bg-[#3a2410] dark:text-[#fdba74]",
            blockClass: "border-[#ffd7a8] bg-[#fff7ed] text-[#b45309] dark:border-[#8a4c16] dark:bg-[#3a2410] dark:text-[#fdba74]",
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    parsed.setHours(0, 0, 0, 0)
    const daysUntilDeadline = Math.round((parsed.getTime() - today.getTime()) / 86400000)

    if (daysUntilDeadline < 0) {
        return {
            label: "Expired",
            value: formattedDate,
            cardClass: "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#3b1518] dark:text-[#fca5a5]",
            blockClass: "border-[#ffc1bc] bg-[#fff1f0] text-[#c12e24] dark:border-[#7e2d2b] dark:bg-[#311716] dark:text-[#ffb2ab]",
        }
    }

    if (daysUntilDeadline === 0) {
        return {
            label: "Due today",
            value: formattedDate,
            cardClass: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] dark:border-[#9a3412] dark:bg-[#3b2413] dark:text-[#fdba74]",
            blockClass: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] dark:border-[#9a3412] dark:bg-[#3b2413] dark:text-[#fdba74]",
        }
    }

    if (daysUntilDeadline <= 3) {
        return {
            label: `${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"} left`,
            value: formattedDate,
            cardClass: "border-[#fde68a] bg-[#fffbeb] text-[#a16207] dark:border-[#854d0e] dark:bg-[#33270d] dark:text-[#facc15]",
            blockClass: "border-[#fde68a] bg-[#fffbeb] text-[#a16207] dark:border-[#854d0e] dark:bg-[#33270d] dark:text-[#facc15]",
        }
    }

    return {
        label: "Open",
        value: formattedDate,
        cardClass: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] dark:border-[#166534] dark:bg-[#122f20] dark:text-[#86efac]",
        blockClass: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] dark:border-[#166534] dark:bg-[#122f20] dark:text-[#86efac]",
    }
}

function getPostedDateMeta(value?: string | null) {
    const formattedDate = formatDate(value)
    if (!value) {
        return {
            label: "Not posted",
            value: formattedDate,
            cardClass: "border-[#d8e1f2] bg-[#edf3ff] text-[#42548d] dark:border-[#3a4778] dark:bg-[#182554] dark:text-[#c7d2f4]",
        }
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return {
            label: "Invalid date",
            value: formattedDate,
            cardClass: "border-[#ffd7a8] bg-[#fff7ed] text-[#b45309] dark:border-[#8a4c16] dark:bg-[#3a2410] dark:text-[#fdba74]",
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    parsed.setHours(0, 0, 0, 0)
    const daysSincePosted = Math.round((today.getTime() - parsed.getTime()) / 86400000)

    if (daysSincePosted < 0) {
        return {
            label: "Scheduled",
            value: formattedDate,
            cardClass: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] dark:border-[#1d4ed8] dark:bg-[#12284d] dark:text-[#93c5fd]",
        }
    }

    if (daysSincePosted === 0) {
        return {
            label: "Today",
            value: formattedDate,
            cardClass: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] dark:border-[#166534] dark:bg-[#122f20] dark:text-[#86efac]",
        }
    }

    if (daysSincePosted <= 7) {
        return {
            label: "New",
            value: formattedDate,
            cardClass: "border-[#bae6fd] bg-[#f0f9ff] text-[#0369a1] dark:border-[#0e7490] dark:bg-[#103044] dark:text-[#67e8f9]",
        }
    }

    if (daysSincePosted <= 30) {
        return {
            label: `${daysSincePosted} days ago`,
            value: formattedDate,
            cardClass: "border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca] dark:border-[#4f46e5] dark:bg-[#1f2355] dark:text-[#c4b5fd]",
        }
    }

    return {
        label: "Older",
        value: formattedDate,
        cardClass: "border-[#d8e1f2] bg-[#f8fafc] text-[#64748b] dark:border-[#334155] dark:bg-[#172033] dark:text-[#cbd5e1]",
    }
}

function DateInfoBlock({
    title,
    value,
    prefix,
    icon,
    emptyLabel = "Not specified",
}: {
    title: string
    value?: string | null
    prefix?: string
    icon: ReactNode
    emptyLabel?: string
}) {
    const deadlineMeta = getDeadlineMeta(value, emptyLabel)
    const hasValue = deadlineMeta.value !== "Not specified"

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#16213f] dark:text-white">
                <span className="text-[#2856b6] dark:text-[#8fb5ff]">{icon}</span>
                <h4 className="text-[1.05rem] font-bold">{title}</h4>
            </div>
            <div
                className={[
                    "rounded-[18px] border px-5 py-5 text-base font-medium",
                    deadlineMeta.blockClass,
                ].join(" ")}
            >
                {hasValue ? `${prefix ? `${prefix}: ` : ""}${deadlineMeta.value} (${deadlineMeta.label})` : deadlineMeta.label}
            </div>
        </div>
    )
}

function formatSalary(job: JobItem) {
    if (job.salary_min == null && job.salary_max == null) return "Not specified"
    const currency = job.salary_currency || "INR"
    if (job.salary_min != null && job.salary_max != null) {
        return `${job.salary_min} - ${job.salary_max} ${currency}`
    }
    return `${job.salary_min ?? job.salary_max} ${currency}`
}

function DetailCard({
    label,
    value,
    icon,
    accentClass,
    badge,
    valueClassName,
}: {
    label: string
    value: string
    icon: ReactNode
    accentClass: string
    badge?: string
    valueClassName?: string
}) {
    return (
        <div className="rounded-[18px] border border-[#d8e1f2] bg-[#edf3ff] p-4 shadow-[0_8px_20px_rgba(29,39,85,0.05)] dark:border-[#223067] dark:bg-[#0f183f] dark:shadow-none">
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] ${accentClass}`}>
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[0.88rem] font-medium leading-snug text-[#5f6f98] dark:text-[#93a4d1]">{label}</p>
                    <p className={`mt-1 text-[0.98rem] font-semibold leading-snug text-[#16213f] dark:text-white ${valueClassName ?? ""}`}>{value}</p>
                    {badge ? (
                        <span className="mt-2 inline-flex rounded-full bg-[#edf3ff] px-2.5 py-1 text-[11px] font-medium text-[#355fbe] dark:bg-[#17285a] dark:text-[#a9c4ff]">
                            {badge}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

function DetailSection({
    title,
    value,
    icon,
}: {
    title: string
    value?: string | null
    icon?: ReactNode
}) {
    if (!value?.trim()) return null

    return (
        <div>
            <div className="mb-2 flex items-center gap-3 text-[#16213f] dark:text-white">
                {icon ? <span className="text-[#2856b6] dark:text-[#8fb5ff]">{icon}</span> : null}
                <h4 className="text-lg font-bold">{title}</h4>
            </div>
            <div className="whitespace-pre-wrap rounded-lg bg-[#edf3ff] p-4 text-sm leading-relaxed text-[#42548d] dark:bg-[#0f183f] dark:text-[#f4f7ff]">
                {value}
            </div>
        </div>
    )
}

function formatRemoteAvailability(remoteWork?: boolean | null) {
    if (remoteWork === null || remoteWork === undefined) return "Not specified"
    return remoteWork ? "Available" : "Not Available"
}

function formatOnsiteOffice(modeOfWork?: string | null) {
    if (!modeOfWork) return "Not specified"
    return modeOfWork === "onsite" || modeOfWork === "hybrid" ? "Available" : "Not Available"
}

function AdditionalDetailItem({
    icon,
    label,
    value,
}: {
    icon: ReactNode
    label: string
    value: string
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#16213f] dark:text-white">
                <span className="text-[#2856b6] dark:text-[#8fb5ff]">{icon}</span>
                <p className="text-[1.02rem] font-semibold">{label}</p>
            </div>
            <p className="pl-7 text-[0.98rem] text-[#4a556f] dark:text-[#c7d2f4]">{value}</p>
        </div>
    )
}

function InfoBlock({
    title,
    value,
    icon,
}: {
    title: string
    value: string
    icon: ReactNode
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#16213f] dark:text-white">
                <span className="text-[#2856b6] dark:text-[#8fb5ff]">{icon}</span>
                <h4 className="text-[1.05rem] font-bold">{title}</h4>
            </div>
            <div className="rounded-[18px] border border-[#d8e1f2] bg-[#edf3ff] px-5 py-5 text-[0.98rem] text-[#4a556f] shadow-[0_8px_20px_rgba(29,39,85,0.05)] dark:border-[#223067] dark:bg-[#0f183f] dark:text-[#c7d2f4] dark:shadow-none">
                {value}
            </div>
        </div>
    )
}

export default function CorporateJobsPage() {
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement | null>(null)
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null)
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const currentBannerDate = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            }).format(new Date()),
        []
    )

    const handleDownloadJob = (job: JobItem) => {
        if (typeof window === "undefined") return

        const blob = buildSimplePdf(buildJobDownloadLines(job))
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${job.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "job"}-jd.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const handleDeleteJob = async (job: JobItem) => {
        const confirmed = window.confirm(`Delete "${job.title}"? This will remove the job posting and its applications.`)
        if (!confirmed) return

        setDeletingJobId(job.id)
        setOpenMenuJobId(null)
        setError("")
        try {
            await jobService.remove(job.id)
            setJobs((current) => current.filter((item) => item.id !== job.id))
            if (selectedJob?.id === job.id) setSelectedJob(null)
        } catch (e: any) {
            setError(getErrorMessage(e?.response?.data?.detail, "Failed to delete job"))
        } finally {
            setDeletingJobId(null)
        }
    }

    const filteredJobs = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) return jobs
        return jobs.filter((job) => {
            return (
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query)
            )
        })
    }, [jobs, searchTerm])

    const loadJobs = async () => {
        setLoading(true)
        setError("")
        try {
            const data = await jobService.getAll(true)
            setJobs(data)
        } catch (e: any) {
            setError(getErrorMessage(e?.response?.data?.detail, "Failed to load jobs"))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadJobs()
    }, [])

    useEffect(() => {
        const onDocumentClick = (event: MouseEvent) => {
            if (!menuRef.current) return
            if (!menuRef.current.contains(event.target as Node)) {
                setOpenMenuJobId(null)
            }
        }
        document.addEventListener("mousedown", onDocumentClick)
        return () => document.removeEventListener("mousedown", onDocumentClick)
    }, [])

    return (
        <div className="space-y-5">
            <div className="rounded-[24px] border border-[#8fbfff] bg-[#edf3ff] px-5 py-5 shadow-[0_12px_26px_rgba(92,134,198,0.16)] dark:border-[#35518a] dark:bg-[#131d3f] dark:shadow-[0_16px_28px_rgba(3,8,26,0.32)]">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[1.65rem] font-bold tracking-tight text-[#111827] dark:text-white sm:text-[1.8rem]">Job Postings</h1>
                        <span className="text-[1.9rem]" aria-hidden="true">💼</span>
                    </div>
                    <p className="max-w-3xl text-[0.94rem] leading-6 text-[#29476f] dark:text-[#c8d7ff]">
                        Manage your job postings and find the best talent
                        <span className="ml-2" aria-hidden="true">✨</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#8fc0f7]/70 px-3 py-1.5 text-[0.84rem] font-medium text-[#123d72] dark:bg-[#20376a] dark:text-[#d9e5ff]">
                            <span aria-hidden="true">🎯</span>
                            {currentBannerDate}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#d8f3d9] px-3 py-1.5 text-[0.84rem] font-medium text-[#166534] dark:bg-[#183925] dark:text-[#b7efc5]">
                            <span aria-hidden="true">📈</span>
                            Talent Acquisition
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#dfe8ff] px-3 py-1.5 text-[0.84rem] font-medium text-[#2348b8] dark:bg-[#243567] dark:text-[#bfd0ff]">
                            <span aria-hidden="true">🚀</span>
                            Growth Opportunities
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-[22px] border border-[#d7ddf8] bg-[#edf3ff] p-4 shadow-[0_12px_24px_rgba(121,144,198,0.12)] sm:p-4 md:p-5 dark:border-[#2b3458] dark:bg-[#131d3f] dark:shadow-[0_12px_24px_rgba(3,8,26,0.34)]">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Job title or keyword"
                        className="h-12 w-full rounded-[16px] border-[#d7ddf8] bg-white px-4 text-sm text-[#1d2755] placeholder:text-[#8b97bf] md:max-w-[248px] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white dark:placeholder:text-[#8e99bf]"
                    />
                    <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard/corporate/jobs/create")}
                            className="h-12 rounded-[16px] bg-[#3b82f6] px-5 text-[0.95rem] font-semibold text-white shadow-none hover:bg-[#3174e8] dark:bg-[#3b82f6] dark:text-white dark:hover:bg-[#3174e8]"
                        >
                            <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
                            Create Job
                        </Button>
                        <Button type="button" variant="outline" className="h-12 rounded-[16px] border-[1.5px] border-[#3b82f6] bg-white px-5 text-[0.95rem] font-medium text-[#3b82f6] shadow-none hover:bg-[#f4f8ff] hover:text-[#3174e8] dark:border-[#3b82f6] dark:bg-transparent dark:text-[#8fb5ff] dark:hover:bg-[#17244f] dark:hover:text-white">
                            <Filter className="mr-2 h-4 w-4 stroke-[2.2]" />
                            Filters
                        </Button>
                    </div>
                </div>

                {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

                <div className="mb-4 flex flex-col gap-1 px-1 text-sm text-[#5f6f98] sm:flex-row sm:items-center sm:justify-between dark:text-[#a0abcf]">
                    <p>Showing 1 to {filteredJobs.length} of {jobs.length} jobs</p>
                    <p>Page 1 of 1 - {filteredJobs.length} jobs per page</p>
                </div>

                {loading ? <p className="text-sm text-[#5f6f98] dark:text-[#a0abcf]">Loading jobs...</p> : null}
                {!loading && filteredJobs.length === 0 ? <p className="text-sm text-[#5f6f98] dark:text-[#a0abcf]">No jobs found.</p> : null}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredJobs.map((job) => {
                        const currentApplications = Number(job.current_applications ?? 0)
                        const maxApplicationsValue = Number(job.max_applications ?? 0)
                        const safeCurrentApplications = Number.isFinite(currentApplications) ? currentApplications : 0
                        const safeMaxApplications = Number.isFinite(maxApplicationsValue) && maxApplicationsValue > 0 ? maxApplicationsValue : 1
                        const completionPercent = getJobCompletionPercent(job)
                        const deadlineMeta = getDeadlineMeta(job.application_deadline)
                        const postedMeta = getPostedDateMeta(job.created_at)

                        return (
                            <JobCard
                                key={job.id}
                                job={job}
                                variant="corporate"
                                index={filteredJobs.indexOf(job)}
                                completionPercent={completionPercent}
                                onEdit={(job) => {
                                    router.push(`/dashboard/corporate/jobs/edit/${job.id}`)
                                }}
                                onDelete={handleDeleteJob}
                                isDeleting={deletingJobId === job.id}
                                isMenuOpen={openMenuJobId === job.id}
                                onToggleMenu={(id) => setOpenMenuJobId(id)}
                                menuRef={openMenuJobId === job.id ? menuRef : undefined}
                                onViewJD={(job) => setSelectedJob(job)}
                                onDownloadJD={(job) => handleDownloadJob(job)}
                            />
                        )
                    })}
                </div>
            </div>

            {selectedJob && (
                <Modal
                    isOpen={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                    title={selectedJob.title}
                    maxWidth="2xl"
                    position="right"
                >
                    <div className="space-y-6 text-[#42548d] dark:text-[#e6ecff]">
                        <JobDetails job={selectedJob} variant="corporate" />

                        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                            <Button variant="outline" className="border-[#ccd7f5] bg-transparent text-[#42548d] hover:bg-[#edf3ff] hover:text-[#16213f] dark:border-[#223067] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858] dark:hover:text-white" onClick={() => setSelectedJob(null)}>Close</Button>
                            <Button
                                className="bg-[#2f65cb] text-white hover:bg-[#2a59b2]"
                                onClick={() => {
                                    router.push(`/dashboard/corporate/jobs/edit/${selectedJob.id}`)
                                }}
                            >
                                Edit Job
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
