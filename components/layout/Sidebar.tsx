'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth.context'
import { Role } from '@/types/auth.types'

interface NavItem {
  label: string
  href: string
  icon: string
  roles?: Role[]
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: `/dashboard/${user?.role?.toLowerCase()}`,
      icon: '📊',
    },
    {
      label: 'Profile',
      href: `/dashboard/${user?.role?.toLowerCase()}/profile`,
      icon: '👤',
    },
    {
      label: 'Jobs',
      href: `/dashboard/${user?.role?.toLowerCase()}/jobs`,
      icon: '💼',
    },
    {
      label: 'Applications',
      href: `/dashboard/${user?.role?.toLowerCase()}/applications`,
      icon: '📝',
    },
    {
      label: 'Skills',
      href: `/dashboard/${user?.role?.toLowerCase()}/skills`,
      icon: '✅',
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
