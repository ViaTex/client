"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch by only showing after mount
    React.useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="rounded-full">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    // Use resolvedTheme to correctly detect current theme (handles "system" case)
    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full"
        >
            {isDark ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-gray-600" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
