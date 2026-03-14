'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Briefcase,
    Users,
    CheckCircle2,
    WalletCards,
    MessageCircle,
    ArrowRight,
    Brush,
    FileText,
    Share2,
} from 'lucide-react'

const gigItems = [
    {
        title: 'Logo Design for New Branch',
        tag: 'Design',
        progress: 65,
        assignee: 'Amit S.',
    },
    {
        title: 'Data Entry: Inventory Sheets',
        tag: 'Operations',
        progress: 20,
        assignee: 'Priya D.',
    },
    {
        title: 'Instagram Reel Marketing',
        tag: 'Marketing',
        progress: 95,
        assignee: 'Karan L.',
    },
]

const recommendedCandidates = [
    { name: 'Rahul Sharma', role: 'React Specialist', match: '98%' },
    { name: 'Sneha Gupta', role: 'Graphic Designer', match: '94%' },
    { name: 'Vikram Singh', role: 'Video Editor', match: '92%' },
]

export default function CorporateDashboard() {
    const { user } = useAuth()

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#E3DED1] dark:bg-[#221910] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 lg:p-4 shadow-sm">
            <div className="grid grid-cols-12 gap-6 max-w-[1400px] mx-auto">
                {/* Left rail: current gigs + hero */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Hero card - Kaam Post Karein */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white dark:bg-[#221910] rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex items-center h-auto sm:h-64 md:h-72 px-4 sm:px-6 md:px-12 py-6 sm:py-0 relative max-sm:flex-col"
                    >
                        <div className="relative z-10 w-full sm:w-2/3 space-y-4">
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9b7a4a]">
                                <LayoutDashboard className="w-4 h-4 text-[#ee8c2b]" />
                                MSME Dashboard
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1b140d] dark:text-white">
                                Kaam Post Karein
                            </h1>
                            <p className="text-sm md:text-base text-stone-600 dark:text-stone-300 max-w-xl mb-2 md:mb-4">
                                Start a new micro-internship today and get tasks completed by top student talent in 48 hours.
                            </p>
                            <Button className="mt-1 md:mt-2 px-8 py-3 md:py-4 bg-[#ee8c2b] hover:bg-[#d97a1f] text-white rounded-full font-bold flex items-center gap-2 shadow-xl shadow-[#ee8c2b]/30 w-full sm:w-auto justify-center">
                                <Briefcase className="w-5 h-5" />
                                Start Hiring Now
                            </Button>
                        </div>
                        <div
                            className="relative mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-0 h-52 sm:h-full w-full sm:w-1/3 bg-cover bg-center opacity-90 rounded-3xl sm:rounded-l-[3rem] transition-transform duration-700 group-hover:scale-105"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKH4bTQ1JLTQ2Jj7kUKgG4nJMlGio-g6n0v806jmqUDsQwRKL7Ad7-8YgxcJufiKjm_a8aPxesCsMnviGm_La5ec0S3uLntmYkmUYtY4hyotTDNZNzbHnxe0sHogQKS2SSSKgyI78QbrUioIOJ8RCLAi84tKWqiysQUC_-Fis98ohQx9VFTBzqt_wgouguZ8Vsat9DWpx8P9V_cVcIk2EpixFgxJD1O6gwh5eqfujasH9gowdhwzxxg7tYAmDhEzAYdj5_CHNiVnKr")',
                            }}
                        />
                    </motion.div>

                    {/* Current gigs tracking */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-white">
                                Current Gigs Tracking
                            </h2>
                            <button className="text-xs md:text-sm font-bold text-[#ee8c2b] flex items-center gap-1">
                                View All
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {gigItems.map((gig, index) => (
                                <div
                                    key={gig.title}
                                    className="bg-white dark:bg-[#221910] rounded-3xl px-5 py-4 md:p-5 flex items-center gap-4 md:gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                                >
                                    <div className="hidden md:flex size-14 rounded-2xl items-center justify-center text-white shrink-0
                                        bg-gradient-to-tr from-[#ee8c2b] to-[#f2b261]">
                                        {index === 0 && <Brush className="w-7 h-7" />}
                                        {index === 1 && <FileText className="w-7 h-7" />}
                                        {index === 2 && <Share2 className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="font-semibold text-sm md:text-base text-stone-900 dark:text-white">
                                                {gig.title}
                                            </h3>
                                            <span className="px-3 py-1 bg-stone-100 dark:bg-black/20 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-stone-500">
                                                {gig.tag}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-stone-200/80 dark:bg-black/40 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        index === 0
                                                            ? 'bg-[#ee8c2b]'
                                                            : index === 1
                                                            ? 'bg-blue-600'
                                                            : 'bg-green-600'
                                                    }`}
                                                    style={{ width: `${gig.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs md:text-sm font-bold text-stone-700 dark:text-stone-200">
                                                {gig.progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end">
                                        <p className="text-[10px] font-bold uppercase text-stone-400 mb-1">
                                            Assigned to
                                        </p>
                                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                                            {gig.assignee}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right rail widgets */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Summary stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#221910] rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-stone-500">Active</p>
                                <p className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">12</p>
                                <p className="text-[11px] text-emerald-600 font-bold mt-1">+2 this week</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#221910] rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-stone-500">Completed</p>
                                <p className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">48</p>
                                <p className="text-[11px] text-emerald-600 font-bold mt-1">+5 new</p>
                            </div>
                        </div>
                        <div className="col-span-2 bg-white dark:bg-[#221910] rounded-3xl p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-3">
                                <div className="size-11 rounded-full bg-[#ee8c2b]/10 text-[#ee8c2b] flex items-center justify-center">
                                    <WalletCards className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-stone-500">Budget Spent</p>
                                    <p className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white">₹12,400</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-stone-400">ROI: 3.4x</span>
                        </div>
                    </div>

                    {/* WhatsApp alert */}
                    <div className="bg-[#ecfdf3] dark:bg-emerald-900/20 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-800 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <p className="font-bold text-stone-800 dark:text-white">WhatsApp Alert</p>
                            </div>
                            <button
                                type="button"
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#25D366]"
                                aria-label="WhatsApp alerts enabled"
                            >
                                <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white shadow" />
                            </button>
                        </div>
                        <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300">
                            Get instant updates on gig progress and candidate questions directly on your phone.
                        </p>
                    </div>

                    {/* Recommended candidates */}
                    <div className="bg-white dark:bg-[#221910] rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        <h2 className="font-bold text-stone-900 dark:text-white mb-4">Recommended for You</h2>
                        <div className="space-y-4">
                            {recommendedCandidates.map((candidate) => (
                                <div key={candidate.name} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gradient-to-tr from-[#ee8c2b] to-[#f2b261] flex items-center justify-center text-white font-bold">
                                            {candidate.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-stone-900 dark:text-white">
                                                {candidate.name}
                                            </p>
                                            <p className="text-[11px] text-stone-500">{candidate.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-[#ee8c2b] bg-[#ee8c2b]/10 px-2 py-1 rounded-lg">
                                        {candidate.match} Match
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full mt-6 border-stone-100 dark:border-gray-700 rounded-full text-xs md:text-sm font-bold text-stone-600 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-gray-800"
                        >
                            Explore Talent Pool
                        </Button>
                    </div>

                    {/* Help widget */}
                    <div className="bg-[#fff7ee] dark:bg-[#3b281a] rounded-3xl p-5 flex items-center gap-4 border border-[#f9e0c2] dark:border-[#5a3a21] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        <div className="size-12 bg-[#ee8c2b] rounded-2xl flex items-center justify-center text-white shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                                Need Help?
                            </h3>
                            <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1">
                                Talk to our project coordinators anytime for support with your gigs.
                            </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                </div>
            </div>
        </div>
    )
}
