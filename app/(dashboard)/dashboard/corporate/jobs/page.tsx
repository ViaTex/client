"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, MoreVertical, Plus, Briefcase, MapPin, IndianRupee, Clock, Clock3, Building, Users } from "lucide-react"
import { Modal } from "@/components/ui/modal"

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

export default function CorporateJobsPage() {
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement | null>(null)
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null)
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

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
            const data = await apiClient.getJobs(true)
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
        <div className="space-y-6">
            <div className="rounded-[24px] border border-[#d7ddf8] bg-[#edf4ff] p-3 shadow-[0_14px_30px_rgba(121,144,198,0.14)] sm:p-4 md:p-5 dark:border-[#2b3458] dark:bg-[#11162a] dark:shadow-[0_14px_28px_rgba(3,8,26,0.42)]">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Job title or keyword"
                        className="h-10 w-full rounded-xl border-[#d7ddf8] bg-white text-sm text-[#1d2755] placeholder:text-[#8b97bf] md:max-w-[280px] dark:border-[#3b456b] dark:bg-[#1a213a] dark:text-white dark:placeholder:text-[#8e99bf]"
                    />
                    <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard/corporate/jobs/create")}
                            className="h-12 rounded-[14px] bg-[#3b82f6] px-6 text-base font-semibold text-white shadow-none hover:bg-[#3174e8] dark:bg-[#3b82f6] dark:text-white dark:hover:bg-[#3174e8]"
                        >
                            <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
                            Create Job
                        </Button>
                        <Button type="button" variant="outline" className="h-12 rounded-[14px] border-[1.5px] border-[#3b82f6] bg-white px-6 text-base font-medium text-[#3b82f6] shadow-none hover:bg-[#f4f8ff] hover:text-[#3174e8] dark:border-[#3b82f6] dark:bg-transparent dark:text-[#8fb5ff] dark:hover:bg-[#17244f] dark:hover:text-white">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredJobs.map((job) => {
                        const currentApplications = Number(job.current_applications ?? 0)
                        const maxApplicationsValue = Number(job.max_applications ?? 0)
                        const safeCurrentApplications = Number.isFinite(currentApplications) ? currentApplications : 0
                        const safeMaxApplications = Number.isFinite(maxApplicationsValue) && maxApplicationsValue > 0 ? maxApplicationsValue : 1
                        const completionPercent = getJobCompletionPercent(job)

                        return (
                            <div key={job.id} className="rounded-[18px] border border-[#dbcfd4] bg-[#fff4f1] shadow-[0_8px_18px_rgba(122,118,145,0.16)] dark:border-[#314176] dark:bg-[#101d49] dark:shadow-[0_18px_30px_rgba(5,10,30,0.34)]">
                                <div className="border-b border-[#eadbdf] p-4 dark:border-[#4658a8]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-[1.02rem] font-bold text-[#171717] dark:text-white">{job.title}</h3>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-[#875ad8] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-[#8c5ce5]">
                                                    {job.job_type.replace("_", " ")}
                                                </span>
                                                <span className="rounded-full bg-[#d8ffde] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1baf52] dark:bg-[#dcfce7] dark:text-[#17803d]">
                                                    {job.status}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-xl bg-[#e8f2ff] px-3 py-1 text-[10px] font-semibold text-[#355fbe] dark:bg-[#1377db] dark:text-white">
                                                    <Clock3 className="h-3 w-3" />
                                                    {job.mode_of_work ?? "onsite"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative" ref={openMenuJobId === job.id ? menuRef : null}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenMenuJobId((prev) => (prev === job.id ? null : job.id))}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6f7da9] hover:bg-white/70 dark:text-[#c6d0ff] dark:hover:bg-[#2a387d]"
                                                aria-label={`Open actions for ${job.title}`}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>

                                            {openMenuJobId === job.id ? (
                                                <div className="absolute right-0 top-10 z-20 w-40 rounded-lg border border-[#d7ddf8] bg-white p-1 shadow-lg sm:w-44 dark:border-[#4658a8] dark:bg-[#24306f]">
                                                    <button
                                                        type="button"
                                                        className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#42548d] hover:bg-[#edf3ff] dark:text-[#e3e9ff] dark:hover:bg-[#2d3c89]"
                                                        onClick={() => {
                                                            setOpenMenuJobId(null)
                                                            router.push(`/dashboard/corporate/jobs/edit/${job.id}`)
                                                        }}
                                                    >
                                                        Edit Job
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl bg-[#e7fff1] p-3 dark:flex dark:min-h-[86px] dark:flex-col dark:justify-between dark:border dark:border-[#23914f] dark:bg-[linear-gradient(180deg,_#1f9448_0%,_#1b863f_100%)]">
                                            <div className="mb-1 inline-flex items-center gap-2 text-[#19bb5b] dark:text-[#d8ffe7]">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium text-[#5b668e] dark:text-white">Location</span>
                                            </div>
                                            <p className="text-[0.95rem] font-semibold text-[#1d2755] dark:text-white">{job.location || "Not specified"}</p>
                                        </div>
                                        <div className="rounded-xl bg-[#f5eefe] p-3 dark:flex dark:min-h-[86px] dark:flex-col dark:justify-between dark:border dark:border-[#9633e1] dark:bg-[linear-gradient(180deg,_#952ee1_0%,_#7e28c7_100%)]">
                                            <div className="mb-1 inline-flex items-center gap-2 text-[#8b5cf6] dark:text-[#f1ddff]">
                                                <Users className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium text-[#5b668e] dark:text-white">Applications</span>
                                            </div>
                                            <p className="text-[0.95rem] font-semibold text-[#1d2755] dark:text-white">{safeCurrentApplications}/{safeMaxApplications}</p>
                                        </div>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-[0.95rem] leading-8 text-[#42548d] dark:text-[#edf1ff]">{job.description}</p>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-end justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs text-[#7c839c] dark:text-[#d8e0ff]">Job Completion</p>
                                            <div className="mt-2 h-2 rounded-full bg-[#c9c9c9] dark:bg-white">
                                                <div className="h-full rounded-full bg-[#1564c0] dark:bg-[#2790ef]" style={{ width: `${completionPercent}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-[1.05rem] font-bold leading-none text-[#171717] sm:text-[1.15rem] md:text-[1.35rem] dark:text-white">{completionPercent}%</span>
                                    </div>

                                    <div className="mt-4 border-t border-[#ddd1d5] pt-4 dark:border-[#4658a8]">
                                        <Button type="button" variant="outline" className="h-10 w-full rounded-xl border-[#d7ddf8] bg-white text-sm text-[#42548d] hover:bg-[#eef3ff] hover:text-[#16213f] dark:border-[#6074c5] dark:bg-transparent dark:text-[#eef3ff] dark:hover:bg-[#2a387d] dark:hover:text-white" onClick={() => setSelectedJob(job)}>
                                            View JD
                                        </Button>
                                    </div>
                                </div>
                            </div>
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
                >
                    <div className="max-h-[70vh] space-y-6 overflow-y-auto text-[#42548d] dark:text-[#e6ecff]">
                        <div className="flex flex-wrap gap-4 border-b border-[#d4def8] pb-4 dark:border-[#223067]">
                            <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-primary" />
                                <span className="font-medium">{selectedJob.company_name || "Not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{selectedJob.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span className="capitalize">{selectedJob.job_type.replace("_", " ")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{selectedJob.status}</span>
                            </div>
                            {(selectedJob.salary_min || selectedJob.salary_max) && (
                                <div className="flex items-center gap-2 text-sm">
                                    <IndianRupee className="h-4 w-4 text-primary" />
                                    <span>
                                        {selectedJob.salary_min} - {selectedJob.salary_max} {selectedJob.salary_currency}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="mb-2 text-lg font-bold text-[#16213f] dark:text-white">Job Description</h4>
                                <div className="rounded-lg bg-[#edf3ff] p-4 text-sm leading-relaxed whitespace-pre-wrap text-[#42548d] dark:bg-[#0f183f] dark:text-[#f4f7ff]">
                                    {selectedJob.description}
                                </div>
                            </div>

                            {selectedJob.requirements && (
                                <div>
                                    <h4 className="mb-2 text-lg font-bold text-[#16213f] dark:text-white">Requirements</h4>
                                    <div className="rounded-lg bg-[#edf3ff] p-4 text-sm leading-relaxed whitespace-pre-wrap text-[#42548d] dark:bg-[#0f183f] dark:text-[#f4f7ff]">
                                        {selectedJob.requirements}
                                    </div>
                                </div>
                            )}

                            {selectedJob.responsibilities && (
                                <div>
                                    <h4 className="mb-2 text-lg font-bold text-[#16213f] dark:text-white">Responsibilities</h4>
                                    <div className="rounded-lg bg-[#edf3ff] p-4 text-sm leading-relaxed whitespace-pre-wrap text-[#42548d] dark:bg-[#0f183f] dark:text-[#f4f7ff]">
                                        {selectedJob.responsibilities}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#edf3ff] p-4 pt-4 sm:grid-cols-2 lg:grid-cols-3 dark:bg-[#0f183f]">
                            <div>
                                <p className="mb-1 text-xs text-[#5f6f98] dark:text-[#93a4d1]">Experience</p>
                                <p className="text-sm font-medium text-[#16213f] dark:text-white">{selectedJob.experience_min ?? 0} - {selectedJob.experience_max ?? "Any"} Years</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-[#5f6f98] dark:text-[#93a4d1]">Applications</p>
                                <p className="text-sm font-medium text-[#16213f] dark:text-white">{selectedJob.current_applications} / {selectedJob.max_applications}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-[#5f6f98] dark:text-[#93a4d1]">Mode</p>
                                <p className="text-sm font-medium capitalize text-[#16213f] dark:text-white">{selectedJob.mode_of_work ?? "onsite"}</p>
                            </div>
                        </div>

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
