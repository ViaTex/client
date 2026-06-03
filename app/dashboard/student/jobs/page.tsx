"use client"

import { useEffect, useMemo, useState } from "react"
import { JobApplicationItem, JobItem } from "@/lib/api"
import { jobService } from "@/services/job.service"
import { studentService } from "@/services/student.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import { JobCard } from "@/components/ui/job-card"
import { Filter, Search, MapPin, Building, Briefcase, IndianRupee, Clock, ChevronDown, CheckCircle2, ChevronRight, CheckSquare, Plus, ExternalLink, CalendarDays, Globe, Contact, FileText, ClipboardList, ShieldCheck, GraduationCap, FolderKanban, FileBadge2, Gift, User, Building2, ArrowLeft, Send } from "lucide-react"
import { JobDetails } from "@/components/ui/job-details"

type JobFilter = "all" | "jobs" | "internships"
type JobAvailability = "all" | "open" | "closed"

type StudentProfileSummary = {
    name?: string | null
    phone?: string | null
    bio?: string | null
    education?: unknown
    technical_skills?: string | null
    soft_skills?: string | null
    preferred_industry?: string | null
    job_roles_of_interest?: string | null
    gender?: string | null
    country?: string | null
    state?: string | null
    city?: string | null
    location_preferences?: string | null
    language_proficiency?: string | null
    linkedin_profile?: string | null
    github_profile?: string | null
    personal_website?: string | null
    resume_url?: string | null
    current_des_score?: number | string | null
}

type ResumeStatusSummary = {
    has_resume?: boolean
    resume_uploaded?: boolean
    ats_score?: number | null
}

const pageIntroVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

const filterPanelVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.1, ease: "easeOut" } },
}

const listVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.03,
        },
    },
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: (index = 0) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.25, delay: Math.min(index * 0.02, 0.15), ease: "easeOut" },
    }),
    exit: { opacity: 0, y: 5, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } },
}

function getErrorMessage(error: any, fallback: string) {
    const detail = error?.response?.data?.detail
    if (typeof detail === "string" && detail.trim()) return detail
    if (Array.isArray(detail) && detail.length) {
        return detail
            .map((item) => (typeof item === "string" ? item : item?.msg))
            .filter(Boolean)
            .join(", ")
    }
    if (error?.response?.status) return `${fallback} (${error.response.status})`
    return error?.message || fallback
}

function withRequestTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
    let timeoutId: ReturnType<typeof setTimeout>
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs)
    })

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
}

function formatLabel(value?: string | null) {
    if (!value) return "Not specified"
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getApplicationStatusButton(status?: string | null) {
    const label = formatLabel(status || "applied")
    const tone =
        status === "selected"
            ? "bg-[#16A34A] text-white hover:bg-[#15803D]"
            : status === "shortlisted"
                ? "bg-[#EAB308] text-white hover:bg-[#CA8A04]"
                : status === "rejected"
                    ? "bg-[#EF4444] text-white hover:bg-[#DC2626]"
                    : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"

    return { label, tone }
}

function formatValue(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "Not specified"
    return String(value)
}

function formatList(values?: string[] | null) {
    if (!values?.length) return "Not specified"
    return values.join(", ")
}

function formatDate(value?: string | null) {
    if (!value) return "Not specified"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function formatSalary(job: JobItem) {
    if (job.salary_min == null && job.salary_max == null && !job.ctc_with_probation && !job.ctc_after_probation) {
        return "Not specified"
    }
    if (job.salary_min != null && job.salary_max != null) {
        return `${job.salary_min} - ${job.salary_max} ${job.salary_currency || "INR"}`
    }
    if (job.salary_min != null || job.salary_max != null) {
        return `${job.salary_min ?? job.salary_max} ${job.salary_currency || "INR"}`
    }
    if (job.ctc_with_probation && job.ctc_after_probation) {
        return `${job.ctc_with_probation} -> ${job.ctc_after_probation}`
    }
    return job.ctc_after_probation || job.ctc_with_probation || "Not specified"
}

function hasNonEmptyValue(value: unknown) {
    if (typeof value === "string") return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
}

function hasEducationEntries(value: unknown) {
    if (!Array.isArray(value)) return false
    return value.some((entry: any) => Boolean(entry?.institution) && Boolean(entry?.level))
}

function calculateProfileStrength(data: StudentProfileSummary | null) {
    if (!data) return 0
    const checks = [
        hasNonEmptyValue(data.name) && hasNonEmptyValue(data.phone) && hasNonEmptyValue(data.bio),
        hasEducationEntries(data.education),
        hasNonEmptyValue(data.technical_skills),
        hasNonEmptyValue(data.soft_skills),
        hasNonEmptyValue(data.preferred_industry) && hasNonEmptyValue(data.job_roles_of_interest),
        hasNonEmptyValue(data.gender) && hasNonEmptyValue(data.country) && hasNonEmptyValue(data.state) && hasNonEmptyValue(data.city),
        hasNonEmptyValue(data.location_preferences) && hasNonEmptyValue(data.language_proficiency),
        hasNonEmptyValue(data.linkedin_profile) || hasNonEmptyValue(data.github_profile) || hasNonEmptyValue(data.personal_website),
        hasNonEmptyValue(data.resume_url),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function getDefaultExpectedSalary(job: JobItem) {
    const value = job.salary_min ?? job.salary_max
    if (value == null) return ""
    return String(value).replace(/\.00$/, "")
}

function getJobDepartment(job: JobItem) {
    return job.industry?.trim() || ""
}

function getJobLocationLabel(job: JobItem) {
    const location = job.location?.trim()
    const workMode = formatLabel(job.mode_of_work || "onsite")
    return location ? `${location} (${workMode})` : ""
}

function buildApplicationCoverLetter({
    role,
    department,
    location,
    salaryPeriod,
    about,
}: {
    role: string
    department: string
    location: string
    salaryPeriod: string
    about: string
}) {
    return [
        `Job Role: ${role || "Not specified"}`,
        `Department: ${department || "Not specified"}`,
        `Location: ${location || "Not specified"}`,
        `Salary Period: ${salaryPeriod || "Not specified"}`,
        "",
        "About:",
        about || "Not specified",
    ].join("\n")
}

function matchesTypeFilter(job: JobItem, filter: JobFilter) {
    if (filter === "all") return true
    if (filter === "internships") return job.job_type === "internship"
    return job.job_type !== "internship"
}

function matchesAvailability(job: JobItem, availability: JobAvailability) {
    if (availability === "all") return true
    const isOpen = job.status === "active" && job.can_apply !== false
    return availability === "open" ? isOpen : !isOpen
}

export default function StudentJobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [applications, setApplications] = useState<JobApplicationItem[]>([])
    const [studentProfile, setStudentProfile] = useState<StudentProfileSummary | null>(null)
    const [resumeStatus, setResumeStatus] = useState<ResumeStatusSummary | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [actionMessage, setActionMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<JobFilter>("all")
    const [availability, setAvailability] = useState<JobAvailability>("all")
    const [selectedCompany, setSelectedCompany] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("")
    const [selectedIndustry, setSelectedIndustry] = useState("")
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
    const [applyJob, setApplyJob] = useState<JobItem | null>(null)
    const [applyingJobId, setApplyingJobId] = useState("")
    const [applyRole, setApplyRole] = useState("")
    const [applyDepartment, setApplyDepartment] = useState("")
    const [applyLocation, setApplyLocation] = useState("")
    const [expectedSalary, setExpectedSalary] = useState("")
    const [salaryPeriod, setSalaryPeriod] = useState("Per Annum")
    const [coverLetter, setCoverLetter] = useState("")
    const [termsAccepted, setTermsAccepted] = useState([true, true, true, true])
    const [showTermsModal, setShowTermsModal] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            // Check if user is authenticated
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('access_token')
                if (!token) {
                    setError("Please log in to view jobs and internships.")
                    setLoading(false)
                    return
                }
            }
            setLoading(true)
            setError("")

            try {
                const jobsData = await withRequestTimeout(jobService.getAll(false), 45000, "Request timeout")
                setJobs(jobsData || [])

                // If jobs loaded successfully but no data, provide helpful message
                if (jobsData && jobsData.length === 0) {
                    console.log('No jobs available from API')
                }

                // Load applications with timeout
                try {
                    const applicationsData = await withRequestTimeout(jobService.getMyApplications(), 45000, "Applications request timeout")
                    setApplications(applicationsData || [])
                } catch (e: any) {
                    setApplications([])
                    // Don't set action message for applications error to avoid blocking the page
                    // But log for debugging
                    console.error('Failed to load applications:', e)
                    if (e?.response?.status === 401) {
                        // Applications endpoint also requires auth, but main error handling will redirect
                        console.log('Authentication required for applications')
                    }
                }

                try {
                    const [profileData, resumeData] = await Promise.all([
                        studentService.getProfile(),
                        studentService.getResumeStatus().catch(() => null),
                    ])
                    setStudentProfile(profileData || null)
                    setResumeStatus(resumeData || null)
                } catch (e) {
                    setStudentProfile(null)
                    setResumeStatus(null)
                    console.error('Failed to load application eligibility:', e)
                }
            } catch (e: any) {
                if (e.code === 'NETWORK_ERROR') {
                    setError(e.message)
                } else if (e.message === 'Request timeout') {
                    setError("The server is taking too long to respond. Please try again later.")
                } else if (e?.response?.status === 401) {
                    setError("Your session has expired. Please log in again.")
                    // The interceptor will handle redirect, but we provide a clear message
                } else {
                    setError(getErrorMessage(e, "Failed to load jobs"))
                }
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const filteredJobs = useMemo(() => {
        // Early return if no jobs
        if (!jobs.length) return []

        const query = searchTerm.trim().toLowerCase()
        const company = selectedCompany.trim().toLowerCase()
        const role = selectedRole.trim().toLowerCase()
        const location = selectedLocation.trim().toLowerCase()
        const industry = selectedIndustry.trim().toLowerCase()

        return jobs.filter((job) => {
            if (!matchesTypeFilter(job, filter)) return false
            if (!matchesAvailability(job, availability)) return false
            if (company && !job.company_name?.toLowerCase().includes(company)) return false
            if (role && !job.title?.toLowerCase().includes(role)) return false
            if (location && !job.location?.toLowerCase().includes(location)) return false
            if (industry && !job.industry?.toLowerCase().includes(industry)) return false
            if (!query) return true

            // Optimize search by checking most likely fields first
            return job.title?.toLowerCase().includes(query) ||
                job.company_name?.toLowerCase().includes(query) ||
                job.location?.toLowerCase().includes(query) ||
                job.industry?.toLowerCase().includes(query) ||
                (job.skills_required || []).some(skill => skill.toLowerCase().includes(query))
        })
    }, [availability, filter, jobs, searchTerm, selectedCompany, selectedIndustry, selectedLocation, selectedRole])

    const appliedJobIds = useMemo(() => new Set(applications.map((application) => application.job_id)), [applications])
    const applicationByJobId = useMemo(
        () => new Map(applications.map((application) => [application.job_id, application])),
        [applications]
    )

    const stats = useMemo(
        () => ({
            open: jobs.filter((job) => job.status === "active" && job.can_apply !== false).length,
            closed: jobs.filter((job) => job.status !== "active" || job.can_apply === false).length,
            total: jobs.length,
        }),
        [jobs]
    )

    const applicationEligibility = useMemo(() => {
        const profileCompletion = calculateProfileStrength(studentProfile)
        const desScore = Number(studentProfile?.current_des_score ?? 0)
        const atsScore = typeof resumeStatus?.ats_score === "number" ? resumeStatus.ats_score : null
        const hasResume = Boolean(resumeStatus?.has_resume || resumeStatus?.resume_uploaded || studentProfile?.resume_url)
        const checks = [
            {
                label: "Resume uploaded",
                passed: hasResume,
                value: hasResume ? "Uploaded" : "Missing",
                fix: "Upload your resume from the Resume page.",
            },
            {
                label: "ATS score greater than 70",
                passed: typeof atsScore === "number" && atsScore > 70,
                value: typeof atsScore === "number" ? `${atsScore}/100` : "Not calculated",
                fix: "Calculate your ATS score after uploading resume.",
            },
            {
                label: "DES/exam score at least 50",
                passed: Number.isFinite(desScore) && desScore >= 50,
                value: `${Number.isFinite(desScore) ? Math.round(desScore) : 0}/100`,
                fix: "Complete the skill verification exam and score 50 or above.",
            },
            {
                label: "Profile completion at least 90%",
                passed: profileCompletion >= 90,
                value: `${profileCompletion}%`,
                fix: "Complete your student profile to 90% or more.",
            },
        ]
        return {
            checks,
            canApply: checks.every((check) => check.passed),
        }
    }, [resumeStatus, studentProfile])

    const openApplyModal = (job: JobItem) => {
        setApplyJob(job)
        setSelectedJob(null)
        setApplyRole(job.title || "")
        setApplyDepartment(getJobDepartment(job))
        setApplyLocation(getJobLocationLabel(job))
        setExpectedSalary(getDefaultExpectedSalary(job))
        setSalaryPeriod("Per Annum")
        setCoverLetter("")
        setTermsAccepted([false, false, false, false])
        setError("")
        setActionMessage("")
    }

    const closeApplyModal = () => {
        if (applyingJobId) return
        setApplyJob(null)
    }

    const handleApply = async (job: JobItem, applicationData?: { expected_salary?: number; cover_letter?: string }) => {
        if (appliedJobIds.has(job.id)) {
            setActionMessage("You have already applied to this job.")
            return
        }

        setApplyingJobId(job.id)
        setError("")
        setActionMessage("")

        try {
            const application = await withRequestTimeout(
                jobService.apply(job.id, applicationData),
                30000,
                "Application request timeout"
            )

            setApplications((current) => [application, ...current])
            const nextApplications = (job.current_applications || 0) + 1
            const patch = {
                current_applications: nextApplications,
                can_apply: job.max_applications != null ? nextApplications < job.max_applications : job.can_apply,
            }
            setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, ...patch } : item)))
            setSelectedJob((current) => (current?.id === job.id ? { ...current, ...patch } : current))
            setApplyJob(null)
            setActionMessage(`Application submitted for ${job.title}.`)
        } catch (e: any) {
            if (e.message === 'Application request timeout') {
                setError("Application request is taking too long. Please try again.")
            } else if (e.code === 'NETWORK_ERROR') {
                setError(e.message)
            } else {
                setError(e?.response?.data?.detail || "Failed to apply for this job")
            }
        } finally {
            setApplyingJobId("")
        }
    }

    const handleSubmitApplication = () => {
        if (!applyJob) return
        if (!applicationEligibility.canApply) {
            setShowTermsModal(true)
            setError("You are not eligible to apply yet. Please complete the requirements in Terms & Conditions.")
            return
        }
        if (!termsAccepted.every(Boolean)) {
            setError("Please accept all terms and conditions before applying.")
            return
        }

        const numericSalary = expectedSalary ? Number(expectedSalary.replace(/,/g, "")) : undefined
        if (numericSalary !== undefined && Number.isNaN(numericSalary)) {
            setError("Enter a valid expected salary.")
            return
        }

        handleApply(applyJob, {
            expected_salary: numericSalary,
            cover_letter: buildApplicationCoverLetter({
                role: applyRole,
                department: applyDepartment,
                location: applyLocation,
                salaryPeriod,
                about: coverLetter.trim(),
            }),
        })
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5 px-3 text-gray-900 dark:text-gray-100 sm:px-4 md:px-6 py-6">
            {/* Header Area */}
            <div className="space-y-4">
                {/* Title Section */}
                {/* <div className="bg-white rounded-[16px] p-5 sm:p-6 shadow-sm border border-[#E5E7EB] dark:bg-[#121C46] dark:border-[#243056]">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-6 h-6 text-[#1B6CFB]" />
                        <h1 className="text-[22px] sm:text-[26px] font-bold text-gray-900 dark:text-white tracking-tight">Available Jobs in Market</h1>
                    </div>
                    <p className="text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 font-medium">
                        Browse real-time job listings from LinkedIn, Unstop, Foundit, and Naukri based on your skills
                    </p>
                </div> */}

                {/* Search Section */}
                <div className="bg-white rounded-[16px] p-5 sm:p-6 shadow-sm border border-[#E5E7EB] dark:bg-[#121C46] dark:border-[#243056]">
                    <div className="flex items-center gap-2 mb-1">
                        <Search className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">Search Jobs</h2>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 font-medium">
                        Enter keywords OR enable resume skills to search for jobs
                    </p>

                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                        {/* Keyword Input */}
                        <div className="flex items-center flex-1 h-[50px] px-5 rounded-[33px] border border-[#E5E7EB] dark:border-[#31406B] bg-white dark:bg-[#0C1430] w-full lg:max-w-[400px]">
                            <Search className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Job title or keyword"
                                className="w-full outline-none border-none ring-0 focus:ring-0 text-[14px] bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 p-0 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Location Input */}
                        <div className="flex items-center flex-1 h-[50px] px-5 rounded-[33px] border border-[#E5E7EB] dark:border-[#31406B] bg-white dark:bg-[#0C1430] w-full">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full outline-none border-none ring-0 focus:ring-0 text-[14px] bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 p-0 font-medium"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <button
                                type="button"
                                onClick={() => { setSearchTerm(""); setSelectedLocation(""); setSelectedIndustry(""); }}
                                className="flex items-center justify-center gap-2 h-[50px] px-6 rounded-[33px] border border-[#E5E7EB] dark:border-[#31406B] bg-white dark:bg-[#0C1430] text-gray-700 dark:text-gray-300 text-[14px] font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                                Filter
                            </button>
                            <button
                                type="button"
                                className="h-[50px] px-8 rounded-[33px] bg-[#1B6CFB] hover:bg-[#155ade] active:scale-95 transition-all shadow-sm hover:shadow-md text-white text-[15px] font-bold w-full sm:w-auto flex-shrink-0"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* Main Content (Left) */}
                <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 lg:col-span-9"
                >
                    {loading ? <p className="text-sm text-gray-500">Finding matching jobs for you...</p> : null}
                    {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</p> : null}
                    {actionMessage ? <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">{actionMessage}</p> : null}
                    {!loading && !error && filteredJobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-[#31406B] dark:bg-[#121C46] dark:text-[#A8B3CF]">
                            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-[#53618C]" />
                            No matching jobs or internships found.
                        </div>
                    ) : null}

                    {/* AI Job Recommendations Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
                        <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-white">AI-Powered Job Recommendations</h2>
                        <div className="flex items-center mt-3 sm:mt-0">
                            <div className="bg-white dark:bg-[#0C1430] border border-gray-200 dark:border-[#31406B] px-3 py-1.5 rounded-md shadow-sm flex items-center gap-2">
                                <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{appliedJobIds.size}</span>
                                <span className="text-[13px] font-medium text-gray-600 dark:text-gray-400">Saved</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.map((job, index) => {
                                const application = applicationByJobId.get(job.id)
                                const isApplied = Boolean(application)
                                const isClosed = job.status !== "active" || job.can_apply === false
                                const applicationStatus = getApplicationStatusButton(application?.status)

                                return (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        variant="student"
                                        index={index}
                                        isApplied={isApplied}
                                        applyingJobId={applyingJobId}
                                        isClosed={isClosed}
                                        applicationStatus={applicationStatus}
                                        onApply={openApplyModal}
                                    />
                                )
                            })}
                        </AnimatePresence>
                    </div>

                    {filteredJobs.length > 0 ? (
                        <p className="text-sm text-gray-600 dark:text-[#A8B3CF] mt-4">
                            Showing <span className="font-semibold">{filteredJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> results
                        </p>
                    ) : null}
                </motion.div>

                {/* Sidebar (Right) */}
                <motion.aside
                    variants={filterPanelVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6 lg:col-span-3"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Job Filter</h3>
                        <button
                            className="text-sm text-[#1B6CFB] font-semibold hover:underline"
                            onClick={() => { setFilter("all"); setAvailability("all"); setSelectedCompany(""); setSelectedRole(""); setSelectedLocation(""); setSelectedIndustry(""); }}
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Job Type</h4>
                            <button className="text-xs text-[#1B6CFB] hover:underline" onClick={() => setFilter("all")}>Clear</button>
                        </div>
                        <div className="space-y-3 pt-2">
                            {[
                                { id: "all", label: "All Types", count: jobs.length },
                                { id: "jobs", label: "Full Time", count: jobs.filter(j => j.job_type !== "internship").length },
                                { id: "internships", label: "Internship", count: jobs.filter(j => j.job_type === "internship").length },
                            ].map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filter === item.id ? "bg-[#1B6CFB] border-[#1B6CFB]" : "border-gray-300 bg-white"}`}>
                                            {filter === item.id && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input
                                            type="radio"
                                            name="jobType"
                                            value={item.id}
                                            checked={filter === item.id}
                                            onChange={(e) => setFilter(e.target.value as JobFilter)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm ${filter === item.id ? "text-gray-900 font-semibold dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">{item.count} Jobs</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#243056]">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Availability</h4>
                            <button className="text-xs text-[#1B6CFB] hover:underline" onClick={() => setAvailability("all")}>Clear</button>
                        </div>
                        <div className="space-y-3 pt-2">
                            {[
                                { id: "all", label: "Any Status", count: stats.total },
                                { id: "open", label: "Open / Hiring", count: stats.open },
                                { id: "closed", label: "Closed", count: stats.closed },
                            ].map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${availability === item.id ? "bg-[#1B6CFB] border-[#1B6CFB]" : "border-gray-300 bg-white"}`}>
                                            {availability === item.id && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input
                                            type="radio"
                                            name="availabilityRadio"
                                            value={item.id}
                                            checked={availability === item.id}
                                            onChange={(e) => setAvailability(e.target.value as JobAvailability)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm ${availability === item.id ? "text-gray-900 font-semibold dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">{item.count}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#243056]">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">Company Name</h4>
                        <Input
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            placeholder="Add company"
                            className="h-10 bg-white dark:bg-[#121C46] border-gray-200"
                        />
                    </div>

                </motion.aside>

            </div>

            {applyJob ? (
                <Modal
                    isOpen={Boolean(applyJob)}
                    onClose={closeApplyModal}
                    title="Job Applied"
                    maxWidth="2xl"
                    className="max-w-6xl border-[#c5c9ef] bg-[#E3E5FB] dark:border-[#26364d] dark:bg-[#121C46]"
                >
                    <div className="space-y-5 rounded-xl border border-[#c5c9ef] bg-[#E3E5FB] p-4 text-[#121a3a] shadow-sm dark:border-[#26364d] dark:bg-[#121C46] dark:text-white sm:p-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#cfe0ff] bg-[#eff6ff] text-[#0f65df] dark:border-[#4f46e5] dark:bg-[#161943] dark:text-[#8b5cf6]">
                                <Briefcase className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#0f1738] dark:text-white">Job Applied</h2>
                                <p className="mt-1 text-sm font-medium text-[#4b5578] dark:text-[#cbd5e1]">
                                    Please fill in the details below to apply for the position.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-xl border border-[#c5c9ef] bg-white/45 p-5 dark:border-[#26364d] dark:bg-[#0b1420]">
                                <div className="mb-4 flex items-center gap-3 text-[#0f65df] dark:text-[#8b5cf6]">
                                    <User className="h-6 w-6" />
                                    <p className="text-base font-bold text-[#0f1738] dark:text-white">Job Role</p>
                                </div>
                                <input
                                    value={applyRole}
                                    onChange={(event) => setApplyRole(event.target.value)}
                                    className="h-12 w-full rounded-lg border border-[#cbd6ea] bg-transparent px-4 text-sm font-medium text-[#121a3a] outline-none dark:border-[#31445e] dark:bg-[#07101a] dark:text-white"
                                    placeholder="Type job role"
                                />
                            </div>

                            <div className="rounded-xl border border-[#c5c9ef] bg-white/45 p-5 dark:border-[#26364d] dark:bg-[#0b1420]">
                                <div className="mb-4 flex items-center gap-3 text-[#0f65df] dark:text-[#8b5cf6]">
                                    <Building2 className="h-6 w-6" />
                                    <p className="text-base font-bold text-[#0f1738] dark:text-white">Department</p>
                                </div>
                                <input
                                    value={applyDepartment}
                                    onChange={(event) => setApplyDepartment(event.target.value)}
                                    className="h-12 w-full rounded-lg border border-[#cbd6ea] bg-transparent px-4 text-sm font-medium text-[#121a3a] outline-none dark:border-[#31445e] dark:bg-[#07101a] dark:text-white"
                                    placeholder="Type department"
                                />
                            </div>

                            <div className="rounded-xl border border-[#c5c9ef] bg-white/45 p-5 dark:border-[#26364d] dark:bg-[#0b1420]">
                                <div className="mb-4 flex items-center gap-3 text-[#0f65df] dark:text-[#8b5cf6]">
                                    <MapPin className="h-6 w-6" />
                                    <p className="text-base font-bold text-[#0f1738] dark:text-white">Location</p>
                                </div>
                                <input
                                    value={applyLocation}
                                    onChange={(event) => setApplyLocation(event.target.value)}
                                    className="h-12 w-full rounded-lg border border-[#cbd6ea] bg-transparent px-4 text-sm font-medium text-[#121a3a] outline-none dark:border-[#31445e] dark:bg-[#07101a] dark:text-white"
                                    placeholder="Type location"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-[#c5c9ef] bg-white/45 p-5 dark:border-[#26364d] dark:bg-[#0b1420]">
                                <div className="mb-5 flex items-center gap-3 text-[#0f65df] dark:text-[#8b5cf6]">
                                    <IndianRupee className="h-6 w-6" />
                                    <p className="text-base font-bold text-[#0f1738] dark:text-white">Expected Salary</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                                    <div className="flex h-12 overflow-hidden rounded-lg border border-[#cbd6ea] dark:border-[#31445e]">
                                        <span className="flex w-14 items-center justify-center border-r border-[#dbe3ef] text-xl font-bold dark:border-[#31445e]">₹</span>
                                        <input
                                            value={expectedSalary}
                                            onChange={(event) => setExpectedSalary(event.target.value)}
                                            inputMode="numeric"
                                            placeholder="6,00,000"
                                            className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium outline-none dark:text-white"
                                        />
                                    </div>
                                    <div className="h-12 rounded-lg border border-[#cbd6ea] text-sm font-medium dark:border-[#31445e] dark:bg-[#07101a]">
                                        <input
                                            value={salaryPeriod}
                                            onChange={(event) => setSalaryPeriod(event.target.value)}
                                            className="h-full w-full rounded-lg border-0 bg-transparent px-4 outline-none dark:text-white"
                                            placeholder="Per Annum"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#c5c9ef] bg-white/45 p-5 dark:border-[#26364d] dark:bg-[#0b1420]">
                                <div className="mb-4 flex items-center gap-3 text-[#0f65df] dark:text-[#8b5cf6]">
                                    <User className="h-6 w-6" />
                                    <p className="text-base font-bold text-[#0f1738] dark:text-white">Say About Yourself</p>
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={coverLetter}
                                        onChange={(event) => setCoverLetter(event.target.value.slice(0, 1000))}
                                        placeholder="Tell the company why you are a good fit for this role..."
                                        className="min-h-40 w-full resize-none rounded-lg border border-[#cbd6ea] bg-transparent p-4 pb-9 text-sm leading-6 outline-none placeholder:text-[#7c86a4] dark:border-[#31445e] dark:bg-[#07101a] dark:text-white dark:placeholder:text-[#8f9bb2]"
                                    />
                                    <span className="absolute bottom-3 right-4 text-xs font-medium text-[#4b5578] dark:text-[#cbd5e1]">
                                        {coverLetter.length} / 1000
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#c5c9ef] bg-white/45 p-5 dark:border-[#26364d] dark:bg-[#0b1420]">
                            <div className="mb-4 flex items-center gap-3 text-[#0f65df] dark:text-[#8b5cf6]">
                                <ShieldCheck className="h-6 w-6" />
                                <p className="text-base font-bold text-[#0f1738] dark:text-white">Terms & Conditions</p>
                            </div>
                            <div className="mb-4 rounded-lg border border-[#cbd6ea] bg-[#f8fbff] p-4 dark:border-[#31445e] dark:bg-[#07101a]">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-[#0f1738] dark:text-white">
                                            Application eligibility
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-[#4b5578] dark:text-[#cbd5e1]">
                                            Resume, ATS, DES score, and profile completion are checked before applying.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowTermsModal(true)}
                                        className="rounded-lg border-[#0f65df] text-[#0f65df] hover:bg-[#eff6ff] dark:border-[#8b5cf6] dark:text-[#c4b5fd] dark:hover:bg-[#161943]"
                                    >
                                        View Terms
                                    </Button>
                                </div>
                                {!applicationEligibility.canApply ? (
                                    <p className="mt-3 rounded-md bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#c2410c] dark:bg-[#2b1a0d] dark:text-[#fdba74]">
                                        You cannot apply until all eligibility checks pass.
                                    </p>
                                ) : (
                                    <p className="mt-3 rounded-md bg-[#f0fdf4] px-3 py-2 text-xs font-semibold text-[#166534] dark:bg-[#10251a] dark:text-[#86efac]">
                                        All eligibility checks passed. You can apply now.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3 text-sm font-medium text-[#33405f] dark:text-[#d6deed]">
                                {[
                                    "I confirm that all the information provided by me is true and accurate to the best of my knowledge.",
                                    "I understand that any false information may lead to disqualification at any stage of the selection process.",
                                    "I agree to the processing of my personal data for recruitment purposes.",
                                    "I have read and agree to the company's Privacy Policy and Terms of Service.",
                                ].map((term, index) => (
                                    <label key={term} className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted[index]}
                                            onChange={(event) => {
                                                setTermsAccepted((current) => current.map((value, itemIndex) => (itemIndex === index ? event.target.checked : value)))
                                            }}
                                            className="mt-0.5 h-5 w-5 rounded border-[#cbd6ea] accent-[#0f65df]"
                                        />
                                        <span>{term}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 rounded-xl border border-[#c5c9ef] bg-white/45 p-3 dark:border-[#26364d] dark:bg-[#0b1420] sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeApplyModal}
                                disabled={Boolean(applyingJobId)}
                                className="h-12 rounded-lg border-[#cbd6ea] px-8 text-[#33405f] hover:bg-[#f5f8ff] dark:border-[#31445e] dark:bg-[#172132] dark:text-white dark:hover:bg-[#1f2b3f]"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmitApplication}
                                loading={applyingJobId === applyJob.id}
                                disabled={applyingJobId === applyJob.id}
                                className="h-12 rounded-lg bg-[#0f65df] px-10 text-base font-bold text-white hover:bg-[#0b57c4] dark:bg-gradient-to-r dark:from-[#2563eb] dark:to-[#8b5cf6]"
                            >
                                <Send className="mr-2 h-5 w-5" />
                                Apply Now
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

            {showTermsModal ? (
                <Modal
                    isOpen={showTermsModal}
                    onClose={() => setShowTermsModal(false)}
                    title="Terms & Conditions"
                    maxWidth="lg"
                    className="dark:border-[#26364d] dark:bg-[#07101a]"
                >
                    <div className="space-y-4 text-[#121a3a] dark:text-white">
                        <div className="rounded-xl border border-[#dbe3ef] bg-[#f8fbff] p-4 dark:border-[#26364d] dark:bg-[#0b1420]">
                            <p className="text-base font-bold">Required before applying</p>
                            <p className="mt-1 text-sm text-[#4b5578] dark:text-[#cbd5e1]">
                                Students can apply only after meeting every requirement below.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {applicationEligibility.checks.map((check) => (
                                <div
                                    key={check.label}
                                    className={`rounded-xl border p-4 ${check.passed
                                        ? "border-[#bbf7d0] bg-[#f0fdf4] dark:border-[#166534] dark:bg-[#10251a]"
                                        : "border-[#fed7aa] bg-[#fff7ed] dark:border-[#9a3412] dark:bg-[#2b1a0d]"
                                        }`}
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-bold">{check.label}</p>
                                            <p className="mt-1 text-sm text-[#4b5578] dark:text-[#cbd5e1]">{check.fix}</p>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${check.passed
                                                ? "bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]"
                                                : "bg-[#ffedd5] text-[#c2410c] dark:bg-[#7c2d12] dark:text-[#fed7aa]"
                                                }`}
                                        >
                                            {check.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                onClick={() => setShowTermsModal(false)}
                                className="rounded-lg bg-[#0f65df] text-white hover:bg-[#0b57c4]"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

            {selectedJob ? (
                <Modal
                    isOpen={Boolean(selectedJob)}
                    onClose={() => setSelectedJob(null)}
                    title={selectedJob.title}
                    maxWidth="2xl"
                    position="right"
                >
                    <div className="max-h-[calc(90vh-120px)] space-y-6 overflow-y-auto pr-1 text-sm text-gray-700 dark:text-[#C7D2FE]">
                        <JobDetails job={selectedJob} variant="student" />

                        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/10 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedJob(null)}
                                className="rounded-xl border-[#D5CCFF] text-[#7C3AED] hover:bg-[#F3EEFF] dark:border-[#4C3D88] dark:text-[#C4B5FD] dark:hover:bg-[#1C2752]"
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={() => openApplyModal(selectedJob)}
                                disabled={appliedJobIds.has(selectedJob.id) || applyingJobId === selectedJob.id || selectedJob.status !== "active" || selectedJob.can_apply === false}
                                className={`rounded-xl disabled:cursor-not-allowed disabled:opacity-70 ${applicationByJobId.has(selectedJob.id)
                                    ? getApplicationStatusButton(applicationByJobId.get(selectedJob.id)?.status).tone
                                    : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                                    }`}
                            >
                                {applicationByJobId.has(selectedJob.id) ? getApplicationStatusButton(applicationByJobId.get(selectedJob.id)?.status).label : applyingJobId === selectedJob.id ? "Applying..." : selectedJob.status !== "active" || selectedJob.can_apply === false ? "Applications Closed" : "Apply Now"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

        </div>
    )
}
