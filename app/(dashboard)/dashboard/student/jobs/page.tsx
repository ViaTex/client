"use client"

import { useEffect, useState } from "react"
import { apiClient, JobItem } from "@/lib/api"
import JobApplicationModal from "@/components/ui/job-application-modal"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiClient.getJobs(false)
        setJobs(data)
        
        // Load student applications to mark applied jobs
        const applications = await apiClient.getStudentApplications()
        const appliedJobIds = new Set(applications.map((app: any) => app.job_id))
        setAppliedJobs(appliedJobIds)
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  const handleApplyClick = (job: JobItem) => {
    if (appliedJobs.has(job.id)) {
      setError("You have already applied for this job")
      return
    }
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleSubmitApplication = async (data: { expected_salary?: string; cover_letter?: string }) => {
    if (!selectedJob) return

    setIsSubmitting(true)
    try {
      await apiClient.submitJobApplication(selectedJob.id, data)
      
      // Add job to applied jobs set
      setAppliedJobs(new Set([...appliedJobs, selectedJob.id]))
      
      setSuccessMessage(`Application submitted for ${selectedJob.title}!`)
      setIsModalOpen(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Jobs
      </h1>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader className="h-4 w-4 animate-spin" />
          Loading jobs...
        </div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20"
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
        </motion.div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-sm text-gray-500">No jobs available.</p>
      )}

      {/* Jobs Grid */}
      <div className="grid gap-3">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-[#f7f8f7] dark:bg-blue-900/10 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {job.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  <span>📍 {job.location}</span>
                  <span>💼 {job.job_type}</span>
                  {job.company_name && <span>🏢 {job.company_name}</span>}
                </div>

                {job.salary_min && job.salary_max && (
                  <p className="text-xs text-gray-500 mt-2">
                    💰 ₹{job.salary_min} - ₹{job.salary_max} {job.salary_currency}
                  </p>
                )}
              </div>

              {/* Apply Button */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleApplyClick(job)}
                  disabled={appliedJobs.has(job.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    appliedJobs.has(job.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                      : "bg-[#7c3aed] text-white hover:opacity-90 dark:bg-[#6d28d9] dark:hover:bg-[#5b21b6]"
                  }`}
                >
                  {appliedJobs.has(job.id) ? "✓ Applied" : "Apply"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        isOpen={isModalOpen}
        jobTitle={selectedJob?.title || ""}
        companyName={selectedJob?.company_name}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitApplication}
        isLoading={isSubmitting}
      />
    </div>
  )
}