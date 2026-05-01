"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
    Menu,
    X,
    User,
    BriefcaseBusiness,
    Building2,
    GraduationCap,
    Shield,
    LogOut,
} from 'lucide-react'

interface NavbarProps {
    variant?: 'default' | 'transparent' | 'solid'
    className?: string
}

export function Navbar({
    variant = 'default',
    className = ""
}: NavbarProps) {
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const getAuthLink = (basePath: string) => {
        if (pathname?.startsWith('/auth/') || pathname === '/') {
            return basePath
        }
        return `${basePath}?redirect=${encodeURIComponent(pathname || '')}`
    }

    const handleLogout = () => {
        logout()
        setIsMobileMenuOpen(false)
    }

    const getDashboardPath = () => {
        if (!user) return '/dashboard'
        return `/dashboard/${user.user_type}`
    }

    const getUserTypeIcon = () => {
        switch (user?.user_type) {
            case 'student': return User
            case 'mentor': return BriefcaseBusiness
            case 'corporate': return Building2
            case 'college': return GraduationCap
            case 'admin': return Shield
            default: return Shield
        }
    }

    const getUserTypeLabel = () => {
        switch (user?.user_type) {
            case 'student': return 'Student'
            case 'mentor': return 'Mentor'
            case 'corporate': return 'Corporate'
            case 'college': return 'College'
            case 'admin': return 'Admin'
            default: return 'User'
        }
    }

    const getNavbarClasses = () => {
        const baseClasses = "w-full z-50 transition-all duration-300 fixed top-0 left-0 right-0"
        switch (variant) {
            case 'solid':
                return `${baseClasses} bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700`
            default:
                return `${baseClasses} bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50`
        }
    }

    if (isLoading) {
        return (
            <nav className={`${getNavbarClasses()} ${className}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/auth/login" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">DS</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900 dark:text-white">DishaSetu</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className={`${getNavbarClasses()} ${className}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href={isAuthenticated ? getDashboardPath() : "/"} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DS</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-white">DishaSetu</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated && user ? (
                            <>
                                <Link href={getDashboardPath()}>
                                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                                        {(() => {
                                            const IconComponent = getUserTypeIcon()
                                            return <IconComponent className="w-4 h-4" />
                                        })()}
                                        <span>Dashboard</span>
                                    </Button>
                                </Link>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {user.name || user.email} · {getUserTypeLabel()}
                                </span>
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href={getAuthLink('/auth/register')}>
                                    <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">Sign Up</Button>
                                </Link>
                                <Link href={getAuthLink('/auth/login')}>
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">Sign In</Button>
                                </Link>
                            </>
                        )}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute left-0 right-0 top-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col space-y-3 p-4">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link href={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500">
                                                {(() => {
                                                    const IconComponent = getUserTypeIcon()
                                                    return <IconComponent className="w-4 h-4 mr-2" />
                                                })()}
                                                Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                    <Link href={getAuthLink('/auth/register')} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">Sign Up</Button>
                                    </Link>
                                    <Link href={getAuthLink('/auth/login')} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Sign In</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
