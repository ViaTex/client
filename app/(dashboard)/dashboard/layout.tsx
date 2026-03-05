import { TopNav } from '@/components/dashboard/top-nav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-screen bg-[#f4f3f0] dark:bg-[#1b140d] overflow-hidden font-sans">
            {/* Header Navbar */}
            <TopNav />

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-6 lg:p-10 max-w-[1440px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
