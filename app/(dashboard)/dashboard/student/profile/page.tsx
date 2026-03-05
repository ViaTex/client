"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
    User,
    Mail,
    Phone,
    FileText,
    UploadCloud,
    CheckCircle2,
    Save,
    Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StudentProfile() {
    const { user } = useAuth()

    // Form States
    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || 'Aryan')
    const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || 'Sharma')
    const [email, setEmail] = useState(user?.email || 'aryan.sharma@example.com')
    const [phone, setPhone] = useState('+91 9876543210')
    const [bio, setBio] = useState('Passionate frontend developer eager to learn and grow.')

    // Resume Upload States
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    // Fake upload to backend where python cloudinary code expects the file
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
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Upload failed")
            }

            const data = await response.json()
            console.log("Uploaded successfully:", data.url)

            setIsUploading(false)
            setUploadSuccess(true)
        } catch (error) {
            console.error("Error uploading resume:", error)
            alert("Failed to upload resume. Please check your connection and Cloudinary keys.")
            setIsUploading(false)
        }
    }

    const handleSaveProfile = () => {
        // Implement save profile details logic here
        alert("Profile details saved successfully!")
    }

    return (
        <div className="w-full font-sans text-[#1b140d] dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column - Personal Information */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="w-6 h-6 text-[#ee8c2b]" />
                            Personal Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-black/20 text-[#1b140d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-black/20 text-[#1b140d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-black/40 text-gray-500 dark:text-gray-400 cursor-not-allowed focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-black/20 text-[#1b140d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-black/20 text-[#1b140d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee8c2b] focus:border-transparent transition-all"
                            />
                        </div>

                        <button onClick={handleSaveProfile} className="flex items-center justify-center gap-2 bg-[#1b140d] dark:bg-white text-white dark:text-[#1b140d] px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all w-full sm:w-auto">
                            <Save className="w-5 h-5" />
                            Save Profile
                        </button>

                    </motion.div>
                </div>

                {/* Right Column - Resume & Documents */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:bg-[#221910] dark:border-gray-800"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-[#ee8c2b]" />
                            Resume Upload
                        </h3>

                        <p className="text-sm text-gray-500 mb-6">
                            Upload your latest resume to apply for internships and let companies discover your true potential.
                        </p>

                        {/* Upload Dropzone */}
                        <label className={`relative flex flex-col items-center justify-center w-full h-48 border-2 ${uploadSuccess ? 'border-green-500 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10' : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-gray-800/50'} rounded-2xl cursor-pointer transition-all overflow-hidden group`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                {isUploading ? (
                                    <>
                                        <div className="w-10 h-10 border-4 border-[#ee8c2b]/30 border-t-[#ee8c2b] rounded-full animate-spin mb-3"></div>
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Uploading to Cloudinary...</p>
                                    </>
                                ) : uploadSuccess ? (
                                    <>
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-3">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-semibold text-green-600 dark:text-green-500">Upload Successful!</p>
                                        <p className="text-xs text-green-500/80 mt-1 truncate max-w-[200px]">{resumeFile?.name}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-[#ee8c2b]/10 text-[#ee8c2b] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold text-[#ee8c2b]">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">PDF, DOCX (MAX. 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                disabled={isUploading}
                            />
                        </label>

                        {/* Current Resume Status (Optional view) */}
                        {uploadSuccess && (
                            <div className="mt-6 flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate text-[#1b140d] dark:text-white">Aryan_Sharma_Resume_Latest.pdf</p>
                                        <p className="text-xs text-gray-500">Updated just now</p>
                                    </div>
                                </div>
                                <button className="text-[#ee8c2b] hover:text-[#c5661a] transition-colors p-2">
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                    </motion.div>
                </div>

            </div>
        </div>
    )
}
