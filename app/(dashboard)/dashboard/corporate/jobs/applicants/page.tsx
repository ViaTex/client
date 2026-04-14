"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Eye,
    IndianRupee,
    Loader,
    Search,
    SlidersHorizontal,
    UserRound,
    UserRoundCheck,
    Users,
    XCircle,
} from "lucide-react"

interface Application {
    id: string
    job_id: string
    job_title: string
    student_id: string
    student_name: string
    student_email: string
    status: string
    resume_url?: string
    expected_salary?: string
    applied_at: string
    rejection_reason?: string
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
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
        applied: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "Applied" },
        shortlisted: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", label: "Shortlisted" },
        selected: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", label: "Selected" },
        rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "Rejected" },
        offer_sent: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", label: "Offer Sent" },
        offer_accepted: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", label: "Offer Accepted" },
        offer_rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "Offer Rejected" },
    }

    const config = statusConfig[status] || statusConfig.applied
    return (
        <span className={`inline-flex rounded-full ${config.bg} px-3 py-1 text-xs font-semibold ${config.text}`}>
            {config.label}
        </span>
    )
}

export default function CorporateApplicantsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all_applications")
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

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
        const loadApplications = async () => {
            try {
                setLoading(true)
                const data = await apiClient.getCorporateApplications()
                setApplications(data)
                setError("")
            } catch (err: any) {
                setError(err?.response?.data?.detail || "Failed to load applications")
            } finally {
                setLoading(false)
            }
        }

        loadApplications()
    }, [])

    // Calculate statistics
    const stats = {
        total: applications.length,
        applied: applications.filter((a) => a.status === "applied").length,
        shortlisted: applications.filter((a) => a.status === "shortlisted").length,
        selected: applications.filter((a) => a.status === "selected").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
    }

    // Filter applications
    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job_title.toLowerCase().includes(searchTerm.toLowerCase())

        if (statusFilter === "all_applications") return matchesSearch
        return matchesSearch && app.status === statusFilter
    })

    return (
        <div className="space-y-6">
            {/* Banner */}
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-[24px] border border-[#8fbfff] bg-[#edf3ff] px-5 py-6 shadow-[0_18px_34px_rgba(92,134,198,0.18)] dark:border-[#35518a] dark:bg-[#131d3f] dark:shadow-[0_20px_34px_rgba(3,8,26,0.4)]"
            >
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[1.8rem] font-bold tracking-tight text-[#111827] dark:text-white">Application Management</h1>
                        <span className="text-[1.6rem]" >📋</span>
                    </div>
                    <p className="max-w-3xl text-[0.98rem] text-[#29476f] dark:text-[#c8d7ff]">
                        Manage job applications and track candidate progress
                        <span className="ml-2">✨</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#8fc0f7]/70 px-4 py-2 text-[0.88rem] font-medium text-[#123d72] dark:bg-[#20376a] dark:text-[#d9e5ff]">
                            <CalendarDays className="h-4 w-4" />
                            {currentBannerDate}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#d8f3d9] px-4 py-2 text-[0.88rem] font-medium text-[#166534] dark:bg-[#183925] dark:text-[#b7efc5]">
                            <ClipboardList className="h-4 w-4" />
                            Active Hiring
                        </span>
                    </div>
                </div>
            </motion.section>

            {/* Stats Cards */}
            <motion.section
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="All Applications"
                        value={stats.total}
                        icon={<ClipboardList className="h-7 w-7 text-[#4b5563] dark:text-[#dbe7ff]" />}
                        tone="border-[#dbe5f7] bg-white dark:border-[#2e426f] dark:bg-[#131d3f]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Applied"
                        value={stats.applied}
                        icon={<CalendarDays className="h-7 w-7 text-[#2563eb] dark:text-[#8fb5ff]" />}
                        tone="border-[#cfe0fd] bg-[#edf3ff] dark:border-[#34528c] dark:bg-[#172552]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Shortlisted"
                        value={stats.shortlisted}
                        icon={<UserRoundCheck className="h-7 w-7 text-[#9333ea] dark:text-[#dfb8ff]" />}
                        tone="border-[#ead9fb] bg-[#faf2ff] dark:border-[#62408c] dark:bg-[#2a1e52]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Selected"
                        value={stats.selected}
                        icon={<CheckCircle2 className="h-7 w-7 text-[#16a34a] dark:text-[#9ae6b4]" />}
                        tone="border-[#d8efdc] bg-[#effcf4] dark:border-[#2e6c4d] dark:bg-[#18382d]"
                    />
                </motion.div>
                <motion.div variants={cardItemVariants}>
                    <SummaryCard
                        title="Rejected"
                        value={stats.rejected}
                        icon={<XCircle className="h-7 w-7 text-[#ea580c] dark:text-[#fdba74]" />}
                        tone="border-[#f5dfcb] bg-[#fff7ee] dark:border-[#74492d] dark:bg-[#342316]"
                    />
                </motion.div>
            </motion.section>

            {/* Search and Filter */}
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
                            <option value="all_applications">All Applications ({stats.total})</option>
                            <option value="applied">Applied ({stats.applied})</option>
                            <option value="shortlisted">Shortlisted ({stats.shortlisted})</option>
                            <option value="selected">Selected ({stats.selected})</option>
                            <option value="rejected">Rejected ({stats.rejected})</option>
                        </select>
                        <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#97a3bf] dark:text-[#8fa0c9]" />
                    </div>
                </div>
            </motion.section>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20"
                >
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20"
                >
                    <Loader className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">Loading applications...</p>
                </motion.div>
            )}

            {/* Applications Table */}
            {!loading && (
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
                    className="overflow-hidden rounded-[22px] border border-[#d7ddf8] bg-white shadow-[0_12px_28px_rgba(121,144,198,0.12)] dark:border-[#2b3458] dark:bg-[#131d3f] dark:shadow-[0_14px_28px_rgba(3,8,26,0.42)]"
                >
                    {filteredApplications.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No applications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-[#e6ebf7] text-left dark:border-[#2a3969]">
                                        <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Student</th>
                                        <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Job Title</th>
                                        <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Status</th>
                                        <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Applied Date</th>
                                        <th className="px-5 py-4 text-[0.95rem] font-semibold text-[#111827] dark:text-white">Expected Salary</th>
                                        <th className="px-5 py-4 text-right text-[0.95rem] font-semibold text-[#111827] dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app) => (
                                        <tr key={app.id} className="border-b border-[#edf1f8] dark:border-[#25345d] hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9cc8f7] text-[#215ba3] dark:bg-[#2a4678] dark:text-[#cfe1ff]">
                                                        <UserRound className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[0.96rem] font-semibold text-[#111827] dark:text-white">{app.student_name}</p>
                                                        <p className="text-[0.88rem] text-[#5f6f98] dark:text-[#b8c5e6]">{app.student_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5 text-[0.96rem] text-[#111827] dark:text-white">{app.job_title}</td>
                                            <td className="px-5 py-5">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="px-5 py-5">
                                                <div className="inline-flex items-center gap-2 text-[0.96rem] text-[#111827] dark:text-white">
                                                    <CalendarDays className="h-3.5 w-3.5 text-[#97a3bf] dark:text-[#9ab1e8]" />
                                                    <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5">
                                                <div className="inline-flex items-center gap-2 text-[0.96rem] text-[#111827] dark:text-white">
                                                    <IndianRupee className="h-3.5 w-3.5 text-[#97a3bf] dark:text-[#9ab1e8]" />
                                                    <span>{app.expected_salary || "Not specified"}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5 text-right">
                                                {app.resume_url && (
                                                    <a
                                                        href={app.resume_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c9d7f1] text-[#2856b6] transition hover:bg-[#edf3ff] dark:border-[#395188] dark:text-[#bcd3ff] dark:hover:bg-[#1f2d5f]"
                                                        aria-label="View resume"
                                                    >
                                                        <Eye className="h-4.5 w-4.5" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.section>
            )}
        </div>
    )
}
