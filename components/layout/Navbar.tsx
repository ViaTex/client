'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth.context'
import { LogOut, User as UserIcon } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, handleLogout } = useAuth()

  const isDashboard = pathname?.startsWith('/dashboard')

  const navbarClasses = "w-full z-50 transition-all duration-300 fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50"

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={isDashboard ? "/dashboard" : "/"} className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">DishaSetu</h1>
          </Link>

          {/* Navigation Links - Only show on non-dashboard pages */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-[#00BAE8] transition-colors text-sm font-medium"
              >
                Home
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-[#00BAE8] transition-colors text-sm font-medium"
              >
                Features
              </button>
              <a
                href="#stakeholders"
                className="text-gray-700 hover:text-[#00BAE8] transition-colors text-sm font-medium"
              >
                For Everyone
              </a>
            </div>
          )}

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={`/dashboard/${user?.role?.toLowerCase()}`}
                  className="hidden md:flex items-center justify-center px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-md text-sm font-medium transition-colors gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center px-5 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors font-medium text-sm gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-5 py-2 border border-[#00BAE8] text-[#00BAE8] hover:bg-[#00BAE8] hover:text-white rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-5 py-2 bg-[#00BAE8] hover:bg-[#009bc2] text-white rounded-md text-sm font-medium transition-colors"
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
