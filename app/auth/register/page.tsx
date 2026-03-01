"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Phone, UserCheck } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { UserType } from '@/types/auth'
import { USER_TYPE_TO_BACKEND } from '@/types/auth'

// ============= Form Schema =============

const registerSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    phone_number: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(20, 'Phone number is too long')
        .regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number (e.g. +919876543210)'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/\d/, 'Must contain at least one digit'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

const userTypeOptions = [
    { value: 'student' as const, label: 'Student', icon: User, description: "Individual's Student" },
    { value: 'corporate' as const, label: 'Corporate', icon: Building2, description: "Institutional's Corporate" },
    { value: 'college' as const, label: 'College', icon: GraduationCap, description: "Institutional's TPO" },
    { value: 'mentor' as const, label: 'Mentor', icon: UserCheck, description: "Individual's Mentor" },
]

// ============= Component =============

function RegisterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated, user, isLoading: authLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<Exclude<UserType, 'admin'>>('student')

    // Redirect if already authenticated
    useEffect(() => {
        if (authLoading) return
        const hasRedirectUrl = searchParams.get('redirect')
        if (!hasRedirectUrl && isAuthenticated && user) {
            router.replace(`/dashboard/${user.user_type}`)
        }
    }, [authLoading, isAuthenticated, user, router, searchParams])

    useEffect(() => {
        const type = searchParams.get('type')
        if (type && ['student', 'corporate', 'college', 'mentor'].includes(type)) {
            setSelectedUserType(type as Exclude<UserType, 'admin'>)
        }
    }, [searchParams])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const handleUserTypeChange = (value: string) => {
        const userType = value as Exclude<UserType, 'admin'>
        setSelectedUserType(userType)
        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/register?type=${userType}&redirect=${redirectUrl}`
            : `/auth/register?type=${userType}`
        router.replace(newUrl)
    }

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)
        try {
            // Map frontend user type to backend role + account_type
            const backendMapping = USER_TYPE_TO_BACKEND[selectedUserType]

            const response = await apiClient.register({
                email: data.email,
                phone_number: data.phone_number,
                password: data.password,
                account_type: backendMapping.account_type,
                role: backendMapping.role,
            })

            toast.success('Registration successful! Please verify your email and phone.')

            // Redirect to OTP verification page with user_id
            router.push(`/auth/verify-otp?user_id=${response.user_id}&email=${encodeURIComponent(data.email)}`)
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Registration failed. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="solid" />

            <div className="container mx-auto px-4 py-12 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-lg mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6">
                            {(() => {
                                const option = userTypeOptions.find(o => o.value === selectedUserType)
                                const Icon = option?.icon || User
                                return <Icon className="w-10 h-10 text-white" />
                            })()}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Create Your Account
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Join DishaSetu and start your journey today
                        </p>
                    </div>

                    {/* User Type Selector */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {userTypeOptions.map((option) => {
                                const Icon = option.icon
                                const isSelected = selectedUserType === option.value
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleUserTypeChange(option.value)}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                        <span className="text-sm font-medium">{option.label}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-500">{option.description}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address *
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
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number *
                                </label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="+919876543210"
                                    leftIcon={<Phone className="w-4 h-4" />}
                                    error={!!errors.phone_number}
                                    {...register('phone_number')}
                                />
                                {errors.phone_number && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Include country code (e.g. +91 for India)
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password *
                                </label>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                    error={!!errors.password}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Min 8 characters with uppercase, lowercase and digit
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password *
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                    error={!!errors.confirmPassword}
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Info box showing what role will be assigned */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    You will be registered as a <strong>{USER_TYPE_TO_BACKEND[selectedUserType].role}</strong> with{' '}
                                    <strong>{USER_TYPE_TO_BACKEND[selectedUserType].account_type}</strong> account type.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                loading={isLoading}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href={`/auth/login?type=${selectedUserType}`}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* OAuth Sign-Up Buttons */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or sign up with</span>
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
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <RegisterContent />
        </Suspense>
    )
}
