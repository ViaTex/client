"use client"

import React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface CustomFormModalProps {
    isOpen: boolean
    title: string
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    children: React.ReactNode
    submitLabel?: string
    cancelLabel?: string
    isSubmitting?: boolean
    submitDisabled?: boolean
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
    position?: "center" | "right"
    className?: string
    footer?: React.ReactNode
}

export function CustomFormModal({
    isOpen,
    title,
    onClose,
    onSubmit,
    children,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    isSubmitting = false,
    submitDisabled = false,
    maxWidth = "2xl",
    position = "right",
    className,
    footer,
}: CustomFormModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth={maxWidth}
            position={position}
            className={className}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                {children}
                {footer ?? (
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" onClick={onClose} type="button">
                            {cancelLabel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || submitDisabled}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? "Saving..." : submitLabel}
                        </Button>
                    </div>
                )}
            </form>
        </Modal>
    )
}
