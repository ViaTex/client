'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingFooter() {
  const router = useRouter()

  return (
    <footer className="w-full py-12 md:py-16 px-4 md:px-8 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">DishaSetu</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              An all-in-one digital employability and placement platform connecting 
              students, employers, educational institutions, and industry mentors.
            </p>
            <p className="text-sm text-gray-500">
              Bridge the gap between education and employment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/login')}
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('features')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Features
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} DishaSetu. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">
              LinkedIn
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
