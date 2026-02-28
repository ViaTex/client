"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    BookOpen,
    User,
    LogOut,
    Building,
    Users,
    FileSpreadsheet,
    GraduationCap,
    Shield,
    Settings,
    Menu,
    X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

const studentNavigation = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Jobs & Internships', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Learning', href: '/dashboard/student/learning', icon: BookOpen },
    { name: 'Settings', href: '/dashboard/student/settings', icon: Settings },
]

const corporateNavigation = [
    { name: 'Dashboard', href: '/dashboard/corporate', icon: LayoutDashboard },
    { name: 'Company Profile', href: '/dashboard/corporate/profile', icon: Building },
    { name: 'Manage Jobs', href: '/dashboard/corporate/jobs', icon: Briefcase },
    { name: 'Manage Applicants', href: '/dashboard/corporate/applicants', icon: Users },
    { name: 'Settings', href: '/dashboard/corporate/settings', icon: Settings },
]

const collegeNavigation = [
    { name: 'Dashboard', href: '/dashboard/college', icon: LayoutDashboard },
    { name: 'College Profile', href: '/dashboard/college/profile', icon: Building },
    { name: 'Students', href: '/dashboard/college/students', icon: GraduationCap },
    { name: 'Internships', href: '/dashboard/college/internships', icon: Briefcase },
    { name: 'Reports', href: '/dashboard/college/reports', icon: FileSpreadsheet },
    { name: 'Settings', href: '/dashboard/college/settings', icon: Settings },
]

const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Institutions', href: '/dashboard/admin/institutions', icon: Building },
    { name: 'System Logs', href: '/dashboard/admin/logs', icon: Shield },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: FileSpreadsheet },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Select navigation based on user type, defaulting to student
    const getNavigationFields = () => {
        if (!user?.user_type) return studentNavigation

        if (user.user_type === 'corporate') {
            return corporateNavigation
        } else if (user.user_type === 'college') {
            return collegeNavigation
        } else if (user.user_type === 'admin') {
            return adminNavigation
        }

        return studentNavigation
    }

    const navigation = getNavigationFields()

    return (
        <>
            {/* Mobile toggle button */}
            <button
                type="button"
                className="lg:hidden fixed z-50 bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 z-40 h-screen w-[280px] shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo Area */}
                <div className="flex items-center h-16 shrink-0 px-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">DS</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                            DishaSetu
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                    }`} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* User Profile Area */}
                <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-inner font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {user?.name || `${user?.user_type?.charAt(0).toUpperCase()}${user?.user_type?.slice(1)} User` || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email || 'student@example.com'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </Button>
                </div>
            </aside>
        </>
    )
}
