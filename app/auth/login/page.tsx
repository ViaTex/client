"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent } from '@/components/ui/modal'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    user_type: z.enum(['student', 'corporate', 'college', 'admin'] as const)
})

type LoginFormData = z.infer<typeof loginSchema>

const userTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'college', label: 'College' },
]

const userTypeIcons = {
    student: User,
    corporate: Building2,
    college: GraduationCap,
    admin: Shield
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [registerLink, setRegisterLink] = useState(`/auth/register?type=student`)

    useEffect(() => {
        const hasRedirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' && localStorage.getItem('redirect_after_login'))
        if (!hasRedirectUrl) {
            redirectIfAuthenticated()
        }
    }, [redirectIfAuthenticated, searchParams])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            user_type: 'student'
        }
    })

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        const registered = searchParams.get('registered')

        if (type && ['student', 'corporate', 'college', 'admin'].includes(type)) {
            setSelectedUserType(type)
            setValue('user_type', type)
        }

        if (registered === 'true') {
            toast.success('Registration successful! Please log in to continue.')
        }
    }, [searchParams, setValue])

    useEffect(() => {
        setValue('user_type', selectedUserType)
    }, [selectedUserType, setValue])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
            const link = redirectUrl
                ? `/auth/register?type=${selectedUserType}&redirect=${encodeURIComponent(redirectUrl)}`
                : `/auth/register?type=${selectedUserType}`
            setRegisterLink(link)
        }
    }, [searchParams, selectedUserType])

    const onSubmit = async (data: LoginFormData) => {
        if (!termsAndPrivacyAccepted) {
            toast.error('Please accept Terms and Conditions to continue')
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.login(data)

            apiClient.setAuthTokens(response.access_token, response.refresh_token)

            login({
                id: response.user_id || 'temp-id',
                email: data.email,
                user_type: data.user_type,
                name: data.email
            }, response.access_token, response.refresh_token)

            toast.success('Login successful!')

            let redirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' ? localStorage.getItem('redirect_after_login') : null)

            if (redirectUrl) {
                redirectUrl = decodeURIComponent(redirectUrl)
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('redirect_after_login')
                }
                router.push(redirectUrl)
                return
            }

            switch (data.user_type) {
                case 'student':
                    router.push('/dashboard/student')
                    break
                case 'corporate':
                    router.push('/dashboard/corporate')
                    break
                case 'college':
                    router.push('/dashboard/college')
                    break
                case 'admin':
                    router.push('/dashboard/admin')
                    break
                default:
                    router.push('/dashboard')
            }
        } catch (error: any) {
            let message = 'Login failed. Please try again.'

            if (error.response) {
                const status = error.response.status
                const detail = error.response.data?.detail

                if (status === 401) {
                    message = 'Invalid password. Please try again.'
                } else if (status === 404) {
                    message = 'This email is not registered. Please create an account first.'
                } else if (status === 400) {
                    message = detail || 'Invalid login request.'
                } else {
                    message = detail || message
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
        setValue('user_type', userType)

        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/login?type=${userType}&redirect=${redirectUrl}`
            : `/auth/login?type=${userType}`
        router.replace(newUrl)

        setTimeout(() => {
            setValue('user_type', userType)
        }, 0)
    }

    const handleTermsAndPrivacyAccept = () => {
        setTermsAndPrivacyAccepted(true)
        setShowTermsModal(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar */}
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

                    {/* User Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            I am a
                        </label>
                        <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 w-full">
                            {userTypeOptions.map((option) => {
                                const Icon = userTypeIcons[option.value as UserType]
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
                            <input type="hidden" {...register('user_type')} />

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
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    )
}
