'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function LandingFooter() {
  const router = useRouter()

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-10">
      <div className="container mx-auto px-6 sm:px-8 lg:px-10 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 md:gap-12 lg:gap-16 mb-14">
          {/* Brand Section */}
          <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
            <Link href="/" className="inline-block">
              <h3 className="text-2xl font-bold text-gray-900">DishaSetu</h3>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              An all-in-one digital employability and placement platform.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bridge the gap between education and employment.
            </p>
            <div className="flex space-x-4 pt-2 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-[#00BAE8] transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00BAE8] transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00BAE8] transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00BAE8] transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
            <h3 className="text-gray-900 font-semibold mb-5 text-lg">Quick Links</h3>
            <ul className="space-y-4 flex flex-col items-center md:items-start">
              <li>
                <button
                  onClick={() => { document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/register')} className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors">
                  Sign Up
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
            <h3 className="text-gray-900 font-semibold mb-5 text-lg">Resources</h3>
            <ul className="space-y-4 flex flex-col items-center md:items-start">
              <li>
                <a href="#" className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#00BAE8] text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
            <h3 className="text-gray-900 font-semibold mb-5 text-lg">Contact Us</h3>
            <ul className="space-y-4 flex flex-col items-center md:items-start">
              <li className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 text-sm">
                <Mail className="w-5 h-5 text-[#00BAE8] shrink-0" />
                <span>support@dishasetu.com</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 text-sm">
                <Phone className="w-5 h-5 text-[#00BAE8] shrink-0" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 text-sm">
                <MapPin className="w-5 h-5 text-[#00BAE8] shrink-0" />
                <span className="text-center md:text-left">Tech Park, Odisha, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-10 pb-2 flex flex-col md:flex-row justify-between items-center gap-6 px-2 md:px-0">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} DishaSetu. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start space-x-6">
            <a href="#" className="text-gray-500 hover:text-[#00BAE8] text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-[#00BAE8] text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
