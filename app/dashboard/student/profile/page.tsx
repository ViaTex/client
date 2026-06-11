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
    Briefcase,
    Plus,
    Pencil,
    Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import ReactSelect, { components, OptionProps, SingleValue, StylesConfig } from 'react-select'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { studentService } from '@/services/student.service'

type ProjectStatus = 'completed' | 'in_progress'

type StudentProject = {
    id: string
    title: string
    description: string
    skills_used: string[]
    technologies_used: string[]
    start_date: string
    end_date: string
    project_url?: string
    github_url?: string
    demo_url?: string
    images: string[]
    status: ProjectStatus
}

type AchievementCategory = 'Certification' | 'Blog' | 'Research' | 'Other'

type CustomAchievement = {
    id: string
    title: string
    category: AchievementCategory
    description: string
    tags: string[]
    url?: string
    date: string
}

type EducationLevel = 'UG' | 'PG' | 'Diploma' | '12th' | '10th' | 'Other'

type StudentEducation = {
    id: string
    level: EducationLevel
    custom_level?: string
    institution: string
    start_date: string
    end_date: string
    score: string
    description: string
}

type WorkMode = 'onsite' | 'hybrid' | 'remote'
type ExperienceType = 'internship' | 'full_time' | 'other'

type ExperienceEntry = {
    id: string
    company_name: string
    role: string
    skills: string[]
    major_project: string
    start_date: string
    end_date: string
    work_mode: WorkMode
    experience_type: ExperienceType
}

type ExperienceGroups = {
    internship: ExperienceEntry[]
    full_time: ExperienceEntry[]
    other: ExperienceEntry[]
}

function generateId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (crypto as any).randomUUID() as string
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => Boolean(v))
}

function normalizeProjects(value: unknown): StudentProject[] {
    if (!Array.isArray(value)) return []
    return value
        .map((v: any) => ({
            id: typeof v?.id === 'string' ? v.id : generateId(),
            title: typeof v?.title === 'string' ? v.title : '',
            description: typeof v?.description === 'string' ? v.description : '',
            skills_used: normalizeStringArray(v?.skills_used ?? v?.skills),
            technologies_used: normalizeStringArray(v?.technologies_used ?? v?.technologies),
            start_date: typeof v?.start_date === 'string' ? v.start_date : '',
            end_date: typeof v?.end_date === 'string' ? v.end_date : '',
            project_url: typeof v?.project_url === 'string' ? v.project_url : '',
            github_url: typeof v?.github_url === 'string' ? v.github_url : '',
            demo_url: typeof v?.demo_url === 'string' ? v.demo_url : '',
            images: normalizeStringArray(v?.images ?? v?.project_images),
            status:
                v?.status === 'completed' || v?.status === 'Completed'
                    ? 'completed'
                    : v?.status === 'in_progress' || v?.status === 'In Progress'
                        ? 'in_progress'
                        : 'in_progress',
        }))
}

function normalizeAchievements(value: unknown): CustomAchievement[] {
    if (!Array.isArray(value)) return []
    return value
        .map((v: any) => ({
            id: typeof v?.id === 'string' ? v.id : generateId(),
            title: typeof v?.title === 'string' ? v.title : '',
            category: v?.category === 'Certification' || v?.category === 'Blog' || v?.category === 'Research' ? v.category : 'Other',
            description: typeof v?.description === 'string' ? v.description : '',
            tags: normalizeStringArray(v?.tags),
            url: typeof v?.url === 'string' ? v.url : '',
            date: typeof v?.date === 'string' ? v.date : '',
        }))
}

function normalizeEducation(value: unknown): StudentEducation[] {
    if (!Array.isArray(value)) return []
    return value.map((v: any) => ({
        id: typeof v?.id === 'string' ? v.id : generateId(),
        level: (v?.level === 'UG' || v?.level === 'PG' || v?.level === 'Diploma' || v?.level === '12th' || v?.level === '10th' || v?.level === 'Other')
            ? v.level
            : 'Other',
        custom_level: typeof v?.custom_level === 'string' ? v.custom_level : '',
        institution: typeof v?.institution === 'string' ? v.institution : '',
        start_date: typeof v?.start_date === 'string' ? v.start_date : '',
        end_date: typeof v?.end_date === 'string' ? v.end_date : '',
        score: typeof v?.score === 'string' || typeof v?.score === 'number' ? String(v.score) : '',
        description: typeof v?.description === 'string' ? v.description : '',
    }))
}

function normalizeCommaList(value: unknown): string[] {
    if (Array.isArray(value)) return normalizeStringArray(value)
    if (typeof value !== 'string') return []
    return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
}

function normalizeUrl(value?: string) {
    const trimmed = value?.trim()
    if (!trimmed) return ''
    if (/^(https?:\/\/|blob:)/i.test(trimmed)) return trimmed
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const backendBase = apiUrl.replace(/\/api\/v\d+\/?$/i, '').replace(/\/$/, '')
    if (trimmed.startsWith('/')) return `${backendBase}${trimmed}`
    if (/^(media|uploads?)\//i.test(trimmed)) return `${backendBase}/${trimmed}`
    return `https://${trimmed}`
}

function formatLabel(value?: string) {
    if (!value) return ''
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

function normalizeExperienceEntry(value: any, type: ExperienceType): ExperienceEntry {
    return {
        id: typeof value?.id === 'string' ? value.id : generateId(),
        company_name: typeof value?.company_name === 'string' ? value.company_name : '',
        role: typeof value?.role === 'string' ? value.role : '',
        skills: normalizeStringArray(value?.skills),
        major_project: typeof value?.major_project === 'string' ? value.major_project : '',
        start_date: typeof value?.start_date === 'string' ? value.start_date : '',
        end_date: typeof value?.end_date === 'string' ? value.end_date : '',
        work_mode: value?.work_mode === 'hybrid' || value?.work_mode === 'remote' ? value.work_mode : 'onsite',
        experience_type: value?.experience_type === 'internship' || value?.experience_type === 'full_time' || value?.experience_type === 'other'
            ? value.experience_type
            : type,
    }
}

function normalizeExperienceGroups(value: any): ExperienceGroups {
    const groups: ExperienceGroups = { internship: [], full_time: [], other: [] }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (Array.isArray(value.internship)) {
            groups.internship = value.internship.map((entry: any) => normalizeExperienceEntry(entry, 'internship'))
        }
        if (Array.isArray(value.full_time)) {
            groups.full_time = value.full_time.map((entry: any) => normalizeExperienceEntry(entry, 'full_time'))
        }
        if (Array.isArray(value.other)) {
            groups.other = value.other.map((entry: any) => normalizeExperienceEntry(entry, 'other'))
        }

        if (groups.internship.length || groups.full_time.length || groups.other.length) {
            return groups
        }
    }

    if (Array.isArray(value)) {
        value.forEach((entry) => {
            const type: ExperienceType = entry?.experience_type === 'internship' || entry?.experience_type === 'full_time' || entry?.experience_type === 'other'
                ? entry.experience_type
                : 'other'
            groups[type].push(normalizeExperienceEntry(entry, type))
        })
    }

    return groups
}

function hasExperienceContent(entry: ExperienceEntry) {
    return Boolean(
        entry.company_name.trim() ||
        entry.role.trim() ||
        entry.skills.length ||
        entry.major_project.trim() ||
        entry.start_date.trim() ||
        entry.end_date.trim()
    )
}

function flattenExperienceGroups(groups: ExperienceGroups): ExperienceEntry[] {
    return [
        ...groups.internship.map((entry) => ({ ...entry, experience_type: 'internship' as const })),
        ...groups.full_time.map((entry) => ({ ...entry, experience_type: 'full_time' as const })),
        ...groups.other.map((entry) => ({ ...entry, experience_type: 'other' as const })),
    ].filter(hasExperienceContent)
}

function hydrateDynamicSections(data: any) {
    return {
        ...(data ?? {}),
        education: normalizeEducation(data?.education),
        projects: normalizeProjects(data?.projects),
        custom_achievements: normalizeAchievements(data?.custom_achievements),
        experience: normalizeExperienceGroups(data?.experience),
    }
}

function hasEducationEntries(value: unknown) {
    if (!Array.isArray(value)) return false
    return value.some((entry: any) => Boolean(entry?.institution) && Boolean(entry?.level))
}

function hasNonEmptyValue(value: unknown) {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
}

function calculateProfileStrength(data: any) {
    const checks = [
        hasNonEmptyValue(data?.name) && hasNonEmptyValue(data?.phone) && hasNonEmptyValue(data?.bio),
        hasEducationEntries(data?.education),
        hasNonEmptyValue(data?.technical_skills),
        hasNonEmptyValue(data?.soft_skills),
        hasNonEmptyValue(data?.preferred_industry) && hasNonEmptyValue(data?.job_roles_of_interest),
        hasNonEmptyValue(data?.gender) && hasNonEmptyValue(data?.country) && hasNonEmptyValue(data?.state) && hasNonEmptyValue(data?.city),
        hasNonEmptyValue(data?.location_preferences) && hasNonEmptyValue(data?.language_proficiency),
        hasNonEmptyValue(data?.linkedin_profile) || hasNonEmptyValue(data?.github_profile) || hasNonEmptyValue(data?.personal_website),
        hasNonEmptyValue(data?.resume_url),
    ]
    const completed = checks.filter(Boolean).length
    return Math.round((completed / checks.length) * 100)
}

function TagInput({
    value,
    onChange,
    placeholder,
}: {
    value: string[]
    onChange: (next: string[]) => void
    placeholder?: string
}) {
    const [draft, setDraft] = useState('')

    const addFromDraft = () => {
        const parts = draft
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)

        if (!parts.length) return

        const next = [...value]
        for (const tag of parts) {
            if (!next.includes(tag)) next.push(tag)
        }
        onChange(next)
        setDraft('')
    }

    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag))
    }

    return (
        <div>
            <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        addFromDraft()
                    }
                }}
                onBlur={addFromDraft}
                placeholder={placeholder || 'Type and press Enter'}
                className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
            />
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-gray-400 hover:text-[#7C3AED] transition-colors"
                                aria-label={`Remove ${tag}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

function ReadonlyField({ value, placeholder }: { value?: string; placeholder?: string }) {
    const text = value?.trim()
    return (
        <div className="min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-[#31406B] dark:bg-[#0C1430] dark:text-gray-200">
            {text ? text : <span className="text-gray-400">{placeholder || 'Not set'}</span>}
        </div>
    )
}

function ReadonlyParagraph({ value, placeholder }: { value?: string; placeholder?: string }) {
    const text = value?.trim()
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-[#31406B] dark:bg-[#0C1430] dark:text-gray-200 whitespace-pre-wrap">
            {text ? text : <span className="text-gray-400">{placeholder || 'Not set'}</span>}
        </div>
    )
}

export default function StudentProfile() {
    const { user, checkAuthStatus } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState<any>({})
    const [showNudge, setShowNudge] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [educationDraft, setEducationDraft] = useState<StudentEducation | null>(null)
    const [editingEducationId, setEditingEducationId] = useState<string | null>(null)
    const [isEducationSaving, setIsEducationSaving] = useState(false)
    const [isAddingEducation, setIsAddingEducation] = useState(false)

    // Resume Upload States
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const profileStrength = calculateProfileStrength(profileData)

    useEffect(() => {
        fetchProfile()
    }, [])

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'))
    }, [])

    const fetchProfile = async () => {
        try {
            setIsLoading(true)
            const data = await studentService.getProfile()
            const hydrated = hydrateDynamicSections(data ?? {})
            setProfileData(hydrateDynamicSections(data ?? {}))
            setShowNudge(calculateProfileStrength(hydrated) < 100)
        } catch (error: any) {
            console.error("Error fetching profile:", error)
            const status = error?.response?.status
            const isTimeout = error?.code === 'ECONNABORTED'
            const isNetworkError = error?.message === 'Network Error' || !error?.response
            const fallback = user?.email ? { email: user.email } : {}
            setProfileData(hydrateDynamicSections(fallback))
            if (status === 404) {
                toast("No profile yet—fill the form and save.", { icon: "📝" })
            } else if (isTimeout) {
                toast.error("Profile request timed out. Check backend and database connectivity.", { id: "profile-load-error", duration: 6000 })
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
            const { experience, ...payload } = profileData || {}
            const experiencePayload = flattenExperienceGroups(normalizeExperienceGroups(experience))
            const updated = await studentService.updateProfile({ ...payload, experience: experiencePayload })
            const hydrated = hydrateDynamicSections(updated ?? { ...payload, experience: experiencePayload })
            setProfileData(hydrateDynamicSections(updated ?? { ...payload, experience: experiencePayload }))
            toast.success("Profile updated successfully!")
            setShowNudge(calculateProfileStrength(hydrated) < 100)
            setIsEditing(false)
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
            formData.append("file", file)

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
            const response = await fetch(`${apiUrl}/student/resume/upload`, {
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
            const resumeUrl = data.resume_url || data.url
            if (!resumeUrl) {
                throw new Error("Resume uploaded, but no resume URL was returned")
            }
            toast.success("Resume uploaded successfully!")
            setProfileData((prev: any) => {
                const next = { ...prev, resume_url: resumeUrl }
                setShowNudge(calculateProfileStrength(next) < 100)
                return next
            })
            setIsUploading(false)
            setUploadSuccess(true)
        } catch (error: any) {
            console.error("Error uploading resume:", error)
            toast.error(error.message || "Failed to upload resume")
            setIsUploading(false)
        }
    }

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingPhoto(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
            const response = await fetch(`${apiUrl}/student/profile-picture/upload`, {
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
            const profilePictureUrl = data.profile_picture_url || data.url
            if (!profilePictureUrl) {
                throw new Error("Profile picture uploaded, but no image URL was returned")
            }
            toast.success("Profile picture updated successfully!")
            
            setProfileData((prev: any) => ({ ...prev, profile_picture_url: profilePictureUrl }))
            
            const cachedUserRaw = localStorage.getItem('user_data')
            if (cachedUserRaw) {
                const cachedUser = JSON.parse(cachedUserRaw)
                cachedUser.profile_picture_url = profilePictureUrl
                localStorage.setItem('user_data', JSON.stringify(cachedUser))
            }
            
            if (checkAuthStatus) {
                checkAuthStatus()
            }
        } catch (error: any) {
            console.error("Error uploading profile picture:", error)
            toast.error(error.message || "Failed to upload profile picture")
        } finally {
            setIsUploadingPhoto(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const projects: StudentProject[] = normalizeProjects(profileData?.projects)
    const achievements: CustomAchievement[] = normalizeAchievements(profileData?.custom_achievements)
    const educationEntries: StudentEducation[] = normalizeEducation(profileData?.education)
    const experienceGroups: ExperienceGroups = normalizeExperienceGroups(profileData?.experience)
    const languageTags = normalizeCommaList(profileData?.language_proficiency)

    const setProjects = (next: StudentProject[]) => {
        setProfileData((prev: any) => ({ ...prev, projects: next }))
    }

    const setAchievements = (next: CustomAchievement[]) => {
        setProfileData((prev: any) => ({ ...prev, custom_achievements: next }))
    }

    const setLanguageTags = (next: string[]) => {
        setProfileData((prev: any) => ({ ...prev, language_proficiency: next.join(', ') }))
    }

    const setExperienceGroups = (next: ExperienceGroups) => {
        setProfileData((prev: any) => ({ ...prev, experience: next }))
    }

    const addExperience = (type: ExperienceType) => {
        const nextEntry: ExperienceEntry = {
            id: generateId(),
            company_name: '',
            role: '',
            skills: [],
            major_project: '',
            start_date: '',
            end_date: '',
            work_mode: 'onsite',
            experience_type: type,
        }
        setExperienceGroups({
            ...experienceGroups,
            [type]: [nextEntry, ...experienceGroups[type]],
        })
    }

    const updateExperience = (type: ExperienceType, id: string, patch: Partial<ExperienceEntry>) => {
        setExperienceGroups({
            ...experienceGroups,
            [type]: experienceGroups[type].map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        })
    }

    const removeExperience = (type: ExperienceType, id: string) => {
        setExperienceGroups({
            ...experienceGroups,
            [type]: experienceGroups[type].filter((entry) => entry.id !== id),
        })
    }


    const addProject = () => {
        const next: StudentProject = {
            id: generateId(),
            title: '',
            description: '',
            skills_used: [],
            technologies_used: [],
            start_date: '',
            end_date: '',
            project_url: '',
            github_url: '',
            demo_url: '',
            images: [],
            status: 'in_progress',
        }
        setProjects([next, ...projects])
    }

    const updateProject = (id: string, patch: Partial<StudentProject>) => {
        setProjects(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    }

    const removeProject = (id: string) => {
        setProjects(projects.filter((p) => p.id !== id))
    }

    const addAchievement = () => {
        const next: CustomAchievement = {
            id: generateId(),
            title: '',
            category: 'Other',
            description: '',
            tags: [],
            url: '',
            date: '',
        }
        setAchievements([next, ...achievements])
    }

    const updateAchievement = (id: string, patch: Partial<CustomAchievement>) => {
        setAchievements(achievements.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    }

    const removeAchievement = (id: string) => {
        setAchievements(achievements.filter((a) => a.id !== id))
    }

    const startAddEducation = () => {
        setIsAddingEducation(true)
        setEditingEducationId(null)
        setEducationDraft({
            id: '',
            level: 'UG',
            custom_level: '',
            institution: '',
            start_date: '',
            end_date: '',
            score: '',
            description: '',
        })
    }

    const startEditEducation = (entry: StudentEducation) => {
        setIsAddingEducation(false)
        setEditingEducationId(entry.id)
        setEducationDraft({ ...entry })
    }

    const cancelEducationEdit = () => {
        setIsAddingEducation(false)
        setEditingEducationId(null)
        setEducationDraft(null)
    }

    const saveEducation = async () => {
        if (!educationDraft) return

        const institution = educationDraft.institution?.trim()
        if (!educationDraft.level || !institution) {
            toast.error('Level and institution are required')
            return
        }
        if (educationDraft.level === 'Other' && !educationDraft.custom_level?.trim()) {
            toast.error('Custom level is required when level is Other')
            return
        }

        try {
            setIsEducationSaving(true)
            const { id, ...payload } = educationDraft

            if (isAddingEducation) {
                const created = await studentService.addEducation(payload)
                setProfileData((prev: any) => ({
                    ...prev,
                    education: [created, ...(prev?.education ?? [])],
                }))
                toast.success('Education added')
            } else if (editingEducationId) {
                const updated = await studentService.updateEducation(editingEducationId, payload)
                setProfileData((prev: any) => ({
                    ...prev,
                    education: normalizeEducation(prev?.education).map((entry) =>
                        entry.id === editingEducationId ? updated : entry
                    ),
                }))
                toast.success('Education updated')
            }

            cancelEducationEdit()
        } catch (error) {
            console.error('Error saving education:', error)
            toast.error('Failed to save education')
        } finally {
            setIsEducationSaving(false)
        }
    }

    const deleteEducation = async (educationId: string) => {
        try {
            setIsEducationSaving(true)
            await studentService.deleteEducation(educationId)
            setProfileData((prev: any) => ({
                ...prev,
                education: normalizeEducation(prev?.education).filter((entry) => entry.id !== educationId),
            }))
            toast.success('Education removed')
        } catch (error) {
            console.error('Error deleting education:', error)
            toast.error('Failed to delete education')
        } finally {
            setIsEducationSaving(false)
        }
    }

    const educationLevelOptions = [
        { value: 'UG', label: 'UG' },
        { value: 'PG', label: 'PG' },
        { value: 'Diploma', label: 'Diploma' },
        { value: '12th', label: '12th' },
        { value: '10th', label: '10th' },
        { value: 'Other', label: 'Other' },
    ]

    const updateEducationDraft = (patch: Partial<StudentEducation>) => {
        setEducationDraft((prev) => (prev ? { ...prev, ...patch } : prev))
    }

    const renderExperienceList = (entries: ExperienceEntry[]) => {
        if (!entries.length) {
            return (
                <p className="text-sm text-gray-500 dark:text-gray-400">No experience added yet.</p>
            )
        }

        return (
            <div className="space-y-4">
                {entries.map((entry) => {
                    const dates = [entry.start_date, entry.end_date].filter(Boolean).join(' - ')
                    return (
                        <div key={entry.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                        {entry.role?.trim() || 'Role'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {entry.company_name?.trim() || 'Company'}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {entry.work_mode}
                                </span>
                            </div>
                            {dates && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{dates}</p>
                            )}
                            {entry.skills.length > 0 && (
                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                    Skills: {entry.skills.join(', ')}
                                </p>
                            )}
                            {entry.major_project?.trim() && (
                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                    Major Project: {entry.major_project}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'transgender', label: 'Transgender' },
        { value: 'non_binary', label: 'Non-binary' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
        { value: 'other', label: 'Other' },
    ]

    // Indian States & Languages Data
    type MultiSelectOption = {
        label: string
        value: string
    }

    const languageOptions: MultiSelectOption[] = [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'marathi', label: 'Marathi' },
        { value: 'gujarati', label: 'Gujarati' },
        { value: 'tamil', label: 'Tamil' },
        { value: 'telugu', label: 'Telugu' },
        { value: 'kannada', label: 'Kannada' },
        { value: 'malayalam', label: 'Malayalam' },
        { value: 'bengali', label: 'Bengali' },
        { value: 'punjabi', label: 'Punjabi' },
        { value: 'urdu', label: 'Urdu' },
        { value: 'odia', label: 'Odia' },
    ]

    const parseCommaList = (value?: string) => {
        if (!value) return []
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    }

    const toOptionArray = (options: MultiSelectOption[], value?: string) => {
        const values = parseCommaList(value)
        return values.map((item) => {
            const match = options.find((option) => option.value === item || option.label.toLowerCase() === item.toLowerCase())
            return match ?? { label: item, value: item.toLowerCase().replace(/\s+/g, '_') }
        })
    }

    const toCsvString = (items: MultiSelectOption[]) => items.map((item) => item.label).join(', ')

    const CheckboxOption = (props: OptionProps<MultiSelectOption, true>) => (
        <components.Option {...props}>
            <div className="flex items-center gap-2 px-1">
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{props.label}</span>
            </div>
        </components.Option>
    )

    const technicalSkillOptions: MultiSelectOption[] = [
        { label: 'React', value: 'react' },
        { label: 'Node.js', value: 'node_js' },
        { label: 'Python', value: 'python' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'SQL', value: 'sql' },
        { label: 'GraphQL', value: 'graphql' },
        { label: 'Docker', value: 'docker' },
        { label: 'AWS', value: 'aws' },
        { label: 'Data Structures', value: 'data_structures' },
    ]

    const softSkillOptions: MultiSelectOption[] = [
        { label: 'Communication', value: 'communication' },
        { label: 'Leadership', value: 'leadership' },
        { label: 'Teamwork', value: 'teamwork' },
        { label: 'Problem Solving', value: 'problem_solving' },
        { label: 'Adaptability', value: 'adaptability' },
        { label: 'Time Management', value: 'time_management' },
    ]

    const industryOptions: MultiSelectOption[] = [
        { label: 'Fintech', value: 'fintech' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'EdTech', value: 'edtech' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'SaaS', value: 'saas' },
        { label: 'Automotive', value: 'automotive' },
    ]

    const roleOptions: MultiSelectOption[] = [
        { label: 'SDE', value: 'sde' },
        { label: 'Data Analyst', value: 'data_analyst' },
        { label: 'Product Manager', value: 'product_manager' },
        { label: 'UX Designer', value: 'ux_designer' },
        { label: 'QA Engineer', value: 'qa_engineer' },
        { label: 'DevOps Engineer', value: 'devops_engineer' },
    ]

    const reactSelectStyles: StylesConfig<MultiSelectOption, boolean> = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: 24,
            borderColor: state.isFocused ? '#7C3AED' : '#D1D5DB',
            boxShadow: 'none',
            minHeight: 54,
            backgroundColor: isDarkMode ? '#0C1430' : '#F8FAFC',
            color: isDarkMode ? '#E2E8F0' : '#111827',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: 16,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            color: isDarkMode ? '#E2E8F0' : '#111827',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused
                ? isDarkMode ? '#1E293B' : '#EEF2FF'
                : isDarkMode ? '#0C1430' : '#ffffff',
            color: isDarkMode ? '#E2E8F0' : '#111827',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#312E81' : '#E9D5FF',
            borderRadius: 9999,
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: isDarkMode ? '#EDE9FE' : '#3730A3',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? '#94A3B8' : '#6B7280',
        }),
        input: (provided) => ({
            ...provided,
            color: isDarkMode ? '#E2E8F0' : '#111827',
        }),
    }

    const selectedLanguageOptions = toOptionArray(languageOptions, profileData.language_proficiency)
    const selectedTechnicalSkills = toOptionArray(technicalSkillOptions, profileData.technical_skills)
    const selectedSoftSkills = toOptionArray(softSkillOptions, profileData.soft_skills)
    const selectedIndustryOptions = toOptionArray(industryOptions, profileData.preferred_industry)
    const selectedRoleOptions = toOptionArray(roleOptions, profileData.job_roles_of_interest)

    const stateOptions = [
        { value: 'andaman_nicobar', label: 'Andaman and Nicobar Islands' },
        { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
        { value: 'arunachal_pradesh', label: 'Arunachal Pradesh' },
        { value: 'assam', label: 'Assam' },
        { value: 'bihar', label: 'Bihar' },
        { value: 'chandigarh', label: 'Chandigarh' },
        { value: 'chhattisgarh', label: 'Chhattisgarh' },
        { value: 'dadra_nagar_haveli', label: 'Dadra and Nagar Haveli' },
        { value: 'daman_diu', label: 'Daman and Diu' },
        { value: 'delhi', label: 'Delhi' },
        { value: 'goa', label: 'Goa' },
        { value: 'gujarat', label: 'Gujarat' },
        { value: 'haryana', label: 'Haryana' },
        { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
        { value: 'jharkhand', label: 'Jharkhand' },
        { value: 'karnataka', label: 'Karnataka' },
        { value: 'kerala', label: 'Kerala' },
        { value: 'ladakh', label: 'Ladakh' },
        { value: 'lakshadweep', label: 'Lakshadweep' },
        { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
        { value: 'maharashtra', label: 'Maharashtra' },
        { value: 'manipur', label: 'Manipur' },
        { value: 'meghalaya', label: 'Meghalaya' },
        { value: 'mizoram', label: 'Mizoram' },
        { value: 'nagaland', label: 'Nagaland' },
        { value: 'odisha', label: 'Odisha' },
        { value: 'puducherry', label: 'Puducherry' },
        { value: 'punjab', label: 'Punjab' },
        { value: 'rajasthan', label: 'Rajasthan' },
        { value: 'sikkim', label: 'Sikkim' },
        { value: 'tamil_nadu', label: 'Tamil Nadu' },
        { value: 'telangana', label: 'Telangana' },
        { value: 'tripura', label: 'Tripura' },
        { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
        { value: 'uttarakhand', label: 'Uttarakhand' },
        { value: 'west_bengal', label: 'West Bengal' },
    ]

    const cityOptionsByState: Record<string, MultiSelectOption[]> = {
        delhi: [
            { label: 'Central Delhi', value: 'central_delhi' },
            { label: 'New Delhi', value: 'new_delhi' },
            { label: 'North Delhi', value: 'north_delhi' },
            { label: 'South Delhi', value: 'south_delhi' },
        ],
        arunachal_pradesh: [
        { label: 'Alo', value: 'alo' },
        { label: 'Bomdila', value: 'bomdila' },
        { label: 'Itanagar', value: 'itanagar' },
        { label: 'Khonsa', value: 'khonsa' },
        { label: 'Miao', value: 'miao' },
        { label: 'Namsai', value: 'namsai' },
        { label: 'Pasighat', value: 'pasighat' },
        { label: 'Roing', value: 'roing' },
        { label: 'Seppa', value: 'seppa' },
        { label: 'Tawang', value: 'tawang' },
        { label: 'Tezu', value: 'tezu' },
        { label: 'Ziro', value: 'ziro' }
    ],
        maharashtra: [
            { label: 'Mumbai', value: 'mumbai' },
            { label: 'Pune', value: 'pune' },
            { label: 'Nagpur', value: 'nagpur' },
            { label: 'Nashik', value: 'nashik' },
        ],
        karnataka: [
            { label: 'Bengaluru', value: 'bengaluru' },
            { label: 'Mysore', value: 'mysore' },
            { label: 'Mangalore', value: 'mangalore' },
            { label: 'Hubli', value: 'hubli' },
        ],
        tamil_nadu: [
            { label: 'Chennai', value: 'chennai' },
            { label: 'Coimbatore', value: 'coimbatore' },
            { label: 'Madurai', value: 'madurai' },
            { label: 'Tiruchirappalli', value: 'tiruchirappalli' },
        ],
        gujarat: [
            { label: 'Ahmedabad', value: 'ahmedabad' },
            { label: 'Vadodara', value: 'vadodara' },
            { label: 'Surat', value: 'surat' },
            { label: 'Rajkot', value: 'rajkot' },
        ],
        west_bengal: [
            { label: 'Kolkata', value: 'kolkata' },
            { label: 'Howrah', value: 'howrah' },
            { label: 'Durgapur', value: 'durgapur' },
            { label: 'Siliguri', value: 'siliguri' },
        ],
        uttar_pradesh: [
            { label: 'Lucknow', value: 'lucknow' },
            { label: 'Noida', value: 'noida' },
            { label: 'Kanpur', value: 'kanpur' },
            { label: 'Varanasi', value: 'varanasi' },
        ],
        rajasthan: [
            { label: 'Jaipur', value: 'jaipur' },
            { label: 'Udaipur', value: 'udaipur' },
            { label: 'Jodhpur', value: 'jodhpur' },
            { label: 'Ajmer', value: 'ajmer' },
        ],
        telangana: [
            { label: 'Hyderabad', value: 'hyderabad' },
            { label: 'Warangal', value: 'warangal' },
            { label: 'Nizamabad', value: 'nizamabad' },
            { label: 'Karimnagar', value: 'karimnagar' },
        ],
        andhra_pradesh: [
            { label: 'Visakhapatnam', value: 'visakhapatnam' },
            { label: 'Vijayawada', value: 'vijayawada' },
            { label: 'Guntur', value: 'guntur' },
            { label: 'Tirupati', value: 'tirupati' },
        ],
        kerala: [
            { label: 'Kochi', value: 'kochi' },
            { label: 'Thiruvananthapuram', value: 'thiruvananthapuram' },
            { label: 'Kozhikode', value: 'kozhikode' },
            { label: 'Thrissur', value: 'thrissur' },
        ],
        bihar: [
            { label: 'Patna', value: 'patna' },
            { label: 'Gaya', value: 'gaya' },
            { label: 'Bhagalpur', value: 'bhagalpur' },
            { label: 'Muzaffarpur', value: 'muzaffarpur' },
        ],
        punjab: [
    { label: 'Abohar', value: 'abohar' },
    { label: 'Ahmedgarh', value: 'ahmedgarh' },
    { label: 'Ajnala', value: 'ajnala' },
    { label: 'Akrur', value: 'akrur' },
    { label: 'Alawalpur', value: 'alawalpur' },
    { label: 'Amloh', value: 'amloh' },
    { label: 'Amritsar', value: 'amritsar' },
    { label: 'Anandpur Sahib', value: 'anandpur_sahib' },
    { label: 'Asifwala', value: 'asifwala' },
    { label: 'Baghapurana', value: 'baghapurana' },
    { label: 'Banga', value: 'banga' },
    { label: 'Bareta', value: 'bareta' },
    { label: 'Barnala', value: 'barnala' },
    { label: 'Bassi Pathana', value: 'bassi_pathana' },
    { label: 'Batala', value: 'batala' },
    { label: 'Bathinda', value: 'bathinda' },
    { label: 'Bhadiar', value: 'bhadiar' },
    { label: 'Bhagha Purana', value: 'bhagha_purana' },
    { label: 'Bhawanigarh', value: 'bhawanigarh' },
    { label: 'Bhikhi', value: 'bhikhi' },
    { label: 'Bhikhiwind', value: 'bhikhiwind' },
    { label: 'Bhogpur', value: 'bhogpur' },
    { label: 'Budhlada', value: 'budhlada' },
    { label: 'Chamat', value: 'chamat' },
    { label: 'Dasuya', value: 'dasuya' },
    { label: 'Dera Baba Nanak', value: 'dera_baba_nanak' },
    { label: 'Dera Bassi', value: 'dera_bassi' },
    { label: 'Dharamkot', value: 'dharamkot' },
    { label: 'Dhariwal', value: 'dhariwal' },
    { label: 'Dhuri', value: 'dhuri' },
    { label: 'Dina Nagar', value: 'dina_nagar' },
    { label: 'Doraha', value: 'doraha' },
    { label: 'Faridkot', value: 'faridkot' },
    { label: 'Fatehgarh Churian', value: 'fatehgarh_churian' },
    { label: 'Fatehgarh Sahib', value: 'fatehgarh_sahib' },
    { label: 'Fazilka', value: 'fazilka' },
    { label: 'Firozpur', value: 'firozpur' },
    { label: 'Firozpur Cantt', value: 'firozpur_cantt' },
    { label: 'Garhdiwala', value: 'garhdiwala' },
    { label: 'Garhshankar', value: 'garhshankar' },
    { label: 'Gharaun', value: 'gharaun' },
    { label: 'Gidderbaha', value: 'gidderbaha' },
    { label: 'Gurdaspur', value: 'gurdaspur' },
    { label: 'Guru Har Sahai', value: 'guru_har_sahai' },
    { label: 'Hajipur', value: 'hajipur' },
    { label: 'Hoshiarpur', value: 'hoshiarpur' },
    { label: 'Jagadhri Mandi', value: 'jagadhri_mandi' },
    { label: 'Jagraon', value: 'jagraon' },
    { label: 'Jaitu', value: 'jaitu' },
    { label: 'Jalalabad', value: 'jalalabad' },
    { label: 'Jalandhar', value: 'jalandhar' },
    { label: 'Jandiala Guru', value: 'jandiala_guru' },
    { label: 'Kapurthala', value: 'kapurthala' },
    { label: 'Kartarpur', value: 'kartarpur' },
    { label: 'Khanna', value: 'khanna' },
    { label: 'Kharar', value: 'kharar' },
    { label: 'Khemkaran', value: 'khemkaran' },
    { label: 'Kot Kapura', value: 'kot_kapura' },
    { label: 'Kurali', value: 'kurali' },
    { label: 'Lalru', value: 'lalru' },
    { label: 'Longowal', value: 'longowal' },
    { label: 'Ludhiana', value: 'ludhiana' },
    { label: 'Machhiwara', value: 'machhiwara' },
    { label: 'Majitha', value: 'majitha' },
    { label: 'Malerkotla', value: 'malerkotla' },
    { label: 'Malout', value: 'malout' },
    { label: 'Mansa', value: 'mansa' },
    { label: 'Maur', value: 'maur' },
    { label: 'Moga', value: 'moga' },
    { label: 'Mohali (SAS Nagar)', value: 'mohali' },
    { label: 'Morinda', value: 'morinda' },
    { label: 'Mukerian', value: 'mukerian' },
    { label: 'Muktsar', value: 'muktsar' },
    { label: 'Mullanpur Garbadas', value: 'mullanpur_garbadas' },
    { label: 'Nabha', value: 'nabha' },
    { label: 'Nakodar', value: 'nakodar' },
    { label: 'Nangal', value: 'nangal' },
    { label: 'Nawanshahr', value: 'nawanshahr' },
    { label: 'Neya', value: 'neya' },
    { label: 'Pathankot', value: 'pathankot' },
    { label: 'Patiala', value: 'patiala' },
    { label: 'Patran', value: 'patran' },
    { label: 'Patti', value: 'patti' },
    { label: 'Phagwara', value: 'phagwara' },
    { label: 'Phillaur', value: 'phillaur' },
    { label: 'Qadian', value: 'qadian' },
    { label: 'Raikot', value: 'raikot' },
    { label: 'Raja Sansi', value: 'raja_sansi' },
    { label: 'Rajpura', value: 'rajpura' },
    { label: 'Raman Mandi', value: 'raman_mandi' },
    { label: 'Rayya', value: 'rayya' },
    { label: 'Rupnagar (Ropar)', value: 'rupnagar' },
    { label: 'Sahnewal', value: 'sahnewal' },
    { label: 'Samana', value: 'samana' },
    { label: 'Samrala', value: 'samrala' },
    { label: 'Sanam', value: 'sanam' },
    { label: 'Sangrur', value: 'sangrur' },
    { label: 'Sardulgarh', value: 'sardulgarh' },
    { label: 'Shahkot', value: 'shahkot' },
    { label: 'Sirhind', value: 'sirhind' },
    { label: 'Sujjanpur', value: 'sujjanpur' },
    { label: 'Sultanpur Lodhi', value: 'sultanpur_lodhi' },
    { label: 'Sunam', value: 'sunam' },
    { label: 'Talwandi Sabo', value: 'talwandi_sabo' },
    { label: 'Tapa', value: 'tapa' },
    { label: 'Tarn Taran', value: 'tarn_taran' },
    { label: 'Urmar Tanda', value: 'urmar_tanda' },
    { label: 'Zira', value: 'zira' },
    { label: 'Zirakpur', value: 'zirakpur' }
],
        odisha: [
            { label: 'Anandpur', value: 'anandpur' },
            { label: 'Angul', value: 'angul' },
            { label: 'Aska', value: 'aska' },
            { label: 'Athagad', value: 'athagad' },
            { label: 'Athamallik', value: 'athamallik' },
            { label: 'Balangir', value: 'balangir' },
            { label: 'Balasore', value: 'balasore' },
            { label: 'Balimela', value: 'balimela' },
            { label: 'Banapur', value: 'banapur' },
            { label: 'Bangriposi', value: 'bangriposi' },
            { label: 'Barbil', value: 'barbil' },
            { label: 'Bargarh', value: 'bargarh' },
            { label: 'Baripada', value: 'baripada' },
            { label: 'Basudevpur', value: 'basudevpur' },
            { label: 'Belguntha', value: 'belguntha' },
            { label: 'Belpahar', value: 'belpahar' },
            { label: 'Berhampur', value: 'berhampur' },
            { label: 'Bhadrak', value: 'bhadrak' },
            { label: 'Bhanjanagar', value: 'bhanjanagar' },
            { label: 'Bhawanipatna', value: 'bhawanipatna' },
            { label: 'Bhuban', value: 'bhuban' },
            { label: 'Bhubaneswar', value: 'bhubaneswar' },
            { label: 'Binamika', value: 'binamika' },
            { label: 'Biramitrapur', value: 'biramitrapur' },
            { label: 'Bishama Katek', value: 'bishama_katek' },
            { label: 'Boudhgarh', value: 'boudhgarh' },
            { label: 'Brajarajnagar', value: 'brajarajnagar' },
            { label: 'Buguda', value: 'buguda' },
            { label: 'Burla', value: 'burla' },
            { label: 'Byasanagar', value: 'byasanagar' },
            { label: 'Chhatrapur', value: 'chhatrapur' },
            { label: 'Chikiti', value: 'chikiti' },
            { label: 'Choudwar', value: 'choudwar' },
            { label: 'Cuttack', value: 'cuttack' },
            { label: 'Daringbadi', value: 'daringbadi' },
            { label: 'Deogarh', value: 'deogarh' },
            { label: 'Dhamnagar', value: 'dhamnagar' },
            { label: 'Dhenkanal', value: 'dhenkanal' },
            { label: 'Digapahandi', value: 'digapahandi' },
            { label: 'G. Udayagiri', value: 'g_udayagiri' },
            { label: 'Ganjam', value: 'ganjam' },
            { label: 'Ghasipura', value: 'ghasipura' },
            { label: 'Gopalpur', value: 'gopalpur' },
            { label: 'Gudari', value: 'gudari' },
            { label: 'Gunupur', value: 'gunupur' },
            { label: 'Hindol', value: 'hindol' },
            { label: 'Hirakud', value: 'hirakud' },
            { label: 'Jagatsinghpur', value: 'jagatsinghpur' },
            { label: 'Jajpur', value: 'jajpur' },
            { label: 'Jaleswar', value: 'jaleswar' },
            { label: 'Jatani', value: 'jatani' },
            { label: 'Jeypore', value: 'jeypore' },
            { label: 'Jharsuguda', value: 'jharsuguda' },
            { label: 'Joda', value: 'joda' },
            { label: 'Kamakshyanagar', value: 'kamakshyanagar' },
            { label: 'Kantamal', value: 'kantamal' },
            { label: 'Kantara', value: 'kantara' },
            { label: 'Karanjia', value: 'karanjia' },
            { label: 'Kashipur', value: 'kashipur' },
            { label: 'Kendrapara', value: 'kendrapara' },
            { label: 'Keonjhar', value: 'keonjhar' },
            { label: 'Kesinga', value: 'kesinga' },
            { label: 'Khariar', value: 'khariar' },
            { label: 'Khariar Road', value: 'khariar_road' },
            { label: 'Khordha', value: 'khordha' },
            { label: 'Kishorenagar', value: 'kishorenagar' },
            { label: 'Konark', value: 'konark' },
            { label: 'Koraput', value: 'koraput' },
            { label: 'Kotpad', value: 'kotpad' },
            { label: 'Kuchinda', value: 'kuchinda' },
            { label: 'Malkangiri', value: 'malkangiri' },
            { label: 'Mohana', value: 'mohana' },
            { label: 'Nabarangpur', value: 'nabarangpur' },
            { label: 'Narasinghpur', value: 'narasinghpur' },
            { label: 'Nayagarh', value: 'nayagarh' },
            { label: 'Nilgiri', value: 'nilgiri' },
            { label: 'Nimapada', value: 'nimapada' },
            { label: 'Nowrangpur', value: 'nowrangpur' },
            { label: 'Nuapada', value: 'nuapada' },
            { label: 'Padampur', value: 'padampur' },
            { label: 'Pallahara', value: 'pallahara' },
            { label: 'Paradip', value: 'paradip' },
            { label: 'Paralakhemundi', value: 'paralakhemundi' },
            { label: 'Patnagarh', value: 'patnagarh' },
            { label: 'Pattamundai', value: 'pattamundai' },
            { label: 'Phulbani', value: 'phulbani' },
            { label: 'Pipili', value: 'pipili' },
            { label: 'Polasara', value: 'polasara' },
            { label: 'Puri', value: 'puri' },
            { label: 'Purushottampur', value: 'purushottampur' },
            { label: 'Rairangpur', value: 'rairangpur' },
            { label: 'Rairakhol', value: 'rairakhol' },
            { label: 'Rajagangapur', value: 'rajagangapur' },
            { label: 'Rambha', value: 'rambha' },
            { label: 'Rayagada', value: 'rayagada' },
            { label: 'Remuna', value: 'remuna' },
            { label: 'Rourkela', value: 'rourkela' },
            { label: 'Sambalpur', value: 'sambalpur' },
            { label: 'Sonepur', value: 'sonepur' },
            { label: 'Soro', value: 'soro' },
            { label: 'Sunabeda', value: 'sunabeda' },
            { label: 'Talcher', value: 'talcher' },
            { label: 'Tarbha', value: 'tarbha' },
            { label: 'Tenksa', value: 'tenksa' },
            { label: 'Tirtol', value: 'tirtol' },
            { label: 'Titlagarh', value: 'titlagarh' },
            { label: 'Tushra', value: 'tushra' },
            { label: 'Udaipur', value: 'udaipur' },
            { label: 'Udala', value: 'udala' },
            { label: 'Umarkote', value: 'umarkote' },
            { label: 'Vani Vihar', value: 'vani_vihar' },
            { label: 'Yusufpur', value: 'yusufpur' }
        ],
        haryana: [
            { label: 'Ambala', value: 'ambala' },
            { label: 'Ambala Cantt', value: 'ambala_cantt' },
            { label: 'Asandh', value: 'asandh' },
            { label: 'Assandh', value: 'assandh' },
            { label: 'Ateli', value: 'ateli' },
            { label: 'Babiyal', value: 'babiyal' },
            { label: 'Bahadurgarh', value: 'bahadurgarh' },
            { label: 'Barara', value: 'barara' },
            { label: 'Barwala', value: 'barwala' },
            { label: 'Bawal', value: 'bawal' },
            { label: 'Bawani Khera', value: 'bawani_khera' },
            { label: 'Beri', value: 'beri' },
            { label: 'Bhiwani', value: 'bhiwani' },
            { label: 'Bilaspur', value: 'bilaspur' },
            { label: 'Charkhi Dadri', value: 'charkhi_dadri' },
            { label: 'Cheeka', value: 'cheeka' },
            { label: 'Ellenabad', value: 'ellenabad' },
            { label: 'Faridabad', value: 'faridabad' },
            { label: 'Fatehabad', value: 'fatehabad' },
            { label: 'Ferozepur Jhirka', value: 'ferozepur_jhirka' },
            { label: 'Ganaur', value: 'ganaur' },
            { label: 'Gharaunda', value: 'gharaunda' },
            { label: 'Gohana', value: 'gohana' },
            { label: 'Gurugram', value: 'gurugram' },
            { label: 'Hansi', value: 'hansi' },
            { label: 'Hassanpur', value: 'hassanpur' },
            { label: 'Hathin', value: 'hathin' },
            { label: 'Hisar', value: 'hisar' },
            { label: 'Hodal', value: 'hodal' },
            { label: 'Indri', value: 'indri' },
            { label: 'Jagadhri', value: 'jagadhri' },
            { label: 'Jakhal Mandi', value: 'jakhal_mandi' },
            { label: 'Jatusana', value: 'jatusana' },
            { label: 'Jhajjar', value: 'jhajjar' },
            { label: 'Jind', value: 'jind' },
            { label: 'Julana', value: 'julana' },
            { label: 'Kaithal', value: 'kaithal' },
            { label: 'Kalanwali', value: 'kalanwali' },
            { label: 'Kalanaur', value: 'kalanaur' },
            { label: 'Kalka', value: 'kalka' },
            { label: 'Kanina', value: 'kanina' },
            { label: 'Karnal', value: 'karnal' },
            { label: 'Kharkhoda', value: 'kharkhoda' },
            { label: 'Ladwa', value: 'ladwa' },
            { label: 'Loharu', value: 'loharu' },
            { label: 'Mahendragarh', value: 'mahendragarh' },
            { label: 'Meham', value: 'meham' },
            { label: 'Mustafabad', value: 'mustafabad' },
            { label: 'Naraingarh', value: 'naraingarh' },
            { label: 'Narnaul', value: 'narnaul' },
            { label: 'Narnaund', value: 'narnaund' },
            { label: 'Narwana', value: 'narwana' },
            { label: 'Nilokheri', value: 'nilokheri' },
            { label: 'Nuh', value: 'nuh' },
            { label: 'Palwal', value: 'palwal' },
            { label: 'Panchkula', value: 'panchkula' },
            { label: 'Panipat', value: 'panipat' },
            { label: 'Pataudi', value: 'pataudi' },
            { label: 'Pehowa', value: 'pehowa' },
            { label: 'Pinjore', value: 'pinjore' },
            { label: 'Pundri', value: 'pundri' },
            { label: 'Radaur', value: 'radaur' },
            { label: 'Rania', value: 'rania' },
            { label: 'Ratia', value: 'ratia' },
            { label: 'Rewari', value: 'rewari' },
            { label: 'Rohtak', value: 'rohtak' },
            { label: 'Sadaura', value: 'sadaura' },
            { label: 'Safidon', value: 'safidon' },
            { label: 'Samalkha', value: 'samalkha' },
            { label: 'Shahbad', value: 'shahbad' },
            { label: 'Sirsa', value: 'sirsa' },
            { label: 'Siwani', value: 'siwani' },
            { label: 'Sohna', value: 'sohna' },
            { label: 'Sonipat', value: 'sonipat' },
            { label: 'Taoru', value: 'taoru' },
            { label: 'Thanesar', value: 'thanesar' },
            { label: 'Tohana', value: 'tohana' },
            { label: 'Tosham', value: 'tosham' },
            { label: 'Uchana', value: 'uchana' },
            { label: 'Yamunanagar', value: 'yamunanagar' }
        ],
        assam: [
        { label: 'Barpeta', value: 'barpeta' },
        { label: 'Bongaigaon', value: 'bongaigaon' },
        { label: 'Dhubri', value: 'dhubri' },
        { label: 'Dibrugarh', value: 'dibrugarh' },
        { label: 'Diphu', value: 'diphu' },
        { label: 'Goalpara', value: 'goalpara' },
        { label: 'Golaghat', value: 'golaghat' },
        { label: 'Guwahati', value: 'guwahati' },
        { label: 'Haflong', value: 'haflong' },
        { label: 'Jorhat', value: 'jorhat' },
        { label: 'Karimganj', value: 'karimganj' },
        { label: 'Kokrajhar', value: 'kokrajhar' },
        { label: 'Lumding', value: 'lumding' },
        { label: 'Nagaon', value: 'nagaon' },
        { label: 'North Lakhimpur', value: 'north_lakhimpur' },
        { label: 'Silchar', value: 'silchar' },
        { label: 'Sivasagar', value: 'sivasagar' },
        { label: 'Tezpur', value: 'tezpur' },
        { label: 'Tinsukia', value: 'tinsukia' }
    ],
    chhattisgarh: [
        { label: 'Ambikapur', value: 'ambikapur' },
        { label: 'Bhilai', value: 'bhilai' },
        { label: 'Bilaspur', value: 'bilaspur' },
        { label: 'Dhamtari', value: 'dhamtari' },
        { label: 'Durg', value: 'durg' },
        { label: 'Jagdalpur', value: 'jagdalpur' },
        { label: 'Janjgir', value: 'janjgir' },
        { label: 'Korba', value: 'korba' },
        { label: 'Mahasamund', value: 'mahasamund' },
        { label: 'Raigarh', value: 'raigarh' },
        { label: 'Raipur', value: 'raipur' },
        { label: 'Rajnandgaon', value: 'rajnandgaon' }
    ],
    goa: [
        { label: 'Bicholim', value: 'bicholim' },
        { label: 'Canacona', value: 'canacona' },
        { label: 'Curchorem', value: 'curchorem' },
        { label: 'Mapusa', value: 'mapusa' },
        { label: 'Margao', value: 'margao' },
        { label: 'Marmagao', value: 'marmagao' },
        { label: 'Panaji', value: 'panaji' },
        { label: 'Ponda', value: 'ponda' },
        { label: 'Quepem', value: 'quepem' },
        { label: 'Sanguem', value: 'sanguem' },
        { label: 'Sanquelim', value: 'sanquelim' },
        { label: 'Valpoi', value: 'valpoi' }
    ],
    himachal_pradesh: [
        { label: 'Baddi', value: 'baddi' },
        { label: 'Bilaspur', value: 'bilaspur' },
        { label: 'Chamba', value: 'chamba' },
        { label: 'Dharamshala', value: 'dharamshala' },
        { label: 'Hamirpur', value: 'hamirpur' },
        { label: 'Kallu', value: 'kallu' },
        { label: 'Mandi', value: 'mandi' },
        { label: 'Nahan', value: 'nahan' },
        { label: 'Paonta Sahib', value: 'paonta_sahib' },
        { label: 'Shimla', value: 'shimla' },
        { label: 'Solan', value: 'solan' },
        { label: 'Una', value: 'una' }
    ],
    jharkhand: [
        { label: 'Adityapur', value: 'adityapur' },
        { label: 'Bokaro Steel City', value: 'bokaro_steel_city' },
        { label: 'Chaibasa', value: 'chaibasa' },
        { label: 'Chas', value: 'chas' },
        { label: 'Deoghar', value: 'deoghar' },
        { label: 'Dhanbad', value: 'dhanbad' },
        { label: 'Dumka', value: 'dumka' },
        { label: 'Giridih', value: 'giridih' },
        { label: 'Hazaribagh', value: 'hazaribagh' },
        { label: 'Jamshedpur', value: 'jamshedpur' },
        { label: 'Jhumri Telaiya', value: 'jhumri_telaiya' },
        { label: 'Medininagar', value: 'medininagar' },
        { label: 'Phusro', value: 'phusro' },
        { label: 'Ramgarh', value: 'ramgarh' },
        { label: 'Ranchi', value: 'ranchi' },
        { label: 'Sahibganj', value: 'sahibganj' }
    ],
    madhya_pradesh: [
        { label: 'Betul', value: 'betul' },
        { label: 'Bhind', value: 'bhind' },
        { label: 'Bhopal', value: 'bhopal' },
        { label: 'Burhanpur', value: 'burhanpur' },
        { label: 'Chhindwara', value: 'chhindwara' },
        { label: 'Dewas', value: 'dewas' },
        { label: 'Guna', value: 'guna' },
        { label: 'Gwalior', value: 'gwalior' },
        { label: 'Indore', value: 'indore' },
        { label: 'Jabalpur', value: 'jabalpur' },
        { label: 'Khandwa', value: 'khandwa' },
        { label: 'Khargone', value: 'khargone' },
        { label: 'Mandsaur', value: 'mandsaur' },
        { label: 'Morena', value: 'morena' },
        { label: 'Murwara', value: 'murwara' },
        { label: 'Neemuch', value: 'neemuch' },
        { label: 'Ratlam', value: 'ratlam' },
        { label: 'Rewa', value: 'rewa' },
        { label: 'Sagar', value: 'sagar' },
        { label: 'Satna', value: 'satna' },
        { label: 'Sehore', value: 'sehore' },
        { label: 'Shivpuri', value: 'shivpuri' },
        { label: 'Singrauli', value: 'singrauli' },
        { label: 'Ujjain', value: 'ujjain' },
        { label: 'Vidisha', value: 'vidisha' }
    ],
    manipur: [
        { label: 'Bishenpur', value: 'bishenpur' },
        { label: 'Chandel', value: 'chandel' },
        { label: 'Churachandpur', value: 'churachandpur' },
        { label: 'Imphal', value: 'imphal' },
        { label: 'Kakching', value: 'kakching' },
        { label: 'Mayang Imphal', value: 'mayang_imphal' },
        { label: 'Senapati', value: 'senapati' },
        { label: 'Thoubal', value: 'thoubal' },
        { label: 'Ukhrul', value: 'ukhrul' }
    ],
    meghalaya: [
        { label: 'Cherrapunji', value: 'cherrapunji' },
        { label: 'Jowai', value: 'jowai' },
        { label: 'Nongstoin', value: 'nongstoin' },
        { label: 'Resubelpara', value: 'resubelpara' },
        { label: 'Shillong', value: 'shillong' },
        { label: 'Tura', value: 'tura' },
        { label: 'Williamnagar', value: 'williamnagar' }
    ],
    mizoram: [
        { label: 'Aizawl', value: 'aizawl' },
        { label: 'Champhai', value: 'champhai' },
        { label: 'Kolasib', value: 'kolasib' },
        { label: 'Lawngtlai', value: 'lawngtlai' },
        { label: 'Lunglei', value: 'lunglei' },
        { label: 'Mamit', value: 'mamit' },
        { label: 'Saiha', value: 'saiha' },
        { label: 'Serchhip', value: 'serchhip' }
    ],
    nagaland: [
        { label: 'Dimapur', value: 'dimapur' },
        { label: 'Kohima', value: 'kohima' },
        { label: 'Mokokchung', value: 'mokokchung' },
        { label: 'Mon', value: 'mon' },
        { label: 'Phek', value: 'phek' },
        { label: 'Tuensang', value: 'tuensang' },
        { label: 'Wokha', value: 'wokha' },
        { label: 'Zunheboto', value: 'zunheboto' }
    ],
    sikkim: [
        { label: 'Gangtok', value: 'gangtok' },
        { label: 'Geyzing', value: 'geyzing' },
        { label: 'Mangan', value: 'mangan' },
        { label: 'Namchi', value: 'namchi' },
        { label: 'Rangpo', value: 'rangpo' },
        { label: 'Singtam', value: 'singtam' }
    ],
    tripura: [
        { label: 'Agartala', value: 'agartala' },
        { label: 'Belonia', value: 'belonia' },
        { label: 'Dharmanagar', value: 'dharmanagar' },
        { label: 'Kailasahar', value: 'kailasahar' },
        { label: 'Khowai', value: 'khowai' },
        { label: 'Melaghar', value: 'melaghar' },
        { label: 'Ranirbazar', value: 'ranirbazar' },
        { label: 'Udaipur', value: 'udaipur' }
    ],
    uttarakhand: [
        { label: 'Almora', value: 'almora' },
        { label: 'Dehradun', value: 'dehradun' },
        { label: 'Haldwani', value: 'haldwani' },
        { label: 'Haridwar', value: 'haridwar' },
        { label: 'Kashipur', value: 'kashipur' },
        { label: 'Mussoorie', value: 'mussoorie' },
        { label: 'Nainital', value: 'nainital' },
        { label: 'Pantnagar', value: 'pantnagar' },
        { label: 'Pauri', value: 'pauri' },
        { label: 'Rishikesh', value: 'rishikesh' },
        { label: 'Roorkee', value: 'roorkee' },
        { label: 'Rudrapur', value: 'rudrapur' }
    ],
    jammu_and_kashmir: [
        { label: 'Anantnag', value: 'anantnag' },
        { label: 'Baramulla', value: 'baramulla' },
        { label: 'Jammu', value: 'jammu' },
        { label: 'Kathua', value: 'kathua' },
        { label: 'Poonch', value: 'poonch' },
        { label: 'Sopore', value: 'sopore' },
        { label: 'Srinagar', value: 'srinagar' },
        { label: 'Udhampur', value: 'udhampur' }
    ]
    }

    const availableCityOptions = profileData.state ? cityOptionsByState[profileData.state] ?? [] : []

    // Calculate profile completion percentage
    const calculateProfileCompletion = (): number => {
        const fields = {
            name: !!profileData.name?.trim(),
            email: !!profileData.email?.trim(),
            phone: !!profileData.phone?.trim(),
            dob: !!profileData.dob?.trim(),
            gender: !!profileData.gender?.trim(),
            city: !!profileData.city?.trim(),
            state: !!profileData.state?.trim(),
            bio: !!profileData.bio?.trim(),
            technical_skills: !!profileData.technical_skills?.trim(),
            soft_skills: !!profileData.soft_skills?.trim(),
            preferred_industry: !!profileData.preferred_industry?.trim(),
            job_roles_of_interest: !!profileData.job_roles_of_interest?.trim(),
            language_proficiency: !!profileData.language_proficiency?.trim(),
            education: Array.isArray(profileData.education) && profileData.education.length > 0,
            experience: profileData.experience && (
                (Array.isArray(profileData.experience?.internship) && profileData.experience.internship.length > 0) ||
                (Array.isArray(profileData.experience?.full_time) && profileData.experience.full_time.length > 0) ||
                (Array.isArray(profileData.experience?.other) && profileData.experience.other.length > 0)
            ),
            projects: Array.isArray(profileData.projects) && profileData.projects.length > 0,
            resume_url: !!profileData.resume_url?.trim(),
        }

        const filledFields = Object.values(fields).filter(Boolean).length
        const totalFields = Object.keys(fields).length
        return Math.round((filledFields / totalFields) * 100)
    }

    const profileCompletion = calculateProfileCompletion()

    const locationPreferenceOptions = [
        { value: 'onsite', label: 'Onsite' },
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
    ]

    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100 dashboard-page">
            {/* Profile Completion Progress Card - Sticky Bottom-Left */}
            <AnimatePresence>
                <motion.div
                    initial={{ x: -400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-6 right-6 z-40 w-72"
                >
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-[#0B1739] p-5 shadow-lg dark:shadow-2xl">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Profile Completion</h4>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300">
                                    {profileCompletion}%
                                </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <motion.div
                                    animate={{ width: `${profileCompletion}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                />
                            </div>

                            {/* Status message */}
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {profileCompletion === 100 
                                    ? "✨ Your profile is complete!" 
                                    : `${100 - profileCompletion}% more to complete your profile`}
                            </p>

                            {/* Hide button */}
                            <button
                                onClick={() => setShowNudge(false)}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                Hide for now
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Student Profile</h1>
                    <p className="mt-1 text-gray-500 dark:text-[#A8B3CF]">Manage your details and professional information</p>
                </div>
                {isEditing ? (
                    <Button 
                        onClick={handleSaveProfile} 
                        loading={isSaving}
                        className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-8 font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </Button>
                ) : (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-8 font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                    >
                        <Pencil className="w-5 h-5" />
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column - Forms */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Personal Details */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                <User className="w-5 h-5" />
                            </div>
                            Personal Information
                        </h3>

                        {/* Profile Picture Upload Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-200/50 dark:border-white/5">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#1F2937] shadow-lg bg-gradient-to-br from-[#E5B59E] to-[#C8EE44] flex items-center justify-center text-[#13141F] text-2xl font-bold group shrink-0">
                                {profileData?.profile_picture_url ? (
                                    <img 
                                        src={profileData.profile_picture_url} 
                                        alt="Profile Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{profileData?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                )}
                                
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <UploadCloud className="w-5.5 h-5.5 mb-1 text-white" />
                                        <span>Upload</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleProfilePictureUpload}
                                            disabled={isUploadingPhoto}
                                        />
                                    </label>
                                )}
                                
                                {isUploadingPhoto && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Profile Image</h4>
                                <p className="text-xs text-gray-500 dark:text-[#A8B3CF] mt-1 leading-relaxed">
                                    {isEditing 
                                        ? "Hover/Click on the avatar circle to upload your photo (PNG, JPG, max 5MB)." 
                                        : "Click 'Edit Profile' to change your profile picture."
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                                <div className="relative">
                                    {isEditing ? (
                                        <Input 
                                            name="name"
                                            value={profileData.name || ''}
                                            onChange={handleInputChange}
                                            className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                            placeholder="Enter full name"
                                        />
                                    ) : (
                                        <ReadonlyField value={profileData.name} placeholder="Enter full name" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address (Read-only)</label>
                                {isEditing ? (
                                    <Input 
                                        value={profileData.email || ''}
                                        readOnly
                                        className="pl-4 rounded-xl border-gray-200 bg-gray-100 dark:bg-black/40 text-gray-400 cursor-not-allowed"
                                    />
                                ) : (
                                    <ReadonlyField value={profileData.email} placeholder="Email not set" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <div className="w-20 bg-gray-100 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-[#31406B] flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            +91
                                        </div>
                                        <Input 
                                            name="phone"
                                            value={profileData.phone || ''}
                                            onChange={handleInputChange}
                                            className="flex-1 pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                            placeholder="XXXXX XXXXX"
                                        />
                                    </div>
                                ) : (
                                    <ReadonlyField value={profileData.phone ? `+91 ${profileData.phone}` : undefined} placeholder="+91 XXXXX XXXXX" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Date of Birth</label>
                                {isEditing ? (
                                    <Input 
                                        type="date"
                                        name="dob"
                                        value={profileData.dob || ''}
                                        onChange={handleInputChange}
                                        className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                    />
                                ) : (
                                    <ReadonlyField value={profileData.dob} placeholder="Date of birth" />
                                )}
                            </div>
                        </div>

                        {/* Location Section */}


                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Languages Known</label>
                            {isEditing ? (
                                <ReactSelect
                                    isMulti
                                    options={languageOptions}
                                    value={selectedLanguageOptions}
                                    onChange={(selected) =>
                                        setProfileData((prev: any) => ({
                                            ...prev,
                                            language_proficiency: toCsvString(selected as MultiSelectOption[]),
                                        }))
                                    }
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={reactSelectStyles}
                                    placeholder="Search and select languages"
                                    isClearable
                                />
                            ) : (
                                <ReadonlyParagraph value={profileData.language_proficiency} placeholder="Not specified" />
                            )}
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Short Bio</label>
                            {isEditing ? (
                                <textarea 
                                    name="bio"
                                    value={profileData.bio || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED] dark:border-[#31406B] dark:bg-[#0C1430]"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <ReadonlyParagraph value={profileData.bio} placeholder="Tell us about yourself..." />
                            )}
                        </div>
                    </div>

                    {/* Education */}
                    <div id="resume" className="scroll-mt-24 rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                        <div className="flex items-start justify-between gap-4 mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-[#1A2348] dark:text-[#8B5CF6]">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                Education
                            </h3>
                            {isEditing && (
                                <Button
                                    type="button"
                                    onClick={startAddEducation}
                                    className="h-10 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Education
                                </Button>
                            )}
                        </div>

                        {isEditing && isAddingEducation && educationDraft && (
                            <div className="mb-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 p-6">
                                <div className="flex items-center justify-between gap-3 mb-5">
                                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-200">New Education</p>
                                    <button
                                        type="button"
                                        onClick={cancelEducationEdit}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#6D28D9] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Institution</label>
                                        <Input
                                            value={educationDraft.institution}
                                            onChange={(e) => updateEducationDraft({ institution: e.target.value })}
                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:border-[#31406B] dark:bg-[#0C1430]"
                                            placeholder="e.g. IIT Bhubaneswar"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Level</label>
                                        <Select
                                            value={educationDraft.level}
                                            onChange={(e) => updateEducationDraft({ level: e.target.value as EducationLevel })}
                                            className="rounded-xl border-gray-200 bg-white/80 dark:border-[#31406B] dark:bg-[#0C1430]"
                                            options={educationLevelOptions}
                                        />
                                    </div>

                                    {educationDraft.level === 'Other' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Custom Level</label>
                                            <Input
                                                value={educationDraft.custom_level || ''}
                                                onChange={(e) => updateEducationDraft({ custom_level: e.target.value })}
                                                className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                placeholder="e.g. Certificate Course"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                        <Input
                                            type="date"
                                            value={educationDraft.start_date}
                                            onChange={(e) => updateEducationDraft({ start_date: e.target.value })}
                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                        <Input
                                            type="date"
                                            value={educationDraft.end_date}
                                            onChange={(e) => updateEducationDraft({ end_date: e.target.value })}
                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Score</label>
                                        <Input
                                            value={educationDraft.score}
                                            onChange={(e) => updateEducationDraft({ score: e.target.value })}
                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                            placeholder="CGPA / Percentage"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                                        <textarea
                                            value={educationDraft.description}
                                            onChange={(e) => updateEducationDraft({ description: e.target.value })}
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 bg-white/80 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED] dark:border-[#31406B] dark:bg-[#0C1430]"
                                            placeholder="Optional highlights, specialization, awards"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cancelEducationEdit}
                                        className="rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={saveEducation}
                                        loading={isEducationSaving}
                                        className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 text-white hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        )}

                        {educationEntries.length === 0 && !isAddingEducation && (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#1C2752] dark:text-gray-400">
                                Add your education history to showcase your academic journey.
                            </div>
                        )}

                        <div className="space-y-6">
                            {educationEntries.map((entry) => {
                                const isEditing = editingEducationId === entry.id
                                const levelLabel = entry.level === 'Other'
                                    ? entry.custom_level?.trim() || 'Other'
                                    : entry.level
                                const timeline = [entry.start_date, entry.end_date].filter(Boolean).join(' - ')
                                const meta = [timeline, entry.score ? `Score: ${entry.score}` : ''].filter(Boolean).join(' | ')

                                return (
                                    <div
                                        key={entry.id}
                                        className="rounded-3xl border border-gray-100 bg-gray-50 p-6 dark:border-[#31406B] dark:bg-[#1C2752]"
                                    >
                                        {!isEditing && (
                                            <>
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200 truncate">
                                                            {levelLabel} - {entry.institution || 'Institution'}
                                                        </p>
                                                        {meta && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meta}</p>
                                                        )}
                                                    </div>
                                                    {isEditing && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => startEditEducation(entry)}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#7C3AED] transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteEducation(entry.id)}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {entry.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{entry.description}</p>
                                                )}
                                            </>
                                        )}

                                        {isEditing && educationDraft && (
                                            <>
                                                <div className="flex items-center justify-between gap-3 mb-5">
                                                    <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200">Edit Education</p>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEducationEdit}
                                                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Cancel
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Institution</label>
                                                        <Input
                                                            value={educationDraft.institution}
                                                            onChange={(e) => updateEducationDraft({ institution: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="e.g. IIT Bhubaneswar"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Level</label>
                                                        <Select
                                                            value={educationDraft.level}
                                                            onChange={(e) => updateEducationDraft({ level: e.target.value as EducationLevel })}
                                                            className="rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            options={educationLevelOptions}
                                                        />
                                                    </div>

                                                    {educationDraft.level === 'Other' && (
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Custom Level</label>
                                                            <Input
                                                                value={educationDraft.custom_level || ''}
                                                                onChange={(e) => updateEducationDraft({ custom_level: e.target.value })}
                                                                className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                                placeholder="e.g. Certificate Course"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={educationDraft.start_date}
                                                            onChange={(e) => updateEducationDraft({ start_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={educationDraft.end_date}
                                                            onChange={(e) => updateEducationDraft({ end_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Score</label>
                                                        <Input
                                                            value={educationDraft.score}
                                                            onChange={(e) => updateEducationDraft({ score: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="CGPA / Percentage"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                                                        <textarea
                                                            value={educationDraft.description}
                                                            onChange={(e) => updateEducationDraft({ description: e.target.value })}
                                                            rows={3}
                                                            className="w-full p-4 rounded-xl border border-gray-200 bg-white/80 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
                                                            placeholder="Optional highlights, specialization, awards"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 mt-6">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={cancelEducationEdit}
                                                        className="rounded-xl"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={saveEducation}
                                                        loading={isEducationSaving}
                                                        className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 text-white hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Skills & Experience */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                <Code2 className="w-5 h-5" />
                            </div>
                            Skills & Professional Details
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Technical Skills</label>
                                {isEditing ? (
                                    <ReactSelect
                                        isMulti
                                        options={technicalSkillOptions}
                                        value={selectedTechnicalSkills}
                                        onChange={(selected) =>
                                            setProfileData((prev: any) => ({
                                                ...prev,
                                                technical_skills: toCsvString(selected as MultiSelectOption[]),
                                            }))
                                        }
                                        components={{ Option: CheckboxOption }}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        styles={reactSelectStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Search technical skills"
                                    />
                                ) : (
                                    <ReadonlyParagraph value={profileData.technical_skills} placeholder="React, Node.js, Python, SQL..." />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Soft Skills</label>
                                {isEditing ? (
                                    <ReactSelect
                                        isMulti
                                        options={softSkillOptions}
                                        value={selectedSoftSkills}
                                        onChange={(selected) =>
                                            setProfileData((prev: any) => ({
                                                ...prev,
                                                soft_skills: toCsvString(selected as MultiSelectOption[]),
                                            }))
                                        }
                                        components={{ Option: CheckboxOption }}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        styles={reactSelectStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Search soft skills"
                                    />
                                ) : (
                                    <ReadonlyParagraph value={profileData.soft_skills} placeholder="Communication, Leadership, Teamwork..." />
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Industry</label>
                                    {isEditing ? (
                                        <ReactSelect
                                            isMulti
                                            options={industryOptions}
                                            value={selectedIndustryOptions}
                                            onChange={(selected) =>
                                                setProfileData((prev: any) => ({
                                                    ...prev,
                                                    preferred_industry: toCsvString(selected as MultiSelectOption[]),
                                                }))
                                            }
                                            components={{ Option: CheckboxOption }}
                                            closeMenuOnSelect={false}
                                            hideSelectedOptions={false}
                                            styles={reactSelectStyles}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Search industries"
                                        />
                                    ) : (
                                        <ReadonlyField value={profileData.preferred_industry} placeholder="e.g. Fintech, Healthcare" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Roles of Interest</label>
                                    {isEditing ? (
                                        <ReactSelect
                                            isMulti
                                            options={roleOptions}
                                            value={selectedRoleOptions}
                                            onChange={(selected) =>
                                                setProfileData((prev: any) => ({
                                                    ...prev,
                                                    job_roles_of_interest: toCsvString(selected as MultiSelectOption[]),
                                                }))
                                            }
                                            components={{ Option: CheckboxOption }}
                                            closeMenuOnSelect={false}
                                            hideSelectedOptions={false}
                                            styles={reactSelectStyles}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Search roles"
                                        />
                                    ) : (
                                        <ReadonlyField value={profileData.job_roles_of_interest} placeholder="e.g. SDE, Data Analyst" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Internship Experience</label>
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            onClick={() => addExperience('internship')}
                                            className="h-9 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Internship
                                        </Button>
                                    )}
                                </div>
                                {!isEditing && renderExperienceList(experienceGroups.internship)}
                                {isEditing && (
                                    <div className="space-y-5">
                                        {experienceGroups.internship.map((entry) => (
                                            <div key={entry.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-[#31406B] dark:bg-[#1C2752]">
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Internship</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience('internship', entry.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company</label>
                                                        <Input
                                                            value={entry.company_name}
                                                            onChange={(e) => updateExperience('internship', entry.id, { company_name: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Company name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Role</label>
                                                        <Input
                                                            value={entry.role}
                                                            onChange={(e) => updateExperience('internship', entry.id, { role: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Role / Title"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={entry.start_date}
                                                            onChange={(e) => updateExperience('internship', entry.id, { start_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={entry.end_date}
                                                            onChange={(e) => updateExperience('internship', entry.id, { end_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Work Mode</label>
                                                        <Select
                                                            value={entry.work_mode}
                                                            onChange={(e) => updateExperience('internship', entry.id, { work_mode: e.target.value as WorkMode })}
                                                            className="rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            options={[
                                                                { value: 'onsite', label: 'Onsite' },
                                                                { value: 'hybrid', label: 'Hybrid' },
                                                                { value: 'remote', label: 'Remote' },
                                                            ]}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Major Project</label>
                                                        <Input
                                                            value={entry.major_project}
                                                            onChange={(e) => updateExperience('internship', entry.id, { major_project: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Key project or achievement"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Skills Used</label>
                                                        <TagInput
                                                            value={entry.skills}
                                                            onChange={(next) => updateExperience('internship', entry.id, { skills: next })}
                                                            placeholder="e.g. React, APIs, Communication"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full-time Experience</label>
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            onClick={() => addExperience('full_time')}
                                            className="h-9 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Full-time
                                        </Button>
                                    )}
                                </div>
                                {!isEditing && renderExperienceList(experienceGroups.full_time)}
                                {isEditing && (
                                    <div className="space-y-5">
                                        {experienceGroups.full_time.map((entry) => (
                                            <div key={entry.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-[#31406B] dark:bg-[#1C2752]">
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Full-time</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience('full_time', entry.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company</label>
                                                        <Input
                                                            value={entry.company_name}
                                                            onChange={(e) => updateExperience('full_time', entry.id, { company_name: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Company name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Role</label>
                                                        <Input
                                                            value={entry.role}
                                                            onChange={(e) => updateExperience('full_time', entry.id, { role: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Role / Title"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={entry.start_date}
                                                            onChange={(e) => updateExperience('full_time', entry.id, { start_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={entry.end_date}
                                                            onChange={(e) => updateExperience('full_time', entry.id, { end_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Work Mode</label>
                                                        <Select
                                                            value={entry.work_mode}
                                                            onChange={(e) => updateExperience('full_time', entry.id, { work_mode: e.target.value as WorkMode })}
                                                            className="rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            options={[
                                                                { value: 'onsite', label: 'Onsite' },
                                                                { value: 'hybrid', label: 'Hybrid' },
                                                                { value: 'remote', label: 'Remote' },
                                                            ]}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Major Project</label>
                                                        <Input
                                                            value={entry.major_project}
                                                            onChange={(e) => updateExperience('full_time', entry.id, { major_project: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Key project or achievement"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Skills Used</label>
                                                        <TagInput
                                                            value={entry.skills}
                                                            onChange={(next) => updateExperience('full_time', entry.id, { skills: next })}
                                                            placeholder="e.g. React, APIs, Communication"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Other Experience</label>
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            onClick={() => addExperience('other')}
                                            className="h-9 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Other
                                        </Button>
                                    )}
                                </div>
                                {!isEditing && renderExperienceList(experienceGroups.other)}
                                {isEditing && (
                                    <div className="space-y-5">
                                        {experienceGroups.other.map((entry) => (
                                            <div key={entry.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 p-5">
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Other</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience('other', entry.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company</label>
                                                        <Input
                                                            value={entry.company_name}
                                                            onChange={(e) => updateExperience('other', entry.id, { company_name: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Company name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Role</label>
                                                        <Input
                                                            value={entry.role}
                                                            onChange={(e) => updateExperience('other', entry.id, { role: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Role / Title"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={entry.start_date}
                                                            onChange={(e) => updateExperience('other', entry.id, { start_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={entry.end_date}
                                                            onChange={(e) => updateExperience('other', entry.id, { end_date: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Work Mode</label>
                                                        <Select
                                                            value={entry.work_mode}
                                                            onChange={(e) => updateExperience('other', entry.id, { work_mode: e.target.value as WorkMode })}
                                                            className="rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            options={[
                                                                { value: 'onsite', label: 'Onsite' },
                                                                { value: 'hybrid', label: 'Hybrid' },
                                                                { value: 'remote', label: 'Remote' },
                                                            ]}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Major Project</label>
                                                        <Input
                                                            value={entry.major_project}
                                                            onChange={(e) => updateExperience('other', entry.id, { major_project: e.target.value })}
                                                            className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                            placeholder="Key project or achievement"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Skills Used</label>
                                                        <TagInput
                                                            value={entry.skills}
                                                            onChange={(next) => updateExperience('other', entry.id, { skills: next })}
                                                            placeholder="e.g. React, APIs, Communication"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                        <div className="flex items-start justify-between gap-4 mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                Projects
                            </h3>
                            {isEditing && (
                                <Button
                                    type="button"
                                    onClick={addProject}
                                    className="h-10 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                >
                                    Add Project
                                </Button>
                            )}
                        </div>
                        {!isEditing && (
                            <div className="space-y-4">
                                {projects.length === 0 && (
                                    <div className="rounded-2xl border border-[#E1E8F8] bg-[#EEF2FF] p-5 text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#1C2752] dark:text-gray-400">
                                        Add your best projects to stand out. You can add multiple projects.
                                    </div>
                                )}

                                {projects.map((project, idx) => {
                                    const timeline = [project.start_date, project.end_date].filter(Boolean).join(' - ')
                                    return (
                                        <div key={project.id} className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 p-6">
                                            <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                                                {project.title?.trim() ? project.title : `Project ${idx + 1}`}
                                            </p>
                                            {project.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{project.description}</p>
                                            )}
                                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                {timeline && <p>{timeline}</p>}
                                                <p>Status: {project.status === 'completed' ? 'Completed' : 'In Progress'}</p>
                                                {project.skills_used.length > 0 && <p>Skills: {project.skills_used.join(', ')}</p>}
                                                {project.technologies_used.length > 0 && <p>Tech: {project.technologies_used.join(', ')}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {isEditing && (
                            <div className="space-y-6">
                                {projects.length === 0 && (
                                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                                        Add your best projects to stand out. You can add multiple projects.
                                    </div>
                                )}

                                {projects.map((project, idx) => (
                                    <div
                                        key={project.id}
                                        className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 p-6"
                                    >
                                        <div className="flex items-center justify-between gap-4 mb-5">
                                            <div className="min-w-0">
                                                <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200 truncate">
                                                    {project.title?.trim() ? project.title : `Project ${idx + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Keep it concise, include impact and links.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeProject(project.id)}
                                                className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Project Title</label>
                                                <Input
                                                    value={project.title}
                                                    onChange={(e) => updateProject(project.id, { title: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    placeholder="e.g. Campus Placement Portal"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Project Description</label>
                                                <textarea
                                                    value={project.description}
                                                    onChange={(e) => updateProject(project.id, { description: e.target.value })}
                                                    rows={3}
                                                    className="w-full p-4 rounded-xl border border-gray-200 bg-white/80 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
                                                    placeholder="What you built, what problem it solved, and the impact."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                                <Input
                                                    type="date"
                                                    value={project.start_date}
                                                    onChange={(e) => updateProject(project.id, { start_date: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                                <Input
                                                    type="date"
                                                    value={project.end_date}
                                                    onChange={(e) => updateProject(project.id, { end_date: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Status</label>
                                                <Select
                                                    value={project.status}
                                                    onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                                                    className="rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    options={[
                                                        { value: 'in_progress', label: 'In Progress' },
                                                        { value: 'completed', label: 'Completed' },
                                                    ]}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Project URL (optional)</label>
                                                <Input
                                                    type="url"
                                                    value={project.project_url || ''}
                                                    onChange={(e) => updateProject(project.id, { project_url: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    placeholder="https://yourproject.com"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">GitHub URL (optional)</label>
                                                <Input
                                                    type="url"
                                                    value={project.github_url || ''}
                                                    onChange={(e) => updateProject(project.id, { github_url: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    placeholder="https://github.com/username/repo"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Demo URL (optional)</label>
                                                <Input
                                                    type="url"
                                                    value={project.demo_url || ''}
                                                    onChange={(e) => updateProject(project.id, { demo_url: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    placeholder="https://youtube.com/..."
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Skills Used (tags)</label>
                                                <TagInput
                                                    value={project.skills_used}
                                                    onChange={(next) => updateProject(project.id, { skills_used: next })}
                                                    placeholder="e.g. Problem solving, Communication"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Technologies Used (tags)</label>
                                                <TagInput
                                                    value={project.technologies_used}
                                                    onChange={(next) => updateProject(project.id, { technologies_used: next })}
                                                    placeholder="e.g. Next.js, FastAPI, PostgreSQL"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Project Images (optional)</label>
                                                <TagInput
                                                    value={project.images}
                                                    onChange={(next) => updateProject(project.id, { images: next })}
                                                    placeholder="Paste image URLs (comma separated)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Custom Achievements */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                        <div className="flex items-start justify-between gap-4 mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                Custom Achievements
                            </h3>
                            {isEditing && (
                                <Button
                                    type="button"
                                    onClick={addAchievement}
                                    className="h-10 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 font-bold text-white shadow-lg shadow-[#7C3AED]/20 hover:from-[#6D28D9] hover:to-[#7C3AED]"
                                >
                                    Add Entry
                                </Button>
                            )}
                        </div>
                        {!isEditing && (
                            <div className="space-y-4">
                                {achievements.length === 0 && (
                                    <div className="rounded-2xl border border-[#E1E8F8] bg-[#EEF2FF] p-5 text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#1C2752] dark:text-gray-400">
                                        Add certifications, blogs, research, hackathons, open-source contributions, or any other professional achievement.
                                    </div>
                                )}

                                {achievements.map((achievement, idx) => (
                                    <div
                                        key={achievement.id}
                                        className="rounded-3xl border border-gray-100 bg-gray-50 p-6 dark:border-[#31406B] dark:bg-[#1C2752]"
                                    >
                                        <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                                            {achievement.title?.trim() ? achievement.title : `Achievement ${idx + 1}`}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Category: <span className="font-bold">{achievement.category}</span>
                                        </p>
                                        {achievement.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{achievement.description}</p>
                                        )}
                                        {achievement.tags.length > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tags: {achievement.tags.join(', ')}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isEditing && (
                            <div className="space-y-6">
                                {achievements.length === 0 && (
                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#1C2752] dark:text-gray-400">
                                        Add certifications, blogs, research, hackathons, open-source contributions, or any other professional achievement.
                                    </div>
                                )}

                                {achievements.map((achievement, idx) => (
                                    <div
                                        key={achievement.id}
                                        className="rounded-3xl border border-gray-100 bg-gray-50 p-6 dark:border-[#31406B] dark:bg-[#1C2752]"
                                    >
                                        <div className="flex items-center justify-between gap-4 mb-5">
                                            <div className="min-w-0">
                                                <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200 truncate">
                                                    {achievement.title?.trim() ? achievement.title : `Achievement ${idx + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Category: <span className="font-bold">{achievement.category}</span>
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAchievement(achievement.id)}
                                                className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title</label>
                                                <Input
                                                    value={achievement.title}
                                                    onChange={(e) => updateAchievement(achievement.id, { title: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    placeholder="e.g. AWS Cloud Practitioner"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                                                <Select
                                                    value={achievement.category}
                                                    onChange={(e) => updateAchievement(achievement.id, { category: e.target.value as AchievementCategory })}
                                                    className="rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    options={[
                                                        { value: 'Certification', label: 'Certification' },
                                                        { value: 'Blog', label: 'Blog / Article' },
                                                        { value: 'Research', label: 'Research Paper' },
                                                        { value: 'Other', label: 'Other' },
                                                    ]}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Date</label>
                                                <Input
                                                    type="date"
                                                    value={achievement.date}
                                                    onChange={(e) => updateAchievement(achievement.id, { date: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                                                <textarea
                                                    value={achievement.description}
                                                    onChange={(e) => updateAchievement(achievement.id, { description: e.target.value })}
                                                    rows={3}
                                                    className="w-full p-4 rounded-xl border border-gray-200 bg-white/80 dark:bg-black/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
                                                    placeholder="What you achieved and why it matters."
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tags</label>
                                                <TagInput
                                                    value={achievement.tags}
                                                    onChange={(next) => updateAchievement(achievement.id, { tags: next })}
                                                    placeholder="e.g. Cloud, DevOps, Writing"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">URL (optional)</label>
                                                <Input
                                                    type="url"
                                                    value={achievement.url || ''}
                                                    onChange={(e) => updateAchievement(achievement.id, { url: e.target.value })}
                                                    className="pl-4 rounded-xl border-gray-200 bg-white/80 dark:bg-black/20"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Secondary Actions */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Additional Profile Details */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-[#E9E7FF] p-2 text-[#7C3AED] dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                <MapPin className="w-5 h-5" />
                            </div>
                            Additional Details
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Gender</label>
                                {isEditing ? (
                                    <Select
                                        value={profileData.gender || ''}
                                        onChange={(e) => setProfileData((prev: any) => ({ ...prev, gender: e.target.value }))}
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                        options={genderOptions}
                                    />
                                ) : (
                                    <ReadonlyField value={formatLabel(profileData.gender)} placeholder="Select gender" />
                                )}
                            </div>

                            {/* <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Countryi</label>
                                {isEditing ? (
                                    <Input
                                        name="country"
                                        value={profileData.country || ''}
                                        onChange={handleInputChange}
                                        placeholder="Country"
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                    />
                                ) : (
                                    <ReadonlyField value={profileData.country} placeholder="Country" />
                                )}
                            </div> */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Country</label>
                                {isEditing ? (
                                    <Select 
                                        name="country"
                                        value={profileData.country || 'india'}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                        options={[{ value: 'india', label: 'India' }]}
                                    />
                                ) : (
                                    <ReadonlyField value="India" />
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">State & City</label>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReactSelect<MultiSelectOption, false>
                                                styles={reactSelectStyles}
                                                options={stateOptions}
                                                value={stateOptions.find((option) => option.value === profileData.state) || null}
                                                onChange={(option: SingleValue<MultiSelectOption>) => {
                                                    setProfileData((prev: any) => ({
                                                        ...prev,
                                                        state: option?.value || '',
                                                        city: '',
                                                    }))
                                                }}
                                                placeholder="Select state"
                                                isClearable
                                                className="rounded-xl"
                                            />
                                            <ReactSelect<MultiSelectOption, false>
                                                styles={reactSelectStyles}
                                                options={availableCityOptions}
                                                value={availableCityOptions.find((option) => option.value === profileData.city) || null}
                                                onChange={(option: SingleValue<MultiSelectOption>) => {
                                                    setProfileData((prev: any) => ({
                                                        ...prev,
                                                        city: option?.value || '',
                                                    }))
                                                }}
                                                placeholder={profileData.state ? 'Select city' : 'Select state first'}
                                                isDisabled={!profileData.state}
                                                isClearable
                                                className="rounded-xl"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadonlyField value={stateOptions.find((s) => s.value === profileData.state)?.label} placeholder="Not specified" />
                                            <ReadonlyField value={profileData.city} placeholder="City" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Location Preference</label>
                                {isEditing ? (
                                    <Select
                                        value={profileData.location_preferences || ''}
                                        onChange={(e) => setProfileData((prev: any) => ({ ...prev, location_preferences: e.target.value }))}
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                        options={locationPreferenceOptions}
                                    />
                                ) : (
                                    <ReadonlyField value={formatLabel(profileData.location_preferences)} placeholder="Select preference" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Language Proficiency</label>
                                {isEditing ? (
                                    <TagInput
                                        value={languageTags}
                                        onChange={setLanguageTags}
                                        placeholder="Mother Tongue, English, Hindi, Odia"
                                    />
                                ) : (
                                    <ReadonlyParagraph value={languageTags.join(', ')} placeholder="Add languages" />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Professional Links */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                             <div className="rounded-xl bg-[#E9E7FF] p-2 text-[#7C3AED] dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            Professional Links
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                    <Linkedin className="w-4 h-4 text-[#0077b5]" /> LinkedIn
                                </div>
                                {isEditing ? (
                                    <Input 
                                        name="linkedin_profile"
                                        value={profileData.linkedin_profile || ''}
                                        onChange={handleInputChange}
                                        placeholder="linkedin.com/in/username"
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                    />
                                ) : (
                                    profileData.linkedin_profile ? (
                                        <a
                                            href={normalizeUrl(profileData.linkedin_profile)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                            <span>{profileData.linkedin_profile}</span>
                                        </a>
                                    ) : (
                                        <ReadonlyField value="" placeholder="linkedin.com/in/username" />
                                    )
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                    <Github className="w-4 h-4 text-black dark:text-white" /> GitHub
                                </div>
                                {isEditing ? (
                                    <Input 
                                        name="github_profile"
                                        value={profileData.github_profile || ''}
                                        onChange={handleInputChange}
                                        placeholder="github.com/username"
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                    />
                                ) : (
                                    profileData.github_profile ? (
                                        <a
                                            href={normalizeUrl(profileData.github_profile)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <Github className="w-4 h-4" />
                                            <span>{profileData.github_profile}</span>
                                        </a>
                                    ) : (
                                        <ReadonlyField value="" placeholder="github.com/username" />
                                    )
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                    <Globe className="w-4 h-4 text-emerald-500" /> Portfolio Website
                                </div>
                                {isEditing ? (
                                    <Input 
                                        name="personal_website"
                                        value={profileData.personal_website || ''}
                                        onChange={handleInputChange}
                                        placeholder="yourwebsite.com"
                                        className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                    />
                                ) : (
                                    profileData.personal_website ? (
                                        <a
                                            href={normalizeUrl(profileData.personal_website)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>{profileData.personal_website}</span>
                                        </a>
                                    ) : (
                                        <ReadonlyField value="" placeholder="yourwebsite.com" />
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resume Section */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                <FileText className="w-5 h-5" />
                            </div>
                            Resume
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Upload your latest resume (PDF)</p>

                        {profileData.resume_url && (
                            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#E1E8F8] bg-[#EEF2FF] p-4 dark:border-[#31406B] dark:bg-[#1C2752]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Current Resume</p>
                                        <a href={normalizeUrl(profileData.resume_url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Document</a>
                                    </div>
                                </div>
                                <a href={normalizeUrl(profileData.resume_url)} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#7C3AED]">
                                    <LinkIcon className="w-4 h-4" />
                                </a>
                            </div>
                        )}

                        <label className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 transition-all group ${uploadSuccess ? 'border-green-500 bg-green-50/20' : 'border-dashed border-gray-200 bg-gray-50 hover:border-[#7C3AED] dark:border-[#31406B] dark:bg-[#0C1430]'}`}>
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                {isUploading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="mb-2 h-8 w-8 rounded-full border-3 border-[#7C3AED] border-t-transparent animate-spin"></div>
                                        <p className="text-xs font-bold text-[#7C3AED]">Uploading...</p>
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
                                        <UploadCloud className="mb-2 w-8 h-8 text-gray-400 transition-colors group-hover:text-[#7C3AED]" />
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Click to upload resume</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={isUploading} />
                        </label>
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="rounded-3xl border border-[#DCE5F8] bg-gradient-to-br from-[#EEF2FF] to-[#E3EAFE] p-8 text-gray-900 shadow-xl dark:border-[#243056] dark:bg-gradient-to-br dark:from-[#121C46] dark:to-[#1C2752] dark:text-white">
                        <h4 className="mb-4 flex items-center gap-2 font-bold">
                            <Briefcase className="w-5 h-5 text-[#7C3AED]" />
                            Career Insight
                        </h4>
                        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">Your profile is seen by over <span className="font-bold text-[#7C3AED] dark:text-[#8B5CF6]">50+ recruitment partners</span> on DishaSetu.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Profile Strength</span>
                                <span className={`${profileStrength < 100 ? 'text-[#7C3AED]' : 'text-green-400'} font-bold`}>{profileStrength}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#C7D2FE] dark:bg-gray-700">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${profileStrength}%` }}
                                    className={`h-full ${profileStrength < 100 ? 'bg-[#7C3AED]' : 'bg-green-500'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Float save button for mobile */}
            {isEditing && (
                <div className="fixed bottom-6 right-6 md:hidden z-50">
                    <Button 
                        onClick={handleSaveProfile}
                        loading={isSaving}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] p-0 text-white shadow-2xl hover:from-[#6D28D9] hover:to-[#7C3AED]"
                    >
                        <Save className="w-6 h-6" />
                    </Button>
                </div>
            )}
        </div>
    )
}
