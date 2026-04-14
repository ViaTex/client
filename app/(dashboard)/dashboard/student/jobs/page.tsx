"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { apiClient, JobItem } from "@/lib/api"

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

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [applyError, setApplyError] = useState("")
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
  const [submittingJobId, setSubmittingJobId] = useState<string | null>(null)

  const loadJobs = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiClient.getJobs(false)
      setJobs(data)
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load jobs"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const handleApply = async () => {
    if (!selectedJob) return

    setSubmittingJobId(selectedJob.id)
    setApplyError("")
    try {
      await apiClient.applyToJob(selectedJob.id)
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === selectedJob.id
            ? {
                ...job,
                has_applied: true,
                current_applications: (job.current_applications || 0) + 1,
              }
            : job
        )
      )
      setSelectedJob(null)
    } catch (error: unknown) {
      setApplyError(getErrorMessage(error, "Failed to apply for this job"))
    } finally {
      setSubmittingJobId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Jobs & Internships
      </h1>

      {loading && <p className="text-sm text-gray-500">Loading jobs...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && jobs.length === 0 && (
        <p className="text-sm text-gray-500">No jobs available.</p>
      )}

      <div className="grid gap-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-gray-200 bg-[#f7f8f7] p-4 dark:border-gray-700 dark:bg-blue-900/10"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {job.title}
            </h3>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {job.description}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {job.location} • {job.job_type.replaceAll("_", " ")}
            </p>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={job.has_applied || submittingJobId === job.id}
                onClick={() => {
                  setApplyError("")
                  setSelectedJob(job)
                }}
                className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white"
              >
                {job.has_applied ? "Applied" : "Apply"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedJob}
        onClose={() => {
          setSelectedJob(null)
          setApplyError("")
        }}
        title={selectedJob ? `Apply for ${selectedJob.title}` : "Apply"}
        maxWidth="md"
      >
        {selectedJob ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedJob.title}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {selectedJob.company_name || "Company not specified"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {selectedJob.location} • {selectedJob.job_type.replaceAll("_", " ")}
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Confirm your application. Your latest student resume will be sent to the corporate manage applicants page for this job.
            </p>

            {applyError ? <p className="text-sm text-red-600">{applyError}</p> : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedJob(null)
                  setApplyError("")
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={submittingJobId === selectedJob.id || !!selectedJob.has_applied}
              >
                {selectedJob.has_applied
                  ? "Already Applied"
                  : submittingJobId === selectedJob.id
                    ? "Applying..."
                    : "Apply Now"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
