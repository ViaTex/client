'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TopNav } from '@/components/dashboard/top-nav'
import { Sidebar } from '@/components/dashboard/sidebar'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    // Auth guard: redirect unauthenticated users to login
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        }
    }, [isAuthenticated, isLoading, router, pathname])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const sidebarWidth = isDesktop ? (isSidebarCollapsed ? 72 : 270) : 0

    // Show nothing while checking auth or if not authenticated (during redirect)
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#E3DED1] dark:bg-[#1b140d] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#ee8c2b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#9a734c] font-medium">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#E3DED1] dark:bg-[#1b140d] font-sans overflow-hidden">
            {/* Fixed sidebar occupying full viewport height on the left */}
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            {/* Fixed top navigation, aligned to start after sidebar */}
            <TopNav isSidebarCollapsed={isSidebarCollapsed} />

            {/* Scrollable content area, padded so it starts below nav and to the right of sidebar */}
            <main
                className="pt-16 lg:pt-20"
                style={{ paddingLeft: sidebarWidth }}
            >
                <div className="px-3 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6 max-w-[1440px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
