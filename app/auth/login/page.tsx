"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { PiCompassRoseFill } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { BsPeopleFill } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

const fieldLabelClassName = "text-sm font-medium text-gray-600 dark:!text-[#7F8DB3]"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

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
            const response = await apiClient.login(data)

            apiClient.setAuthTokens(response.access_token, response.refresh_token)

            // Use user_type from backend response
            const userType = response.user_type || 'student'
            
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
        <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] dark:bg-[#0A1020] px-4">
            <div className="w-full max-w-6xl rounded-2xl overflow-hidden border border-gray-200 dark:border-[#243056] shadow-xl bg-white dark:bg-[#121C46] grid lg:grid-cols-2">

                {/* LEFT SIDE (BLUE PANEL) */}
                <div className="hidden lg:flex bg-[#2F3DBF] text-white p-10 flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <PiCompassRoseFill />
                            </span>
                            Dishasetu
                        </h2>

                        <h1 className="mt-10 text-4xl font-bold leading-tight">
                            Aapka Career,<br />Aapka Setu
                        </h1>

                        <p className="mt-5 max-w-sm text-white/90">
                            Your bridge to a premium career ecosystem.
                            Empowering talent through technology.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center -space-x-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                                <FaUsers className="text-white text-sm" />
                            </div>

                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                                <HiUserGroup className="text-white text-sm" />
                            </div>

                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                                <BsPeopleFill className="text-white text-sm" />
                            </div>
                        </div>

                        <p className="text-sm text-white/90">
                            Joined by 10k+ professionals
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE (LOGIN FORM) */}
                <div className="p-10 flex flex-col justify-center bg-white dark:bg-[#121C46]">
                    <div className="max-w-md mx-auto w-full">

                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome Back
                        </h2>

                        <p className="text-gray-500 dark:text-[#D5DCEF] mt-1 mb-8">
                            Log in to manage your career journey.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                            {/* EMAIL */}
                            <div>
                                <label className={fieldLabelClassName}>
                                    Phone Number/Email
                                </label>

                                <Input
                                    type="email"
                                    placeholder="Enter your phone or email"
                                    className={`${baseInputClassName} ${emailValue ? filledInputClassName : ""}`}
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
                                <div className="flex justify-between items-center">
                                    <label className={fieldLabelClassName}>
                                        Password
                                    </label>

                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm text-[#4F46E5] dark:text-[#6F52ED] font-medium hover:text-[#6366F1] dark:hover:text-[#A78BFA]"
                                    >
                                        Forgot?
                                    </Link>
                                </div>

                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className={`${baseInputClassName} ${passwordValue ? filledInputClassName : ""}`}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-500 dark:text-[#9AA8C8] hover:text-gray-800 dark:hover:text-white"
                                            suppressHydrationWarning
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
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

                            {/* LOGIN BUTTON */}
                            <Button
                                type="submit"
                                loading={isLoading}
                                className="w-full h-12 rounded-full bg-[#2536B8] text-white hover:bg-[#1F2FA2] dark:bg-[#2536B8] dark:hover:bg-[#1F2FA2]"
                            >
                                Aage Badhein →
                            </Button>
                        </form>

                        {/* SOCIAL LOGIN */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-[#31406B]" />
                            <span className="text-xs text-gray-400 dark:text-[#A5B0CD]">
                                OR CONTINUE WITH
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-[#31406B]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="border border-gray-200 dark:border-[#31406B] rounded-xl h-12 flex items-center justify-center gap-2 bg-white dark:bg-[#0C1430] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#111C3D] transition-colors"
                                suppressHydrationWarning
                            >
                                <svg
                                    viewBox="0 0 533.5 544.3"
                                    className="w-5 h-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4-50.4H272v95.4h146.9c-6.4 34.5-25.5 63.7-54.3 83.3v69.2h87.7c51.2-47.1 81-116.7 81-197.5z" />
                                    <path fill="#34A853" d="M272 544.3c73.5 0 135.4-24.5 180.5-66.7l-87.7-69.2c-24.5 16.5-55.7 26-92.8 26-71.4 0-132-48.2-153.6-113.1H27.7v70.9C72.6 486.7 167.7 544.3 272 544.3z" />
                                    <path fill="#FBBC05" d="M118.4 323.3c-9.7-28.8-9.7-59.9 0-88.7V163.7H27.7c-38.6 77.3-38.6 169.3 0 246.6z" />
                                    <path fill="#EA4335" d="M272 107.7c39.9 0 75.8 13.7 104.1 40.6l78.1-78.1C408.4 24.6 343.3 0 272 0 167.7 0 72.6 57.6 27.7 163.7l90.7 70.9C140 156 200.6 107.7 272 107.7z" />
                                </svg>
                                Google
                            </button>

                            <button
                                type="button"
                                className="rounded-xl h-12 flex items-center justify-center gap-2 bg-[#0077B5] text-white hover:bg-[#005582] transition-colors"
                                suppressHydrationWarning
                            >
                                <FaLinkedin className="text-white" />
                                LinkedIn
                            </button>
                        </div>

                        {/* REGISTER */}
                        <p className="text-center text-sm text-gray-500 dark:text-[#AAB5D1] mt-6">
                            Naya account chahiye?{" "}
                            <Link
                                href="/auth/register"
                                className="text-[#4F46E5] dark:text-[#6F52ED] font-semibold hover:text-[#6366F1] dark:hover:text-[#8B5CF6]"
                            >
                                Naya Account Banayein
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
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
