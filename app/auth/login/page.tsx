"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, UserCheck } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent } from '@/components/ui/modal'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { UserType } from '@/types/auth'
import { BACKEND_ROLE_TO_USER_TYPE } from '@/types/auth'

// Login only needs email + password (backend determines role from DB)
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const userTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'college', label: 'College' },
    { value: 'mentor', label: 'Mentor' },
]

const userTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    student: User,
    corporate: Building2,
    college: GraduationCap,
    mentor: UserCheck,
    admin: Shield,
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isAuthenticated, isLoading: authLoading, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [registerLink, setRegisterLink] = useState(`/auth/register?type=student`)

    // Redirect if already authenticated
    useEffect(() => {
        if (authLoading) return
        const hasRedirectUrl = searchParams.get('redirect')
        if (!hasRedirectUrl && isAuthenticated && user) {
            router.replace(`/dashboard/${user.user_type}`)
        }
    }, [authLoading, isAuthenticated, user, router, searchParams])

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        const registered = searchParams.get('registered')

        if (type && ['student', 'corporate', 'college', 'mentor', 'admin'].includes(type)) {
            setSelectedUserType(type)
        }

        if (registered === 'true') {
            toast.success('Registration successful! Please log in to continue.')
        }
    }, [searchParams])

    useEffect(() => {
        const redirectUrl = searchParams.get('redirect')
        const link = redirectUrl
            ? `/auth/register?type=${selectedUserType}&redirect=${encodeURIComponent(redirectUrl)}`
            : `/auth/register?type=${selectedUserType}`
        setRegisterLink(link)
    }, [searchParams, selectedUserType])

    const onSubmit = async (data: LoginFormData) => {
        if (!termsAndPrivacyAccepted) {
            toast.error('Please accept Terms and Conditions to continue')
            return
        }

        setIsLoading(true)
        try {
            // Backend login returns TokenResponse with user info
            const tokenResponse = await apiClient.login({
                email: data.email,
                password: data.password,
            })

            // Login via AuthProvider context (stores token + user)
            login(tokenResponse)

            toast.success('Login successful!')

            // Handle redirect
            const redirectUrl = searchParams.get('redirect')
            if (redirectUrl) {
                router.push(decodeURIComponent(redirectUrl))
                return
            }

            // Route based on backend user role
            const userType = BACKEND_ROLE_TO_USER_TYPE[tokenResponse.user.role] || 'student'
            router.push(`/dashboard/${userType}`)
        } catch (error: any) {
            let message = 'Login failed. Please try again.'

            if (error.response) {
                const status = error.response.status
                const detail = error.response.data?.detail

                if (status === 401) {
                    message = typeof detail === 'string' ? detail : 'Invalid email or password.'
                } else if (status === 403) {
                    // Check if this is an inactive account requiring verification
                    if (typeof detail === 'object' && detail?.requires_verification) {
                        const userId = detail.user_id
                        const userEmail = detail.email
                        toast.error(detail.message || 'Account is not active. Please complete verification.')
                        // Redirect to OTP verification page (OTPs already resent by backend)
                        router.push(`/auth/verify-otp?user_id=${userId}&email=${encodeURIComponent(userEmail)}`)
                        return
                    }
                    message = typeof detail === 'string' ? detail : detail?.message || 'Account is not active or is locked.'
                } else if (status === 400) {
                    message = typeof detail === 'string' ? detail : 'Invalid login request.'
                } else {
                    message = typeof detail === 'string' ? detail : message
                }
            }

            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUserTypeChange = (value: string) => {
        const userType = value as UserType
        setSelectedUserType(userType)
        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/login?type=${userType}&redirect=${redirectUrl}`
            : `/auth/login?type=${userType}`
        router.replace(newUrl)
    }

    const handleTermsAndPrivacyAccept = () => {
        setTermsAndPrivacyAccepted(true)
        setShowTermsModal(false)
    }

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
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* User Type Selection (visual only, doesn't affect login) */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            I am a
                        </label>
                        <div className="grid sm:grid-cols-4 grid-cols-2 gap-3 w-full">
                            {userTypeOptions.map((option) => {
                                const Icon = userTypeIcons[option.value]
                                const isSelected = selectedUserType === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleUserTypeChange(option.value)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                        <span className="text-sm font-medium">{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    error={!!errors.email}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                    error={!!errors.password}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Terms and Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div
                                    className="cursor-pointer flex-1"
                                    onClick={() => setShowTermsModal(true)}
                                >
                                    <Checkbox
                                        id="terms-privacy"
                                        checked={termsAndPrivacyAccepted}
                                        onChange={() => setShowTermsModal(true)}
                                        label={
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                    Accept Terms & Conditions
                                                </span>
                                                {!termsAndPrivacyAccepted && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                        }
                                    />
                                </div>
                                {selectedUserType !== 'admin' && (
                                    <Link
                                        href={`/auth/forgot-password?type=${selectedUserType}`}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors whitespace-nowrap"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                loading={isLoading}
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* OAuth Login Buttons */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <a
                                    href={apiClient.getGoogleLoginUrl()}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </a>
                                <a
                                    href={apiClient.getLinkedInLoginUrl()}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>

                        {selectedUserType !== 'admin' && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href={registerLink}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                    >
                                        Create one
                                    </Link>
                                </p>
                            </div>
                        )}

                        {selectedUserType === 'admin' && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                    Admin accounts are created by authorized personnel only
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Terms and Conditions Modal */}
            <Modal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title="Terms and Conditions"
                maxWidth="2xl"
            >
                <TermsModalContent />
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleTermsAndPrivacyAccept} className="bg-blue-500 hover:bg-blue-600 text-white">
                        Accept Terms and Conditions and Privacy Policy
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
