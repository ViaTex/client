'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingHeader() {
  const router = useRouter()

  return (
    <header className="w-full py-4 px-4 md:px-8 fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            DishaSetu
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => {
              const element = document.getElementById('hero')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            Home
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('features')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            Features
          </button>
          <a 
            href="#stakeholders" 
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            For Everyone
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
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
        </div>
      </div>
    </header>
  )
}
