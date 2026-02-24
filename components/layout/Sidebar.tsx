'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth.context'
import { Role } from '@/types/auth.types'
import {
  LayoutDashboard,
  User,
  Briefcase,
  ClipboardList,
  CheckCircle,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  color?: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: `/dashboard/${user?.role?.toLowerCase()}`,
      icon: LayoutDashboard,
      description: 'Overview and analytics',
      color: 'from-blue-500 to-purple-600'
    },
    {
      label: 'Profile',
      href: `/dashboard/${user?.role?.toLowerCase()}/profile`,
      icon: User,
      description: 'Personal information',
      color: 'from-green-500 to-teal-600'
    },
    {
      label: 'Jobs',
      href: `/dashboard/${user?.role?.toLowerCase()}/jobs`,
      icon: Briefcase,
      description: 'Browse available jobs',
      color: 'from-orange-500 to-red-600'
    },
    {
      label: 'Applications',
      href: `/dashboard/${user?.role?.toLowerCase()}/applications`,
      icon: ClipboardList,
      description: 'Track your applications',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Skills',
      href: `/dashboard/${user?.role?.toLowerCase()}/skills`,
      icon: CheckCircle,
      description: 'Manage your skills',
      color: 'from-purple-500 to-pink-600'
    },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2">Menu</h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg ${isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                  : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  }`}
              >
                <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${isActive
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-gray-100 group-hover:bg-white/50'
                  }`}>
                  <item.icon className={`w-5 h-5 ${isActive
                    ? 'text-white'
                    : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className={`text-xs mt-0.5 ${isActive
                      ? 'text-white/90'
                      : 'text-gray-500'
                      }`}>
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
