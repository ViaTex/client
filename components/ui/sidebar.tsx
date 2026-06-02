"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState, useRef, useEffect } from 'react'

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
    { name: 'Shortlisted', href: '/dashboard/corporate/shortlisted', icon: FileText },
    { name: 'Settings', href: '/dashboard/corporate/settings', icon: Settings },
]

const mentorNavigation = [
    { name: 'Dashboard', href: '/dashboard/mentor', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/mentor/profile', icon: User },
    { name: 'Skill Evaluations', href: '/dashboard/mentor/evaluations', icon: CalendarCheck },
    { name: 'Settings', href: '/dashboard/mentor/settings', icon: Settings },
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
    setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
    isMobileOpen: boolean
    setIsMobileOpen: (value: boolean | ((prev: boolean) => boolean)) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const isCorporate = user?.user_type === 'corporate'
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

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
                    className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar: Connected Full-Height & Full-Width Grid Design */}
            <aside
                className={`fixed left-0 top-0 h-screen z-50 flex flex-col shrink-0
                    transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width,transform]
                    bg-white border-r border-gray-100
                    dark:bg-gradient-to-b dark:from-[#1b1437] dark:via-[#080b20] dark:to-[#0b2b40] 
                    dark:border-white/[0.06] dark:shadow-[8px_0_32px_rgba(0,0,0,0.05)]
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ width: 'var(--sidebar-w)' }}
            >
                {/* Header: Logo (Centered perfectly in collapsed state) */}
                <div className={`flex items-center h-[72px] shrink-0 border-b border-gray-100 dark:border-white/[0.04] w-full ${isCollapsed ? 'justify-center' : 'px-5'}`}>
                    <Link href="/" className="flex items-center gap-3">
                        {/* Purple Logo Box */}
                        <div className="w-9 h-9 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/10">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <span className={`text-[16px] font-bold text-[#0f172a] dark:text-white tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden
                            ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'}`}
                        >
                            DishaSetu
                        </span>
                    </Link>
                </div>

                {/* Navigation Links - Full sidebar width layout container to avoid centering shifts */}
                <div className="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-6 w-full">
                    <nav className="flex flex-col gap-[6px] w-full">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <div 
                                    key={item.name} 
                                    className={`relative w-full flex items-center ${isCollapsed ? 'justify-center px-2 h-11' : 'px-3'}`}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`relative flex items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group shrink-0
                                            ${isCollapsed 
                                                ? 'w-11 h-11 justify-center p-0 rounded-xl' 
                                                : 'px-4 py-[11px] rounded-2xl w-full'
                                            }
                                            ${isActive
                                                ? 'bg-[#F3E8FF] text-[#7C3AED] font-semibold dark:bg-[#7C3AED]/15 dark:border dark:border-[#7C3AED]/35 dark:text-white dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]'
                                                : 'text-[#475569] hover:bg-gray-50 hover:text-[#0f172a] dark:text-white/60 dark:hover:bg-white/[0.04] dark:hover:text-white'
                                            }`}
                                    >
                                        <Icon
                                            className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${isActive
                                                ? 'text-[#7C3AED] dark:text-white'
                                                : 'text-gray-400 group-hover:text-gray-600 dark:text-white/40 dark:group-hover:text-white/80'
                                                }`}
                                            strokeWidth={isActive ? 2.2 : 1.8}
                                        />
                                        
                                        {/* Smooth Slide-Fade Link Text (No Instant Unmounting) */}
                                        <span className={`text-[14px] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden
                                            ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'}`}
                                        >
                                            {item.name}
                                        </span>

                                        {/* Corporate count badge with smooth collapse transition */}
                                        {!isCollapsed && isCorporate && item.name === 'Shortlisted' && (
                                            <span className="ml-auto inline-flex items-center justify-center text-[11px] font-bold bg-[#7C3AED] text-white px-2 py-0.5 rounded-full animate-in zoom-in duration-200">
                                                45
                                            </span>
                                        )}

                                        {/* Smooth Floating Custom Tooltip when minimized (Matches reference style) */}
                                        {isCollapsed && (
                                            <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl
                                                bg-white dark:bg-[#161F43] border border-gray-100 dark:border-white/[0.08] text-[#0f172a] dark:text-white text-[12px] font-semibold whitespace-nowrap
                                                shadow-xl opacity-0 pointer-events-none translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto
                                                transition-all duration-200 z-50"
                                            >
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Perfectly Aligned Active Indicator Pill (Locks perfectly onto 72px sidebar right edge, decoupled from Link) */}
                                    {isActive && (
                                        <div 
                                            className="absolute top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#7C3AED] dark:bg-[#8B5CF6] rounded-l-md transition-all duration-300 z-10"
                                            style={{ right: '0px' }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom section: Premium User Profile Card */}
                <div className={`shrink-0 border-t border-gray-100 dark:border-white/[0.04] relative w-full ${isCollapsed ? 'py-4 px-2 flex flex-col items-center' : 'p-4'}`} ref={profileMenuRef}>
                    {/* Logout / Profile Dropdown Menu */}
                    {showProfileMenu && !isCollapsed && (
                        <div className="absolute bottom-[80px] left-4 right-4 bg-white dark:bg-[#161F43] border border-gray-100 dark:border-white/[0.08] rounded-2xl p-2 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log Out Account</span>
                            </button>
                        </div>
                    )}

                    <div 
                        onClick={() => !isCollapsed && setShowProfileMenu(!showProfileMenu)}
                        className={`flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCollapsed 
                            ? 'w-11 h-11 justify-center p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] cursor-pointer' 
                            : 'gap-3 px-3 py-[10px] bg-[#F0F5FF]/70 border border-[#E0EAFF] dark:bg-white/[0.03] dark:border-white/[0.04] rounded-2xl cursor-pointer hover:bg-[#E8EFFF] dark:hover:bg-white/[0.06] w-full'}`}
                    >
                        {/* Avatar (Matches exact reference purple gradient) */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-white shrink-0 text-[14px] font-bold shadow-md shadow-purple-500/10">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        {/* Smooth profile detail minimize fade */}
                        <div className={`flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
                            ${isCollapsed ? 'w-0 opacity-0 pointer-events-none ml-0' : 'w-auto opacity-100 ml-2'}`}
                        >
                            <p className="text-[13px] font-bold text-[#0f172a] dark:text-white truncate tracking-wider uppercase">
                                {(() => {
                                    const raw = user?.name || ''
                                    const displayName = raw.includes('@') ? raw.split('@')[0] : raw
                                    const firstName = displayName.split(' ')[0]
                                    return firstName ? firstName : 'AMAN'
                                })()}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-white/40 font-medium truncate mt-0.5">
                                {user?.user_type ? user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1) : 'Student'}
                            </p>
                        </div>

                        {!isCollapsed && (
                            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/40 transition-transform duration-200 shrink-0" />
                        )}
                    </div>

                    {/* Collapsed logout fallback icon */}
                    {isCollapsed && (
                        <button
                            type="button"
                            onClick={logout}
                            className="mt-3 flex items-center justify-center w-11 h-11 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-[18px] h-[18px]" />
                        </button>
                    )}
                </div>
            </aside>
        </>
    )
}
