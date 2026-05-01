"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient, JobApplicationItem, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Building2, CalendarDays, Clock3, MapPin, Search } from "lucide-react"

type JobFilter = "all" | "jobs" | "internships"

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

function matchesFilter(job: JobItem, filter: JobFilter) {
    if (filter === "all") return true
    if (filter === "internships") return job.job_type === "internship"
    return job.job_type !== "internship"
}

export default function StudentJobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [applications, setApplications] = useState<JobApplicationItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [actionMessage, setActionMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<JobFilter>("all")
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
                setJobs(jobsData)
                setApplications(applicationsData)
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
        return jobs.filter((job) => {
            if (!matchesFilter(job, filter)) return false
            if (!query) return true
            return [
                job.title,
                job.description,
                job.location,
                job.company_name,
                job.company_description,
                ...(job.skills_required || []),
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        })
    }, [filter, jobs, searchTerm])

    const appliedJobIds = useMemo(() => new Set(applications.map((application) => application.job_id)), [applications])

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
            setJobs((current) =>
                current.map((item) =>
                    item.id === job.id
                        ? {
                              ...item,
                              current_applications: (item.current_applications || 0) + 1,
                              can_apply:
                                  item.max_applications != null
                                      ? (item.current_applications || 0) + 1 < item.max_applications
                                      : item.can_apply,
                          }
                        : item
                )
            )
            setSelectedJob((current) =>
                current?.id === job.id
                    ? {
                          ...current,
                          current_applications: (current.current_applications || 0) + 1,
                          can_apply:
                              current.max_applications != null
                                  ? (current.current_applications || 0) + 1 < current.max_applications
                                  : current.can_apply,
                      }
                    : current
            )
            setActionMessage(`Application submitted for ${job.title}.`)
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to apply for this job")
        } finally {
            setApplyingJobId("")
        }
    }

    return (
        <div className="space-y-5">
            <section className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-5 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-[2rem]">Jobs & Internships</h1>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500 dark:text-[#A8B3CF]">
                            Explore exciting career opportunities and internship programs to grow your skills, gain real-world experience, and build a successful future with us.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
                        <div className="relative w-full xl:w-[320px] xl:flex-none">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search roles, companies, skills"
                                className="h-11 pl-9"
                            />
                        </div>
                        <div className="grid w-full min-w-0 grid-cols-3 rounded-xl border border-gray-200 bg-white p-1 xl:w-[320px] xl:flex-none dark:border-[#31406B] dark:bg-[#0C1430]">
                            {[
                                { id: "all", label: "All" },
                                { id: "jobs", label: "Jobs" },
                                { id: "internships", label: "Internships" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id as JobFilter)}
                                    className={`min-w-0 whitespace-nowrap rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors sm:px-3 ${
                                        filter === item.id
                                            ? "bg-[#7C3AED] text-white"
                                            : "text-gray-600 hover:bg-gray-100 dark:text-[#A8B3CF] dark:hover:bg-white/10"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {loading ? <p className="text-sm text-gray-500">Loading opportunities...</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {actionMessage ? <p className="text-sm text-green-600">{actionMessage}</p> : null}
            {!loading && !error && filteredJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#121C46] dark:text-[#A8B3CF]">
                    No matching jobs or internships found.
                </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
                {filteredJobs.map((job) => (
                    <article
                        key={job.id}
                        className="rounded-3xl border border-[#DCE5F8] bg-white p-5 shadow-sm dark:border-[#243056] dark:bg-[#121C46] sm:p-6"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#7C3AED] dark:bg-[#1C2752] dark:text-[#C4B5FD]">
                                            {formatLabel(job.job_type)}
                                        </span>
                                        {job.mode_of_work ? (
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-[#A8B3CF]">
                                                {formatLabel(job.mode_of_work)}
                                            </span>
                                        ) : null}
                                    </div>
                                    <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-[#A8B3CF]">
                                        <Building2 className="h-4 w-4" />
                                        {job.company_name || "Company not specified"}
                                    </p>
                                </div>
                                <div className="w-full rounded-2xl bg-[#F7F8FF] px-4 py-3 text-left dark:bg-[#0C1430] sm:w-auto sm:max-w-[220px] sm:text-right">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Salary / CTC</p>
                                    <p className="mt-1 break-words text-sm font-bold text-gray-900 dark:text-white">{formatSalary(job)}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">
                                        <MapPin className="h-4 w-4" />
                                        Location
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatValue(job.location)}</p>
                                </div>
                                <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">
                                        <Clock3 className="h-4 w-4" />
                                        Experience
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {job.experience_min ?? 0} - {job.experience_max ?? "Any"} years
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">
                                        <CalendarDays className="h-4 w-4" />
                                        Deadline
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(job.application_deadline)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
                                        disabled={appliedJobIds.has(job.id) || applyingJobId === job.id || job.can_apply === false}
                                        className="h-11 rounded-xl bg-[#7C3AED] px-5 text-white hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {appliedJobIds.has(job.id) ? "Applied" : applyingJobId === job.id ? "Applying..." : "Apply Now"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
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
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Company</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatValue(selectedJob.company_name)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Salary / CTC</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatSalary(selectedJob)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Location</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatValue(selectedJob.location)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Work Mode</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formatLabel(selectedJob.mode_of_work)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Experience</p>
                                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                                    {selectedJob.experience_min ?? 0} - {selectedJob.experience_max ?? "Any"} years
                                </p>
                            </div>
                            <div className="rounded-2xl bg-[#F7F8FF] p-4 dark:bg-[#0C1430]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#A8B3CF]">Deadline</p>
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
                                disabled={appliedJobIds.has(selectedJob.id) || applyingJobId === selectedJob.id || selectedJob.can_apply === false}
                                className="rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {appliedJobIds.has(selectedJob.id) ? "Applied" : applyingJobId === selectedJob.id ? "Applying..." : "Apply Now"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

        </div>
    )
}
