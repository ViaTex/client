'use client'

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
    return (
        <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-3 shadow-sm sm:rounded-[1.5rem] sm:p-4 md:rounded-[2rem] md:p-6 lg:p-4 dark:bg-[#101d49]">
            <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-[1.75rem] border border-[#d4def8] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(66,98,170,0.12)] sm:px-6 sm:py-6 md:rounded-[2rem] md:px-8 lg:min-h-[18rem] lg:flex-row lg:items-center lg:px-10 lg:py-0 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_32px_rgba(3,8,26,0.35)]"
                    >
                        <div className="relative z-10 w-full space-y-4 lg:w-2/3 lg:pr-6">
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c73b5] dark:text-[#8ea1d6]">
                                <LayoutDashboard className="h-4 w-4 text-[#ee8c2b]" />
                                MSME Dashboard
                            </p>
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl md:text-4xl dark:text-white">
                                Kaam Post Karein
                            </h1>
                            <p className="max-w-xl text-sm text-[#5f6f98] md:text-base dark:text-[#93a4d1]">
                                Start a new micro-internship today and get tasks completed by top student talent in 48 hours.
                            </p>
                            <Button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ee8c2b] px-6 py-3 font-bold text-white shadow-xl shadow-[#ee8c2b]/30 hover:bg-[#d97a1f] sm:w-auto md:px-8 md:py-4">
                                <Briefcase className="h-5 w-5" />
                                Start Hiring Now
                            </Button>
                        </div>
                        <div
                            className="relative h-52 w-full rounded-3xl bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105 sm:h-60 lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-[34%] lg:rounded-l-[3rem]"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKH4bTQ1JLTQ2Jj7kUKgG4nJMlGio-g6n0v806jmqUDsQwRKL7Ad7-8YgxcJufiKjm_a8aPxesCsMnviGm_La5ec0S3uLntmYkmUYtY4hyotTDNZNzbHnxe0sHogQKS2SSSKgyI78QbrUioIOJ8RCLAi84tKWqiysQUC_-Fis98ohQx9VFTBzqt_wgouguZ8Vsat9DWpx8P9V_cVcIk2EpixFgxJD1O6gwh5eqfujasH9gowdhwzxxg7tYAmDhEzAYdj5_CHNiVnKr")',
                            }}
                        />
                    </motion.div>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between gap-3 px-1">
                            <h2 className="text-lg font-bold text-[#16213f] md:text-xl dark:text-white">
                                Current Gigs Tracking
                            </h2>
                            <button className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#ee8c2b] md:text-sm">
                                View All
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {gigItems.map((gig, index) => (
                                <div
                                    key={gig.title}
                                    className="flex flex-col items-start gap-4 rounded-3xl border border-[#d4def8] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:px-5 md:flex-row md:items-center md:gap-6 md:p-5 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]"
                                >
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ee8c2b] to-[#f2b261] text-white sm:size-14">
                                        {index === 0 && <Brush className="h-7 w-7" />}
                                        {index === 1 && <FileText className="h-7 w-7" />}
                                        {index === 2 && <Share2 className="h-7 w-7" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-[#16213f] md:text-base dark:text-white">
                                                {gig.title}
                                            </h3>
                                            <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5c73b5] md:text-[11px] dark:bg-[#1a2858] dark:text-[#8ea1d6]">
                                                {gig.tag}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfe8fb] dark:bg-[#07112e]">
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
                                            <span className="text-xs font-bold text-[#5f6f98] md:text-sm dark:text-[#93a4d1]">
                                                {gig.progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex w-full flex-col items-start md:w-auto md:items-end">
                                        <p className="mb-1 text-[10px] font-bold uppercase text-[#7d8db7] dark:text-[#7183b6]">
                                            Assigned to
                                        </p>
                                        <p className="text-xs font-semibold text-[#16213f] dark:text-white">
                                            {gig.assignee}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="col-span-12 space-y-6 lg:col-span-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col justify-between rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#4b74f0] dark:bg-[#1a2858] dark:text-[#7aa2ff]">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#7d8db7] dark:text-[#7183b6]">Active</p>
                                <p className="text-2xl font-bold text-[#16213f] md:text-3xl dark:text-white">12</p>
                                <p className="mt-1 text-[11px] font-bold text-emerald-600">+2 this week</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8faf0] text-emerald-500 dark:bg-[#16342f] dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#7d8db7] dark:text-[#7183b6]">Completed</p>
                                <p className="text-2xl font-bold text-[#16213f] md:text-3xl dark:text-white">48</p>
                                <p className="mt-1 text-[11px] font-bold text-emerald-600">+5 new</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:col-span-2 sm:flex-row sm:items-center sm:justify-between dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ee8c2b]/10 text-[#ee8c2b]">
                                    <WalletCards className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-[#7d8db7] dark:text-[#7183b6]">Budget Spent</p>
                                    <p className="text-xl font-bold text-[#16213f] md:text-2xl dark:text-white">Rs. 12,400</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-[#7d8db7] dark:text-[#7183b6] sm:text-right">ROI: 3.4x</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-3xl border border-[#b9e6d0] bg-[#effcf4] p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#28506a] dark:bg-[#16314f] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-white">
                                    <MessageCircle className="h-4 w-4" />
                                </div>
                                <p className="font-bold text-[#16213f] dark:text-white">WhatsApp Alert</p>
                            </div>
                            <button
                                type="button"
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#25D366]"
                                aria-label="WhatsApp alerts enabled"
                            >
                                <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white shadow" />
                            </button>
                        </div>
                        <p className="text-xs text-[#5f6f98] md:text-sm dark:text-[#93a4d1]">
                            Get instant updates on gig progress and candidate questions directly on your phone.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                        <h2 className="mb-4 font-bold text-[#16213f] dark:text-white">Recommended for You</h2>
                        <div className="space-y-4">
                            {recommendedCandidates.map((candidate) => (
                                <div key={candidate.name} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#ee8c2b] to-[#f2b261] font-bold text-white">
                                            {candidate.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#16213f] dark:text-white">
                                                {candidate.name}
                                            </p>
                                            <p className="text-[11px] text-[#7d8db7] dark:text-[#7183b6]">{candidate.role}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-lg bg-[#ee8c2b]/10 px-2 py-1 text-[11px] font-bold text-[#ee8c2b]">
                                        {candidate.match} Match
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="mt-6 w-full rounded-full border-[#ccd7f5] bg-transparent text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] hover:text-[#16213f] md:text-sm dark:border-[#223067] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858] dark:hover:text-white"
                        >
                            Explore Talent Pool
                        </Button>
                    </div>

                    <div className="flex flex-col items-start gap-4 rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:flex-row sm:items-center dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ee8c2b] text-white">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-[#16213f] dark:text-white">
                                Need Help?
                            </h3>
                            <p className="mt-1 text-[11px] text-[#5f6f98] dark:text-[#93a4d1]">
                                Talk to our project coordinators anytime for support with your gigs.
                            </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#7d8db7] dark:text-[#7183b6] sm:self-center" />
                    </div>
                </div>
            </div>
        </div>
    )
}
