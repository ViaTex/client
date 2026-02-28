"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean
    placeholder?: string
    options: { value: string; label: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, placeholder, options, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    error
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600",
                    className
                )}
                ref={ref}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        )
    }
)
Select.displayName = "Select"

export { Select }
