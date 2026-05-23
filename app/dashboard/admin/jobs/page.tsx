"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Clock } from "lucide-react"

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const filteredJobs = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) return jobs
        return jobs.filter((job) => {
            return (
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query) ||
                (job.company_name || "").toLowerCase().includes(query)
            )
        })
    }, [jobs, searchTerm])

    const loadJobs = async () => {
        setLoading(true)
        setError("")
        try {
            const data = await apiClient.getJobs(false) // Admin can see all jobs
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

    const handleApprove = async (jobId: string) => {
        try {
            await apiClient.approveJob(jobId)
            // Update local state instead of full reload for better UX
            setJobs(jobs.map(job => job.id === jobId ? { ...job, is_public: true } : job))
        } catch (e: any) {
            console.error(e?.response?.data?.detail || "Failed to approve job")
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and approve jobs submitted by corporates and colleges.</p>
                    </div>
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs..."
                        className="md:max-w-xs"
                    />
                </div>

                {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4 px-1">
                    <p>Showing 1 to {filteredJobs.length} of {jobs.length} jobs</p>
                </div>

                {loading ? <p className="text-sm text-gray-500">Loading jobs...</p> : null}
                {!loading && filteredJobs.length === 0 ? <p className="text-sm text-gray-500">No jobs found.</p> : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className={`rounded-xl border ${job.is_public ? 'border-emerald-200/70 bg-emerald-50/40' : 'border-orange-200/70 bg-orange-50/40'} dark:bg-gray-900 dark:border-gray-700`}>
                            <div className={`p-4 border-b ${job.is_public ? 'border-emerald-100' : 'border-orange-100'} dark:border-gray-700`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                            {job.company_name || 'Unknown Company'} • {job.job_type.replace("_", " ")}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                        {job.is_public ? (
                                            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                <Clock className="w-3 h-3 mr-1" /> Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200 mt-3 line-clamp-3">{job.description}</p>
                            </div>
                            <div className="p-4 flex items-center gap-2">
                                {!job.is_public && (
                                    <Button onClick={() => handleApprove(job.id)} size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                                        Approve Job
                                    </Button>
                                )}
                                <Button type="button" variant="outline" size="sm" className="w-full">
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
