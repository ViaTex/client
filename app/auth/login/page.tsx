"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, BriefcaseBusiness, X } from 'lucide-react'
import { PiCompassRoseFill } from "react-icons/pi";
import Link from 'next/link'
import LoginIllustration from './LoginIllustration'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth.service'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>



function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

    const userTypeOptions = [
        { value: 'student', label: 'Student', icon: User },
        { value: 'mentor', label: 'Mentor', icon: BriefcaseBusiness },
        { value: 'corporate', label: 'Corporate', icon: Building2 },
        { value: 'college', label: 'College', icon: GraduationCap },
    ]

    useEffect(() => {
        const hasRedirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' && localStorage.getItem('redirect_after_login'))
        if (!hasRedirectUrl) {
            redirectIfAuthenticated()
        }
    }, [redirectIfAuthenticated, searchParams])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const emailValue = watch("email")
    const passwordValue = watch("password")
    const baseInputClassName = "mt-2 h-12 rounded-xl bg-gray-100 dark:bg-[#17213F] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9AA8C8] border border-transparent focus:border-[#7C3AED]"
    const filledInputClassName = "bg-[#DCE7F9] dark:bg-[#344670]"

    useEffect(() => {
        const registered = searchParams.get('registered')

        if (registered === 'true') {
            toast.success('Registration successful! Please log in to continue.')
        }
    }, [searchParams])

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await authService.login(data)

            authService.setTokens(response.access_token, response.refresh_token)

            // Use user_type from backend response
            const userType = (response.user_type || 'student') as UserType

            login({
                id: response.user_id || 'temp-id',
                email: data.email,
                user_type: userType,
                name: response.name || data.email
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

            // Redirect based on backend user_type response
            switch (userType) {
                case 'student':
                    router.push('/dashboard/student')
                    break
                case 'mentor':
                    router.push('/dashboard/mentor')
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
                const data = error.response.data?.data

                if (status === 401) {
                    message = 'Invalid password. Please try again.'
                } else if (status === 404) {
                    message = 'This email is not registered. Please create an account first.'
                } else if (status === 400) {
                    message = detail || 'Invalid login request.'
                } else if (status === 422) {
                    // Validation error - extract meaningful message
                    if (data && Array.isArray(data)) {
                        message = data[0]?.msg || 'Invalid request. Please check your email and password.'
                    } else if (detail) {
                        message = detail
                    } else {
                        message = 'Invalid email or password.'
                    }
                } else {
                    message = detail || message
                }
            }

            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4fc] dark:bg-[#0A1020] p-4 md:p-8">
            <div className="w-full max-w-[1000px] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#243056] shadow-2xl bg-white dark:bg-[#121C46] grid lg:grid-cols-2 min-h-[330px]">

                {/* LEFT SIDE (LOGIN FORM) */}
                <div className="p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-[#121C46]">
                    <div className="w-full max-w-md mx-auto">

                        {/* Header Area */}
                        <div className="mb-6 flex flex-col items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-[#7199D6] dark:text-[#7199D6] mb-5">
                                <span className="w-10 h-10 rounded-full bg-[#7199D6] dark:bg-[#7199D6] flex items-center justify-center text-white">
                                    <Image src={`/images/dishasetu_logo.png`} width={16} height={16} alt="icon" />
                                </span>
                                Dishasetu
                            </h2>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome Back!
                            </h1>
                            <p className="text-gray-500 dark:text-[#D5DCEF] mt-1 text-sm">
                                Sign in by entering the information below
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* EMAIL */}
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Email Address (e.g. email@example.com)"
                                    className={`mt-2 h-12 rounded-lg bg-white dark:bg-[#17213F] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9AA8C8] border-gray-200 dark:border-[#2A375E] focus:border-[#7199D6] dark:focus:border-[#7199D6] focus:ring-1 focus:ring-[#7199D6] ${emailValue ? filledInputClassName : ""}`}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (••••••••••••)"
                                    className={`mt-2 h-12 rounded-lg bg-white dark:bg-[#17213F] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9AA8C8] border-gray-200 dark:border-[#2A375E] focus:border-[#7199D6] dark:focus:border-[#7199D6] focus:ring-1 focus:ring-[#7199D6] ${passwordValue ? filledInputClassName : ""}`}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                            suppressHydrationWarning
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    }
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* REMEMBER ME & FORGOT PASSWORD */}
                            <div className="flex justify-between items-center pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#7199D6] focus:ring-[#7199D6]" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-[#9AA8C8]">Remember me</span>
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs font-medium text-gray-500 dark:text-[#9AA8C8] hover:text-[#7199D6] dark:hover:text-[#7199D6]"
                                >
                                    Forgotten Password?
                                </Link>
                            </div>

                            {/* LOGIN BUTTON */}
                            <Button
                                type="submit"
                                loading={isLoading}
                                className="w-full h-12 rounded-lg bg-[#7199D6] text-white hover:bg-[#5C86C9] dark:bg-[#7199D6] dark:hover:bg-[#5C86C9] mt-5 font-medium tracking-wide shadow-md transition-all"
                            >
                                Continue
                            </Button>
                        </form>

                        {/* SOCIAL LOGIN */}
                        <div className="my-5 flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-[#31406B]" />
                            <span className="text-xs font-medium text-gray-400 dark:text-[#A5B0CD]">
                                OR
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-[#31406B]" />
                        </div>

                        <div className="flex justify-center gap-8 mb-5">
                            {/* Facebook Button */}
                            <button
                                type="button"
                                className="flex flex-col items-center gap-2"
                                suppressHydrationWarning
                            >
                                <div className="w-14 h-14 rounded-full border border-gray-100 dark:border-[#31406B] flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1877F2]" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-medium text-gray-500 dark:text-[#AAB5D1]">Facebook</span>
                            </button>

                            {/* Google Button */}
                            <button
                                type="button"
                                className="flex flex-col items-center gap-2"
                                suppressHydrationWarning
                            >
                                <div className="w-14 h-14 rounded-full border border-gray-100 dark:border-[#31406B] flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <svg
                                        viewBox="0 0 533.5 544.3"
                                        className="w-6 h-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4-50.4H272v95.4h146.9c-6.4 34.5-25.5 63.7-54.3 83.3v69.2h87.7c51.2-47.1 81-116.7 81-197.5z" />
                                        <path fill="#34A853" d="M272 544.3c73.5 0 135.4-24.5 180.5-66.7l-87.7-69.2c-24.5 16.5-55.7 26-92.8 26-71.4 0-132-48.2-153.6-113.1H27.7v70.9C72.6 486.7 167.7 544.3 272 544.3z" />
                                        <path fill="#FBBC05" d="M118.4 323.3c-9.7-28.8-9.7-59.9 0-88.7V163.7H27.7c-38.6 77.3-38.6 169.3 0 246.6z" />
                                        <path fill="#EA4335" d="M272 107.7c39.9 0 75.8 13.7 104.1 40.6l78.1-78.1C408.4 24.6 343.3 0 272 0 167.7 0 72.6 57.6 27.7 163.7l90.7 70.9C140 156 200.6 107.7 272 107.7z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-medium text-gray-500 dark:text-[#AAB5D1]">Google</span>
                            </button>
                        </div>

                        {/* REGISTER */}
                        <p className="text-center text-sm text-gray-500 dark:text-[#AAB5D1]">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => setIsRegisterModalOpen(true)}
                                className="text-[#7199D6] dark:text-[#7199D6] font-bold hover:underline"
                            >
                                Create Account
                            </button>
                        </p>

                        {/* FOOTER */}
                        <div className="mt-5 text-center">
                            <p className="text-[11px] text-gray-400">@2024 Dishasetu</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE (ILLUSTRATION) */}
                <LoginIllustration />

            </div>

            {/* REGISTER MODAL */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#121C46] rounded-2xl w-full max-w-md p-6 relative shadow-xl"
                    >
                        <button
                            onClick={() => setIsRegisterModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-[#9AA8C8] dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Join Dishasetu</h3>
                        <p className="text-sm text-gray-500 dark:text-[#D5DCEF] mb-6 text-center">Please select your role to continue</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {userTypeOptions.map((option) => {
                                const Icon = option.icon
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => router.push(`/auth/register?type=${option.value}`)}
                                        className="rounded-xl border border-gray-200 dark:border-[#31406B] px-4 py-6 transition-all duration-200 flex flex-col items-center space-y-3 hover:border-[#7199D6] dark:hover:border-[#7199D6] hover:bg-blue-50 dark:hover:bg-[#17213F] text-gray-600 dark:text-[#D3DCF6] hover:text-[#7199D6] dark:hover:text-[#7199D6]"
                                    >
                                        <Icon className="w-8 h-8" />
                                        <span className="text-sm font-semibold uppercase tracking-widest">{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            )}
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
