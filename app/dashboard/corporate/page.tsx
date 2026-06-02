'use client'

import { useMemo, useState } from 'react'
import {
    ArrowRight,
    BadgeCheck,
    Briefcase,
    Building2,
    CalendarDays,
    Check,
    CircleAlert,
    Clock3,
    FileSearch,
    Filter,
    HandCoins,
    MapPin,
    ShieldCheck,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react'

type ViewMode = 'recruiter' | 'admin'

const stats = {
    recruiter: [
        {
            label: 'Total Open Positions',
            value: '12',
            hint: 'Across 4 active teams',
            icon: Briefcase,
        },
        {
            label: 'New Candidates (Unreviewed)',
            value: '38',
            hint: '+9 in last 24h',
            icon: FileSearch,
            emphasis: true,
        },
        {
            label: 'Average Time-to-Hire',
            value: '16.4 days',
            hint: '5.1 days faster vs last quarter',
            icon: Clock3,
        },
        {
            label: 'Verified Talent Pool',
            value: '145',
            hint: 'DES > 75 or mentor verified',
            icon: ShieldCheck,
        },
    ],
    admin: [
        {
            label: 'Total Open Positions',
            value: '27',
            hint: 'Across 7 business units',
            icon: Briefcase,
        },
        {
            label: 'New Candidates (Unreviewed)',
            value: '84',
            hint: '42 tagged as priority',
            icon: FileSearch,
            emphasis: true,
        },
        {
            label: 'Average Time-to-Hire',
            value: '18.1 days',
            hint: 'Talent ops target: < 20 days',
            icon: Clock3,
        },
        {
            label: 'Verified Talent Pool',
            value: '462',
            hint: 'DES > 75 or mentor verified',
            icon: ShieldCheck,
        },
    ],
}

const hiringFunnel = [
    { stage: 'Total Sourced / Applied', count: 382, color: 'bg-[#4f8cff]' },
    { stage: 'Screened / Shortlisted', count: 146, color: 'bg-[#17cf73]' },
    { stage: 'Interviews Scheduled', count: 51, color: 'bg-[#f59e0b]' },
    { stage: 'Offers Extended / Accepted', count: 19, color: 'bg-[#8b5cf6]' },
]

const topCandidates = [
    {
        name: 'Rahul Sharma',
        location: 'Bengaluru',
        role: 'Frontend Developer',
        des: 88,
        skills: ['React', 'Node.js'],
    },
    {
        name: 'Priya Menon',
        location: 'Pune',
        role: 'Data Analyst',
        des: 84,
        skills: ['SQL', 'Power BI'],
    },
    {
        name: 'Siddharth Verma',
        location: 'Hyderabad',
        role: 'ML Engineer',
        des: 91,
        skills: ['Python', 'PyTorch'],
    },
    {
        name: 'Meera Reddy',
        location: 'Chennai',
        role: 'UI/UX Designer',
        des: 86,
        skills: ['Figma', 'Design Systems'],
    },
]

const campusEngagements = [
    {
        drive: 'Virtual Frontend Hiring Drive',
        date: 'May 24, 2026 • 10:30 AM',
        institution: 'ABC Institute of Technology',
        preAssessed: 126,
    },
    {
        drive: 'On-Campus Data Science Sprint',
        date: 'May 27, 2026 • 11:00 AM',
        institution: 'Nexus University',
        preAssessed: 93,
    },
    {
        drive: 'Graduate Talent Connect',
        date: 'May 30, 2026 • 02:00 PM',
        institution: 'Stellar College of Engineering',
        preAssessed: 148,
    },
]

const tasks = [
    {
        tone: 'alert',
        text: '5 new applications received for Senior Java Developer role.',
    },
    {
        tone: 'action',
        text: 'Review 3 candidate projects submitted for the recent assignment.',
    },
    {
        tone: 'info',
        text: 'Interview scheduled with Rahul Sharma at 2:00 PM.',
    },
]

export default function CorporateDashboard() {
    const [mode, setMode] = useState<ViewMode>('recruiter')

    const funnelMax = useMemo(
        () => Math.max(...hiringFunnel.map((item) => item.count)),
        []
    )

    return (
        <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
            <div className="mx-auto max-w-[1450px] space-y-6">
                <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                                <Sparkles className="h-4 w-4 text-[#17cf73]" />
                                Dishasetu Employer Console
                            </p>
                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
                                Corporate Hiring Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                                Verified skills + DES intelligence to reduce screening effort and improve hiring quality.
                            </p>
                        </div>

                        <div className="inline-flex rounded-xl bg-[#edf3ff] p-1 dark:bg-[#1a2858]">
                            <button
                                type="button"
                                onClick={() => setMode('recruiter')}
                                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                                    mode === 'recruiter'
                                        ? 'bg-white text-[#16213f] shadow-sm dark:bg-[#101d49] dark:text-white'
                                        : 'text-[#5872b6] dark:text-[#9db0df]'
                                }`}
                            >
                                Day-to-Day Recruiter
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('admin')}
                                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                                    mode === 'admin'
                                        ? 'bg-white text-[#16213f] shadow-sm dark:bg-[#101d49] dark:text-white'
                                        : 'text-[#5872b6] dark:text-[#9db0df]'
                                }`}
                            >
                                HR Admin / Manager
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats[mode].map((item) => {
                        const Icon = item.icon
                        return (
                            <article
                                key={item.label}
                                className={`rounded-3xl border p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] transition-colors dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)] ${
                                    item.emphasis
                                        ? 'border-[#17cf73]/40 bg-[#effcf4] dark:border-[#17cf73]/50 dark:bg-[#113226]'
                                        : 'border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49]'
                                }`}
                            >
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#4f8cff] dark:bg-[#1a2858] dark:text-[#8aa9ff]">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">
                                    {item.label}
                                </p>
                                <p className="mt-1 text-3xl font-black tracking-tight text-[#16213f] dark:text-white">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs font-medium text-[#5f6f98] dark:text-[#93a4d1]">
                                    {item.hint}
                                </p>
                            </article>
                        )
                    })}
                </section>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 space-y-6 xl:col-span-8">
                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold text-[#16213f] dark:text-white">
                                    Hiring Funnel
                                </h2>
                                <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[11px] font-bold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#9db0df]">
                                    Conversion View
                                </span>
                            </div>

                            <div className="space-y-4">
                                {hiringFunnel.map((stage) => (
                                    <div key={stage.stage} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">
                                                {stage.stage}
                                            </p>
                                            <p className="font-black text-[#16213f] dark:text-white">{stage.count}</p>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#deebff] dark:bg-[#13234f]">
                                            <div
                                                className={`h-full rounded-full ${stage.color}`}
                                                style={{ width: `${(stage.count / funnelMax) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-bold text-[#16213f] dark:text-white">
                                    Top Recommended Candidates
                                </h2>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#ccd7f5] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#2b3f7a] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    Filter by Role
                                </button>
                            </div>

                            <div className="space-y-3">
                                {topCandidates.map((candidate) => (
                                    <article
                                        key={candidate.name}
                                        className="grid grid-cols-1 gap-3 rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-4 sm:grid-cols-12 sm:items-center dark:border-[#21376f] dark:bg-[#0e1c45]"
                                    >
                                        <div className="sm:col-span-4">
                                            <p className="font-bold text-[#16213f] dark:text-white">{candidate.name}</p>
                                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6e80af] dark:text-[#96a9d9]">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {candidate.location}
                                            </p>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">
                                                Target Role
                                            </p>
                                            <p className="text-sm font-semibold text-[#22335f] dark:text-[#d7e3ff]">
                                                {candidate.role}
                                            </p>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">
                                                DES Score
                                            </p>
                                            <p className="inline-flex items-center gap-1 rounded-lg bg-[#17cf73]/15 px-2 py-1 text-sm font-black text-[#0f8f4f] dark:bg-[#17cf73]/20 dark:text-[#5be6a1]">
                                                <BadgeCheck className="h-4 w-4" />
                                                {candidate.des}/100
                                            </p>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">
                                                Verified Skills Match
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {candidate.skills.map((skill) => (
                                                    <span
                                                        key={`${candidate.name}-${skill}`}
                                                        className="inline-flex items-center gap-1 rounded-md bg-[#edf8ff] px-2 py-0.5 text-[11px] font-bold text-[#315e9c] dark:bg-[#1b2d5e] dark:text-[#b2ccff]"
                                                    >
                                                        {skill}
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="sm:col-span-1 sm:text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 rounded-lg bg-[#17cf73] px-3 py-2 text-xs font-bold text-white hover:bg-[#11b865]"
                                            >
                                                Shortlist
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="col-span-12 space-y-6 xl:col-span-4">
                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <h2 className="mb-4 text-lg font-bold text-[#16213f] dark:text-white">
                                Active Campus Engagements
                            </h2>
                            <div className="space-y-4">
                                {campusEngagements.map((event) => (
                                    <article
                                        key={event.drive}
                                        className="rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-4 dark:border-[#21376f] dark:bg-[#0e1c45]"
                                    >
                                        <p className="font-semibold text-[#1d2f5c] dark:text-[#deebff]">{event.drive}</p>
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6e80af] dark:text-[#96a9d9]">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {event.date}
                                        </p>
                                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#4f6fbc] dark:text-[#9db0df]">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {event.institution}
                                        </p>
                                        <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#17cf73]/15 px-2 py-1 text-xs font-bold text-[#0f8f4f] dark:bg-[#17cf73]/20 dark:text-[#5be6a1]">
                                            <Users className="h-3.5 w-3.5" />
                                            {event.preAssessed} pre-assessed students
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)]">
                            <h2 className="mb-4 text-lg font-bold text-[#16213f] dark:text-white">Tasks & Alerts</h2>
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <article
                                        key={task.text}
                                        className={`rounded-2xl border px-4 py-3 ${
                                            task.tone === 'alert'
                                                ? 'border-[#fecaca] bg-[#fff4f4] dark:border-[#7f2f3c] dark:bg-[#321521]'
                                                : task.tone === 'action'
                                                  ? 'border-[#fde68a] bg-[#fffbeb] dark:border-[#6e5527] dark:bg-[#2e2614]'
                                                  : 'border-[#bfdbfe] bg-[#eff6ff] dark:border-[#274e80] dark:bg-[#132742]'
                                        }`}
                                    >
                                        <p className="inline-flex items-start gap-2 text-sm font-medium text-[#22335f] dark:text-[#d7e3ff]">
                                            {task.tone === 'alert' && <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]" />}
                                            {task.tone === 'action' && <HandCoins className="mt-0.5 h-4 w-4 shrink-0 text-[#ca8a04]" />}
                                            {task.tone === 'info' && <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />}
                                            {task.text}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
