'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { jobsService } from '@/features/student/student.service'
import type { Job } from '@/features/student/student.types'

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    jobsService
      .list({ status: 'open' })
      .then((res) => {
        setJobs(res.jobs)
        setTotal(res.total)
      })
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12 text-gray-600">Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
        <p className="text-gray-600">Find roles that match your profile ({total} open)</p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          No open jobs at the moment. Check back later.
        </div>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/dashboard/student/jobs/${job.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.company?.name ?? 'Company'}</p>
                    {job.locationType && (
                      <p className="text-sm text-gray-500 mt-1">{job.locationType}</p>
                    )}
                  </div>
                  <span className="text-blue-600 font-medium">View →</span>
                </div>
                {job.requiredSkills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
