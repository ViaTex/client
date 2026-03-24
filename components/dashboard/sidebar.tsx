"use client"

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
    Rocket,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const studentNavigation = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Skill Verification', href: '/dashboard/skill-verification', icon: FileSpreadsheet },
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
    { name: 'Job Management', href: '/dashboard/admin/jobs', icon: Briefcase },
    { name: 'System Logs', href: '/dashboard/admin/logs', icon: Shield },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: FileSpreadsheet },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
]

type SidebarProps = {
    isCollapsed: boolean
    isMobileOpen: boolean
    setIsMobileOpen: (value: boolean | ((prev: boolean) => boolean)) => void
}

export function Sidebar({ isCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const isCorporate = user?.user_type === 'corporate'

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
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-gray-900/50 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar — below fixed header on mobile so navbar menu stays usable */}
            <aside
                className={`fixed left-0 z-50 flex flex-col border border-[#E3DED1]/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-[8px_0_32px_-8px_rgba(27,20,13,0.12)] dark:shadow-[8px_0_32px_-8px_rgba(0,0,0,0.45)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none top-16 bottom-0 h-auto lg:top-0 lg:h-screen lg:bottom-auto shrink-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                style={{ width: 'var(--sidebar-w)' }}
            >
                {/* Top section: logo + collapse + navigation */}
                <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-5'} py-4 flex flex-col gap-6 items-center lg:items-stretch`}>
                    {/* Brand — collapse/expand lives in TopNav */}
                    <div
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                    >
                        <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 bg-[#ee8c2b] rounded-xl flex items-center justify-center text-white shrink-0">
                                <Rocket className="w-6 h-6" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-base font-bold text-[#1b140d] dark:text-white leading-tight">
                                        DishaSetu
                                    </span>
                                    <span className="text-[11px] text-stone-500 font-medium">
                                        {isCorporate ? 'MSME Portal' : 'Career Portal'}
                                    </span>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 mt-4 flex flex-col gap-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out group ${isActive
                                        ? 'bg-[#ee8c2b] text-white shadow-md shadow-[#ee8c2b]/25'
                                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 shrink-0 ${isActive
                                            ? 'text-white'
                                            : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-gray-100'
                                            }`}
                                    />
                                    {!isCollapsed && <span>{item.name}</span>}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute  h-7 bg-[#ee8c2b] rounded-r-full"
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom section: plan + profile + logout (styled like design) */}
                <div className="shrink-0 px-2 pb-6 pt-4 space-y-3">
                    {/* Plan card, hidden when collapsed */}
                    {/* {!isCollapsed && (
                        <div className="rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
                            <p className="text-[11px] text-stone-500 mb-2 uppercase tracking-[0.18em] font-bold">
                                Plan
                            </p>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-sm font-bold text-stone-800">
                                    Pro MSME
                                </span>
                                <span className="text-[11px] font-semibold text-[#ee8c2b]">
                                    80% used
                                </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                                <div className="h-full w-[80%] bg-[#ee8c2b]" />
                            </div>
                        </div>
                    )} */}

                    {/* User + logout */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ee8c2b] to-[#f2b261] flex items-center justify-center text-white shrink-0 shadow-inner font-bold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                                        {user?.name ||
                                            `${user?.user_type?.charAt(0).toUpperCase()}${user?.user_type?.slice(1)} User` ||
                                            'User'}
                                    </p>
                                    <p className="text-[11px] text-stone-500 dark:text-gray-400 truncate">
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={logout}
                                className="inline-flex items-center justify-center rounded-full border border-stone-200 dark:border-gray-700 px-3 py-1.5 text-[11px] font-semibold text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                            >
                                <LogOut className="w-3.5 h-3.5 mr-1" />
                                {!isCollapsed && 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
