"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Input } from "@/components/ui/input"
import { apiClient, JobApplicationItem } from "@/lib/api"
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Eye,
    FileText,
    Search,
    SlidersHorizontal,
    UserRound,
    UserRoundCheck,
    XCircle,
} from "lucide-react"

const getErrorMessage = (error: unknown, fallback: string) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail === "string"
    ) {
        return (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || fallback
    }

    return fallback
}

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
    return (
        <span className="inline-flex rounded-full bg-[#dfeafe] px-3 py-1 text-xs font-semibold capitalize text-[#2856b6] dark:bg-[#1c2c5c] dark:text-[#bcd3ff]">
            {status}
        </span>
    )
}

export default function CorporateApplicantsPage() {
    const [applications, setApplications] = useState<JobApplicationItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all_applications")

    useEffect(() => {
        const loadApplications = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await apiClient.getReceivedApplications()
                setApplications(data)
            } catch (error: unknown) {
                setError(getErrorMessage(error, "Failed to load applications"))
            } finally {
                setLoading(false)
            }
        }

        loadApplications()
    }, [])

    const currentBannerDate = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            }).format(new Date()),
        []
    )

    const filteredApplications = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()

        return applications.filter((application) => {
            const matchesSearch =
                !query ||
                application.student_name?.toLowerCase().includes(query) ||
                application.student_email?.toLowerCase().includes(query) ||
                application.job_title.toLowerCase().includes(query)

            const matchesStatus =
                statusFilter === "all_applications" || application.status === statusFilter

            return !!matchesSearch && matchesStatus
        })
    }, [applications, searchTerm, statusFilter])

    const statusCounts = useMemo(
        () =>
            applications.reduce(
                (acc, application) => {
                    acc.all += 1
                    if (application.status === "applied") acc.applied += 1
                    if (application.status === "shortlisted") acc.shortlisted += 1
                    if (application.status === "selected") acc.selected += 1
                    if (application.status === "rejected") acc.rejected += 1
                    return acc
                },
                { all: 0, applied: 0, shortlisted: 0, selected: 0, rejected: 0 }
            ),
        [applications]
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
                    </div>
                    <p className="max-w-3xl text-[0.98rem] text-[#29476f] dark:text-[#c8d7ff]">
                        Review live student applications and open each uploaded resume directly from this page.
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

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
                className="overflow-hidden rounded-[22px] border border-[#d7ddf8] bg-white shadow-[0_12px_28px_rgba(121,144,198,0.12)] dark:border-[#2b3458] dark:bg-[#131d3f] dark:shadow-[0_14px_28px_rgba(3,8,26,0.42)]"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-[#e6ebf7] text-left dark:border-[#2a3969]">
                                <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Student</th>
                                <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Job Title</th>
                                <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Status</th>
                                <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Applied Date</th>
                                <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Resume</th>
                                <th className="px-5 py-4 text-right text-[0.95rem] font-semibold text-[#111827] dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application) => (
                                <tr key={application.id} className="border-b border-[#edf1f8] dark:border-[#25345d]">
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9cc8f7] text-[#215ba3] dark:bg-[#2a4678] dark:text-[#cfe1ff]">
                                                <UserRound className="h-4.5 w-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[0.96rem] font-semibold text-[#111827] dark:text-white">
                                                    {application.student_name || "Not specified"}
                                                </p>
                                                <p className="text-[0.88rem] text-[#5f6f98] dark:text-[#b8c5e6]">
                                                    {application.student_email || "Not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 text-[0.96rem] text-[#111827] dark:text-white">
                                        <div>
                                            <p>{application.job_title}</p>
                                            <p className="text-[0.82rem] text-[#5f6f98] dark:text-[#b8c5e6]">
                                                {application.location || "Location not specified"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        <StatusBadge status={application.status} />
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="inline-flex items-center gap-2 text-[0.96rem] text-[#111827] dark:text-white">
                                            <CalendarDays className="h-3.5 w-3.5 text-[#97a3bf] dark:text-[#9ab1e8]" />
                                            <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        {application.resume_url ? (
                                            <a
                                                href={application.resume_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-[#2856b6] hover:underline dark:text-[#bcd3ff]"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                View Resume
                                            </a>
                                        ) : (
                                            <span className="text-[0.92rem] text-[#5f6f98] dark:text-[#b8c5e6]">
                                                Resume not uploaded
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 text-right">
                                        <button
                                            type="button"
                                            className="inline-flex h-9 items-center justify-center rounded-full border border-[#c9d7f1] px-4 text-[#2856b6] transition hover:bg-[#edf3ff] dark:border-[#395188] dark:text-[#bcd3ff] dark:hover:bg-[#1f2d5f]"
                                            onClick={() => {
                                                if (application.resume_url) {
                                                    window.open(application.resume_url, "_blank", "noopener,noreferrer")
                                                }
                                            }}
                                            aria-label="View applicant resume"
                                        >
                                            <Eye className="h-4.5 w-4.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading ? <p className="px-5 py-5 text-sm text-[#5f6f98] dark:text-[#b8c5e6]">Loading applications...</p> : null}
                {error ? <p className="px-5 py-5 text-sm text-red-600">{error}</p> : null}
                {!loading && !error && filteredApplications.length === 0 ? (
                    <p className="px-5 py-5 text-sm text-[#5f6f98] dark:text-[#b8c5e6]">
                        No student applications found yet.
                    </p>
                ) : null}
            </motion.section>
        </div>
    )
}
