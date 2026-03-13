'use client'

import { useEffect, useState } from 'react'
import { TopNav } from '@/components/dashboard/top-nav'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

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
