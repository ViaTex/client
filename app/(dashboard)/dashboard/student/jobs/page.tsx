"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient, JobApplicationItem, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import { Briefcase, Building2, CalendarDays, Clock3, ExternalLink, FileText, Heart, MapPin, Search, Sparkles, Users } from "lucide-react"

type JobFilter = "all" | "jobs" | "internships"
type JobAvailability = "all" | "open" | "closed"

const pageIntroVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

const filterPanelVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.1, ease: "easeOut" } },
}

const listVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.03,
        },
    },
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: (index = 0) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.25, delay: Math.min(index * 0.02, 0.15), ease: "easeOut" },
    }),
    exit: { opacity: 0, y: 5, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } },
}

function getErrorMessage(error: any, fallback: string) {
    const detail = error?.response?.data?.detail
    if (typeof detail === "string" && detail.trim()) return detail
    if (Array.isArray(detail) && detail.length) {
        return detail
            .map((item) => (typeof item === "string" ? item : item?.msg))
            .filter(Boolean)
            .join(", ")
    }
    if (error?.response?.status) return `${fallback} (${error.response.status})`
    return error?.message || fallback
}

function formatLabel(value?: string | null) {
    if (!value) return "Not specified"
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getApplicationStatusButton(status?: string | null) {
    const label = formatLabel(status || "applied")
    const tone =
        status === "selected"
            ? "bg-[#16A34A] text-white hover:bg-[#15803D]"
            : status === "shortlisted"
              ? "bg-[#EAB308] text-white hover:bg-[#CA8A04]"
              : status === "rejected"
                ? "bg-[#EF4444] text-white hover:bg-[#DC2626]"
                : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"

    return { label, tone }
}

function formatValue(value?: string | number | null) {
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

function formatSalary(job: JobItem) {
    if (job.salary_min == null && job.salary_max == null && !job.ctc_with_probation && !job.ctc_after_probation) {
        return "Not specified"
    }
    if (job.salary_min != null && job.salary_max != null) {
        return `${job.salary_min} - ${job.salary_max} ${job.salary_currency || "INR"}`
    }
    if (job.salary_min != null || job.salary_max != null) {
        return `${job.salary_min ?? job.salary_max} ${job.salary_currency || "INR"}`
    }
    if (job.ctc_with_probation && job.ctc_after_probation) {
        return `${job.ctc_with_probation} -> ${job.ctc_after_probation}`
    }
    return job.ctc_after_probation || job.ctc_with_probation || "Not specified"
}

function matchesTypeFilter(job: JobItem, filter: JobFilter) {
    if (filter === "all") return true
    if (filter === "internships") return job.job_type === "internship"
    return job.job_type !== "internship"
}

function matchesAvailability(job: JobItem, availability: JobAvailability) {
    if (availability === "all") return true
    const isOpen = job.status === "active" && job.can_apply !== false
    return availability === "open" ? isOpen : !isOpen
}

export default function StudentJobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [applications, setApplications] = useState<JobApplicationItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [actionMessage, setActionMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<JobFilter>("all")
    const [availability, setAvailability] = useState<JobAvailability>("all")
    const [selectedCompany, setSelectedCompany] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("")
    const [selectedIndustry, setSelectedIndustry] = useState("")
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
    const [applyingJobId, setApplyingJobId] = useState("")

    useEffect(() => {
        const loadData = async () => {
            // Check if user is authenticated
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('access_token')
                if (!token) {
                    setError("Please log in to view jobs and internships.")
                    setLoading(false)
                    return
                }
            }
            setLoading(true)
            setError("")
            
            // Create timeout promise with longer duration
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
            
            try {
                // Load jobs with timeout
                const jobsPromise = apiClient.getJobs(false)
                const jobsData = await Promise.race([jobsPromise, timeoutPromise]) as JobItem[]
                setJobs(jobsData || [])
                
                // If jobs loaded successfully but no data, provide helpful message
                if (jobsData && jobsData.length === 0) {
                    console.log('No jobs available from API')
                }
                
                // Load applications with timeout
                try {
                    const applicationsPromise = apiClient.getMyApplications()
                    const applicationsData = await Promise.race([applicationsPromise, timeoutPromise]) as JobApplicationItem[]
                    setApplications(applicationsData || [])
                } catch (e: any) {
                    setApplications([])
                    // Don't set action message for applications error to avoid blocking the page
                    // But log for debugging
                    console.error('Failed to load applications:', e)
                    if (e?.response?.status === 401) {
                        // Applications endpoint also requires auth, but main error handling will redirect
                        console.log('Authentication required for applications')
                    }
                }
            } catch (e: any) {
                if (e.code === 'NETWORK_ERROR') {
                    setError(e.message)
                } else if (e.message === 'Request timeout') {
                    setError("The server is taking too long to respond. Please try again later.")
                } else if (e?.response?.status === 401) {
                    setError("Your session has expired. Please log in again.")
                    // The interceptor will handle redirect, but we provide a clear message
                } else {
                    setError(getErrorMessage(e, "Failed to load jobs"))
                }
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const filteredJobs = useMemo(() => {
        // Early return if no jobs
        if (!jobs.length) return []
        
        const query = searchTerm.trim().toLowerCase()
        const company = selectedCompany.trim().toLowerCase()
        const role = selectedRole.trim().toLowerCase()
        const location = selectedLocation.trim().toLowerCase()
        const industry = selectedIndustry.trim().toLowerCase()

        return jobs.filter((job) => {
            if (!matchesTypeFilter(job, filter)) return false
            if (!matchesAvailability(job, availability)) return false
            if (company && !job.company_name?.toLowerCase().includes(company)) return false
            if (role && !job.title?.toLowerCase().includes(role)) return false
            if (location && !job.location?.toLowerCase().includes(location)) return false
            if (industry && !job.industry?.toLowerCase().includes(industry)) return false
            if (!query) return true

            // Optimize search by checking most likely fields first
            return job.title?.toLowerCase().includes(query) ||
                   job.company_name?.toLowerCase().includes(query) ||
                   job.location?.toLowerCase().includes(query) ||
                   job.industry?.toLowerCase().includes(query) ||
                   (job.skills_required || []).some(skill => skill.toLowerCase().includes(query))
        })
    }, [availability, filter, jobs, searchTerm, selectedCompany, selectedIndustry, selectedLocation, selectedRole])

    const appliedJobIds = useMemo(() => new Set(applications.map((application) => application.job_id)), [applications])
    const applicationByJobId = useMemo(
        () => new Map(applications.map((application) => [application.job_id, application])),
        [applications]
    )

    const stats = useMemo(
        () => ({
            open: jobs.filter((job) => job.status === "active" && job.can_apply !== false).length,
            closed: jobs.filter((job) => job.status !== "active" || job.can_apply === false).length,
            total: jobs.length,
        }),
        [jobs]
    )

    const handleApply = async (job: JobItem) => {
        if (appliedJobIds.has(job.id)) {
            setActionMessage("You have already applied to this job.")
            return
        }

        setApplyingJobId(job.id)
        setError("")
        setActionMessage("")
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Application request timeout')), 20000)
        )
        
        try {
            const applyPromise = apiClient.applyToJob(job.id)
            const application = await Promise.race([applyPromise, timeoutPromise])
            
            setApplications((current) => [application, ...current])
            const nextApplications = (job.current_applications || 0) + 1
            const patch = {
                current_applications: nextApplications,
                can_apply: job.max_applications != null ? nextApplications < job.max_applications : job.can_apply,
            }
            setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, ...patch } : item)))
            setSelectedJob((current) => (current?.id === job.id ? { ...current, ...patch } : current))
            setActionMessage(`Application submitted for ${job.title}.`)
        } catch (e: any) {
            if (e.message === 'Application request timeout') {
                setError("Application request is taking too long. Please try again.")
            } else if (e.code === 'NETWORK_ERROR') {
                setError(e.message)
            } else {
                setError(e?.response?.data?.detail || "Failed to apply for this job")
            }
        } finally {
            setApplyingJobId("")
        }
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5 px-3 text-gray-900 dark:text-gray-100 sm:px-4 md:px-6">
            <motion.section
                variants={pageIntroVariants}
                initial="hidden"
                animate="visible"
                className="relative overflow-hidden rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-5 shadow-sm dark:border-[#243056] dark:bg-[#121C46]"
            >
                <div
                    aria-hidden="true"
                    className="absolute right-5 top-4 hidden h-24 w-48 rounded-full bg-gradient-to-r from-[#38BDF8]/20 via-[#7C3AED]/20 to-[#F59E0B]/20 blur-2xl sm:block"
                />
                <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D5CCFF] bg-white/80 px-3 py-1 text-xs font-bold text-[#6D28D9] shadow-sm dark:border-[#4C3D88] dark:bg-white/10 dark:text-[#C4B5FD]">
                            <span className="inline-flex" aria-hidden="true">
                                <Sparkles className="h-3.5 w-3.5" />
                            </span>
                            Fresh career matches
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-[2rem]">Jobs & Internships</h1>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500 dark:text-[#A8B3CF]">
                            Explore career opportunities, filter by your goals, and apply directly from your student dashboard.
                        </p>
                    </div>

                    <div className="relative w-full xl:w-[360px] xl:flex-none">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search roles, companies, skills"
                            className="h-11 pl-9"
                        />
                    </div>
                </div>
            </motion.section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <motion.aside
                    variants={filterPanelVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 lg:col-span-1"
                >
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                        <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Opportunity type</p>
                        <div className="grid grid-cols-3 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-[#31406B] dark:bg-[#0C1430]">
                            {[
                                { id: "all", label: "All" },
                                { id: "jobs", label: "Jobs" },
                                { id: "internships", label: "Intern" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id as JobFilter)}
                                    className={`relative min-w-0 rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors ${
                                        filter === item.id
                                            ? "text-white"
                                            : "text-gray-600 hover:bg-white dark:text-[#A8B3CF] dark:hover:bg-white/10"
                                    }`}
                                >
                                    {filter === item.id ? (
                                        <span
                                            className="absolute inset-0 rounded-lg bg-[#7C3AED]"
                                        />
                                    ) : null}
                                    <span className="relative">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                        <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Job availability</p>
                        <div className="space-y-2">
                            {[
                                { id: "all", label: `All (${stats.total})` },
                                { id: "open", label: `Open (${stats.open})` },
                                { id: "closed", label: `Closed (${stats.closed})` },
                            ].map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-[#C7D2FE]">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value={item.id}
                                        checked={availability === item.id}
                                        onChange={(e) => setAvailability(e.target.value as JobAvailability)}
                                        className="h-4 w-4 accent-[#7C3AED]"
                                    />
                                    {item.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {[
                        { label: "Company name", value: selectedCompany, setter: setSelectedCompany, placeholder: "Add company" },
                        { label: "Role", value: selectedRole, setter: setSelectedRole, placeholder: "Add job role" },
                        { label: "Location", value: selectedLocation, setter: setSelectedLocation, placeholder: "Add location" },
                        { label: "Industry", value: selectedIndustry, setter: setSelectedIndustry, placeholder: "Add industry" },
                    ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                            <label className="mb-3 block text-sm font-bold text-gray-900 dark:text-white">{item.label}</label>
                            <Input
                                value={item.value}
                                onChange={(e) => item.setter(e.target.value)}
                                placeholder={item.placeholder}
                                className="h-10"
                            />
                        </div>
                    ))}
                </motion.aside>

                <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 lg:col-span-3"
                >
                    {loading ? <p className="text-sm text-gray-500">Loading opportunities...</p> : null}
                    {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</p> : null}
                    {actionMessage ? <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">{actionMessage}</p> : null}
                    {!loading && !error && filteredJobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#121C46] dark:text-[#A8B3CF]">
                            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-[#53618C]" />
                            No matching jobs or internships found.
                        </div>
                    ) : null}

                    <AnimatePresence mode="popLayout">
                        {filteredJobs.map((job, index) => {
                            const application = applicationByJobId.get(job.id)
                            const isApplied = Boolean(application)
                            const isClosed = job.status !== "active" || job.can_apply === false
                            const applicationStatus = getApplicationStatusButton(application?.status)

                            return (
                            <motion.article
                                key={job.id}
                                custom={index}
                                layout
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="group overflow-hidden rounded-3xl border border-[#DCE5F8] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-[#243056] dark:bg-[#121C46]"
                            >
                                <div className="border-b border-gray-100 bg-[#F7F8FF] p-5 dark:border-[#243056] dark:bg-[#0C1430]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-lg font-bold text-white shadow-sm"
                                            >
                                                {job.company_name?.[0]?.toUpperCase() || "J"}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">{job.title || "Job Title"}</h2>
                                                <p className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-[#A8B3CF]">
                                                    <Building2 className="h-4 w-4 flex-none" />
                                                    <span className="truncate">{job.company_name || "Company not specified"}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                            <Users className="h-3.5 w-3.5" />
                                            {formatLabel(job.job_type)}
                                        </span>
                                        {job.industry ? (
                                            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                                {job.industry}
                                            </span>
                                        ) : null}
                                        {job.remote_work || job.mode_of_work ? (
                                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                {job.remote_work ? "Remote" : formatLabel(job.mode_of_work)}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatValue(job.location)}</p>
                                        </div>
                                        <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">
                                                <Clock3 className="h-4 w-4" />
                                                Experience
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {job.experience_min ?? 0} - {job.experience_max ?? "Any"} years
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">
                                                <CalendarDays className="h-4 w-4" />
                                                Deadline
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(job.application_deadline)}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 border-t border-gray-100 pt-4 dark:border-[#243056] sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-[#A8B3CF]">Salary / CTC</p>
                                            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{formatSalary(job)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-[#A8B3CF]">Openings</p>
                                            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{formatValue(job.number_of_openings)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-[#A8B3CF]">Applications</p>
                                            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                                                {formatValue(job.current_applications)} / {formatValue(job.max_applications)}
                                            </p>
                                        </div>
                                    </div>

                                    {job.skills_required?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills_required.slice(0, 5).map((skill) => (
                                                <span key={skill} className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills_required.length > 5 ? (
                                                <span className="px-2 py-1 text-xs text-gray-500 dark:text-[#A8B3CF]">+{job.skills_required.length - 5} more</span>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-col gap-2">
                                            {job.company_website ? (
                                                <a
                                                    href={job.company_website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED] hover:underline dark:text-[#C4B5FD]"
                                                >
                                                    Company website
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            ) : null}
                                            {application?.offer_letter ? (
                                                <a
                                                    href={application.offer_letter}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-left text-sm font-semibold text-[#166534] hover:underline dark:text-[#86efac]"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Open offer letter PDF
                                                </a>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setSelectedJob(job)}
                                                    className="h-11 w-full rounded-xl border-[#D5CCFF] px-5 text-[#7C3AED] hover:bg-[#F3EEFF] dark:border-[#4C3D88] dark:text-[#C4B5FD] dark:hover:bg-[#1C2752] sm:w-auto"
                                                >
                                                    View Full Details
                                                </Button>
                                            </div>
                                            <div>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleApply(job)}
                                                    disabled={isApplied || applyingJobId === job.id || isClosed}
                                                    className={`h-11 w-full rounded-xl px-5 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto ${isApplied ? applicationStatus.tone : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"}`}
                                                >
                                                    {isApplied ? applicationStatus.label : applyingJobId === job.id ? "Applying..." : isClosed ? "Applications Closed" : "Apply Now"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                            )
                        })}
                    </AnimatePresence>

                    {filteredJobs.length > 0 ? (
                        <p className="text-sm text-gray-600 dark:text-[#A8B3CF]">
                            Jobs: <span className="font-semibold">{filteredJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> results
                        </p>
                    ) : null}
                </motion.div>
            </div>

            {selectedJob ? (
                <Modal
                    isOpen={Boolean(selectedJob)}
                    onClose={() => setSelectedJob(null)}
                    title={selectedJob.title}
                    maxWidth="2xl"
                    className="max-h-[90vh] overflow-hidden"
                >
                    <div className="max-h-[calc(90vh-120px)] space-y-6 overflow-y-auto pr-1 text-sm text-gray-700 dark:text-[#C7D2FE]">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">Company</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatValue(selectedJob.company_name)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">Salary / CTC</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatSalary(selectedJob)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">Location</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatValue(selectedJob.location)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">Work Mode</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatLabel(selectedJob.mode_of_work)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">Experience</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                                    {selectedJob.experience_min ?? 0} - {selectedJob.experience_max ?? "Any"} years
                                </p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-[#A8B3CF]">Deadline</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatDate(selectedJob.application_deadline)}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Job Description</h3>
                            <div className="whitespace-pre-wrap rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                {formatValue(selectedJob.description)}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Requirements</h3>
                                <div className="whitespace-pre-wrap rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                    {formatValue(selectedJob.requirements)}
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Responsibilities</h3>
                                <div className="whitespace-pre-wrap rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                    {formatValue(selectedJob.responsibilities)}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Skills Required</h3>
                                <p>{formatList(selectedJob.skills_required)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Eligibility</h3>
                                <p>Education Level: {formatList(selectedJob.education_level)}</p>
                                <p className="mt-1">Degree: {formatList(selectedJob.education_degree)}</p>
                                <p className="mt-1">Branch: {formatList(selectedJob.education_branch)}</p>
                                <p className="mt-1">Criteria: {formatValue(selectedJob.eligibility_criteria)}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Company Details</h3>
                                <p>Description: {formatValue(selectedJob.company_description)}</p>
                                <p className="mt-1">Website: {formatValue(selectedJob.company_website)}</p>
                                <p className="mt-1">Address: {formatValue(selectedJob.company_address)}</p>
                                <p className="mt-1">Type: {formatValue(selectedJob.company_type)}</p>
                                <p className="mt-1">Size: {formatValue(selectedJob.company_size)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Hiring Details</h3>
                                <p>Selection Process: {formatValue(selectedJob.selection_process)}</p>
                                <p className="mt-1">Contact Person: {formatValue(selectedJob.contact_person)}</p>
                                <p className="mt-1">Contact Designation: {formatValue(selectedJob.contact_designation)}</p>
                                <p className="mt-1">Openings: {formatValue(selectedJob.number_of_openings)}</p>
                                <p className="mt-1">Applications: {formatValue(selectedJob.current_applications)} / {formatValue(selectedJob.max_applications)}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/10 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedJob(null)}
                                className="rounded-xl border-[#D5CCFF] text-[#7C3AED] hover:bg-[#F3EEFF] dark:border-[#4C3D88] dark:text-[#C4B5FD] dark:hover:bg-[#1C2752]"
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleApply(selectedJob)}
                                disabled={appliedJobIds.has(selectedJob.id) || applyingJobId === selectedJob.id || selectedJob.status !== "active" || selectedJob.can_apply === false}
                                className={`rounded-xl disabled:cursor-not-allowed disabled:opacity-70 ${
                                    applicationByJobId.has(selectedJob.id)
                                        ? getApplicationStatusButton(applicationByJobId.get(selectedJob.id)?.status).tone
                                        : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                                }`}
                            >
                                {applicationByJobId.has(selectedJob.id) ? getApplicationStatusButton(applicationByJobId.get(selectedJob.id)?.status).label : applyingJobId === selectedJob.id ? "Applying..." : selectedJob.status !== "active" || selectedJob.can_apply === false ? "Applications Closed" : "Apply Now"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

        </div>
    )
}
