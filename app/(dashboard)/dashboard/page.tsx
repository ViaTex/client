'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth.context'
import { ROLE_DASHBOARD_ROUTES } from '@/types/auth.types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Redirect to role-specific dashboard if user is on generic dashboard
    if (user?.role && isAuthenticated) {
      const roleDashboard = ROLE_DASHBOARD_ROUTES[user.role]
      if (roleDashboard && roleDashboard !== '/dashboard') {
        router.push(roleDashboard)
      }
    }
  }, [user, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  )
}
