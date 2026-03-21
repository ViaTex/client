"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'

export default function SkillVerificationExamLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [showExitModal, setShowExitModal] = useState(false)
    const [exitRequested, setExitRequested] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const requestFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen()
                }
            } catch {
                // Ignore fullscreen errors; user can still proceed.
            }
        }

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !exitRequested) {
                setShowExitModal(true)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                setShowExitModal(true)
            }
        }

        requestFullscreen()
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [exitRequested])

    const handleConfirmExit = async () => {
        setExitRequested(true)
        if (typeof window !== 'undefined') {
            const sessionId = localStorage.getItem('active_exam_session_id')
            if (sessionId) {
                try {
                    await apiClient.abandonExam(sessionId)
                } catch {
                    // Best-effort abandon call.
                }
            }
            localStorage.setItem('skill_verification_under_review', '1')
        }
        router.replace('/dashboard/skill-verification')
    }

    const handleStay = async () => {
        setShowExitModal(false)
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen()
            }
        } catch {
            // Ignore fullscreen re-entry errors.
        }
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto w-full max-w-none bg-[#fdf9f4] dark:bg-[#1b140d]">
            {children}
            <Modal
                isOpen={showExitModal}
                onClose={handleStay}
                title="Exit Full-Screen?"
                maxWidth="md"
            >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Exiting full-screen will immediately END your exam and submit your current progress.
                    Do you wish to proceed?
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        variant="destructive"
                        className="rounded-xl"
                        onClick={handleConfirmExit}
                    >
                        End Exam
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={handleStay}
                    >
                        Stay in Full-Screen
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
