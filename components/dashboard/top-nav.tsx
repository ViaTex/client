"use client"

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'

export function TopNav() {
    const pathname = usePathname()

    // Generate simple title from pathname
    const getPageTitle = () => {
        if (!pathname) return 'Dashboard'
        const parts = pathname.split('/').filter(Boolean)
        const lastPart = parts[parts.length - 1]

        if (lastPart === 'student' || lastPart === 'dashboard') return 'Overview'
        if (lastPart === 'profile') return 'My Profile'
        if (lastPart === 'jobs') return 'Jobs & Internships'
        if (lastPart === 'resume') return 'Resume Builder'
        if (lastPart === 'settings') return 'Settings'
        if (lastPart === 'learning') return 'Learning Hub'

        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
    }

    return (
        <header className="h-16 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-300">
            {/* Left side: Page Title */}
            <div className="flex items-center flex-1">
                {/* Mobile spacing padding for hamburger menu */}
                <div className="w-10 lg:hidden" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                {/* Search Bar (Hidden on Mobile) */}
                <div className="relative hidden md:block w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Search..."
                    />
                </div>

                <Button variant="ghost" size="icon" className="relative hidden sm:flex text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <Search className="h-5 w-5 md:hidden" />
                </Button>

                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                <ThemeToggle />
            </div>
        </header>
    )
}
