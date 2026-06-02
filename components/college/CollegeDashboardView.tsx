"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    AlertTriangle,
    BarChart3,
    BriefcaseBusiness,
    CalendarClock,
    CheckCircle2,
    GraduationCap,
    Lightbulb,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { collegeService, CollegeOverview } from '@/services/college.service'
import { cn } from '@/lib/utils'

const palette = ['#2563eb', '#14b8a6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6']

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response
        if (response?.data?.detail) return response.data.detail
    }
    if (error instanceof Error) return error.message
    return fallback
}

function ChartShell({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]', className)}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-gray-950 dark:text-white">{title}</h2>
            </div>
            <div className="h-72 min-h-0">{children}</div>
        </section>
    )
}

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-lg bg-gray-200 dark:bg-white/10', className)} />
}

function EmptyState({ label }: { label: string }) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-white/50">{label}</div>
}

function KpiCard({
    label,
    value,
    helper,
    icon: Icon,
    tone,
}: {
    label: string
    value: string | number
    helper: string
    icon: ElementType
    tone: string
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-normal text-gray-500 dark:text-white/50">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950 dark:text-white">{value}</p>
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', tone)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-white/60">{helper}</p>
        </div>
    )
}

function InsightPanel({ insights }: { insights: CollegeOverview['ai_insights'] }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-950 dark:text-white">AI Insights</h2>
            </div>
            {insights.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-white/50">No insights yet. More activity data will unlock recommendations.</p>
            ) : (
                <div className="space-y-3">
                    {insights.map((insight) => (
                        <div key={`${insight.type}-${insight.title}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-950 dark:text-white">{insight.title}</p>
                                    <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-white/60">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export function CollegeDashboardView() {
    const [data, setData] = useState<CollegeOverview | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { resolvedTheme } = useTheme()

    const chartTheme = useMemo(() => {
        const dark = resolvedTheme === 'dark'
        return {
            axis: dark ? '#94a3b8' : '#64748b',
            grid: dark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.25)',
            tooltipBg: dark ? '#0B1739' : '#ffffff',
            tooltipText: dark ? '#ffffff' : '#111827',
            border: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
        }
    }, [resolvedTheme])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            setData(await collegeService.getOverview())
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load college dashboard'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-5">
                <SkeletonBlock className="h-28" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-32" />)}
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                    <SkeletonBlock className="h-80" />
                    <SkeletonBlock className="h-80" />
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{error || 'College dashboard data is unavailable.'}</p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    const kpis = data.kpis
    const tooltipStyle = {
        backgroundColor: chartTheme.tooltipBg,
        color: chartTheme.tooltipText,
        border: `1px solid ${chartTheme.border}`,
        borderRadius: 8,
    }

    return (
        <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">College Command Center</p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-950 dark:text-white md:text-3xl">Placement intelligence dashboard</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-white/60">
                            Live employability, verification, recruiter engagement, and hiring pipeline health from your college data.
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <KpiCard label="Total Students" value={kpis.total_students.value.toLocaleString()} helper={`${kpis.total_students.growth_percentage}% growth`} icon={Users} tone="bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" />
                <KpiCard label="Verified Students" value={kpis.verified_students.value.toLocaleString()} helper={`${kpis.verified_students.verification_rate}% verified`} icon={ShieldCheck} tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" />
                <KpiCard label="Placed Students" value={kpis.placed_students.value.toLocaleString()} helper={`${kpis.placed_students.placement_percentage}% placed`} icon={CheckCircle2} tone="bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" />
                <KpiCard label="Average DES" value={kpis.average_des.value} helper="College average" icon={TrendingUp} tone="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" />
                <KpiCard label="Active Recruiters" value={kpis.active_recruiters.value.toLocaleString()} helper="Engaged companies" icon={BriefcaseBusiness} tone="bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" />
                <KpiCard label="Upcoming Interviews" value={kpis.upcoming_interviews.value.toLocaleString()} helper="Viva + hiring" icon={CalendarClock} tone="bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" />
            </section>

            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className="grid gap-4 lg:grid-cols-2">
                    <ChartShell title="DES Distribution">
                        {data.des_distribution.some((item) => item.count > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.des_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                    <XAxis dataKey="bucket" tick={{ fill: chartTheme.axis, fontSize: 12 }} />
                                    <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={palette[0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState label="No DES data yet" />}
                    </ChartShell>

                    <ChartShell title="Verification Funnel">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.verification_funnel}>
                                <defs>
                                    <linearGradient id="verificationFill" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="5%" stopColor={palette[1]} stopOpacity={0.55} />
                                        <stop offset="95%" stopColor={palette[1]} stopOpacity={0.04} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                <XAxis dataKey="stage" tick={{ fill: chartTheme.axis, fontSize: 11 }} interval={0} />
                                <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area dataKey="count" stroke={palette[1]} fill="url(#verificationFill)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartShell>

                    <ChartShell title="Placement Funnel">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.placement_funnel} layout="vertical" margin={{ left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                <XAxis type="number" tick={{ fill: chartTheme.axis, fontSize: 12 }} allowDecimals={false} />
                                <YAxis type="category" dataKey="stage" tick={{ fill: chartTheme.axis, fontSize: 12 }} width={82} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill={palette[2]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartShell>

                    <ChartShell title="Monthly Placement Trends">
                        {data.monthly_placement_trends.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.monthly_placement_trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                    <XAxis dataKey="month" tick={{ fill: chartTheme.axis, fontSize: 12 }} />
                                    <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line dataKey="placements" stroke={palette[3]} strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <EmptyState label="No placements recorded yet" />}
                    </ChartShell>
                </div>
                <InsightPanel insights={data.ai_insights} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                    <div className="border-b border-gray-100 p-4 dark:border-white/10">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                            <GraduationCap className="h-4 w-4" />
                            Department Analytics
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/[0.03] dark:text-white/50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Department</th>
                                    <th className="px-4 py-3 text-right">Students</th>
                                    <th className="px-4 py-3 text-right">Avg DES</th>
                                    <th className="px-4 py-3 text-right">Verified</th>
                                    <th className="px-4 py-3 text-right">Placed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.department_analytics.length ? data.department_analytics.map((item) => (
                                    <tr key={item.department} className="border-t border-gray-100 dark:border-white/10">
                                        <td className="px-4 py-3 font-medium text-gray-950 dark:text-white">{item.department}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-white/60">{item.student_count}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-white/60">{item.average_des}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-white/60">{item.verification_percentage}%</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-white/60">{item.placement_percentage}%</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-white/50">No department data</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                    <div className="border-b border-gray-100 p-4 dark:border-white/10">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                            <BarChart3 className="h-4 w-4" />
                            Top Hiring Companies
                        </h2>
                    </div>
                    <div className="grid gap-4 p-4 lg:grid-cols-[220px_1fr]">
                        <div className="h-64">
                            {data.top_hiring_companies.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.top_hiring_companies} dataKey="students_hired" nameKey="company" innerRadius={48} outerRadius={82} paddingAngle={2}>
                                            {data.top_hiring_companies.map((_entry, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState label="No hiring data" />}
                        </div>
                        <div className="space-y-2">
                            {data.top_hiring_companies.map((item) => (
                                <div key={item.company} className="rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">{item.company}</p>
                                        <span className="text-sm font-bold text-gray-950 dark:text-white">{item.students_hired}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">Avg DES {item.average_des} · {item.placement_contribution}% contribution</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
