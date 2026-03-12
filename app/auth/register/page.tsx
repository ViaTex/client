"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, Phone, Globe, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const emailSchema = z.string().email('Please enter a valid email address')

const baseSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    user_type: z.enum(['student', 'corporate', 'college'] as const),
})

const userTypeOptions = [
    { value: 'student', label: 'Student', icon: User },
    { value: 'corporate', label: 'Corporate', icon: Building2 },
    { value: 'college', label: 'College', icon: GraduationCap },
]

function RegisterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')

    useEffect(() => {
        const hasRedirectUrl = searchParams.get('redirect')
        if (!hasRedirectUrl) redirectIfAuthenticated()
    }, [redirectIfAuthenticated, searchParams])

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        if (type && ['student', 'corporate', 'college'].includes(type)) {
            setSelectedUserType(type)
        }
    }, [searchParams])

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>({
        defaultValues: { user_type: selectedUserType }
    })

    const handleUserTypeChange = (value: string) => {
        const userType = value as UserType
        setSelectedUserType(userType)
        reset()
        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/register?type=${userType}&redirect=${redirectUrl}`
            : `/auth/register?type=${userType}`
        router.replace(newUrl)
    }

    const onSubmit = async (data: any) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords don't match")
            return
        }
        setIsLoading(true)
        try {
            let response: any
            const { confirmPassword, ...registerData } = data

            switch (selectedUserType) {
                case 'student':
                    response = await apiClient.registerStudent(registerData)
                    break
                case 'corporate':
                    response = await apiClient.registerCorporate(registerData)
                    break
                case 'college':
                    response = await apiClient.registerCollege(registerData)
                    break
                default:
                    throw new Error('Invalid user type')
            }

            toast.success('Registration successful! Logging you in...')

            try {
                const loginResponse = await apiClient.login({
                    email: data.email,
                    password: data.password,
                    user_type: selectedUserType
                })
                apiClient.setAuthTokens(loginResponse.access_token, loginResponse.refresh_token)
                login(
                    {
                        id: loginResponse.user_id || 'temp-id',
                        email: data.email,
                        user_type: selectedUserType,
                        name: loginResponse.name || data.name || data.company_name || data.college_name || data.email
                    },
                    loginResponse.access_token,
                    loginResponse.refresh_token
                )

                let redirectUrl = searchParams.get('redirect')
                if (redirectUrl) {
                    router.push(decodeURIComponent(redirectUrl))
                    return
                }

                switch (selectedUserType) {
                    case 'student': router.push('/dashboard/student/profile'); break
                    case 'corporate': router.push('/dashboard/corporate'); break
                    case 'college': router.push('/dashboard/college'); break
                    default: router.push('/dashboard')
                }
            } catch {
                router.push(`/auth/login?type=${selectedUserType}&registered=true`)
            }
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Registration failed. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const renderStudentForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                <Input id="name" placeholder="Enter your full name" leftIcon={<User className="w-4 h-4" />} {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <Input id="phone" type="tel" placeholder="Enter phone number" leftIcon={<Phone className="w-4 h-4" />} {...register('phone')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
                <Input id="institution" placeholder="Your college or institution" leftIcon={<GraduationCap className="w-4 h-4" />} {...register('institution')} />
            </div>
        </div>
    )

    const renderCorporateForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
                <Input id="company_name" placeholder="Enter company name" leftIcon={<Building2 className="w-4 h-4" />} {...register('company_name', { required: 'Company name is required' })} />
                {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name.message as string}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website URL</label>
                <Input id="website_url" placeholder="https://company.com" leftIcon={<Globe className="w-4 h-4" />} {...register('website_url')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
                <Input id="contact_person" placeholder="Contact person name" leftIcon={<User className="w-4 h-4" />} {...register('contact_person')} />
            </div>
        </div>
    )

    const renderCollegeForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">College Name *</label>
                <Input id="college_name" placeholder="Enter college name" leftIcon={<GraduationCap className="w-4 h-4" />} {...register('college_name', { required: 'College name is required' })} />
                {errors.college_name && <p className="mt-1 text-sm text-red-600">{errors.college_name.message as string}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website URL</label>
                <Input id="website_url" placeholder="https://college.edu" leftIcon={<Globe className="w-4 h-4" />} {...register('website_url')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person Name</label>
                <Input id="contact_person_name" placeholder="Authorized contact person" leftIcon={<User className="w-4 h-4" />} {...register('contact_person_name')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <Input id="phone" type="tel" placeholder="Enter phone number" leftIcon={<Phone className="w-4 h-4" />} {...register('phone')} />
            </div>
        </div>
    )

    const renderFormFields = () => {
        switch (selectedUserType) {
            case 'student': return renderStudentForm()
            case 'corporate': return renderCorporateForm()
            case 'college': return renderCollegeForm()
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
                    className="max-w-2xl mx-auto"
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Create Your {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)} Account
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Join DishaSetu and start your journey today
                        </p>
                    </div>

                    {/* User Type Selector */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I am a</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Dynamic Form Fields */}
                            <motion.div
                                key={selectedUserType}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderFormFields()}
                            </motion.div>

                            {/* Email & Password */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        leftIcon={<Mail className="w-4 h-4" />}
                                        error={!!errors.email}
                                        {...register('email', { required: 'Email is required' })}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        leftIcon={<Lock className="w-4 h-4" />}
                                        rightIcon={
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                        error={!!errors.password}
                                        {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>}
                                    <p className="mt-1 text-xs text-gray-500">Min 8 chars, uppercase, digit, and special character</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        leftIcon={<Lock className="w-4 h-4" />}
                                        rightIcon={
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                        error={!!errors.confirmPassword}
                                        {...register('confirmPassword', { required: 'Please confirm your password' })}
                                    />
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message as string}</p>}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                loading={isLoading}
                            >
                                Sign Up
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
