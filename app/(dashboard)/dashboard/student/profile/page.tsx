"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Mail,
    Phone,
    FileText,
    UploadCloud,
    CheckCircle2,
    Save,
    Link as LinkIcon,
    GraduationCap,
    BookOpen,
    Code2,
    Globe,
    Github,
    Linkedin,
    AlertCircle,
    X,
    Calendar,
    MapPin,
    Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function StudentProfile() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [profileData, setProfileData] = useState<any>({})
    const [showNudge, setShowNudge] = useState(false)

    // Resume Upload States
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setIsLoading(true)
            const data = await apiClient.getStudentProfile()
            setProfileData(data ?? {})
            if (!data?.institution || !data?.degree || !data?.technical_skills) {
                setShowNudge(true)
            }
        } catch (error: any) {
            console.error("Error fetching profile:", error)
            const status = error?.response?.status
            const isNetworkError = error?.message === 'Network Error' || !error?.response
            const fallback = user?.email ? { email: user.email } : {}
            setProfileData(fallback)
            if (status === 404) {
                toast("No profile yet—fill the form and save.", { icon: "📝" })
            } else if (isNetworkError) {
                toast.error("Cannot reach backend. Start it on port 8000: in server folder run run.bat", { id: "profile-load-error", duration: 6000 })
            } else {
                toast.error("Failed to load profile data.", { id: "profile-load-error" })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setProfileData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true)
            await apiClient.updateStudentProfile(profileData)
            toast.success("Profile updated successfully!")
            setShowNudge(false)
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setResumeFile(file)
        setIsUploading(true)
        setUploadSuccess(false)

        try {
            const formData = new FormData()
            formData.append("resume", file)

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
            const response = await fetch(`${apiUrl}/student/upload-resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Upload failed")
            }

            const data = await response.json()
            toast.success("Resume uploaded successfully!")
            setProfileData((prev: any) => ({ ...prev, resume_url: data.url }))
            setIsUploading(false)
            setUploadSuccess(true)
        } catch (error: any) {
            console.error("Error uploading resume:", error)
            toast.error(error.message || "Failed to upload resume")
            setIsUploading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#ee8c2b] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="w-full font-sans text-[#1b140d] dark:text-gray-100">
            {/* Profile Completeness Nudge */}
            <AnimatePresence>
                {showNudge && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-6 overflow-hidden"
                    >
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-amber-800 dark:text-amber-200">Complete your profile</p>
                                    <p className="text-sm text-amber-700/80 dark:text-amber-400/80">A complete profile increases your chances of getting hired by 3x!</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNudge(false)} className="text-amber-400 hover:text-amber-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Student Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your details and professional information</p>
                </div>
                <Button 
                    onClick={handleSaveProfile} 
                    loading={isSaving}
                    className="bg-[#ee8c2b] hover:bg-[#d57a22] text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-[#ee8c2b]/20 flex items-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column - Forms */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Personal Details */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 dark:bg-[#221910] dark:border-gray-800">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                                <div className="relative">
                                    <Input 
                                        name="name"
                                        value={profileData.name || ''}
                                        onChange={handleInputChange}
                                        className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address (Read-only)</label>
                                <Input 
                                    value={profileData.email || ''}
                                    readOnly
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-100 dark:bg-black/40 text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                                <Input 
                                    name="phone"
                                    value={profileData.phone || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Date of Birth</label>
                                <Input 
                                    type="date"
                                    name="dob"
                                    value={profileData.dob || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Short Bio</label>
                            <textarea 
                                name="bio"
                                value={profileData.bio || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] transition-all"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 dark:bg-[#221910] dark:border-gray-800">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            Academic Background
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Institution / College</label>
                                <Input 
                                    name="institution"
                                    value={profileData.institution || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                    placeholder="Enter your college name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Degree</label>
                                <Input 
                                    name="degree"
                                    value={profileData.degree || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                    placeholder="e.g. B.Tech, MBA"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Branch / Specialization</label>
                                <Input 
                                    name="branch"
                                    value={profileData.branch || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                    placeholder="e.g. Computer Science"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Graduation Year</label>
                                <Input 
                                    type="number"
                                    name="graduation_year"
                                    value={profileData.graduation_year || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                    placeholder="2025"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">B.Tech CGPA</label>
                                <Input 
                                    type="number"
                                    step="0.01"
                                    name="btech_cgpa"
                                    value={profileData.btech_cgpa || ''}
                                    onChange={handleInputChange}
                                    className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills & Experience */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 dark:bg-[#221910] dark:border-gray-800">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                                <Code2 className="w-5 h-5" />
                            </div>
                            Skills & Professional Details
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Technical Skills</label>
                                <textarea 
                                    name="technical_skills"
                                    value={profileData.technical_skills || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] transition-all"
                                    placeholder="React, Node.js, Python, SQL..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Soft Skills</label>
                                <textarea 
                                    name="soft_skills"
                                    value={profileData.soft_skills || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] transition-all"
                                    placeholder="Communication, Leadership, Teamwork..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Industry</label>
                                    <Input 
                                        name="preferred_industry"
                                        value={profileData.preferred_industry || ''}
                                        onChange={handleInputChange}
                                        className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                        placeholder="e.g. Fintech, Healthcare"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Roles of Interest</label>
                                    <Input 
                                        name="job_roles_of_interest"
                                        value={profileData.job_roles_of_interest || ''}
                                        onChange={handleInputChange}
                                        className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:bg-black/20"
                                        placeholder="e.g. SDE, Data Analyst"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Internship Experience</label>
                                <textarea 
                                    name="internship_experience"
                                    value={profileData.internship_experience || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] transition-all"
                                    placeholder="Describe your past internships..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Secondary Actions */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    
                    {/* Professional Links */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 dark:bg-[#221910] dark:border-gray-800">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                             <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            Professional Links
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                    <Linkedin className="w-4 h-4 text-[#0077b5]" /> LinkedIn
                                </div>
                                <Input 
                                    name="linkedin_profile"
                                    value={profileData.linkedin_profile || ''}
                                    onChange={handleInputChange}
                                    placeholder="linkedin.com/in/username"
                                    className="rounded-xl border-gray-100 bg-gray-50 dark:bg-black/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                    <Github className="w-4 h-4 text-black dark:text-white" /> GitHub
                                </div>
                                <Input 
                                    name="github_profile"
                                    value={profileData.github_profile || ''}
                                    onChange={handleInputChange}
                                    placeholder="github.com/username"
                                    className="rounded-xl border-gray-100 bg-gray-50 dark:bg-black/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                    <Globe className="w-4 h-4 text-emerald-500" /> Portfolio Website
                                </div>
                                <Input 
                                    name="personal_website"
                                    value={profileData.personal_website || ''}
                                    onChange={handleInputChange}
                                    placeholder="yourwebsite.com"
                                    className="rounded-xl border-gray-100 bg-gray-50 dark:bg-black/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resume Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 dark:bg-[#221910] dark:border-gray-800">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            Resume
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Upload your latest resume (PDF/DOCX)</p>

                        {profileData.resume_url && (
                            <div className="mb-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Current Resume</p>
                                        <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Document</a>
                                    </div>
                                </div>
                                <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#ee8c2b]">
                                    <LinkIcon className="w-4 h-4" />
                                </a>
                            </div>
                        )}

                        <label className={`relative flex flex-col items-center justify-center w-full h-40 border-2 ${uploadSuccess ? 'border-green-500 bg-green-50/20' : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20'} rounded-2xl cursor-pointer hover:border-[#ee8c2b] transition-all overflow-hidden group`}>
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                {isUploading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-3 border-[#ee8c2b] border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-xs font-bold text-[#ee8c2b]">Uploading...</p>
                                    </div>
                                ) : uploadSuccess ? (
                                    <>
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-green-600">Updated Successfully!</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#ee8c2b] transition-colors mb-2" />
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Click to upload resume</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={isUploading} />
                        </label>
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="bg-gradient-to-br from-[#1b140d] to-[#3d2e1f] rounded-3xl p-8 text-white shadow-xl">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-[#ee8c2b]" />
                            Career Insight
                        </h4>
                        <p className="text-sm text-gray-300 mb-6">Your profile is seen by over <span className="text-[#ee8c2b] font-bold">50+ recruitment partners</span> on DishaSetu.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Profile Strength</span>
                                <span className={`${showNudge ? 'text-orange-400' : 'text-green-400'} font-bold`}>{showNudge ? '40%' : '100%'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: showNudge ? '40%' : '100%' }}
                                    className={`h-full ${showNudge ? 'bg-orange-500' : 'bg-green-500'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Float save button for mobile */}
            <div className="fixed bottom-6 right-6 md:hidden z-50">
                <Button 
                    onClick={handleSaveProfile}
                    loading={isSaving}
                    className="bg-[#ee8c2b] hover:bg-[#d57a22] text-white rounded-full h-14 w-14 p-0 shadow-2xl flex items-center justify-center"
                >
                    <Save className="w-6 h-6" />
                </Button>
            </div>
        </div>
    )
}
