import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from 'react-hot-toast'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-poppins'
})

export const metadata: Metadata = {
    title: 'DishaSetu - Bridging Talent with Opportunity',
    description: 'DishaSetu connects students, colleges, and corporates to create meaningful career opportunities',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning className={`${inter.variable} ${poppins.variable} font-sans`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>{children}</QueryProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'var(--toast-bg)',
                                color: 'var(--toast-color)',
                                border: '1px solid var(--toast-border)',
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    )
}

