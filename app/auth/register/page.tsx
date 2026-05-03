"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Phone, Globe, BriefcaseBusiness } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import LoginIllustration from '../login/LoginIllustration'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

const userTypeOptions = [
    { value: 'student', label: 'Student', icon: User },
    { value: 'mentor', label: 'Mentor', icon: BriefcaseBusiness },
    { value: 'corporate', label: 'Corporate', icon: Building2 },
    { value: 'college', label: 'College', icon: GraduationCap },
]

type RegisterFormData = {
    email: string
    password: string
    confirmPassword?: string
    user_type?: UserType
    name?: string
    phone?: string
    institution?: string
    current_role?: string
    experience_years?: number
    expertise_areas?: string
    motivation?: string
    company_name?: string
    website_url?: string
    contact_person?: string
    college_name?: string
    contact_person_name?: string
}

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
        if (type && ['student', 'mentor', 'corporate', 'college'].includes(type)) {
            setSelectedUserType(type)
        }
    }, [searchParams])

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterFormData>({
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

    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords don't match")
            return
        }
        setIsLoading(true)
        try {
            const registerData = { ...data }
            delete registerData.confirmPassword

            switch (selectedUserType) {
                case 'student':
                    await apiClient.registerStudent(registerData)
                    break
                case 'corporate':
                    await apiClient.registerCorporate(registerData)
                    break
                case 'mentor':
                    await apiClient.registerMentor({
                        ...registerData,
                        expertise_areas: data.expertise_areas
                            ? data.expertise_areas.split(',').map((item) => item.trim()).filter(Boolean)
                            : [],
                        experience_years: data.experience_years ? Number(data.experience_years) : undefined,
                    })
                    break
                case 'college':
                    await apiClient.registerCollege(registerData)
                    break
                default:
                    throw new Error('Invalid user type')
            }

            toast.success('Registration successful! Logging you in...')

            try {
                const loginResponse = await apiClient.login({
                    email: data.email,
                    password: data.password
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

                const redirectUrl = searchParams.get('redirect')
                if (redirectUrl) {
                    router.push(decodeURIComponent(redirectUrl))
                    return
                }

                switch (selectedUserType) {
                    case 'student': router.push('/dashboard/student/profile'); break
                    case 'mentor': router.push('/dashboard/mentor'); break
                    case 'corporate': router.push('/dashboard/corporate'); break
                    case 'college': router.push('/dashboard/college'); break
                    default: router.push('/dashboard')
                }
            } catch {
                router.push(`/auth/login`)
            }
        } catch (error: unknown) {
            const response = typeof error === 'object' && error !== null && 'response' in error
                ? (error as { response?: { data?: { detail?: string } } }).response
                : undefined
            const message = response?.data?.detail || 'Registration failed. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const labelClassName = "mb-1 block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-[#A8B3CF]"
    const inputClassName = "mt-1 h-12 rounded-lg bg-white dark:bg-[#17213F] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9AA8C8] border border-gray-200 dark:border-[#2A375E] focus:border-[#7199D6] dark:focus:border-[#7199D6] focus:ring-1 focus:ring-[#7199D6]"

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

    const renderMentorForm = () => (
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
                <label className={labelClassName}>Current Role</label>
                <Input
                    id="current_role"
                    placeholder="Principal Engineer, Data Scientist..."
                    leftIcon={<BriefcaseBusiness className="w-4 h-4" />}
                    className={inputClassName}
                    {...register('current_role')}
                />
            </div>
            <div>
                <label className={labelClassName}>Years of Experience</label>
                <Input
                    id="experience_years"
                    type="number"
                    placeholder="e.g. 12"
                    className={inputClassName}
                    {...register('experience_years')}
                />
            </div>
            <div>
                <label className={labelClassName}>Expertise Areas</label>
                <Input
                    id="expertise_areas"
                    placeholder="Cloud, DevOps, AI, Communication"
                    className={inputClassName}
                    {...register('expertise_areas')}
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
            <div>
                <label className={labelClassName}>Why Mentor on DishaSetu?</label>
                <Input
                    id="motivation"
                    placeholder="Share your mentoring motivation"
                    className={inputClassName}
                    {...register('motivation')}
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
            case 'mentor': return renderMentorForm()
            case 'corporate': return renderCorporateForm()
            case 'college': return renderCollegeForm()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4fc] dark:bg-[#0A1020] p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[1000px] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#243056] shadow-2xl bg-white dark:bg-[#121C46] grid lg:grid-cols-2 min-h-[330px]"
            >
                {/* LEFT SIDE (REGISTER FORM) */}
                <div className="p-8 md:p-10 flex flex-col bg-white dark:bg-[#121C46] overflow-y-auto max-h-[85vh]">
                    <div className="w-full max-w-md mx-auto my-auto">
                        {/* Header Area */}
                        <div className="mb-6 flex flex-col items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-[#7199D6] dark:text-[#7199D6] mb-5">
                                <span className="w-10 h-10 rounded-full bg-[#7199D6] dark:bg-[#7199D6] flex items-center justify-center text-white">
                                    <Image src={`/images/dishasetu_logo.png`} width={16} height={16} alt="icon" />
                                </span>
                                Dishasetu
                            </h2>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create your account
                            </h1>
                            <p className="text-gray-500 dark:text-[#D5DCEF] mt-1 text-sm text-center">
                                Fill in your details to start your professional transformation.
                            </p>
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

                                    {/* Email & Password Section */}
                                    <div className="border-t border-gray-200 pt-6 space-y-4 dark:border-[#31406B]">
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
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 dark:text-[#9AA8C8] hover:text-gray-800 dark:hover:text-white">
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                }
                                                error={!!errors.password}
                                                className={inputClassName}
                                                {...register('password', { required: 'Password is required' })}
                                            />
                                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-[#8F9BC0]">Minimum 8 characters with uppercase, number & special character</p>
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Confirm Password *</label>
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your password"
                                                leftIcon={<Lock className="w-4 h-4" />}
                                                rightIcon={
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 dark:text-[#9AA8C8] hover:text-gray-800 dark:hover:text-white">
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

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-lg bg-[#7199D6] text-white hover:bg-[#5C86C9] dark:bg-[#7199D6] dark:hover:bg-[#5C86C9] mt-5 font-medium tracking-wide shadow-md transition-all"
                                        loading={isLoading}
                                    >
                                        Aage Badhein →
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600 dark:text-[#A8B3CF]">
                                        Already have an account?{' '}
                                        <Link
                                            href={`/auth/login`}
                                            className="text-[#7199D6] dark:text-[#7199D6] font-bold hover:underline"
                                        >
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE (ILLUSTRATION) */}
                        <LoginIllustration />
                </motion.div>
            </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    )
}
