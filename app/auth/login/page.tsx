"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent } from '@/components/ui/modal'
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

    const labelClassName = "block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300 mb-2"
    const inputClassName = "h-12 rounded-xl border-transparent bg-[#f6efe6] text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#8a4a14]/20 dark:bg-gray-800"

    return (
        <div className="min-h-screen bg-[#f6f1ea] dark:bg-gray-950">
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-[0_25px_60px_rgba(71,45,16,0.12)] dark:border-gray-800 dark:bg-gray-900">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Left Panel */}
                            <div className="relative flex flex-col justify-between bg-[#f4ede4] px-8 py-10 sm:px-12 sm:py-12 dark:bg-gray-900">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700/80">Elevate your career</span>
                                    <h1 className="mt-4 text-4xl font-bold leading-tight text-[#4b2a12] sm:text-5xl">
                                        UNLOCK YOUR<br />POTENTIAL
                                    </h1>
                                    <p className="mt-5 max-w-sm text-base text-[#6b4b36]">
                                        Your journey to career success starts here. Join our community of builders and innovators.
                                    </p>
                                </div>

                                <div className="relative mt-10">
                                    <div className="absolute inset-x-0 -bottom-6 h-20 bg-gradient-to-t from-[#f4ede4] to-transparent dark:from-gray-900" />
                                    <img
                                        alt="Students collaborating in a modern workspace"
                                        className="h-80 w-full rounded-2xl object-cover shadow-xl"
                                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
                                    />
                                    <div className="absolute -top-4 -right-4 rounded-2xl bg-[#8a4a14] p-3 shadow-lg">
                                        <RotateCcw className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="bg-white px-8 py-10 sm:px-12 sm:py-12 dark:bg-gray-900">
                                <div className="mx-auto w-full max-w-md">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Sign in to your account to continue.
                                        </p>
                                    </div>

                                    {/* User Type Selection */}
                                    <div className="mb-6">
                                        <label className={labelClassName}>I am a</label>
                                        <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 w-full">
                                            {userTypeOptions.map((option) => {
                                                const Icon = userTypeIcons[option.value as UserType]
                                                const isSelected = selectedUserType === option.value

                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleUserTypeChange(option.value)}
                                                        className={`rounded-xl border px-3 py-3 transition-all duration-200 flex flex-col items-center space-y-2 ${isSelected
                                                            ? 'border-[#8a4a14] bg-[#f6efe6] text-[#6b3b16]'
                                                            : 'border-amber-100 hover:border-[#8a4a14]/40 text-gray-600 dark:text-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                                            }`}
                                                    >
                                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#8a4a14]' : ''}`} />
                                                        <span className="text-xs font-semibold uppercase tracking-widest">{option.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Login Form */}
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <input type="hidden" {...register('user_type')} />

                                        <div>
                                            <label htmlFor="email" className={labelClassName}>
                                                Email Address
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                leftIcon={<Mail className="w-4 h-4" />}
                                                error={!!errors.email}
                                                className={inputClassName}
                                                {...register('email')}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="password" className={labelClassName}>
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
                                                className={inputClassName}
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
                                                            <span className="text-[#8a4a14] font-medium">
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
                                                    className="text-sm text-[#8a4a14] hover:text-[#6b3b16] font-medium transition-colors whitespace-nowrap"
                                                >
                                                    Forgot Password?
                                                </Link>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl bg-neutral-900 text-white hover:bg-black"
                                            loading={isLoading}
                                        >
                                            SIGN IN
                                        </Button>
                                    </form>

                                    {selectedUserType !== 'admin' && (
                                        <div className="mt-6 text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Don&apos;t have an account?{' '}
                                                <Link
                                                    href={registerLink}
                                                    className="text-[#8a4a14] hover:text-[#6b3b16] font-semibold transition-colors"
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
                            </div>
                        </div>
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
                    <Button onClick={handleTermsAndPrivacyAccept} className="bg-neutral-900 text-white hover:bg-black">
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
