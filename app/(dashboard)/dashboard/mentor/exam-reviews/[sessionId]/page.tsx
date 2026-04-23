"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient, ExamReviewAssignmentDetail, MentorExamReviewScorePayload } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const emptyFeedback = {
    strengths: [] as string[],
    behavioral_analysis: '',
    areas_for_improvement: [] as string[],
}

function parseLines(value: string): string[] {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
}

export default function MentorExamReviewDetailPage() {
    const params = useParams()
    const router = useRouter()
    const sessionId = typeof params?.sessionId === 'string' ? params.sessionId : ''

    const [loading, setLoading] = useState(true)
    const [detail, setDetail] = useState<ExamReviewAssignmentDetail | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [sectionAScore, setSectionAScore] = useState('')
    const [sectionDScore, setSectionDScore] = useState('')
    const [sectionAStrengths, setSectionAStrengths] = useState('')
    const [sectionABehavioral, setSectionABehavioral] = useState('')
    const [sectionAImprovements, setSectionAImprovements] = useState('')
    const [sectionDStrengths, setSectionDStrengths] = useState('')
    const [sectionDBehavioral, setSectionDBehavioral] = useState('')
    const [sectionDImprovements, setSectionDImprovements] = useState('')
    const [topicScoresRaw, setTopicScoresRaw] = useState('')

    useEffect(() => {
        if (!sessionId) return
        const load = async () => {
            try {
                const data = await apiClient.getMentorExamReviewDetail(sessionId)
                setDetail(data)
            } catch {
                setError('Unable to load review details.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [sessionId])

    const hasVideo = useMemo(() => {
        return Boolean(detail?.section_a.video_url || detail?.section_d.video_url)
    }, [detail])

    const handleSubmit = async () => {
        if (!detail) return
        setSubmitError(null)
        setSubmitSuccess(null)

        const scoreA = Number(sectionAScore)
        const scoreD = Number(sectionDScore)
        if (!Number.isFinite(scoreA) || !Number.isFinite(scoreD)) {
            setSubmitError('Please enter numeric scores for Section A and D.')
            return
        }
        if (scoreA < 0 || scoreA > 10 || scoreD < 0 || scoreD > 10) {
            setSubmitError('Scores must be between 0 and 10.')
            return
        }

        let topicScores: Record<string, number> | undefined
        if (topicScoresRaw.trim()) {
            try {
                const parsed = JSON.parse(topicScoresRaw)
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    topicScores = parsed as Record<string, number>
                } else {
                    setSubmitError('Topic scores must be a JSON object.')
                    return
                }
            } catch {
                setSubmitError('Topic scores must be valid JSON.')
                return
            }
        }

        const payload: MentorExamReviewScorePayload = {
            section_a: {
                score: scoreA,
                feedback: {
                    strengths: parseLines(sectionAStrengths),
                    behavioral_analysis: sectionABehavioral.trim(),
                    areas_for_improvement: parseLines(sectionAImprovements),
                },
            },
            section_d: {
                score: scoreD,
                feedback: {
                    strengths: parseLines(sectionDStrengths),
                    behavioral_analysis: sectionDBehavioral.trim(),
                    areas_for_improvement: parseLines(sectionDImprovements),
                },
                topic_scores: topicScores,
            },
        }

        if (!payload.section_a.feedback.behavioral_analysis || !payload.section_d.feedback.behavioral_analysis) {
            setSubmitError('Please add behavioral analysis for both sections.')
            return
        }

        setIsSubmitting(true)
        try {
            await apiClient.submitMentorExamReviewScore(sessionId, payload)
            setSubmitSuccess('Review submitted successfully.')
            setTimeout(() => router.push('/dashboard/mentor/exam-reviews'), 800)
        } catch {
            setSubmitError('Unable to submit review. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return <p className="text-sm text-gray-500">Loading review...</p>
    }

    if (error || !detail) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-red-400">{error || 'Review not found.'}</p>
                <Button variant="outline" onClick={() => router.push('/dashboard/mentor/exam-reviews')}>
                    Back to list
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#1E1B4B] p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/70">Exam Review</p>
                        <h1 className="text-2xl font-bold">Session #{detail.session_id.slice(0, 8)}</h1>
                        <p className="mt-2 text-sm text-white/70">{detail.student.name}</p>
                    </div>
                    <div className="text-right text-xs text-white/70">
                        <p>Level: {detail.exam_level}</p>
                        <p>Step: {detail.current_step}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#243056] dark:bg-[#0F1A3A]">
                    <h2 className="text-sm font-semibold">Student Snapshot</h2>
                    <p className="mt-2 text-xs text-gray-500">ID: {detail.student.student_id}</p>
                    <p className="mt-2 text-xs text-gray-500">Skills: {detail.student.technical_skills || 'Not provided'}</p>
                    {detail.student.resume_url && (
                        <Button asChild variant="outline" className="mt-4 w-full">
                            <Link href={detail.student.resume_url} target="_blank" rel="noreferrer">
                                View Resume
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#243056] dark:bg-[#0F1A3A]">
                    <h2 className="text-sm font-semibold">Section A</h2>
                    <p className="mt-2 text-xs text-gray-500">Score AI: {detail.section_a.ai_score ?? 'N/A'}</p>
                    {detail.section_a.video_url ? (
                        <Button asChild variant="outline" className="mt-3 w-full">
                            <Link href={detail.section_a.video_url} target="_blank" rel="noreferrer">
                                Open Section A Video
                            </Link>
                        </Button>
                    ) : (
                        <p className="mt-3 text-xs text-gray-500">Video not available.</p>
                    )}
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#243056] dark:bg-[#0F1A3A]">
                    <h2 className="text-sm font-semibold">Section D</h2>
                    <p className="mt-2 text-xs text-gray-500">Score AI: {detail.section_d.ai_score ?? 'N/A'}</p>
                    {detail.section_d.video_url ? (
                        <Button asChild variant="outline" className="mt-3 w-full">
                            <Link href={detail.section_d.video_url} target="_blank" rel="noreferrer">
                                Open Section D Video
                            </Link>
                        </Button>
                    ) : (
                        <p className="mt-3 text-xs text-gray-500">Video not available.</p>
                    )}
                </div>
            </div>

            {hasVideo && (
                <div className="rounded-2xl border border-dashed bg-white p-4 text-xs text-gray-500 dark:border-[#243056] dark:bg-[#0F1A3A]">
                    Video links open in a new tab. The browser will download or stream based on the file type.
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-[#243056] dark:bg-[#0F1A3A]">
                    <h2 className="text-lg font-semibold">Section A Feedback</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-xs font-semibold">Score (0-10)</label>
                            <Input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={sectionAScore}
                                onChange={(event) => setSectionAScore(event.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Strengths (one per line)</label>
                            <Textarea
                                value={sectionAStrengths}
                                onChange={(event) => setSectionAStrengths(event.target.value)}
                                className="min-h-[90px]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Behavioral analysis</label>
                            <Textarea
                                value={sectionABehavioral}
                                onChange={(event) => setSectionABehavioral(event.target.value)}
                                className="min-h-[90px]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Areas for improvement (one per line)</label>
                            <Textarea
                                value={sectionAImprovements}
                                onChange={(event) => setSectionAImprovements(event.target.value)}
                                className="min-h-[90px]"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-[#243056] dark:bg-[#0F1A3A]">
                    <h2 className="text-lg font-semibold">Section D Feedback</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-xs font-semibold">Score (0-10)</label>
                            <Input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={sectionDScore}
                                onChange={(event) => setSectionDScore(event.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Strengths (one per line)</label>
                            <Textarea
                                value={sectionDStrengths}
                                onChange={(event) => setSectionDStrengths(event.target.value)}
                                className="min-h-[90px]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Behavioral analysis</label>
                            <Textarea
                                value={sectionDBehavioral}
                                onChange={(event) => setSectionDBehavioral(event.target.value)}
                                className="min-h-[90px]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Areas for improvement (one per line)</label>
                            <Textarea
                                value={sectionDImprovements}
                                onChange={(event) => setSectionDImprovements(event.target.value)}
                                className="min-h-[90px]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Topic scores JSON (optional)</label>
                            <Textarea
                                value={topicScoresRaw}
                                onChange={(event) => setTopicScoresRaw(event.target.value)}
                                placeholder='{"Problem Solving Skill": 8.5, "Confidence": 7}'
                                className="min-h-[90px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-emerald-500">{submitSuccess}</p>}

            <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard/mentor/exam-reviews')}>
                    Back to list
                </Button>
                <Button loading={isSubmitting} onClick={handleSubmit}>
                    Submit Review
                </Button>
            </div>
        </div>
    )
}
