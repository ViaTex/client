'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Header Navbar */}
                    <TopNav />

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
