'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TopNav } from '@/components/dashboard/top-nav'
import { Sidebar } from '@/components/dashboard/sidebar'
import { useAuth } from '@/hooks/useAuth'

/** One source of truth for desktop rail width — drives sidebar, main, and top nav via CSS var */
const SIDEBAR_EXPANDED_PX = 244
const SIDEBAR_COLLAPSED_PX = 72

const layoutTransitionClass =
    'transition-[padding-left] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    // Auth guard: redirect unauthenticated users to login
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        }
    }, [isAuthenticated, isLoading, router, pathname])

    // Close mobile drawer when navigating
    useEffect(() => {
        setIsMobileSidebarOpen(false)
    }, [pathname])

    /** Skill verification exam sections — fullscreen focus, no dashboard chrome */
    const isSkillExamMode = pathname.startsWith('/dashboard/skill-verification/exam')

    const sidebarWidthPx = isSkillExamMode
        ? 0
        : isSidebarCollapsed
          ? SIDEBAR_COLLAPSED_PX
          : SIDEBAR_EXPANDED_PX

    // Show nothing while checking auth or if not authenticated (during redirect)
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#080F26] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-white/50 font-medium">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen bg-[#F9F9F9] dark:bg-[#070D1F] font-sans overflow-hidden ${
                isSkillExamMode ? 'flex h-[100dvh] min-h-0 flex-col' : ''
            }`}
            style={
                {
                    ['--sidebar-w' as string]: `${sidebarWidthPx}px`,
                } as React.CSSProperties
            }
        >
            {!isSkillExamMode && (
                <>
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        setIsCollapsed={setIsSidebarCollapsed}
                        isMobileOpen={isMobileSidebarOpen}
                        setIsMobileOpen={setIsMobileSidebarOpen}
                    />
                    <TopNav
                        isSidebarCollapsed={isSidebarCollapsed}
                        setIsSidebarCollapsed={setIsSidebarCollapsed}
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    />
                </>
            )}

            <main
                className={
                    isSkillExamMode
                        ? 'flex min-h-0 flex-1 flex-col overflow-hidden pt-0 pl-0'
                        : `pt-[72px] pl-0 lg:pl-[var(--sidebar-w)] ${layoutTransitionClass}`
                }
            >
                <div
                    className={
                        isSkillExamMode
                            ? 'flex min-h-0 flex-1 flex-col overflow-auto w-full max-w-none'
                            : 'px-5 py-5 lg:px-6 lg:py-6 max-w-[1440px] mx-auto w-full'
                    }
                >
                    {children}
                </div>
            </main>
        </div>
    )
}
