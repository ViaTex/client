import { useTheme } from "next-themes"

// Stat card – Figma: vertical flow, radius 16px, padding 10px; dark mode uses Figma hex colors
function StatCard({
    icon: Icon,
    label,
    value,
    secondaryText,
    backgroundColor,
    darkBackgroundColor,
    iconBgColor,
    iconColor = 'text-white',
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string | number
    secondaryText?: string
    backgroundColor: string
    darkBackgroundColor?: string
    iconBgColor: string
    iconColor?: string
}) {
    const { theme, resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark' || theme === 'dark'
    const bg = isDark && darkBackgroundColor ? darkBackgroundColor : backgroundColor
    return (
        <div
            className="relative flex min-h-[108px] w-full min-w-0 flex-col rounded-[16px] p-2.5 gap-2.5"
            style={{
                backgroundColor: bg,
                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            }}
        >
            <div
                className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-[10px] ${iconBgColor}`}
            >
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 pr-10">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                    {value}
                </p>
                {secondaryText && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{secondaryText}</p>
                )}
            </div>
        </div>
    )
}

export default StatCard;

