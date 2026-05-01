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
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

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
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState<any>({})
    const [showNudge, setShowNudge] = useState(false)
    const [educationDraft, setEducationDraft] = useState<StudentEducation | null>(null)
    const [editingEducationId, setEditingEducationId] = useState<string | null>(null)
    const [isEducationSaving, setIsEducationSaving] = useState(false)
    const [isAddingEducation, setIsAddingEducation] = useState(false)

    // Resume Upload States
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const profileStrength = calculateProfileStrength(profileData)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setIsLoading(true)
            const data = await apiClient.getStudentProfile()
            const hydrated = hydrateDynamicSections(data ?? {})
            setProfileData(hydrateDynamicSections(data ?? {}))
            setShowNudge(calculateProfileStrength(hydrated) < 100)
        } catch (error: any) {
            console.error("Error fetching profile:", error)
            const status = error?.response?.status
            const isNetworkError = error?.message === 'Network Error' || !error?.response
            const fallback = user?.email ? { email: user.email } : {}
            setProfileData(hydrateDynamicSections(fallback))
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
            const { experience, ...payload } = profileData || {}
            const experiencePayload = flattenExperienceGroups(normalizeExperienceGroups(experience))
            const updated = await apiClient.updateStudentProfile({ ...payload, experience: experiencePayload })
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
                const created = await apiClient.addStudentEducation(payload)
                setProfileData((prev: any) => ({
                    ...prev,
                    education: [created, ...(prev?.education ?? [])],
                }))
                toast.success('Education added')
            } else if (editingEducationId) {
                const updated = await apiClient.updateStudentEducation(editingEducationId, payload)
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
            await apiClient.deleteStudentEducation(educationId)
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
        { value: 'other', label: 'Other' },
    ]

    const locationPreferenceOptions = [
        { value: 'onsite', label: 'Onsite' },
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
    ]

    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100">
            {/* Profile Completeness Nudge */}
            <AnimatePresence>
                {showNudge && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-6 overflow-hidden"
                    >
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-amber-800 dark:text-amber-200">Complete your profile</p>
                                    <p className="text-sm text-amber-700/80 dark:text-amber-300/80">A complete profile increases your chances of getting hired by 3x!</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNudge(false)} className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
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
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-[#241A52] dark:text-[#8B5CF6]">
                                <User className="w-5 h-5" />
                            </div>
                            Personal Information
                        </h3>

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
                                    <Input 
                                        name="phone"
                                        value={profileData.phone || ''}
                                        onChange={handleInputChange}
                                        className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                ) : (
                                    <ReadonlyField value={profileData.phone} placeholder="+91 XXXXX XXXXX" />
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
                    <div id="resume" className="scroll-mt-24 rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
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
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
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
                                    <textarea 
                                        name="technical_skills"
                                        value={profileData.technical_skills || ''}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED] dark:border-[#31406B] dark:bg-[#0C1430]"
                                        placeholder="React, Node.js, Python, SQL..."
                                    />
                                ) : (
                                    <ReadonlyParagraph value={profileData.technical_skills} placeholder="React, Node.js, Python, SQL..." />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Soft Skills</label>
                                {isEditing ? (
                                    <textarea 
                                        name="soft_skills"
                                        value={profileData.soft_skills || ''}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED] dark:border-[#31406B] dark:bg-[#0C1430]"
                                        placeholder="Communication, Leadership, Teamwork..."
                                    />
                                ) : (
                                    <ReadonlyParagraph value={profileData.soft_skills} placeholder="Communication, Leadership, Teamwork..." />
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Industry</label>
                                    {isEditing ? (
                                        <Input 
                                            name="preferred_industry"
                                            value={profileData.preferred_industry || ''}
                                            onChange={handleInputChange}
                                            className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                            placeholder="e.g. Fintech, Healthcare"
                                        />
                                    ) : (
                                        <ReadonlyField value={profileData.preferred_industry} placeholder="e.g. Fintech, Healthcare" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Roles of Interest</label>
                                    {isEditing ? (
                                        <Input 
                                            name="job_roles_of_interest"
                                            value={profileData.job_roles_of_interest || ''}
                                            onChange={handleInputChange}
                                            className="pl-4 rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                            placeholder="e.g. SDE, Data Analyst"
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
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
                        <div className="flex items-start justify-between gap-4 mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
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
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
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
                    <div className="rounded-3xl border border-[#DCE5F8] bg-[#F7F8FF] p-8 shadow-sm dark:border-[#243056] dark:bg-[#121C46]">
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

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Country</label>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">State</label>
                                    {isEditing ? (
                                        <Input
                                            name="state"
                                            value={profileData.state || ''}
                                            onChange={handleInputChange}
                                            placeholder="State"
                                            className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                        />
                                    ) : (
                                        <ReadonlyField value={profileData.state} placeholder="State" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">City</label>
                                    {isEditing ? (
                                        <Input
                                            name="city"
                                            value={profileData.city || ''}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            className="rounded-xl border-gray-200 bg-gray-50 dark:border-[#31406B] dark:bg-[#0C1430]"
                                        />
                                    ) : (
                                        <ReadonlyField value={profileData.city} placeholder="City" />
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
