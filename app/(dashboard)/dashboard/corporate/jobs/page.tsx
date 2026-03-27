"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, MoreVertical, Plus, Briefcase, MapPin, IndianRupee, Clock, Building } from "lucide-react"
import { Modal } from "@/components/ui/modal"

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
            setError(e?.response?.data?.detail || "Failed to load jobs")
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
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-5">
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs by title, description, or location..."
                        className="md:max-w-lg"
                    />
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            onClick={() => router.push("/dashboard/corporate/jobs/create")} 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Job
                        </Button>
                        <Button type="button" variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4 px-1">
                    <p>Showing 1 to {filteredJobs.length} of {jobs.length} jobs</p>
                    <p>Page 1 of 1 • {filteredJobs.length} jobs per page</p>
                </div>

                {loading ? <p className="text-sm text-gray-500">Loading jobs...</p> : null}
                {!loading && filteredJobs.length === 0 ? <p className="text-sm text-gray-500">No jobs found.</p> : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 dark:bg-gray-900 dark:border-gray-700">
                            <div className="p-4 border-b border-emerald-100 dark:border-gray-700">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                            {job.job_type.replace("_", " ")} • {job.status}
                                        </p>
                                    </div>
                                    <div className="relative" ref={openMenuJobId === job.id ? menuRef : null}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenMenuJobId((prev) => (prev === job.id ? null : job.id))}
                                            className="h-8 w-8 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center justify-center"
                                            aria-label={`Open actions for ${job.title}`}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {openMenuJobId === job.id ? (
                                            <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1">
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
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
                                <p className="text-sm text-gray-700 dark:text-gray-200 mt-3 line-clamp-3">{job.description}</p>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-500">
                                    {job.location} • applications {job.current_applications}/{job.max_applications}
                                </p>
                                <Button type="button" variant="outline" className="w-full mt-3" onClick={() => setSelectedJob(job)}>
                                    View JD
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {selectedJob && (
                <Modal
                    isOpen={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                    title={selectedJob.title}
                    maxWidth="2xl"
                >
                    <div className="max-h-[70vh] overflow-y-auto space-y-6 text-gray-700 dark:text-gray-200">
                        {/* Header Stats */}
                        <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm">
                                <Building className="w-4 h-4 text-primary" />
                                <span className="font-medium">{selectedJob.company_name || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{selectedJob.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <span className="capitalize">{selectedJob.job_type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{selectedJob.status}</span>
                            </div>
                            {(selectedJob.salary_min || selectedJob.salary_max) && (
                                <div className="flex items-center gap-2 text-sm">
                                    <IndianRupee className="w-4 h-4 text-primary" />
                                    <span>
                                        {selectedJob.salary_min} - {selectedJob.salary_max} {selectedJob.salary_currency}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Job Description</h4>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                            </div>
                            
                            {selectedJob.requirements && (
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Requirements</h4>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                        {selectedJob.requirements}
                                    </div>
                                </div>
                            )}

                            {selectedJob.responsibilities && (
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Responsibilities</h4>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                        {selectedJob.responsibilities}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 p-4 rounded-xl dark:bg-gray-800/30">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Experience</p>
                                <p className="text-sm font-medium">{selectedJob.experience_min ?? 0} - {selectedJob.experience_max ?? 'Any'} Years</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Applications</p>
                                <p className="text-sm font-medium">{selectedJob.current_applications} / {selectedJob.max_applications}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Mode</p>
                                <p className="text-sm font-medium capitalize">{selectedJob.mode_of_work ?? 'onsite'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
                            <Button 
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
