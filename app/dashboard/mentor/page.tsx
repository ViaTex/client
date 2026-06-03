"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SkillEvaluationItem } from '@/lib/types'
import { mentorService } from '@/services/mentor.service'
import { Star, CalendarClock, ClipboardCheck, UserRound } from 'lucide-react'

export default function MentorDashboardPage() {
    const { user } = useAuth()
    const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await mentorService.getEvaluations()
                setEvaluations(data || [])
            } catch {
                setEvaluations([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const stats = useMemo(() => {
        const total = evaluations.length
        const pending = evaluations.filter((item) => item.status !== 'evaluated').length
        const completed = evaluations.filter((item) => item.status === 'evaluated').length
        const rated = evaluations.filter((item) => typeof item.student_rating_of_mentor === 'number')
        const avgRating = rated.length
            ? (rated.reduce((sum, item) => sum + (item.student_rating_of_mentor || 0), 0) / rated.length).toFixed(1)
            : '0.0'

        return { total, pending, completed, avgRating }
    }, [evaluations])

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#155E75] p-6 text-white">
                <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0] || 'Mentor'}</h1>
                <p className="mt-2 text-sm text-white/90">
                    Track vivas, score submissions, and guide student growth with structured feedback.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-white p-4 dark:bg-[#0F1A3A]">
                    <p className="text-xs text-gray-500">Total Evaluations</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <ClipboardCheck className="h-5 w-5 text-[#0F766E]" />
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-4 dark:bg-[#0F1A3A]">
                    <p className="text-xs text-gray-500">Pending Reviews</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-2xl font-bold">{stats.pending}</p>
                        <CalendarClock className="h-5 w-5 text-amber-500" />
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-4 dark:bg-[#0F1A3A]">
                    <p className="text-xs text-gray-500">Completed</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-2xl font-bold">{stats.completed}</p>
                        <UserRound className="h-5 w-5 text-sky-500" />
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-4 dark:bg-[#0F1A3A]">
                    <p className="text-xs text-gray-500">Avg Student Rating</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-2xl font-bold">{stats.avgRating}</p>
                        <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white p-4 dark:bg-[#0F1A3A]">
                <h2 className="text-lg font-semibold">Recent Skill Evaluations</h2>
                {loading ? (
                    <p className="mt-3 text-sm text-gray-500">Loading evaluations...</p>
                ) : evaluations.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-500">No evaluations assigned yet.</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {evaluations.slice(0, 8).map((item) => (
                            <div key={item.evaluation_id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">Evaluation #{item.evaluation_id.slice(0, 8)}</p>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize dark:bg-slate-800">
                                        {item.status.replaceAll('_', ' ')}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Student ID: {item.student_id}</p>
                                {item.confirmed_slot && (
                                    <p className="mt-1 text-xs text-gray-500">Viva Slot: {new Date(item.confirmed_slot).toLocaleString()}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
