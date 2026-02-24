'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { jobsService, studentService } from '@/features/student/student.service'
import type { Job } from '@/features/student/student.types'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [applied, setApplied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    jobsService
      .getById(id)
      .then(setJob)
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !job) return
    studentService
      .getMyApplications()
      .then((apps) => setApplied(apps.some((a) => a.jobId === id)))
      .catch(() => {})
  }, [id, job])

  const handleApply = async () => {
    setApplying(true)
    setError(null)
    try {
      await studentService.apply(id)
      setApplied(true)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12 text-gray-600">Loading job...</div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="p-6 md:p-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>
        <button
          onClick={() => router.push('/dashboard/student/jobs')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to jobs
        </button>
      </div>
    )
  }

  if (!job) return null

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <button
        onClick={() => router.push('/dashboard/student/jobs')}
        className="text-blue-600 hover:underline mb-6"
      >
        ← Back to jobs
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
        <p className="text-gray-600 mb-4">{job.company?.name}</p>

        {job.locationType && (
          <p className="text-sm text-gray-500 mb-2">Location: {job.locationType}</p>
        )}
        {job.salaryRange && (
          <p className="text-sm text-gray-500 mb-2">Salary: {job.salaryRange}</p>
        )}

        {job.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.requiredSkills.map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {job.description && (
          <div className="prose prose-sm max-w-none mt-4 text-gray-700 whitespace-pre-wrap">
            {job.description}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          {applied ? (
            <p className="text-green-600 font-medium">You have applied to this job.</p>
          ) : job.status === 'open' ? (
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {applying ? 'Applying...' : 'Apply now'}
            </button>
          ) : (
            <p className="text-gray-500">This job is no longer accepting applications.</p>
          )}
        </div>
      </div>
    </div>
  )
}
