'use client'

import { useAuth } from '@/lib/auth.context'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { studentService } from '@/features/student/student.service'
import type { StudentProfile } from '@/features/student/student.types'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'STUDENT') return
    studentService
      .getMe()
      .then(setProfile)
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [user?.role])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12 text-gray-600">Loading dashboard...</div>
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

  const applications = profile?.applications ?? []
  const offered = applications.filter((a) => a.applicationStatus === 'offered')
  const verifiedCount =
    (profile?.skillsJson && profile.skillsJson.filter((s) => s.verified).length) ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.fullName ?? user?.fullName}!
        </h1>
        <p className="text-gray-600">Manage your profile, skills, and job applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">DES Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {profile?.overallDes != null ? profile.overallDes : '--'}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Applications</p>
              <p className="text-3xl font-bold text-green-600">{applications.length}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Verified Skills</p>
              <p className="text-3xl font-bold text-purple-600">{verifiedCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {offered.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="font-medium text-amber-800">
            You have {offered.length} offer{offered.length > 1 ? 's' : ''} pending.{' '}
            <Link href="/dashboard/student/applications" className="underline">
              View applications
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/student/profile"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center font-medium"
            >
              Update Profile
            </Link>
            <Link
              href="/dashboard/student/jobs"
              className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-center font-medium"
            >
              View Jobs
            </Link>
            <Link
              href="/dashboard/student/skills"
              className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-center font-medium"
            >
              Skill Verification
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent activity</div>
          ) : (
            <ul className="space-y-2">
              {applications.slice(0, 5).map((app) => (
                <li key={app.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{app.job?.title ?? 'Job'}</span>
                  <span
                    className={`font-medium ${
                      app.applicationStatus === 'offered'
                        ? 'text-green-600'
                        : app.applicationStatus === 'rejected'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {app.applicationStatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
