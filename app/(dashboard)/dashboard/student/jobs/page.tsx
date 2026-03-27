"use client"

import { useEffect, useState } from "react"
import { apiClient, JobItem } from "@/lib/api"

export default function StudentJobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await apiClient.getJobs(false)
                setJobs(data)
            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load jobs")
            } finally {
                setLoading(false)
            }
        }
        loadJobs()
    }, [])

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            {loading ? <p className="text-sm text-gray-500">Loading jobs...</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {!loading && !error && jobs.length === 0 ? <p className="text-sm text-gray-500">No jobs available.</p> : null}

            <div className="grid gap-3">
                {jobs.map((job) => (
                    <div key={job.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{job.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{job.location} • {job.job_type}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
