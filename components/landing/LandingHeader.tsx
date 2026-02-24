'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function LandingHeader() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navbarClasses = "w-full z-50 transition-all duration-300 fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50"

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
             <h1 className="text-xl md:text-2xl font-bold text-gray-900">DishaSetu</h1>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 hover:text-[#00BAE8] transition-colors text-sm font-medium">Home</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 hover:text-[#00BAE8] transition-colors text-sm font-medium">Features</button>
            <a href="#stakeholders" className="text-gray-700 hover:text-[#00BAE8] transition-colors text-sm font-medium">For Everyone</a>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
             <button onClick={() => router.push('/login')} className="px-5 py-2 border border-[#00BAE8] text-[#00BAE8] hover:bg-[#00BAE8] hover:text-white rounded-md text-sm font-medium transition-colors">Login</button>
             <button onClick={() => router.push('/register')} className="px-5 py-2 bg-[#00BAE8] hover:bg-[#009bc2] text-white rounded-md text-sm font-medium transition-colors">Get Started</button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:text-gray-900">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200">
            <div className="flex flex-col space-y-3 p-4">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) }} 
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#00BAE8] rounded-md text-sm font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }} 
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#00BAE8] rounded-md text-sm font-medium"
              >
                Features
              </button>
              <a 
                href="#stakeholders" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#00BAE8] rounded-md text-sm font-medium"
              >
                For Everyone
              </a>
              
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                 <button 
                   onClick={() => { setIsMobileMenuOpen(false); router.push('/login') }} 
                   className="w-full px-4 py-2 border border-[#00BAE8] text-[#00BAE8] hover:bg-[#00BAE8] hover:text-white rounded-md text-sm font-medium transition-colors"
                 >
                   Login
                 </button>
                 <button 
                   onClick={() => { setIsMobileMenuOpen(false); router.push('/register') }} 
                   className="w-full px-4 py-2 bg-[#00BAE8] hover:bg-[#009bc2] text-white rounded-md text-sm font-medium transition-colors"
                 >
                   Get Started
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
