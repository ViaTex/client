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

const topNavTransitionClass =
    'transition-[left,width] duration-[ms:400ms] ease-[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none'

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
            {/* Left: Sidebar toggle + Search */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Mobile menu toggle */}
                <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen((v) => !v)}
                    className="lg:hidden inline-flex shrink-0 items-center justify-center rounded-lg
                        bg-gray-100 text-gray-700 dark:bg-[#080F26] dark:text-white
                        w-10 h-10 hover:bg-gray-200 dark:hover:bg-[#0B1739] focus:outline-none transition-colors"
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

                {/* Search Bar */}
                {/* <div className="hidden lg:flex items-center flex-1">
                    <div className="flex w-full items-center rounded-[4px] bg-[#F3F3F3] dark:bg-[#080F26] border border-[#6F6F6F]/30 dark:border-white/10 pl-2 pr-3 py-3 h-[48px] gap-2">
                        <Search className="w-4 h-4 text-[#6F6F6F] dark:text-white/40 shrink-0" />
                        <input
                            className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-[#6F6F6F] dark:placeholder:text-white/40 text-gray-900 dark:text-white outline-none"
                            placeholder="Search"
                        />
                    </div>
                </div> */}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-5">
                {/* Notification Bell */}
                <button className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
                    <Bell className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0B1739]"></span>
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none group">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/20">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                            <Link href="/dashboard/student/profile">Profile</Link>
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
