'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth.context'
import { userService } from '@/features/user/user.service'
import type { UserProfile } from '@/features/user/user.types'

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  })

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const profileData = await userService.getProfile(user!.id)
      setProfile(profileData)
      setFormData({
        fullName: profileData.fullName || profileData.name || user?.fullName || '',
        email: profileData.email || user?.email || '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
      // If profile doesn't exist, use auth user data
      if (user) {
        setFormData({
          fullName: user.fullName,
          email: user.email,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('User not found')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)

      const updatedProfile = await userService.updateProfile(user.id, {
        fullName: formData.fullName,
        email: formData.email,
      })

      setProfile(updatedProfile)
      setSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              Profile updated successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Full Name Field */}
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition"
              placeholder="Enter your email"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your email address is used for account verification and notifications
            </p>
          </div>

          {/* Account Info (Read-only) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-gray-900 font-medium">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-gray-900 font-medium">{user?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Verified:</span>
                <span className="text-gray-900 font-medium">
                  {user?.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              {profile?.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => loadProfile()}
              disabled={isSaving}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
