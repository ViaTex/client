"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Shield, Mail, Phone, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'

// ============= OTP Input Component =============

function OTPInput({
    length = 6,
    value,
    onChange,
    label,
    icon: Icon,
}: {
    length?: number
    value: string
    onChange: (val: string) => void
    label: string
    icon: React.ComponentType<{ className?: string }>
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, char: string) => {
        if (!/^\d*$/.test(char)) return
        const newValue = value.split('')
        newValue[index] = char
        const result = newValue.join('').slice(0, length)
        onChange(result)
        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
        onChange(pasted)
        const nextIndex = Math.min(pasted.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            </div>
            <div className="flex gap-2 justify-center">
                {Array.from({ length }).map((_, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[i] || ''}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                ))}
            </div>
        </div>
    )
}

// ============= Main Component =============

function VerifyOTPContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [emailOtp, setEmailOtp] = useState('')
    const [phoneOtp, setPhoneOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const userId = searchParams.get('user_id')
    const email = searchParams.get('email')

    // Redirect if no user_id
    useEffect(() => {
        if (!userId) {
            router.replace('/auth/register')
        }
    }, [userId, router])

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleVerify = async () => {
        if (emailOtp.length !== 6 || phoneOtp.length !== 6) {
            toast.error('Please enter both 6-digit OTP codes')
            return
        }

        if (!userId) return

        setIsLoading(true)
        try {
            const response = await apiClient.verifyOtp({
                user_id: userId,
                email_otp: emailOtp,
                phone_otp: phoneOtp,
            })

            if (response.success) {
                toast.success('Account verified successfully! Please log in.')
                router.push('/auth/login?registered=true')
            }
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Verification failed. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async (type: 'email' | 'phone' | 'both') => {
        if (!userId || countdown > 0) return

        setIsResending(true)
        try {
            await apiClient.resendOtp({ user_id: userId, type })
            toast.success(`OTP resent to your ${type === 'both' ? 'email and phone' : type}`)
            setCountdown(60) // 60-second cooldown
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to resend OTP')
        } finally {
            setIsResending(false)
        }
    }

    if (!userId) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="solid" />

            <div className="min-h-screen flex items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Verify Your Account
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            We&apos;ve sent verification codes to your email
                            {email && (
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {' '}({email})
                                </span>
                            )}{' '}
                            and phone number.
                        </p>
                    </div>

                    {/* OTP Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 space-y-8">
                        {/* Email OTP */}
                        <OTPInput
                            value={emailOtp}
                            onChange={setEmailOtp}
                            label="Email Verification Code"
                            icon={Mail}
                        />

                        {/* Phone OTP */}
                        <OTPInput
                            value={phoneOtp}
                            onChange={setPhoneOtp}
                            label="Phone Verification Code"
                            icon={Phone}
                        />

                        {/* Verify Button */}
                        <Button
                            onClick={handleVerify}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                            loading={isLoading}
                            disabled={emailOtp.length !== 6 || phoneOtp.length !== 6}
                        >
                            Verify & Activate Account
                        </Button>

                        {/* Resend Options */}
                        <div className="flex flex-col items-center gap-2 pt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Didn&apos;t receive the codes?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleResend('both')}
                                    disabled={countdown > 0 || isResending}
                                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Both'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Back to login */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            &larr; Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <VerifyOTPContent />
        </Suspense>
    )
}
