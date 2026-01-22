'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth.context'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, handleLogout } = useAuth()

  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href={isDashboard ? "/dashboard" : "/"} className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">DishaSetu</h1>
          </Link>

          {/* Navigation Links - Only show on non-dashboard pages */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#stakeholders"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                For Everyone
              </a>
            </div>
          )}

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:block text-sm text-gray-700">
                  <span className="font-medium">{user?.fullName}</span>
                  <span className="text-gray-500 ml-2">({user?.role})</span>
                </div>
                {!isDashboard && (
                  <Link
                    href={`/dashboard/${user?.role?.toLowerCase()}`}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 md:px-6 py-2 bg-blue-600 text-white font-medium rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
