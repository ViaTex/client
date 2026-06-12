"use client"

import { useEffect, useMemo, useState } from 'react'
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth'

const getProfileHref = (userType?: string) => {
    switch (userType) {
        case 'mentor':
            return '/dashboard/mentor/profile'
        case 'corporate':
            return '/dashboard/corporate/profile'
        case 'college':
            return '/dashboard/college'
        case 'admin':
            return '/dashboard/admin'
        case 'student':
        default:
            return '/dashboard/student/profile'
    }
}

const topNavTransitionClass =
    'transition-[left,width] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] will-change-[left,width] motion-reduce:transition-none'

type TopNavProps = {
    isSidebarCollapsed: boolean
    setIsSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
    isMobileSidebarOpen: boolean
    setIsMobileSidebarOpen: (value: boolean | ((prev: boolean) => boolean)) => void
}

export function TopNav({
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
}: TopNavProps) {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    const [customTitle, setCustomTitle] = useState<string | undefined>(undefined)

    const defaultTitle = useMemo(() => {
        if (pathname.startsWith('/dashboard/student/profile')) return 'Student Profile'
        if (pathname.startsWith('/dashboard/student')) return 'Student Dashboard'
        if (pathname.startsWith('/dashboard/mentor')) return 'Mentor Dashboard'
        if (pathname.startsWith('/dashboard/corporate')) return 'Corporate Dashboard'
        if (pathname.startsWith('/dashboard/college')) return 'College Dashboard'
        if (pathname.startsWith('/dashboard/admin')) return 'Admin Dashboard'
        return 'Dashboard'
    }, [pathname])

    const title = customTitle || defaultTitle

    useEffect(() => {
        const onTitleChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ title?: string }>
            setCustomTitle(customEvent.detail?.title || undefined)
        }

        window.addEventListener('dashboard:title-change', onTitleChange as EventListener)
        return () => window.removeEventListener('dashboard:title-change', onTitleChange as EventListener)
    }, [])

    return (
        <header
            className={`fixed top-0 right-0 z-[60] flex items-center justify-between whitespace-nowrap
                border-b border-[#E5E7EB] dark:border-white/10
                px-6 lg:px-8
                bg-white dark:bg-[#0B1739]
                left-0 w-full lg:left-[var(--sidebar-w)] lg:w-[calc(100%_-_var(--sidebar-w))]
                ${topNavTransitionClass}`}
            style={{ height: '72px' }}
        >
            {/* Left: Sidebar toggle + Welcome message */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Mobile menu toggle */}
                <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen((v) => !v)}
                    className="lg:hidden inline-flex shrink-0 items-center justify-center rounded-xl
                        bg-gray-100 text-gray-700 dark:bg-[#13141F] dark:text-white
                        w-10 h-10 hover:bg-gray-200 dark:hover:bg-white/5 focus:outline-none transition-colors"
                    aria-expanded={isMobileSidebarOpen}
                    aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMobileSidebarOpen ? (
                        <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                    ) : (
                        <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
                    )}
                </button>

                {/* Desktop sidebar collapse/expand toggle */}
                <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed((v) => !v)}
                    className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg
                        text-gray-500 dark:text-white/60
                        hover:bg-gray-100 dark:hover:bg-white/[0.06]
                        hover:text-gray-700 dark:hover:text-white
                        transition-colors duration-200"
                    aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isSidebarCollapsed ? (
                        <PanelLeftOpen className="w-5 h-5" strokeWidth={1.8} />
                    ) : (
                        <PanelLeftClose className="w-5 h-5" strokeWidth={1.8} />
                    )}
                </button>

                {/* Welcome back message */}
                <span className="text-[20px] font-bold text-gray-900 dark:text-white select-none hidden md:inline-block font-poppins tracking-tight">
                    Welcome back {(() => {
                        const raw = user?.name || ''
                        const displayName = raw.includes('@') ? raw.split('@')[0] : raw
                        const firstName = displayName.split(' ')[0]
                        return firstName
                            ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
                            : 'Taylor'
                    })()} 👋
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-5">
                {/* Search Bar (Pill style) */}
                <div className="hidden md:flex items-center relative w-[240px] lg:w-[280px]">
                    <Search className="absolute left-4 w-4.5 h-4.5 text-gray-400 dark:text-white/40 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search courses"
                        className="w-full bg-[#F3F4F6]/60 dark:bg-[#13141F] border border-gray-200/50 dark:border-white/[0.08] focus:border-gray-300 dark:focus:border-white/20 rounded-full pl-11 pr-5 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none transition-all"
                    />
                </div>

                {/* Notification Bell */}
                <button className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
                    <Bell className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#070D1F]"></span>
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none group">
                            {/* Premium avatar styling with picture or fallback gradient initials */}
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-white/10 shrink-0 shadow-sm relative group-hover:scale-102 transition-transform bg-gradient-to-br from-[#E5B59E] to-[#C8EE44] flex items-center justify-center text-[#13141F] text-sm font-bold">
                                {user?.profile_picture_url ? (
                                    <img
                                        src={user.profile_picture_url}
                                        alt="Profile Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            <div className="hidden lg:flex flex-col items-start">
                                <span className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
                                    {(() => {
                                        const raw = user?.name || ''
                                        const displayName = raw.includes('@') ? raw.split('@')[0] : raw
                                        const firstName = displayName.split(' ')[0]
                                        return firstName
                                            ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
                                            : 'User'
                                    })()}
                                </span>
                                <span className="text-[11px] text-gray-500 dark:text-white/40 leading-tight">
                                    {user?.user_type?.charAt(0).toUpperCase()}{user?.user_type?.slice(1) || 'Student'}
                                </span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={getProfileHref(user?.user_type)}>Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
