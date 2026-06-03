"use client"

import { useEffect, useState } from 'react'
import {
    Award,
    BarChart3,
    Briefcase,
    CalendarDays,
    Check,
    Clock3,
    Eye,
    Filter,
    Github,
    GraduationCap,
    MapPin,
    MessageSquare,
    PlayCircle,
    ShieldCheck,
    Star,
    Trash2,
    UserCheck,
    X,
} from 'lucide-react'

const shortlisted = [
    {
        name: 'Meera Reddy',
        role: 'UX Designer',
        location: 'Bengaluru',
        des: 91,
        match: '96%',
        skills: ['Figma', 'Design Systems', 'UX Research'],
        status: 'Interview Scheduled',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNKPqz9jDJj8uLZ6xvrnYZ_mM2dUQOIpLeCVP5jZmukSOhoJixAqorMc8WG6TuLyn58ijczD1S7RxYnZIBZOmgLbuYrSzCMgaB93lN-372saaoDm-EGzAxLwSmArrgDd47nRNqvRE5dtDRWpPGHOGgTY3rqP1tlFRYkfKnj3_YZ8Vt1nbJhoiqy0YB0HPHlb4PLKniEEYHNP66P_FwmJX73EkB1G_JYtoT9K3OKysH616Be0PbpkpE_IBwAzN1e__RpqsF54HUFyVu',
    },
    {
        name: 'Rohan Gupta',
        role: 'DevOps Engineer',
        location: 'Hyderabad',
        des: 85,
        match: '91%',
        skills: ['AWS', 'CI/CD', 'Docker'],
        status: 'Profile Review',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9XJMjJnZBb3DclT8lBSy4svFU2nJ_qgGQMzBJ1Gb1b2OREHuYnJsqZYY4cnnaKXUFSn2Mzal7z-o0nLs9zW_4rqNqrDLFnSDl5i2Ce0DgAcmpYTv4rnHYvD_fcNcRjRrac2YTQttOWtgkC6f468X4GngkAnfrE5XivOcO8g6dbTWgcYjqoy9mrGJQrW4raEwPreUM_MTqPfq1qYLIlpZdS2aLeRvyKlNKFhlILnjO_wuDXznPZlSM6O56bUUqt_RH9V3xP3d5F2pN',
    },
    {
        name: 'Ananya Iyer',
        role: 'Frontend Developer',
        location: 'Pune',
        des: 89,
        match: '94%',
        skills: ['React', 'TypeScript', 'Next.js'],
        status: 'Assignment Submitted',
        img: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
    },
    {
        name: 'Arjun Sharma',
        role: 'Data Analyst',
        location: 'Chennai',
        des: 87,
        match: '90%',
        skills: ['SQL', 'Power BI', 'Python'],
        status: 'Ready for Interview',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    },
]

const upcomingInterviews = [
    { name: 'Meera Reddy', role: 'UX Designer', slot: 'Tomorrow, 10:00 AM' },
    { name: 'Ananya Iyer', role: 'Frontend Developer', slot: 'May 21, 2:30 PM' },
]

const trendBars = [
    { label: 'Frontend Roles', value: 82 },
    { label: 'Data Roles', value: 67 },
    { label: 'DevOps Roles', value: 51 },
]

type ProfileTab = 'dashboard' | 'projects' | 'skills' | 'certifications'

export default function ShortlistedPage() {
    const [selectedCandidate, setSelectedCandidate] = useState<(typeof shortlisted)[number] | null>(null)
    const [activeTab, setActiveTab] = useState<ProfileTab>('dashboard')

    const openProfile = (candidate: (typeof shortlisted)[number]) => {
        setSelectedCandidate(candidate)
        setActiveTab('dashboard')
    }

    const closeProfile = () => {
        setSelectedCandidate(null)
    }

    useEffect(() => {
        if (!selectedCandidate) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeProfile()
            }
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleEscape)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleEscape)
        }
    }, [selectedCandidate])

    return (
        <div className="relative min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
            <div className="mx-auto max-w-[1450px] space-y-6">
                <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                                <UserCheck className="h-4 w-4 text-[#17cf73]" />
                                Curated Candidate Pipeline
                            </p>
                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
                                Shortlisted Candidates
                            </h1>
                            <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                                High confidence profiles matched by DES and verified skills.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                            <div className="rounded-xl bg-[#edf3ff] px-4 py-3 dark:bg-[#1a2858]">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6f83b8] dark:text-[#9ab0e4]">Total Shortlisted</p>
                                <p className="text-xl font-black text-[#16213f] dark:text-white">45</p>
                            </div>
                            <div className="rounded-xl bg-[#effcf4] px-4 py-3 dark:bg-[#103025]">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#4f8f71] dark:text-[#79d3a9]">Interview Ready</p>
                                <p className="text-xl font-black text-[#0f8f4f] dark:text-[#5be6a1]">19</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-12 gap-6">
                    <section className="col-span-12 space-y-5 xl:col-span-8">
                        <div className="rounded-3xl border border-[#d4def8] bg-white p-4 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-5 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#ccd7f5] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#2b3f7a] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    DES 80+
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#ccd7f5] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#2b3f7a] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Verified Skills
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#ccd7f5] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#2b3f7a] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                                >
                                    <Briefcase className="h-3.5 w-3.5" />
                                    Role Fit: High
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {shortlisted.map((candidate) => (
                                <article
                                    key={candidate.name}
                                    className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(66,98,170,0.18)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${candidate.img})` }} />
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-[#16213f] dark:text-white">{candidate.name}</h3>
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4df] px-2 py-0.5 text-[11px] font-bold text-[#b76a00] dark:bg-[#3d2b0f] dark:text-[#ffcc7d]">
                                                        <Star className="h-3 w-3" />
                                                        {candidate.match} match
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-[#43558d] dark:text-[#c5d7ff]">{candidate.role}</p>
                                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6f83b8] dark:text-[#97abdc]">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {candidate.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="rounded-xl bg-[#effcf4] px-3 py-2 dark:bg-[#103025]">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f8f71] dark:text-[#79d3a9]">DES Score</p>
                                                <p className="text-lg font-black text-[#0f8f4f] dark:text-[#5be6a1]">{candidate.des}/100</p>
                                            </div>
                                            <div className="rounded-xl bg-[#edf3ff] px-3 py-2 dark:bg-[#1a2858]">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6f83b8] dark:text-[#9ab0e4]">Stage</p>
                                                <p className="text-sm font-bold text-[#30467e] dark:text-[#bfd4ff]">{candidate.status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {candidate.skills.map((skill) => (
                                            <span
                                                key={`${candidate.name}-${skill}`}
                                                className="inline-flex items-center gap-1 rounded-md bg-[#f4f8ff] px-2.5 py-1 text-[11px] font-bold text-[#34589d] dark:bg-[#172958] dark:text-[#b7cdff]"
                                            >
                                                {skill}
                                                <Check className="h-3 w-3" />
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openProfile(candidate)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-[#17cf73] px-4 py-2 text-xs font-bold text-white hover:bg-[#11b865]"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Profile
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-[#ccd7f5] px-4 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#2b3f7a] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                                        >
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Schedule Interview
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-[#f5c7c7] px-4 py-2 text-xs font-bold text-[#be3a3a] hover:bg-[#fff1f1] dark:border-[#743238] dark:text-[#ff9b9b] dark:hover:bg-[#2d1518]"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <aside className="col-span-12 space-y-6 xl:col-span-4">
                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <h2 className="text-lg font-bold text-[#16213f] dark:text-white">Upcoming Interviews</h2>
                            <div className="mt-4 space-y-3">
                                {upcomingInterviews.map((item) => (
                                    <div
                                        key={`${item.name}-${item.slot}`}
                                        className="rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-4 dark:border-[#21376f] dark:bg-[#0e1c45]"
                                    >
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#4f6fbc] dark:text-[#9db0df]">{item.slot}</p>
                                        <p className="mt-1 text-sm font-bold text-[#16213f] dark:text-white">{item.name}</p>
                                        <p className="text-xs text-[#6f83b8] dark:text-[#97abdc]">{item.role}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <h2 className="text-lg font-bold text-[#16213f] dark:text-white">Pipeline Trends</h2>
                            <div className="mt-4 space-y-4">
                                {trendBars.map((bar) => (
                                    <div key={bar.label}>
                                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#30467e] dark:text-[#bfd4ff]">
                                            <span>{bar.label}</span>
                                            <span>{bar.value}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#deebff] dark:bg-[#13234f]">
                                            <div className="h-full rounded-full bg-[#17cf73]" style={{ width: `${bar.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <h2 className="text-lg font-bold text-[#16213f] dark:text-white">Tasks & Alerts</h2>
                            <div className="mt-4 space-y-3">
                                <p className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-sm font-medium text-[#1e3a8a] dark:border-[#2a4f87] dark:bg-[#132742] dark:text-[#b8d7ff]">
                                    5 new profiles shortlisted in the last 24 hours.
                                </p>
                                <p className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-sm font-medium text-[#92400e] dark:border-[#6e5527] dark:bg-[#2e2614] dark:text-[#f7c47d]">
                                    Review 2 project submissions before final interview round.
                                </p>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#eef3ff] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#dfe9ff] dark:bg-[#1a2858] dark:text-[#c4d3ff] dark:hover:bg-[#243971]"
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Notify Hiring Team
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ccd7f5] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#2b3f7a] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                                >
                                    <Clock3 className="h-3.5 w-3.5" />
                                    Open Full Hiring Timeline
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>

                {selectedCandidate && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b1739]/60 px-3 py-4 backdrop-blur-sm sm:items-center sm:py-8"
                        onClick={closeProfile}
                        aria-hidden
                    >
                        <div
                            className="w-full max-w-5xl rounded-2xl border border-[#d8e2fb] bg-[#f6f8fc] p-3 shadow-2xl sm:rounded-3xl sm:p-5 dark:border-[#273b74] dark:bg-[#122453]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 dark:bg-[#111d49]">
                                <h2 className="text-sm font-bold text-[#1b2f60] sm:text-base dark:text-white">Dishasetu Dynamic Student Portfolio</h2>
                                <button
                                    type="button"
                                    onClick={closeProfile}
                                    className="rounded-full bg-[#e7ecfb] p-1.5 text-[#5b6fa7] hover:bg-[#dbe4fb] dark:bg-[#1f3367] dark:text-[#bcd1ff]"
                                    aria-label="Close student profile"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-3 max-h-[72vh] overflow-y-auto rounded-2xl bg-[#fdfcf8] p-3 sm:max-h-[76vh] sm:p-4 dark:bg-[#0f1d46]">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="inline-flex gap-1 rounded-xl bg-[#eef3ff] p-1 dark:bg-[#1a2858]">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('dashboard')}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'dashboard' ? 'bg-white text-[#16213f] dark:bg-[#101d49] dark:text-white' : 'text-[#5f74ad] dark:text-[#97abdc]'}`}
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('projects')}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'projects' ? 'bg-white text-[#16213f] dark:bg-[#101d49] dark:text-white' : 'text-[#5f74ad] dark:text-[#97abdc]'}`}
                                        >
                                            Projects
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('skills')}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'skills' ? 'bg-white text-[#16213f] dark:bg-[#101d49] dark:text-white' : 'text-[#5f74ad] dark:text-[#97abdc]'}`}
                                        >
                                            Skills
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('certifications')}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'certifications' ? 'bg-white text-[#16213f] dark:bg-[#101d49] dark:text-white' : 'text-[#5f74ad] dark:text-[#97abdc]'}`}
                                        >
                                            Certifications
                                        </button>
                                    </div>

                                    <p className="text-xs font-semibold text-[#6f83b8] dark:text-[#97abdc]">
                                        Candidate: <span className="font-black text-[#1e3366] dark:text-white">{selectedCandidate.name}</span>
                                    </p>
                                </div>

                                {activeTab === 'dashboard' && (
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <div className="flex items-center gap-3">
                                                <div className="h-16 w-16 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${selectedCandidate.img})` }} />
                                                <div>
                                                    <p className="font-bold text-[#1c2f61] dark:text-white">{selectedCandidate.name}</p>
                                                    <p className="text-xs text-[#687aa8] dark:text-[#9db0df]">{selectedCandidate.role}</p>
                                                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#fff4df] px-2 py-0.5 text-[10px] font-bold text-[#b76a00] dark:bg-[#3d2b0f] dark:text-[#ffcc7d]">
                                                        <Award className="h-3 w-3" />
                                                        Champion Gold
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#dce8ff] text-center dark:border-[#2c4f8f]">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase text-[#6f83b8] dark:text-[#9db0df]">DES Score</p>
                                                    <p className="text-2xl font-black text-[#1c2f61] dark:text-white">{selectedCandidate.des * 10}</p>
                                                    <p className="text-[10px] text-[#6f83b8] dark:text-[#97abdc]">/1000</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <div className="h-24 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${selectedCandidate.img})` }} />
                                            <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1c2f61] dark:text-white">
                                                <PlayCircle className="h-4 w-4 text-[#4f8cff]" />
                                                30s Mentor Viva Highlight
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 lg:col-span-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="text-sm font-black text-[#1c2f61] dark:text-white">Local MSME Gig: E-Commerce API Build</p>
                                            <p className="mt-1 text-xs text-[#687aa8] dark:text-[#9db0df]">Local MSME design-to-code project delivered with verified mentor review.</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button className="rounded-md bg-[#2d63c8] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2452a8]">View GitHub Repo</button>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-[#effcf4] px-2.5 py-1.5 text-[11px] font-bold text-[#0f8f4f] dark:bg-[#103025] dark:text-[#5be6a1]">
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    Verified by Mentor
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'projects' && (
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="text-sm font-black text-[#1c2f61] dark:text-white">Community Health App UI/UX</p>
                                            <p className="mt-1 text-xs text-[#687aa8] dark:text-[#9db0df]">End-to-end design system and usability testing report with 92% success score.</p>
                                        </div>
                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="text-sm font-black text-[#1c2f61] dark:text-white">Sales Insights Dashboard</p>
                                            <p className="mt-1 text-xs text-[#687aa8] dark:text-[#9db0df]">Business KPI dashboard with role-based access and multi-source data sync.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-[#d9e6ff] bg-[#f4f8ff] p-3 dark:border-[#264581] dark:bg-[#102453]">
                                            <p className="text-sm font-black text-[#1c2f61] dark:text-white">Dishasetu Skill Matrix Detail</p>
                                            <p className="mt-1 text-xs text-[#687aa8] dark:text-[#9db0df]">
                                                Verified stack, competency spread, and mentor validation snapshots for faster hiring decisions.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="mb-2 text-sm font-black text-[#1c2f61] dark:text-white">Verified Skill Stack</p>
                                            {selectedCandidate.skills.map((skill, index) => (
                                                <div key={`${skill}-${index}`} className="mb-2">
                                                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#42548d] dark:text-[#bcd1ff]">
                                                        <span>{skill}</span>
                                                        <span>{90 - index * 6}%</span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-[#deebff] dark:bg-[#1a3975]">
                                                        <div className="h-full rounded-full bg-[#2d63c8]" style={{ width: `${90 - index * 6}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="mb-2 text-sm font-black text-[#1c2f61] dark:text-white">Skill Competency Overview</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="rounded-lg bg-[#eff3fb] p-2 dark:bg-[#193468]">
                                                    <p className="font-semibold text-[#42548d] dark:text-[#bcd1ff]">Soft Skills</p>
                                                    <p className="text-lg font-black text-[#1c2f61] dark:text-white">88</p>
                                                </div>
                                                <div className="rounded-lg bg-[#eff3fb] p-2 dark:bg-[#193468]">
                                                    <p className="font-semibold text-[#42548d] dark:text-[#bcd1ff]">Technical</p>
                                                    <p className="text-lg font-black text-[#1c2f61] dark:text-white">92</p>
                                                </div>
                                                <div className="rounded-lg bg-[#eff3fb] p-2 dark:bg-[#193468]">
                                                    <p className="font-semibold text-[#42548d] dark:text-[#bcd1ff]">Problem Solving</p>
                                                    <p className="text-lg font-black text-[#1c2f61] dark:text-white">86</p>
                                                </div>
                                                <div className="rounded-lg bg-[#eff3fb] p-2 dark:bg-[#193468]">
                                                    <p className="font-semibold text-[#42548d] dark:text-[#bcd1ff]">Execution</p>
                                                    <p className="text-lg font-black text-[#1c2f61] dark:text-white">90</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="mb-2 text-sm font-black text-[#1c2f61] dark:text-white">Certification Vault</p>
                                            <div className="space-y-2">
                                                <div className="rounded-lg border border-[#e3ecff] bg-[#f7faff] p-2.5 dark:border-[#2d4b84] dark:bg-[#163268]">
                                                    <p className="text-xs font-bold text-[#1c2f61] dark:text-white">AWS Certified Cloud Practitioner</p>
                                                    <p className="text-[11px] text-[#687aa8] dark:text-[#9db0df]">Mentor aligned with live project evidence</p>
                                                </div>
                                                <div className="rounded-lg border border-[#e3ecff] bg-[#f7faff] p-2.5 dark:border-[#2d4b84] dark:bg-[#163268]">
                                                    <p className="text-xs font-bold text-[#1c2f61] dark:text-white">Google Data Analytics</p>
                                                    <p className="text-[11px] text-[#687aa8] dark:text-[#9db0df]">Industry workflow and dashboard case submission</p>
                                                </div>
                                            </div>
                                        </div>
                                        </div>

                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="mb-2 text-sm font-black text-[#1c2f61] dark:text-white">Mentor Endorsements</p>
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                <p className="rounded-lg bg-[#f5f8ff] p-2 text-[11px] text-[#4c5f92] dark:bg-[#193468] dark:text-[#bfd4ff]">
                                                    Strong architecture sense and clean handoff quality.
                                                </p>
                                                <p className="rounded-lg bg-[#f5f8ff] p-2 text-[11px] text-[#4c5f92] dark:bg-[#193468] dark:text-[#bfd4ff]">
                                                    Reliable communication and ownership during sprint cycles.
                                                </p>
                                                <p className="rounded-lg bg-[#f5f8ff] p-2 text-[11px] text-[#4c5f92] dark:bg-[#193468] dark:text-[#bfd4ff]">
                                                    Consistently high project quality under realistic timelines.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'certifications' && (
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="text-sm font-black text-[#1c2f61] dark:text-white">AWS Certified Cloud Practitioner</p>
                                            <p className="mt-1 text-xs text-[#687aa8] dark:text-[#9db0df]">Credential validated with blockchain-backed certificate vault.</p>
                                            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#effcf4] px-2 py-1 text-[11px] font-bold text-[#0f8f4f] dark:bg-[#103025] dark:text-[#5be6a1]">
                                                <GraduationCap className="h-3.5 w-3.5" />
                                                Verified
                                            </span>
                                        </div>
                                        <div className="rounded-xl border border-[#e8e6db] bg-white p-3 dark:border-[#29427a] dark:bg-[#132a5d]">
                                            <p className="text-sm font-black text-[#1c2f61] dark:text-white">Google Data Analytics</p>
                                            <p className="mt-1 text-xs text-[#687aa8] dark:text-[#9db0df]">Applied coursework mapped to live projects and mentor audits.</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button className="inline-flex items-center gap-1 rounded-md bg-[#2d63c8] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#2452a8]">
                                                    <Github className="h-3.5 w-3.5" />
                                                    View Portfolio Evidence
                                                </button>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-[#edf3ff] px-2 py-1 text-[11px] font-bold text-[#325aa2] dark:bg-[#193468] dark:text-[#b7cdff]">
                                                    <BarChart3 className="h-3.5 w-3.5" />
                                                    Skill Impact: High
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
