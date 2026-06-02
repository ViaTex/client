"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
    CalendarCheck,
    Shield,
    Settings,
    Rocket,
    ChevronDown,
    ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState, useRef, useEffect } from 'react'

interface NavigationSubItem {
    name: string
    href: string
}

interface NavigationItem {
    name: string
    href?: string
    icon: any
    badge?: number
    subItems?: NavigationSubItem[]
}

const studentNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Verify Project', href: '/dashboard/student/projects', icon: Rocket },
    { name: 'Skill Verification', href: '/dashboard/skill-verification', icon: FileSpreadsheet },
    { name: 'Interviews', href: '/dashboard/student/interviews', icon: CalendarCheck },
    { name: 'My Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Jobs & Internships', href: '/dashboard/student/jobs', icon: Briefcase, badge: 2 },
    { name: 'Learning', href: '/dashboard/student/learning', icon: BookOpen },
    { name: 'Settings', href: '/dashboard/student/settings', icon: Settings },
]

const corporateNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/corporate', icon: LayoutDashboard },
    { name: 'Smart Match', href: '/dashboard/corporate/smart-match', icon: Rocket },
    { name: 'Interviews', href: '/dashboard/corporate/interviews', icon: CalendarCheck },
    { name: 'Company Profile', href: '/dashboard/corporate/profile', icon: Building },
    { name: 'Manage Jobs', href: '/dashboard/corporate/jobs', icon: Briefcase },
    { name: 'Manage Applicants', href: '/dashboard/corporate/applicants', icon: Users },
    { name: 'Shortlisted', href: '/dashboard/corporate/shortlisted', icon: FileText, badge: 45 },
    { name: 'Settings', href: '/dashboard/corporate/settings', icon: Settings },
]

const mentorNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/mentor', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/mentor/profile', icon: User },
    { name: 'Skill Evaluations', href: '/dashboard/mentor/evaluations', icon: CalendarCheck, badge: 1 },
    { name: 'Settings', href: '/dashboard/mentor/settings', icon: Settings },
]

const collegeNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/college', icon: LayoutDashboard },
    { name: 'College Profile', href: '/dashboard/college/profile', icon: Building },
    { name: 'Students', href: '/dashboard/college/students', icon: GraduationCap },
    { name: 'Internships', href: '/dashboard/college/internships', icon: Briefcase },
    { name: 'Reports', href: '/dashboard/college/reports', icon: FileSpreadsheet },
    { name: 'Settings', href: '/dashboard/college/settings', icon: Settings },
]

const adminNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    {
        name: 'Manage Users',
        icon: Users,
        subItems: [
            { name: 'Students', href: '/dashboard/admin/students' },
            { name: 'Corporate', href: '/dashboard/admin/users/corporate' },
            { name: 'College', href: '/dashboard/admin/users/college' },
            { name: 'Mentor', href: '/dashboard/admin/users/mentor' },
        ],
    },
    { name: 'Project Assignments', href: '/dashboard/admin/assignments', icon: FileText },
    { name: 'Institutions', href: '/dashboard/admin/institutions', icon: Building },
    { name: 'Job Management', href: '/dashboard/admin/jobs', icon: Briefcase },
    { name: 'System Logs', href: '/dashboard/admin/logs', icon: Shield },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: FileSpreadsheet },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
]

type SidebarProps = {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
    isMobileOpen: boolean
    setIsMobileOpen: (value: boolean | ((prev: boolean) => boolean)) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { user, logout } = useAuth()
    const isCorporate = user?.user_type === 'corporate'

    // Select navigation based on user type, defaulting to student
    const getNavigationFields = () => {
        if (!user?.user_type) return studentNavigation

        if (user.user_type === 'corporate') {
            return corporateNavigation
        } else if (user.user_type === 'mentor') {
            return mentorNavigation
        } else if (user.user_type === 'college') {
            return collegeNavigation
        } else if (user.user_type === 'admin') {
            return adminNavigation
        }

        return studentNavigation
    }

    const navigation = getNavigationFields()

    // Handle clicks outside of profile dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-x-0 top-0 bottom-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar: Connected Full-Height & Full-Width Grid Design */}
            <aside
                className={`fixed left-0 top-0 z-50 flex flex-col h-screen
                    bg-[#080F26] dark:bg-[#0B1739] text-gray-800 dark:text-white 
                    transition-[width,transform] duration-[ms:400ms] ease-[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none
                    shrink-0
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ width: 'var(--sidebar-w)' }}
            >
                {/* Header: Logo */}
                <div className={`flex items-center h-[72px] shrink-0 border-b border-white/10 ${isCollapsed ? 'px-3 justify-center' : 'px-5'}`}>
                    <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-[#7C3AED] to-[#A855F7] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/25">
                            <Rocket className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-[15px] font-bold text-white tracking-tight">
                                DishaSetu
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'} py-5`}>
                    <nav className="flex flex-col gap-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`relative flex items-center gap-3 ${isCollapsed ? 'px-3 justify-center' : 'px-4'} py-[10px] rounded-lg text-[13px] font-medium transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-gray-100 text-gray-900 dark:bg-[#080F26] dark:text-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white/90'
                                        }`}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon
                                        className={`w-[18px] h-[18px] shrink-0 ${isActive
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-400 group-hover:text-gray-700 dark:text-white/50 dark:group-hover:text-white/80'
                                            }`}
                                        strokeWidth={isActive ? 2.2 : 1.8}
                                    />
                                    {!isCollapsed && (
                                        <>
                                            <span>{item.name}</span>
                                            {/* Show shortlisted count badge only for corporate sidebar */}
                                            {isCorporate && item.name === 'Shortlisted' && (
                                                <span className="ml-2 inline-flex items-center justify-center text-[11px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                                    45
                                                </span>
                                            )}
                                        </>
                                    )}

                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom section: User Profile + Logout */}
                <div className={`shrink-0 border-t border-gray-200 dark:border-white/10 ${isCollapsed ? 'px-2' : 'px-3'} py-4`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white shrink-0 text-sm font-bold shadow-lg shadow-purple-500/20">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0 pr-5">
                                    <p className="text-[13px] font-semibold text-white truncate">
                                        {(() => {
                                            const raw = user?.name || ''
                                            // If it looks like an email, use part before @
                                            const displayName = raw.includes('@') ? raw.split('@')[0] : raw
                                            // Take just the first name
                                            const firstName = displayName.split(' ')[0]
                                            return firstName
                                                ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
                                                : `${user?.user_type?.charAt(0).toUpperCase()}${user?.user_type?.slice(1)} User`
                                        })()}
                                    </p>
                                    <p className="text-[11px] text-white/40 truncate">
                                        {user?.user_type?.charAt(0).toUpperCase()}{user?.user_type?.slice(1) || 'Student'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40 hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}

