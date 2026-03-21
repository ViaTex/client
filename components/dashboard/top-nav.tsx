"use client"

import { useEffect, useMemo, useState } from 'react'
import { Bell, ChevronsLeft, ChevronsRight, Menu, Search, X } from 'lucide-react'
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
    'transition-[left,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none'

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
    const { logout } = useAuth()
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
            className={`fixed top-0 right-0 z-[60] flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e3df] dark:border-gray-800 pl-2 pr-4 lg:pl-2 lg:pr-8 py-4 bg-white/95 dark:bg-[#221910]/95 backdrop-blur-md left-0 w-full lg:left-[var(--sidebar-w)] lg:w-[calc(100%_-_var(--sidebar-w))] ${topNavTransitionClass}`}
        >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen((v) => !v)}
                    className="lg:hidden inline-flex shrink-0 items-center justify-center rounded-xl bg-[#ee8c2b] text-white shadow-md shadow-[#ee8c2b]/35 w-10 h-10 hover:bg-[#e07d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee8c2b] focus-visible:ring-offset-2 dark:ring-offset-[#221910] transition-colors"
                    aria-expanded={isMobileSidebarOpen}
                    aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMobileSidebarOpen ? (
                        <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    ) : (
                        <Menu className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed((v) => !v)}
                    className="hidden lg:inline-flex shrink-0 items-center justify-center rounded-xl bg-[#ee8c2b] text-white shadow-md shadow-[#ee8c2b]/35 w-11 h-11 hover:bg-[#e07d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee8c2b] focus-visible:ring-offset-2 dark:ring-offset-[#221910] transition-colors"
                    aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isSidebarCollapsed ? (
                        <ChevronsRight className="w-5 h-5" strokeWidth={2.5} aria-hidden />
                    ) : (
                        <ChevronsLeft className="w-5 h-5" strokeWidth={2.5} aria-hidden />
                    )}
                </button>
                <h1 className="text-xl lg:text-2xl font-extrabold text-[#1b140d] dark:text-white tracking-tight truncate">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-6">
                <label className="hidden lg:flex flex-col min-w-64 h-10">
                    <div className="flex w-full flex-1 items-stretch rounded-xl bg-[#e5e3df]/50 dark:bg-white/10 px-3">
                        <div className="text-[#9a734c] dark:text-gray-400 flex items-center justify-center pr-2">
                            <Search className="w-5 h-5 text-gray-500" />
                        </div>
                        <input className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-[#9a734c] dark:placeholder:text-gray-400 text-[#1b140d] dark:text-white outline-none" placeholder="Search skills, jobs..." />
                    </div>
                </label>
                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#221910]"></span>
                    </div>
                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-10 h-10 rounded-full border-2 border-[#ee8c2b] p-0.5 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#ee8c2b]/50">
                                <div className="w-full h-full rounded-full bg-center bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCkv9aa2uILXDA9U1AIKGrrJAagir-34Z2VpIvCsRWxXVPFcpFi_UxiRqaDUOCDE6Uzz5N9DuNQCgNd2-bLsAHu_8H4BH3bLIgkRztx792t2Jm3PSuAaAd2gYYk8ttM9f1x67HuV1QuS_MkducAu5UJkcYQ9yNdSlXheR9OCx-nJHFQC48RVZSgU0YFoi1k1H8y_q83__EuH7iyN3Iit3vKH1_T_WcvdLOft3KE5Pns-ggyMuKfn4846vmKqTnhTm_tCEg37lafhu1z")' }}></div>
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
            </div>
        </header>
    )
}
