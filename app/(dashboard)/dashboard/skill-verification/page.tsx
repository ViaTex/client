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
        <div className="w-full font-sans text-[#1b140d] dark:text-gray-100">
            <div className="bg-white rounded-[1.5rem] border border-white/40 dark:bg-[#221910] dark:border-gray-800 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Skill Verification</h1>
                        <p className="text-sm text-[#9a734c] dark:text-gray-400 mt-2">
                            Validate your skills across intro, fundamentals, logic, and debugging sections.
                        </p>
                    </div>

                    {showBanner && (
                        <div className="rounded-2xl border border-[#f1d4b8] bg-[#fff3e8] text-[#7b4b1c] px-4 py-3 text-sm font-medium">
                            Your exam is currently under review. You will be notified of your score shortly.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#9a734c]">Attempts</p>
                            <p className="text-2xl font-bold mt-2">Up to 3</p>
                            <p className="text-xs text-[#9a734c] mt-1">Incomplete attempts still count.</p>
                        </div>
                        <div className="rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#9a734c]">Sections</p>
                            <p className="text-2xl font-bold mt-2">A → D</p>
                            <p className="text-xs text-[#9a734c] mt-1">Linear, no backtracking.</p>
                        </div>
                        <div className="rounded-2xl border border-[#efe8df] bg-[#fcfaf8] p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#9a734c]">Scoring</p>
                            <p className="text-2xl font-bold mt-2">Weighted</p>
                            <p className="text-xs text-[#9a734c] mt-1">Final score after Section D.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            className="bg-[#ee8c2b] hover:bg-[#df7f1f] text-white rounded-xl"
                            onClick={() => router.push('/dashboard/skill-verification/exam/section-a')}
                        >
                            Start Skill Verification
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl"
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
