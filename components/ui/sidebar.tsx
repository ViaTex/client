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
    Bell,
    LineChart,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { mentorSidebarInfo } from '@/lib/mentor-sidebar-info'

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
    comingSoon?: boolean
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

const mentorIconMap = {
    dashboard: LayoutDashboard,
    profile: User,
    evaluations: CalendarCheck,
    vivas: CalendarCheck,
    projects: FileText,
    reports: FileSpreadsheet,
    messages: Bell,
    settings: Settings,
} as const

const mentorNavigation: NavigationItem[] = mentorSidebarInfo.map((item) => ({
    name: item.name,
    href: item.href ?? undefined,
    icon: mentorIconMap[item.iconKey],
    badge: item.badge,
    comingSoon: item.comingSoon,
}))

const collegeNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/college', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/college/analytics', icon: LineChart },
    { name: 'Students', href: '/dashboard/college/students', icon: GraduationCap },
    { name: 'Verification & Viva', href: '/dashboard/college/verification', icon: CalendarCheck },
    { name: 'Placements', href: '/dashboard/college/placements', icon: Rocket },
    { name: 'Recruiters', href: '/dashboard/college/recruiters', icon: Building },
    { name: 'Jobs', href: '/dashboard/college/jobs', icon: Briefcase },
    { name: 'Reports', href: '/dashboard/college/reports', icon: FileSpreadsheet },
    { name: 'Notifications', href: '/dashboard/college/notifications', icon: Bell },
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
    const [pendingReviews, setPendingReviews] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (user?.user_type === 'mentor') {
            const fetchPending = async () => {
                try {
                    const { mentorService } = await import('@/services/mentor.service')
                    const data = await mentorService.getEvaluations()
                    const pending = data.filter((item) => item.status === 'assigned').length
                    setPendingReviews(pending)
                } catch {
                    // Fallback silently
                }
            }
            fetchPending()
        }
    }, [user, pathname])

    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        'Manage Users': true, // Default to true so it is initially expanded
    })

    const toggleMenu = (name: string) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [name]: !prev[name],
        }))
    }

    const checkSubItemActive = (href: string) => {
        if (href.includes('?')) {
            const [basePath, queryString] = href.split('?')
            if (pathname !== basePath) return false
            const params = new URLSearchParams(queryString)
            for (const [key, value] of params.entries()) {
                let currentVal = searchParams.get(key)
                if (key === 'tab' && !currentVal) {
                    currentVal = 'account'
                }
                if (currentVal !== value) return false
            }
            return true
        }
        return pathname === href || pathname.startsWith(href + '/')
    }

    const getNavigationFields = () => {
        if (!user?.user_type) return studentNavigation

        if (user.user_type === 'corporate') {
            return corporateNavigation
        } else if (user.user_type === 'mentor') {
            return mentorNavigation.map(item => {
                if (item.name === 'Skill Evaluations' && pendingReviews !== undefined) {
                    return { ...item, badge: pendingReviews }
                }
                if (item.name === 'Settings') {
                    return {
                        ...item,
                        href: undefined,
                        subItems: [
                            { name: 'Account Settings', href: '/dashboard/mentor/settings?tab=account' },
                            { name: 'Security', href: '/dashboard/mentor/settings?tab=security' },
                            { name: 'Notifications', href: '/dashboard/mentor/settings?tab=notifications' },
                            { name: 'Appearance', href: '/dashboard/mentor/settings?tab=appearance' },
                            { name: 'Privacy', href: '/dashboard/mentor/settings?tab=privacy' },
                            { name: 'Connected Accounts', href: '/dashboard/mentor/settings?tab=connected' },
                            { name: 'Help & Support', href: '/dashboard/mentor/settings?tab=help' },
                        ]
                    }
                }
                return item
            })
        } else if (user.user_type === 'college') {
            return collegeNavigation
        } else if (user.user_type === 'admin') {
            return adminNavigation
        }

        return studentNavigation
    }

    const navigation = getNavigationFields()

    // Auto-expand menus based on active subitems
    useEffect(() => {
        const currentNavigation = getNavigationFields()
        const updatedExpansion: Record<string, boolean> = { ...expandedMenus }
        let changed = false

        currentNavigation.forEach(item => {
            if (item.subItems && !expandedMenus[item.name]) {
                const hasActiveSub = item.subItems.some(sub => checkSubItemActive(sub.href))
                if (hasActiveSub) {
                    updatedExpansion[item.name] = true
                    changed = true
                }
            }
        })

        if (changed) {
            setExpandedMenus(updatedExpansion)
        }
    }, [pathname, searchParams])

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex flex-col h-screen transform
                    transition-[width,transform] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none
                    shrink-0
                    ${isMobileOpen ? 'p-3' : 'lg:p-4 p-0'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ width: 'var(--sidebar-w)' }}
            >
                {/* Floating Inner Container with rounded corners on both left and right sides */}
                <div className="flex flex-col h-full w-full bg-[#13141F] text-white rounded-[17px] border border-white/[0.05] overflow-hidden shadow-2xl">
                    {/* Header: Logo */}
                    <div className={`flex items-center h-[88px] shrink-0 ${isCollapsed ? 'px-3 justify-center' : 'px-6'}`}>
                        <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            {/* Custom overlapping logo styled like the screenshot */}
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                {/* Peach outer circle */}
                                <div className="absolute inset-0 rounded-full bg-[#E5B59E] border border-white/20 shadow-md"></div>
                                {/* White inner crescent cutting in */}
                                <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-inner">
                                    {/* Dark center dot */}
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#13141F]"></div>
                                </div>
                            </div>
                            {!isCollapsed && (
                                <span className="text-[20px] font-bold text-white tracking-tight font-poppins">
                                    DishaSetu
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className={`flex-1 overflow-y-auto scrollbar-none ${isCollapsed ? 'px-2' : 'px-4'} py-4`}>
                        <nav className="flex flex-col gap-2">
                            {navigation.map((item) => {
                                const hasSubItems = !!item.subItems
                                const isExpanded = expandedMenus[item.name]
                                const isAnySubActive = hasSubItems && item.subItems?.some(sub => checkSubItemActive(sub.href))
                                const isActive = hasSubItems ? isAnySubActive : (pathname === item.href)
                                const Icon = item.icon
                                const isDisabled = item.comingSoon || !item.href

                                if (hasSubItems) {
                                    return (
                                        <div key={item.name} className="flex flex-col">
                                            <button
                                                onClick={() => {
                                                    if (isCollapsed) {
                                                        setIsCollapsed(false)
                                                        setExpandedMenus((prev) => ({ ...prev, [item.name]: true }))
                                                    } else {
                                                        toggleMenu(item.name)
                                                    }
                                                }}
                                                className={`relative flex items-center gap-3.5 w-full ${isCollapsed ? 'px-3 justify-center' : 'px-5'} py-3.5 rounded-full text-[14px] font-semibold transition-all duration-200 group
                                                    ${isAnySubActive
                                                        ? 'text-white bg-white/[0.04]'
                                                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                                                    }`}
                                                title={isCollapsed ? item.name : undefined}
                                            >
                                                <Icon
                                                    className={`w-[20px] h-[20px] shrink-0 ${isAnySubActive
                                                        ? 'text-[#C8EE44]'
                                                        : 'text-white/50 group-hover:text-white/80'
                                                        }`}
                                                    strokeWidth={isAnySubActive ? 2.5 : 2}
                                                />
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="truncate">{item.name}</span>
                                                        <ChevronDown
                                                            className={`ml-auto w-4.5 h-4.5 text-white/40 transition-transform duration-200 group-hover:text-white/70
                                                                ${isExpanded ? 'rotate-180' : ''}`}
                                                        />
                                                    </>
                                                )}
                                            </button>

                                            {/* Sub-items with curved connector tree design */}
                                            {!isCollapsed && isExpanded && (
                                                <div className="relative pl-[48px] flex flex-col gap-1 mt-1.5 transition-all duration-200">
                                                    {item.subItems?.map((subItem, idx, arr) => {
                                                        const isSubActive = checkSubItemActive(subItem.href)
                                                        const isLast = idx === arr.length - 1
                                                        return (
                                                            <Link
                                                                key={subItem.name}
                                                                href={subItem.href}
                                                                onClick={() => setIsMobileOpen(false)}
                                                                className="relative flex items-center h-10 group"
                                                            >
                                                                {/* Vertical line segment (top half) */}
                                                                <div className="absolute left-[-18px] top-0 w-[1.5px] h-1/2 bg-white/15 group-hover:bg-white/35 transition-colors" />

                                                                {/* Vertical line segment (bottom half) - omit for last element */}
                                                                {!isLast && (
                                                                    <div className="absolute left-[-18px] top-1/2 w-[1.5px] h-1/2 bg-white/15 group-hover:bg-white/35 transition-colors" />
                                                                )}

                                                                {/* Curved branch pointing right */}
                                                                <div className="absolute left-[-18px] top-1/2 w-4 h-4 border-l-[1.5px] border-b-[1.5px] border-white/15 rounded-bl-[6px] -translate-y-1/2 group-hover:border-white/35 transition-colors" />

                                                                <span className={`text-[13px] font-semibold transition-colors duration-150 pl-1
                                                                    ${isSubActive
                                                                        ? 'text-[#C8EE44]'
                                                                        : 'text-white/50 group-hover:text-white'
                                                                    }`}
                                                                >
                                                                    {subItem.name}
                                                                </span>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                const itemClassName = `relative flex items-center gap-3.5 ${isCollapsed ? 'px-3 justify-center' : 'px-5'} py-3.5 rounded-full text-[14px] font-semibold transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-[#C8EE44] text-[#13141F]'
                                        : isDisabled
                                            ? 'text-white/35 cursor-default'
                                            : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                                    }`

                                const iconClassName = `w-[20px] h-[20px] shrink-0 ${isActive
                                        ? 'text-[#13141F]'
                                        : isDisabled
                                            ? 'text-white/25'
                                            : 'text-white/50 group-hover:text-white/80'
                                    }`

                                if (isDisabled) {
                                    return (
                                        <div
                                            key={item.name}
                                            className={itemClassName}
                                            title={isCollapsed ? item.name : undefined}
                                        >
                                            <Icon
                                                className={iconClassName}
                                                strokeWidth={2}
                                            />
                                            {!isCollapsed && (
                                                <>
                                                    <span className="truncate">{item.name}</span>
                                                    {item.badge !== undefined && (
                                                        <span className="ml-auto inline-flex items-center justify-center text-[11px] font-bold w-5.5 h-5.5 px-1.5 rounded-full shrink-0 bg-[#F5C2A9] text-[#13141F]">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href || '#'}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={itemClassName}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <Icon
                                            className={iconClassName}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        {!isCollapsed && (
                                            <>
                                                <span className="truncate">{item.name}</span>
                                                {/* Show badge dynamically if defined */}
                                                {item.badge !== undefined && (
                                                    <span className={`ml-auto inline-flex items-center justify-center text-[11px] font-bold w-5.5 h-5.5 px-1.5 rounded-full shrink-0
                                                        ${isActive
                                                            ? 'bg-[#13141F] text-[#C8EE44]'
                                                            : 'bg-[#F5C2A9] text-[#13141F]'}`}
                                                    >
                                                        {item.badge}
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
                    <div className={`shrink-0 border-t border-white/10 ${isCollapsed ? 'px-2' : 'px-4'} py-4`}>
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
                            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[#13141F] shrink-0 text-sm font-bold shadow-md relative bg-gradient-to-br from-[#E5B59E] to-[#C8EE44]">
                                {user?.profile_picture_url ? (
                                    <img
                                        src={user.profile_picture_url}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-[13px] font-semibold text-white truncate">
                                            {(() => {
                                                const raw = user?.name || ''
                                                const displayName = raw.includes('@') ? raw.split('@')[0] : raw
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
                                        className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4.5 h-4.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
