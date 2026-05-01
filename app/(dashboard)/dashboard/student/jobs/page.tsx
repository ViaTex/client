"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient, JobApplicationItem, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Briefcase, Building2, CalendarDays, Clock3, ExternalLink, Heart, MapPin, Search, Users } from "lucide-react"

type JobFilter = "all" | "jobs" | "internships"
type JobAvailability = "all" | "open" | "closed"

function formatLabel(value?: string | null) {
    if (!value) return "Not specified"
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
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
        const loadJobs = async () => {
            setLoading(true)
            setError("")
            try {
                const [jobsData, applicationsData] = await Promise.all([
                    apiClient.getJobs(false),
                    apiClient.getMyApplications(),
                ])
                setJobs(jobsData || [])
                setApplications(applicationsData || [])
            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load jobs")
            } finally {
                setLoading(false)
            }
        }
        loadJobs()
    }, [])

    const filteredJobs = useMemo(() => {
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

            return [
                job.title,
                job.description,
                job.location,
                job.company_name,
                job.company_description,
                job.industry,
                ...(job.skills_required || []),
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        })
    }, [availability, filter, jobs, searchTerm, selectedCompany, selectedIndustry, selectedLocation, selectedRole])

    const appliedJobIds = useMemo(() => new Set(applications.map((application) => application.job_id)), [applications])

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
        try {
            const application = await apiClient.applyToJob(job.id)
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
            setError(e?.response?.data?.detail || "Failed to apply for this job")
        } finally {
            setApplyingJobId("")
        }
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5 px-3 text-gray-900 dark:text-gray-100 sm:px-4 md:px-6">
            <section className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-5 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
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
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <aside className="space-y-4 lg:col-span-1">
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
                                    className={`min-w-0 rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors ${
                                        filter === item.id
                                            ? "bg-[#7C3AED] text-white"
                                            : "text-gray-600 hover:bg-white dark:text-[#A8B3CF] dark:hover:bg-white/10"
                                    }`}
                                >
                                    {item.label}
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
                </aside>

                <div className="space-y-4 lg:col-span-3">
                    {loading ? <p className="text-sm text-gray-500">Loading opportunities...</p> : null}
                    {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</p> : null}
                    {actionMessage ? <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">{actionMessage}</p> : null}
                    {!loading && !error && filteredJobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#121C46] dark:text-[#A8B3CF]">
                            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-[#53618C]" />
                            No matching jobs or internships found.
                        </div>
                    ) : null}

                    {filteredJobs.map((job) => {
                        const isApplied = appliedJobIds.has(job.id)
                        const isClosed = job.status !== "active" || job.can_apply === false

                        return (
                            <article
                                key={job.id}
                                className="overflow-hidden rounded-3xl border border-[#DCE5F8] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-[#243056] dark:bg-[#121C46]"
                            >
                                <div className="border-b border-gray-100 bg-[#F7F8FF] p-5 dark:border-[#243056] dark:bg-[#0C1430]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-lg font-bold text-white">
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
                                        ) : (
                                            <span />
                                        )}
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setSelectedJob(job)}
                                                className="h-11 rounded-xl border-[#D5CCFF] px-5 text-[#7C3AED] hover:bg-[#F3EEFF] dark:border-[#4C3D88] dark:text-[#C4B5FD] dark:hover:bg-[#1C2752]"
                                            >
                                                View Full Details
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleApply(job)}
                                                disabled={isApplied || applyingJobId === job.id || isClosed}
                                                className="h-11 rounded-xl bg-[#7C3AED] px-5 text-white hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isApplied ? "Applied" : applyingJobId === job.id ? "Applying..." : isClosed ? "Applications Closed" : "Apply Now"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )
                    })}

                    {filteredJobs.length > 0 ? (
                        <p className="text-sm text-gray-600 dark:text-[#A8B3CF]">
                            Jobs: <span className="font-semibold">{filteredJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> results
                        </p>
                    ) : null}
                </div>
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
                                className="rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {appliedJobIds.has(selectedJob.id) ? "Applied" : applyingJobId === selectedJob.id ? "Applying..." : selectedJob.status !== "active" || selectedJob.can_apply === false ? "Applications Closed" : "Apply Now"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}
        </div>
    )
}
