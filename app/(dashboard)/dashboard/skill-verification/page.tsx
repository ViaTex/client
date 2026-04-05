"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SkillVerificationPage() {
    const router = useRouter()
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const flag = localStorage.getItem('skill_verification_under_review')
        setShowBanner(Boolean(flag))
    }, [])

    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100">
            <div className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] dark:border-[#243056] dark:bg-[#121C46]">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Skill Verification</h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-[#A8B3CF]">
                            Validate your skills across intro, fundamentals, logic, and debugging sections.
                        </p>
                    </div>

                    {showBanner && (
                        <div className="rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 text-sm font-medium text-[#5B21B6] dark:border-[#4C1D95] dark:bg-[#241A52] dark:text-[#C4B5FD]">
                            Your exam is currently under review. You will be notified of your score shortly.
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 dark:border-[#31406B] dark:bg-[#1C2752]">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] dark:text-[#8B5CF6]">Attempts</p>
                            <p className="mt-2 text-2xl font-bold">Up to 3</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-[#A8B3CF]">Incomplete attempts still count.</p>
                        </div>
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 dark:border-[#31406B] dark:bg-[#1C2752]">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] dark:text-[#8B5CF6]">Sections</p>
                            <p className="mt-2 text-2xl font-bold">A → D</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-[#A8B3CF]">Linear, no backtracking.</p>
                        </div>
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 dark:border-[#31406B] dark:bg-[#1C2752]">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] dark:text-[#8B5CF6]">Scoring</p>
                            <p className="mt-2 text-2xl font-bold">Weighted</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-[#A8B3CF]">Final score after Section D.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white hover:from-[#6D28D9] hover:to-[#7C3AED]"
                            onClick={() => router.push('/dashboard/skill-verification/exam/section-a')}
                        >
                            Start Skill Verification
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 dark:border-[#31406B] dark:text-white dark:hover:bg-[#1C2752]"
                            onClick={() => router.push('/dashboard/student')}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
