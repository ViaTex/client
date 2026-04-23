"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiClient, ExamReviewAssignmentItem } from '@/lib/api'
import { Button } from '@/components/ui/button'

const statusLabel: Record<string, string> = {
    queued: 'Queued',
    assigned: 'Assigned',
    completed: 'Completed',
}

export default function MentorExamReviewsPage() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<ExamReviewAssignmentItem[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiClient.getMentorExamReviews()
                setItems(data || [])
            } catch {
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return <p className="text-sm text-gray-500">Loading exam reviews...</p>
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] p-6 text-white">
                <h1 className="text-2xl font-bold">Exam Reviews</h1>
                <p className="mt-2 text-sm text-white/80">
                    Review Section A and D submissions, then submit your scores and feedback.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-500 dark:border-[#334155]">
                    No exam reviews assigned yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {items.map((item) => (
                        <div
                            key={item.session_id}
                            className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#243056] dark:bg-[#0F1A3A]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold">Session #{item.session_id.slice(0, 8)}</p>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {statusLabel[item.status] || item.status}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Student ID: {item.student_id || 'Unavailable'}</p>
                            {item.assigned_at && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Assigned: {new Date(item.assigned_at).toLocaleString()}
                                </p>
                            )}
                            <div className="mt-4">
                                <Button asChild className="rounded-xl">
                                    <Link href={`/dashboard/mentor/exam-reviews/${item.session_id}`}>
                                        Open Review
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
