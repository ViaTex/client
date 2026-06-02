"use client"

import { useCallback, useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { collegeService, CollegeStudent } from '@/services/college.service'
import { cn } from '@/lib/utils'

type StudentDetail = {
    personal_info?: {
        name?: string
        email?: string
        phone?: string
        location?: string
    }
    scores?: {
        des?: number
        ats?: number | null
        profile_completion?: number
    }
    projects?: unknown[]
    education?: unknown[]
    verification_history?: unknown[]
    interview_history?: unknown[]
    placement_history?: unknown[]
}

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response
        if (response?.data?.detail) return response.data.detail
    }
    if (error instanceof Error) return error.message
    return fallback
}

const statusClass: Record<string, string> = {
    verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    placed: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    scheduled: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    pending: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    not_started: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/60',
    not_applied: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/60',
    applied: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    shortlisted: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    interview: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
}

function StatusPill({ value }: { value: string }) {
    return (
        <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize', statusClass[value] || statusClass.not_started)}>
            {value.replace(/_/g, ' ')}
        </span>
    )
}

function Drawer({ studentId, onClose }: { studentId: string; onClose: () => void }) {
    const [detail, setDetail] = useState<StudentDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        collegeService.getStudentDetail(studentId)
            .then((data) => alive && setDetail(data as StudentDetail))
            .catch((err: unknown) => alive && setError(getErrorMessage(err, 'Failed to load student')))
            .finally(() => alive && setLoading(false))
        return () => { alive = false }
    }, [studentId])

    return (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-[#081127]" onClick={(event) => event.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Student intelligence</p>
                        <h2 className="mt-1 text-xl font-bold text-gray-950 dark:text-white">{detail?.personal_info?.name || 'Student profile'}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />)}
                    </div>
                ) : error ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">{error}</p>
                ) : detail ? (
                    <div className="space-y-4">
                        <section className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                            <h3 className="font-semibold text-gray-950 dark:text-white">Personal Info</h3>
                            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                <p className="text-gray-600 dark:text-white/60">Email: <span className="text-gray-950 dark:text-white">{detail.personal_info?.email || '-'}</span></p>
                                <p className="text-gray-600 dark:text-white/60">Phone: <span className="text-gray-950 dark:text-white">{detail.personal_info?.phone || '-'}</span></p>
                                <p className="text-gray-600 dark:text-white/60">Location: <span className="text-gray-950 dark:text-white">{detail.personal_info?.location || '-'}</span></p>
                                <p className="text-gray-600 dark:text-white/60">Profile: <span className="text-gray-950 dark:text-white">{detail.scores?.profile_completion ?? 0}%</span></p>
                            </div>
                        </section>
                        <section className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                                <p className="text-xs text-gray-500 dark:text-white/50">DES Score</p>
                                <p className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{detail.scores?.des ?? 0}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                                <p className="text-xs text-gray-500 dark:text-white/50">ATS Score</p>
                                <p className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{detail.scores?.ats ?? '-'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                                <p className="text-xs text-gray-500 dark:text-white/50">Projects</p>
                                <p className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{detail.projects?.length || 0}</p>
                            </div>
                        </section>
                        {[
                            ['Education', detail.education],
                            ['Projects', detail.projects],
                            ['Verification History', detail.verification_history],
                            ['Interview History', detail.interview_history],
                            ['Placement History', detail.placement_history],
                        ].map(([title, rows]) => (
                            <section key={String(title)} className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                                <h3 className="font-semibold text-gray-950 dark:text-white">{String(title)}</h3>
                                <div className="mt-3 space-y-2">
                                    {Array.isArray(rows) && rows.length ? rows.map((item, index) => (
                                        <pre key={index} className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-white/[0.04] dark:text-white/70">
                                            {JSON.stringify(item, null, 2)}
                                        </pre>
                                    )) : <p className="text-sm text-gray-500 dark:text-white/50">No data recorded.</p>}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : null}
            </aside>
        </div>
    )
}

export function CollegeStudentsPage() {
    const [students, setStudents] = useState<CollegeStudent[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [filters, setFilters] = useState({ query: '', department: '', year: '', des_min: '', des_max: '', verified: '', placed: '' })
    const [page, setPage] = useState(0)
    const limit = 20

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const params: Record<string, string | number | boolean | undefined> = { skip: page * limit, limit }
            Object.entries(filters).forEach(([key, value]) => {
                if (!value) return
                if (key === 'verified' || key === 'placed') params[key] = value === 'true'
                else params[key] = value
            })
            const result = await collegeService.getStudents(params)
            setStudents(result.data)
            setTotal(result.total)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to fetch students'))
        } finally {
            setLoading(false)
        }
    }, [filters, page])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    return (
        <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Students</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-white/60">Search, filter, and inspect employability data across your roster.</p>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(6,minmax(0,1fr))]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input className="pl-9" placeholder="Search name, email, roll number" value={filters.query} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, query: event.target.value })) }} />
                    </div>
                    <Input placeholder="Department" value={filters.department} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, department: event.target.value })) }} />
                    <Input placeholder="Year" value={filters.year} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, year: event.target.value })) }} />
                    <Input type="number" placeholder="DES min" value={filters.des_min} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, des_min: event.target.value })) }} />
                    <Input type="number" placeholder="DES max" value={filters.des_max} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, des_max: event.target.value })) }} />
                    <Select value={filters.verified} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, verified: event.currentTarget.value })) }} options={[{ value: '', label: 'Any verification' }, { value: 'true', label: 'Verified' }, { value: 'false', label: 'Unverified' }]} />
                    <Select value={filters.placed} onChange={(event) => { setPage(0); setFilters((prev) => ({ ...prev, placed: event.currentTarget.value })) }} options={[{ value: '', label: 'Any placement' }, { value: 'true', label: 'Placed' }, { value: 'false', label: 'Unplaced' }]} />
                </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1739]">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 dark:border-white/10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                        <SlidersHorizontal className="h-4 w-4" />
                        {total.toLocaleString()} students
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button>
                        <Button variant="outline" disabled={(page + 1) * limit >= total} onClick={() => setPage((value) => value + 1)}>Next</Button>
                    </div>
                </div>
                <div className="w-full overflow-hidden">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/[0.03] dark:text-white/50">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="hidden px-4 py-3 text-left xl:table-cell">Roll Number</th>
                                <th className="hidden px-4 py-3 text-left lg:table-cell">Email</th>
                                <th className="hidden px-4 py-3 text-left md:table-cell">Department</th>
                                <th className="hidden px-4 py-3 text-left xl:table-cell">Year</th>
                                <th className="px-4 py-3 text-left">DES</th>
                                <th className="hidden px-4 py-3 text-left lg:table-cell">ATS</th>
                                <th className="hidden px-4 py-3 text-left xl:table-cell">Profile</th>
                                <th className="px-4 py-3 text-left">Verification</th>
                                <th className="hidden px-4 py-3 text-left sm:table-cell">Placement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, index) => (
                                    <tr key={index} className="border-t border-gray-100 dark:border-white/10">
                                        <td colSpan={10} className="px-4 py-3"><div className="h-8 animate-pulse rounded bg-gray-200 dark:bg-white/10" /></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr><td colSpan={10} className="px-4 py-10 text-center text-red-600 dark:text-red-300">{error}</td></tr>
                            ) : students.length ? students.map((student) => (
                                <tr key={student.id} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/[0.03]" onClick={() => setSelectedId(student.id)}>
                                    <td className="truncate px-4 py-3 font-semibold text-gray-950 dark:text-white">{student.name}</td>
                                    <td className="hidden truncate px-4 py-3 text-gray-600 dark:text-white/60 xl:table-cell">{student.roll_number || '-'}</td>
                                    <td className="hidden truncate px-4 py-3 text-gray-600 dark:text-white/60 lg:table-cell">{student.email}</td>
                                    <td className="hidden truncate px-4 py-3 text-gray-600 dark:text-white/60 md:table-cell">{student.department}</td>
                                    <td className="hidden px-4 py-3 text-gray-600 dark:text-white/60 xl:table-cell">{student.year || '-'}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-950 dark:text-white">{student.des_score}</td>
                                    <td className="hidden px-4 py-3 text-gray-600 dark:text-white/60 lg:table-cell">{student.ats_score ?? '-'}</td>
                                    <td className="hidden px-4 py-3 text-gray-600 dark:text-white/60 xl:table-cell">{student.profile_completion}%</td>
                                    <td className="px-4 py-3"><StatusPill value={student.verification_status} /></td>
                                    <td className="hidden px-4 py-3 sm:table-cell"><StatusPill value={student.placement_status} /></td>
                                </tr>
                            )) : (
                                <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-500 dark:text-white/50">No students match these filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedId && <Drawer studentId={selectedId} onClose={() => setSelectedId(null)} />}
        </div>
    )
}
