'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth.context'
import { studentService } from '@/features/student/student.service'
import type { StudentProfile, SkillItem, ProjectItem, JobPreferences } from '@/features/student/student.types'

const defaultSkills: SkillItem[] = []
const defaultProjects: ProjectItem[] = []
const defaultPrefs: JobPreferences = {}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    collegeName: '',
    degree: '',
    branch: '',
    graduationYear: '' as string | number,
    currentCity: '',
    aboutMe: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeFileUrl: '',
    skillsJson: defaultSkills,
    projectsJson: defaultProjects,
    jobPreferencesJson: defaultPrefs,
    showPhone: true,
    showEmail: true,
    showResume: true,
    showDes: true,
  })

  useEffect(() => {
    if (user?.role !== 'STUDENT') return
    studentService
      .getMe()
      .then((p) => {
        setProfile(p)
        setForm({
          fullName: p.fullName ?? '',
          phone: p.phone ?? '',
          collegeName: p.collegeName ?? '',
          degree: p.degree ?? '',
          branch: p.branch ?? '',
          graduationYear: p.graduationYear ?? '',
          currentCity: p.currentCity ?? '',
          aboutMe: p.aboutMe ?? '',
          linkedinUrl: p.linkedinUrl ?? '',
          githubUrl: p.githubUrl ?? '',
          portfolioUrl: p.portfolioUrl ?? '',
          resumeFileUrl: p.resumeFileUrl ?? '',
          skillsJson: p.skillsJson ?? defaultSkills,
          projectsJson: p.projectsJson ?? defaultProjects,
          jobPreferencesJson: p.jobPreferencesJson ?? defaultPrefs,
          showPhone: p.showPhone ?? true,
          showEmail: p.showEmail ?? true,
          showResume: p.showResume ?? true,
          showDes: p.showDes ?? true,
        })
      })
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [user?.role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : name === 'graduationYear' ? (value ? Number(value) : '') : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      const payload = {
        ...form,
        graduationYear: form.graduationYear === '' ? undefined : Number(form.graduationYear),
      }
      const updated = await studentService.updateMe(payload)
      setProfile(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12 text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Onboarding</h1>
        <p className="text-gray-600">Complete your profile for better job matching</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>
        )}

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email ?? user?.email ?? ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <input
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                name="graduationYear"
                type="number"
                min="2000"
                max="2030"
                value={form.graduationYear}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Links</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current City</label>
              <input
                name="currentCity"
                value={form.currentCity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
              <textarea
                name="aboutMe"
                value={form.aboutMe}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
              <input
                name="portfolioUrl"
                value={form.portfolioUrl}
                onChange={handleChange}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume file URL</label>
            <input
              name="resumeFileUrl"
              value={form.resumeFileUrl}
              onChange={handleChange}
              type="url"
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Upload your resume elsewhere and paste the link here, or use file upload when available.</p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
          <div className="space-y-2">
            {[
              { key: 'showPhone', label: 'Show phone to employers' },
              { key: 'showEmail', label: 'Show email to employers' },
              { key: 'showResume', label: 'Show resume to employers' },
              { key: 'showDes', label: 'Show DES score to employers' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={key}
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
