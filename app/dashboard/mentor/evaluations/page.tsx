"use client"

import { useEffect, useState } from 'react'
import { apiClient, SkillEvaluationItem } from '@/lib/api'

export default function MentorEvaluationsPage() {
    const [loading, setLoading] = useState(true)
    const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiClient.getMentorEvaluations()
                setEvaluations(data || [])
            } catch {
                setEvaluations([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return <p className="text-sm text-gray-500">Loading evaluations...</p>
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">Skill Evaluations</h1>
            {evaluations.length === 0 ? (
                <p className="text-sm text-gray-500">No evaluations available.</p>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {evaluations.map((item) => (
                        <div key={item.evaluation_id} className="rounded-lg border bg-white p-4 dark:bg-[#0F1A3A]">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">Evaluation #{item.evaluation_id.slice(0, 8)}</p>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize dark:bg-slate-800">
                                    {item.status.replaceAll('_', ' ')}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">Student: {item.student_id}</p>
                            {item.total_score != null && <p className="text-sm text-gray-500">Total Score: {item.total_score}/100</p>}
                            {item.verdict && <p className="text-sm text-gray-500">Verdict: {item.verdict.replaceAll('_', ' ')}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
