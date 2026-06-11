"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import toast from 'react-hot-toast'
import { Bell, Download, FileSpreadsheet, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { collegeService } from '@/services/college.service'

const colors = ['#2563eb', '#14b8a6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6']
type Row = Record<string, unknown>
type MetricMap = Record<string, string | number | null | undefined>
type NotificationItem = { id: string; title: string; description: string; created_at?: string | null }

function asRows(value: unknown): Row[] {
    return Array.isArray(value) ? value.filter((item): item is Row => typeof item === 'object' && item !== null) : []
}

function asMetrics(value: unknown): MetricMap {
    return typeof value === 'object' && value !== null ? value as MetricMap : {}
}

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response
        if (response?.data?.detail) return response.data.detail
    }
    if (error instanceof Error) return error.message
    return fallback
}

function MetricGrid({ metrics }: { metrics?: MetricMap }) {
    const entries = Object.entries(metrics || {})
    if (!entries.length) return null
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {entries.map(([key, value]) => (
                <div key={key} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-white/50">{key.replace(/_/g, ' ')}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : String(value ?? '-')}</p>
                </div>
            ))}
        </div>
    )
}

function DataTable({ rows }: { rows: Row[] }) {
    const columns = useMemo(() => Object.keys(rows[0] || {}).filter((key) => key !== 'id' && key !== 'student_id').slice(0, 8), [rows])
    return (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
            <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/[0.03] dark:text-white/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th key={column} className={`px-4 py-3 text-left ${index > 3 ? 'hidden lg:table-cell' : ''}`}>{column.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length ? rows.map((row, rowIndex) => (
                            <tr key={String(row.id ?? rowIndex)} className="border-t border-gray-100 dark:border-white/10">
                                {columns.map((column, index) => (
                                    <td key={column} className={`truncate px-4 py-3 text-gray-700 dark:text-white/70 ${index > 3 ? 'hidden lg:table-cell' : ''}`}>
                                        {String(row[column] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr><td className="px-4 py-10 text-center text-gray-500 dark:text-white/50" colSpan={Math.max(columns.length, 1)}>No data available.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

function ChartBlock({ title, data, xKey, yKey }: { title: string; data: Row[]; xKey: string; yKey: string }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
            <h2 className="mb-4 text-sm font-semibold text-gray-950 dark:text-white">{title}</h2>
            <div className="h-72">
                {data.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey={yKey} radius={[6, 6, 0, 0]} fill={colors[0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-white/50">No chart data.</div>}
            </div>
        </section>
    )
}

export function CollegeAnalyticsPage() {
    return (
        <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Analytics</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-white/60">Advanced DES, verification, placement, department, and recruiter intelligence.</p>
            </section>
            <div className="rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-white/60">This page uses the same live analytics API as the dashboard and emphasizes the full chart canvas.</p>
                </div>
            </div>
        </div>
    )
}

export function CollegeVerificationPage() {
    const [data, setData] = useState<Row | null>(null)
    const [loading, setLoading] = useState(true)
    const fetchData = (showLoading = true) => {
        if (showLoading) setLoading(true)
        collegeService.getVerification().then(setData).finally(() => setLoading(false))
    }
    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(false), 0)
        return () => window.clearTimeout(timer)
    }, [])
    return <SectionFrame title="Verification & Viva" description="Track the trust verification pipeline and mentor throughput." loading={loading} onRefresh={fetchData}>
        <MetricGrid metrics={asMetrics(data?.metrics)} />
        <DataTable rows={asRows(data?.evaluations)} />
        <DataTable rows={asRows(data?.mentor_analytics)} />
    </SectionFrame>
}

export function CollegePlacementsPage() {
    const [data, setData] = useState<Row | null>(null)
    const [loading, setLoading] = useState(true)
    const fetchData = (showLoading = true) => {
        if (showLoading) setLoading(true)
        collegeService.getPlacements().then(setData).finally(() => setLoading(false))
    }
    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(false), 0)
        return () => window.clearTimeout(timer)
    }, [])
    return <SectionFrame title="Placements" description="Placement intelligence, offers, packages, and hiring distribution." loading={loading} onRefresh={fetchData}>
        <MetricGrid metrics={asMetrics(data?.metrics)} />
        <div className="grid gap-4 xl:grid-cols-3">
            <ChartBlock title="Placement Trend" data={asRows(data?.placement_trend)} xKey="month" yKey="placements" />
            <ChartBlock title="Department Comparison" data={asRows(data?.department_comparison)} xKey="department" yKey="placements" />
            <ChartBlock title="Company Hiring Distribution" data={asRows(data?.company_distribution)} xKey="company" yKey="hires" />
        </div>
        <DataTable rows={asRows(data?.feed)} />
    </SectionFrame>
}

export function CollegeRecruitersPage() {
    const [data, setData] = useState<Row | null>(null)
    const [loading, setLoading] = useState(true)
    const fetchData = (showLoading = true) => {
        if (showLoading) setLoading(true)
        collegeService.getRecruiters().then(setData).finally(() => setLoading(false))
    }
    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(false), 0)
        return () => window.clearTimeout(timer)
    }, [])
    return <SectionFrame title="Recruiters" description="Recruiter engagement analytics across jobs, views, shortlists, interviews, and offers." loading={loading} onRefresh={fetchData}>
        <MetricGrid metrics={asMetrics(data?.metrics)} />
        <DataTable rows={asRows(data?.recruiters)} />
    </SectionFrame>
}

export function CollegeJobsPage() {
    const [rows, setRows] = useState<Row[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const fetchData = (showLoading = true) => {
        if (showLoading) setLoading(true)
        collegeService.getJobs({ skip: 0, limit: 50 }).then((data) => {
            setRows(data.data)
            setTotal(data.total)
        }).finally(() => setLoading(false))
    }
    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(false), 0)
        return () => window.clearTimeout(timer)
    }, [])
    return <SectionFrame title="Jobs" description={`${total.toLocaleString()} college jobs with candidate pipeline counts.`} loading={loading} onRefresh={fetchData}>
        <DataTable rows={rows} />
    </SectionFrame>
}

export function CollegeNotificationsPage() {
    const [data, setData] = useState<{ unread_count: number; notifications: NotificationItem[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const fetchData = (showLoading = true) => {
        if (showLoading) setLoading(true)
        collegeService.getNotifications().then(setData).finally(() => setLoading(false))
    }
    useEffect(() => {
        const timer = window.setTimeout(() => fetchData(false), 0)
        return () => window.clearTimeout(timer)
    }, [])
    return <SectionFrame title="Notifications" description={`${data?.unread_count || 0} unread activity items from live platform events.`} loading={loading} onRefresh={fetchData}>
        <div className="space-y-3">
            {(data?.notifications || []).map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                    <div className="flex items-start gap-3">
                        <Bell className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="font-semibold text-gray-950 dark:text-white">{item.title}</p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">{item.description}</p>
                            <p className="mt-2 text-xs text-gray-500 dark:text-white/40">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</p>
                        </div>
                    </div>
                </div>
            ))}
            {!data?.notifications?.length && <EmptyPanel label="No activity yet." />}
        </div>
    </SectionFrame>
}

export function CollegeReportsPage() {
    const [reportType, setReportType] = useState('placement')
    const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
    const download = async () => {
        try {
            const blob = await collegeService.downloadReport(reportType, format)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${reportType}_report.${format === 'csv' ? 'csv' : format}`
            link.click()
            URL.revokeObjectURL(url)
            toast.success('Report downloaded')
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, `${format.toUpperCase()} export is not available yet`))
        }
    }
    return (
        <SectionFrame title="Reports" description="Generate downloadable reports from backend data." loading={false}>
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <div className="grid gap-4 md:grid-cols-3">
                    <Select value={reportType} onChange={(event) => setReportType(event.currentTarget.value)} options={[
                        { value: 'placement', label: 'Placement Report' },
                        { value: 'des', label: 'DES Report' },
                        { value: 'verification', label: 'Verification Report' },
                        { value: 'department', label: 'Department Report' },
                        { value: 'recruiter_activity', label: 'Recruiter Activity Report' },
                    ]} />
                    <Select value={format} onChange={(event) => setFormat(event.currentTarget.value as 'csv' | 'excel' | 'pdf')} options={[
                        { value: 'csv', label: 'CSV' },
                        { value: 'excel', label: 'Excel' },
                        { value: 'pdf', label: 'PDF' },
                    ]} />
                    <Button onClick={download} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                </div>
            </section>
        </SectionFrame>
    )
}

export function CollegeSettingsPage() {
    return <SectionFrame title="Settings" description="College dashboard configuration uses the existing account and theme system." loading={false}>
        <EmptyPanel label="No additional college-specific settings have been configured." />
    </SectionFrame>
}

function EmptyPanel({ label }: { label: string }) {
    return (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-white/15 dark:bg-[#0B1739] dark:text-white/50">
            {label}
        </div>
    )
}

function SectionFrame({
    title,
    description,
    loading,
    onRefresh,
    children,
}: {
    title: string
    description: string
    loading: boolean
    onRefresh?: () => void
    children: ReactNode
}) {
    return (
        <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-white/60">{description}</p>
                    </div>
                    {onRefresh && (
                        <Button variant="outline" onClick={onRefresh} className="gap-2">
                            <RefreshCcw className="h-4 w-4" />
                            Refresh
                        </Button>
                    )}
                </div>
            </section>
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />)}
                </div>
            ) : children}
        </div>
    )
}
