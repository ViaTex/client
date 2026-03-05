"use client"

import { usePathname } from 'next/navigation'
import { Bell, Search, Rocket } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth'

export function TopNav() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e3df] dark:border-gray-800 px-6 lg:px-10 py-4 bg-white dark:bg-[#221910] sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ee8c2b] rounded-xl flex items-center justify-center text-white">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h2 className="text-[#1b140d] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Dishasetu</h2>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-[#1b140d] dark:text-gray-100 text-sm font-semibold border-b-2 border-[#ee8c2b] pb-1" href="/dashboard/student">Dashboard</Link>
                    <Link className="text-[#1b140d]/60 dark:text-gray-400 text-sm font-medium hover:text-[#ee8c2b] transition-colors" href="/dashboard/learning">Learning</Link>
                    <Link className="text-[#1b140d]/60 dark:text-gray-400 text-sm font-medium hover:text-[#ee8c2b] transition-colors" href="/dashboard/internships">Internships</Link>
                    <Link className="text-[#1b140d]/60 dark:text-gray-400 text-sm font-medium hover:text-[#ee8c2b] transition-colors" href="/dashboard/community">Community</Link>
                </nav>
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
