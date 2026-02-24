'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { studentService } from '@/features/student/student.service'
import type { StudentApplication } from '@/features/student/student.types'

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = () => {
    studentService
      .getMyApplications()
      .then(setApplications)
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAccept = async (app: StudentApplication) => {
    setUpdatingId(app.id)
    try {
      await studentService.acceptOrDeclineOffer(app.id, 'accepted')
      load()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDecline = async (app: StudentApplication) => {
    setUpdatingId(app.id)
    try {
      await studentService.acceptOrDeclineOffer(app.id, 'declined')
      load()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12 text-gray-600">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track status and respond to offers</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <p>No applications yet.</p>
          <Link href="/dashboard/student/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {app.job?.title ?? 'Job'}
                  </h2>
                  <p className="text-gray-600">{app.job?.company?.name ?? 'Company'}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.applicationStatus === 'offered'
                        ? 'bg-green-100 text-green-800'
                        : app.applicationStatus === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : app.applicationStatus === 'declined' || app.applicationStatus === 'rejected'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.applicationStatus}
                  </span>
                  {app.applicationStatus === 'offered' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(app)}
                        disabled={updatingId === app.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(app)}
                        disabled={updatingId === app.id}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
