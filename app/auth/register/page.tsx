"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Phone, Globe, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent } from '@/components/ui/modal'
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
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)

    const termsVersion = 'v1'

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
        if (!termsAccepted) {
            toast.error('Please accept Terms & Policies to continue')
            return
        }
        setIsLoading(true)
        try {
            let response: any
            const { confirmPassword, ...registerData } = data
            registerData.has_accepted_terms = true
            registerData.accepted_terms_version = termsVersion

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

    const labelClassName = "block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300 mb-2"
    const inputClassName = "h-12 rounded-xl border-transparent bg-[#f6efe6] text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#8a4a14]/20 dark:bg-gray-800"

    const renderStudentForm = () => (
        <div className="space-y-4">
            <div>
                <label className={labelClassName}>Full Name *</label>
                <Input
                    id="name"
                    placeholder="Enter your full name"
                    leftIcon={<User className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>}
            </div>
            <div>
                <label className={labelClassName}>Phone Number</label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    leftIcon={<Phone className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('phone')}
                />
            </div>
            <div>
                <label className={labelClassName}>Institution</label>
                <Input
                    id="institution"
                    placeholder="Your college or institution"
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('institution')}
                />
            </div>
        </div>
    )

    const renderCorporateForm = () => (
        <div className="space-y-4">
            <div>
                <label className={labelClassName}>Company Name *</label>
                <Input
                    id="company_name"
                    placeholder="Enter company name"
                    leftIcon={<Building2 className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('company_name', { required: 'Company name is required' })}
                />
                {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name.message as string}</p>}
            </div>
            <div>
                <label className={labelClassName}>Website URL</label>
                <Input
                    id="website_url"
                    placeholder="https://company.com"
                    leftIcon={<Globe className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('website_url')}
                />
            </div>
            <div>
                <label className={labelClassName}>Contact Person</label>
                <Input
                    id="contact_person"
                    placeholder="Contact person name"
                    leftIcon={<User className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('contact_person')}
                />
            </div>
        </div>
    )

    const renderCollegeForm = () => (
        <div className="space-y-4">
            <div>
                <label className={labelClassName}>College Name *</label>
                <Input
                    id="college_name"
                    placeholder="Enter college name"
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('college_name', { required: 'College name is required' })}
                />
                {errors.college_name && <p className="mt-1 text-sm text-red-600">{errors.college_name.message as string}</p>}
            </div>
            <div>
                <label className={labelClassName}>Website URL</label>
                <Input
                    id="website_url"
                    placeholder="https://college.edu"
                    leftIcon={<Globe className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('website_url')}
                />
            </div>
            <div>
                <label className={labelClassName}>Contact Person Name</label>
                <Input
                    id="contact_person_name"
                    placeholder="Authorized contact person"
                    leftIcon={<User className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('contact_person_name')}
                />
            </div>
            <div>
                <label className={labelClassName}>Phone Number</label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    leftIcon={<Phone className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('phone')}
                />
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
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Fill in your details to start your professional transformation.
                                        </p>
                                    </div>

                                    {/* User Type Selector */}
                                    <div className="mb-6">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300 mb-3">I am a</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {userTypeOptions.map((option) => {
                                                const Icon = option.icon
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
                                        <div className="border-t border-amber-100 pt-6 space-y-4 dark:border-gray-700">
                                            <div>
                                                <label className={labelClassName}>Email Address *</label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter your email address"
                                                    leftIcon={<Mail className="w-4 h-4" />}
                                                    error={!!errors.email}
                                                    className={inputClassName}
                                                    {...register('email', { required: 'Email is required' })}
                                                />
                                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>}
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Password *</label>
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
                                                    className={inputClassName}
                                                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                                                />
                                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>}
                                                <p className="mt-1 text-xs text-gray-500">Min 8 chars, uppercase, digit, and special character</p>
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Confirm Password *</label>
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
                                                    className={inputClassName}
                                                    {...register('confirmPassword', { required: 'Please confirm your password' })}
                                                />
                                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message as string}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div
                                                className="cursor-pointer flex-1"
                                                onClick={() => setShowTermsModal(true)}
                                            >
                                                <Checkbox
                                                    id="terms-policies"
                                                    checked={termsAccepted}
                                                    onChange={() => setShowTermsModal(true)}
                                                    label={
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="text-[#8a4a14] font-medium">
                                                                I agree to Terms & Policies
                                                            </span>
                                                            {!termsAccepted && <span className="text-red-500 ml-1">*</span>}
                                                        </span>
                                                    }
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowTermsModal(true)}
                                                className="text-xs text-[#8a4a14] hover:text-[#6b3b16] font-semibold uppercase tracking-widest"
                                            >
                                                View
                                            </button>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl bg-neutral-900 text-white hover:bg-black"
                                            loading={isLoading}
                                        >
                                            CREATE ACCOUNT
                                        </Button>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Already have an account?{' '}
                                            <Link
                                                href={`/auth/login?type=${selectedUserType}`}
                                                className="text-[#8a4a14] hover:text-[#6b3b16] font-semibold"
                                            >
                                                Log in
                                            </Link>
                                        </p>
                                    </div>

                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-amber-100 dark:border-gray-700" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-4 font-semibold tracking-[0.2em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                                Or sign up with
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {['Google', 'GitHub', 'LinkedIn'].map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                className="flex items-center justify-center rounded-xl border border-amber-100 py-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-[#f6efe6] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Modal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title="Terms and Policies"
                maxWidth="2xl"
            >
                <TermsModalContent />
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={() => {
                            setTermsAccepted(true)
                            setShowTermsModal(false)
                        }}
                        className="bg-neutral-900 text-white hover:bg-black"
                    >
                        Accept Terms & Policies
                    </Button>
                </div>
            </Modal>
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
