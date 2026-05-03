"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    className,
    maxWidth = "lg"
}: ModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
            document.documentElement.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
            document.documentElement.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto overscroll-none bg-black/50 p-4 pt-6 pointer-events-none backdrop-blur-sm sm:items-center sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-auto"
                        onClick={handleBackdropClick}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "relative my-auto w-full rounded-xl border border-gray-200 bg-white shadow-2xl pointer-events-auto dark:border-gray-700 dark:bg-gray-800",
                            maxWidthClasses[maxWidth],
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <h2 className="min-w-0 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                {title}
                            </h2>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export function TermsModalContent() {
    return (
        <div className="max-h-96 overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms and Conditions and Privacy Policy</h3>
                <p>By accessing and using DishaSetu, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">2. Use License</h3>
                <p>Permission is granted to temporarily download one copy of DishaSetu per device for personal, non-commercial transitory viewing only.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">3. Disclaimer</h3>
                <p>The materials on DishaSetu are provided on an 'as is' basis. DishaSetu makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">4. Limitations</h3>
                <p>In no event shall DishaSetu or its suppliers be liable for any damages arising out of the use or inability to use the materials on DishaSetu.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">5. Governing Law</h3>
                <p>These terms and conditions are governed by and construed in accordance with the laws of India.</p>
            </div>
        </div>
    )
}

export function PrivacyModalContent() {
    return (
        <div className="max-h-96 overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact us.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, and communicate with you.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">3. Information Sharing</h3>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">4. Contact Us</h3>
                <p>If you have any questions about this privacy policy, please contact us.</p>
            </div>
        </div>
    )
}
