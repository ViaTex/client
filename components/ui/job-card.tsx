"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"
import { JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { 
    BadgeCheck, 
    MapPin, 
    Users, 
    ArrowRight, 
    Briefcase, 
    GraduationCap, 
    Clock, 
    MoreVertical, 
    Trash2,
    CalendarDays,
    Download
} from "lucide-react"

interface JobCardProps {
    job: JobItem
    variant: 'student' | 'corporate'
    index?: number
    // Student props
    isApplied?: boolean
    applyingJobId?: string
    isClosed?: boolean
    applicationStatus?: { label: string; tone: string }
    onApply?: (job: JobItem) => void
    // Corporate props
    completionPercent?: number
    onEdit?: (job: JobItem) => void
    onDelete?: (job: JobItem) => void
    isDeleting?: boolean
    isMenuOpen?: boolean
    onToggleMenu?: (jobId: string | null) => void
    menuRef?: React.Ref<HTMLDivElement>
    onViewJD?: (job: JobItem) => void
    onDownloadJD?: (job: JobItem) => void
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

// Helpers
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

function getPostedDateMeta(value?: string | null) {
    const formattedDate = formatDate(value)
    if (!value) return { label: "Not posted", value: formattedDate }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return { label: "Invalid date", value: formattedDate }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    parsed.setHours(0, 0, 0, 0)
    const daysSincePosted = Math.round((today.getTime() - parsed.getTime()) / 86400000)

    if (daysSincePosted < 0) return { label: "Scheduled", value: formattedDate }
    if (daysSincePosted === 0) return { label: "Today", value: formattedDate }
    if (daysSincePosted <= 7) return { label: "New", value: formattedDate }
    if (daysSincePosted <= 30) return { label: `${daysSincePosted} days ago`, value: formattedDate }
    return { label: "Older", value: formattedDate }
}

function getDeadlineMeta(value?: string | null, emptyLabel = "No deadline") {
    const formattedDate = formatDate(value)
    if (!value) {
        return {
            label: emptyLabel,
            value: emptyLabel,
            cardClass: "border-[#d8e1f2] bg-[#edf3ff] text-[#42548d] dark:border-[#3a4778] dark:bg-[#182554] dark:text-[#c7d2f4]",
        }
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return {
            label: "Invalid date",
            value: formattedDate,
            cardClass: "border-[#ffd7a8] bg-[#fff7ed] text-[#b45309] dark:border-[#8a4c16] dark:bg-[#3a2410] dark:text-[#fdba74]",
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    parsed.setHours(0, 0, 0, 0)
    const daysUntilDeadline = Math.round((parsed.getTime() - today.getTime()) / 86400000)

    if (daysUntilDeadline < 0) {
        return {
            label: "Expired",
            value: formattedDate,
            cardClass: "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#3b1518] dark:text-[#fca5a5]",
        }
    }

    if (daysUntilDeadline === 0) {
        return {
            label: "Due today",
            value: formattedDate,
            cardClass: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] dark:border-[#9a3412] dark:bg-[#3b2413] dark:text-[#fdba74]",
        }
    }

    if (daysUntilDeadline <= 3) {
        return {
            label: `${daysUntilDeadline} days left`,
            value: formattedDate,
            cardClass: "border-[#fde68a] bg-[#fffbeb] text-[#a16207] dark:border-[#854d0e] dark:bg-[#33270d] dark:text-[#facc15]",
        }
    }

    return {
        label: "Open",
        value: formattedDate,
        cardClass: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] dark:border-[#166534] dark:bg-[#122f20] dark:text-[#86efac]",
    }
}

export function JobCard({
    job,
    variant,
    index = 0,
    isApplied,
    applyingJobId,
    isClosed,
    applicationStatus,
    onApply,
    completionPercent = 0,
    onEdit,
    onDelete,
    isDeleting,
    isMenuOpen,
    onToggleMenu,
    menuRef,
    onViewJD,
    onDownloadJD,
}: JobCardProps) {
    const postedMeta = getPostedDateMeta(job.created_at)
    const deadlineMeta = getDeadlineMeta(job.application_deadline)

    const safeCurrentApplications = Number.isFinite(Number(job.current_applications)) ? Number(job.current_applications) : 0
    const safeMaxApplications = Number.isFinite(Number(job.max_applications)) && Number(job.max_applications) > 0 ? Number(job.max_applications) : 1

    return (
        <motion.article
            custom={index}
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="group rounded-[20px] bg-white p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 dark:border-[#243056] dark:hover:border-blue-900/50 dark:bg-[#121C46] flex flex-col relative w-full"
        >
            {/* Top Section */}
            <div className="flex justify-between items-start w-full">
                <div className="flex gap-4 items-start">
                    {/* Logo */}
                    <div className="flex items-center justify-center w-[60px] h-[60px] flex-shrink-0 rounded-[16px] border-[3px] border-white ring-1 ring-[#E5E7EB] dark:ring-[#31406B] dark:border-[#121C46] bg-[#F0F5FF] dark:bg-blue-900/30 text-[#1B6CFB] text-[24px] font-bold shadow-sm">
                        {job.company_name?.[0]?.toUpperCase() || "J"}
                    </div>

                    {/* Title & Company Info */}
                    <div className="flex flex-col mt-0.5">
                        <h2 className="text-[18px] font-bold text-gray-900 dark:text-white line-clamp-1 pr-2">{job.title || "Job Title"}</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <p className="text-[15px] font-medium text-gray-600 dark:text-gray-300 line-clamp-1">
                                {job.company_name}
                            </p>
                            <BadgeCheck className="w-[18px] h-[18px] text-[#1B6CFB]" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-[14px] font-medium text-gray-500">{job.location || "Location"}</p>
                        </div>
                    </div>
                </div>

                {variant === 'corporate' && (
                    <div className="relative" ref={menuRef as any}>
                        <button
                            type="button"
                            onClick={() => onToggleMenu?.(isMenuOpen ? null : job.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6f7da9] hover:bg-gray-100 dark:text-[#c6d0ff] dark:hover:bg-[#2a387d]"
                            aria-label={`Open actions for ${job.title}`}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-10 z-20 w-40 rounded-lg border border-[#d7ddf8] bg-white p-1 shadow-lg sm:w-44 dark:border-[#4658a8] dark:bg-[#24306f]">
                                <button
                                    type="button"
                                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#42548d] hover:bg-[#edf3ff] dark:text-[#e3e9ff] dark:hover:bg-[#2d3c89]"
                                    onClick={() => {
                                        onToggleMenu?.(null)
                                        onEdit?.(job)
                                    }}
                                >
                                    Edit Job
                                </button>
                                <button
                                    type="button"
                                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-[#dc2626] hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#fca5a5] dark:hover:bg-[#5f1f2b]"
                                    onClick={() => onDelete?.(job)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeleting ? "Deleting..." : "Delete Job"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-5">
                {job.skills_required?.length ? (
                    job.skills_required.slice(0, 4).map((skill) => (
                        <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0C1430] text-gray-800 dark:text-[#A8B3CF] text-[13px] font-medium rounded-[10px] border border-[#E5E7EB] dark:border-[#31406B] shadow-sm">
                            {skill}
                        </div>
                    ))
                ) : (
                    <span className="text-[12px] text-gray-400 italic mt-2">No specific skills mentioned.</span>
                )}
                {job.skills_required && job.skills_required.length > 4 && (
                    <div className="flex items-center justify-center gap-1 px-4 py-1.5 bg-white dark:bg-[#0C1430] text-[#1B6CFB] text-[13px] font-bold rounded-[10px] border border-[#E5E7EB] dark:border-[#31406B] shadow-sm leading-tight">
                        +{job.skills_required.length - 4} <span className="text-[10px] text-gray-500 font-medium">More</span>
                    </div>
                )}
            </div>

            {/* Horizontal Divider */}
            <div className="w-full h-px bg-[#E5E7EB] dark:bg-[#243056] my-5"></div>

            {/* Hiring Status and Actions */}
            <div className="flex justify-between items-center w-full gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-[42px] h-[42px] bg-[#F0F5FF] dark:bg-[#1A2C58] rounded-[12px] flex items-center justify-center text-[#1B6CFB] flex-shrink-0">
                        <Users className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-[#1B6CFB] truncate">{job.hiring_status || "Actively Hiring"}</p>
                        {variant === 'corporate' ? (
                            <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                                Applications: {safeCurrentApplications}/{safeMaxApplications}
                            </p>
                        ) : (
                            <p className="text-[13px] font-medium text-gray-500 mt-0.5">Hiring Status</p>
                        )}
                    </div>
                </div>

                {variant === 'student' && onApply && (
                    <Button
                        type="button"
                        onClick={() => onApply(job)}
                        disabled={isApplied || applyingJobId === job.id || isClosed}
                        className={`h-11 px-6 rounded-[12px] text-[15px] font-bold shadow-sm transition-all duration-300 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2 ${isApplied && applicationStatus ? applicationStatus.tone : "bg-[#1B6CFB] text-white hover:bg-[#155ade]"}`}
                    >
                        {isApplied && applicationStatus ? applicationStatus.label : applyingJobId === job.id ? "Applying..." : isClosed ? "Closed" : "Apply Job"}
                        {!isApplied && !isClosed && applyingJobId !== job.id && <ArrowRight className="w-4 h-4" />}
                    </Button>
                )}
                
                {variant === 'corporate' && (
                    <div className={`flex-shrink-0 flex items-center gap-2 rounded-lg border px-2 py-1.5 font-semibold ${deadlineMeta.cardClass}`}>
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <div className="leading-tight">
                            <span className="block text-[9px] uppercase tracking-wide opacity-80">Deadline</span>
                            <span className="block whitespace-nowrap text-[12px]">{deadlineMeta.value}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Horizontal Divider */}
            <div className="w-full h-px bg-[#E5E7EB] dark:bg-[#243056] my-5"></div>

            {/* Footer Info */}
            {variant === 'corporate' ? (
                <div className="w-full">

                    <div className="flex items-center justify-between w-full px-1">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[13px] font-semibold">
                            <Briefcase className="w-4 h-4 text-gray-400" /> {job.job_type === 'internship' ? 'Part-time' : 'Full-time'}
                        </div>
                        <div className="w-px h-4 bg-[#E5E7EB] dark:bg-[#31406B]"></div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[13px] font-semibold">
                            <GraduationCap className="w-[18px] h-[18px] text-gray-400" /> {job.job_type === 'internship' ? 'Internship' : 'Job'}
                        </div>
                        <div className="w-px h-4 bg-[#E5E7EB] dark:bg-[#31406B]"></div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[13px] font-semibold">
                            <Clock className="w-4 h-4 text-gray-400" /> {postedMeta.label === "Today" ? "Posted today" : postedMeta.label.includes("ago") ? `Posted ${postedMeta.label}` : `Posted on ${postedMeta.value}`}
                        </div>
                    </div>
                    
                    {(onViewJD || onDownloadJD) && (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#243056]">
                            <div className="flex gap-3">
                                {onViewJD && (
                                    <Button type="button" variant="outline" className="h-10 flex-1 rounded-xl border-[#d7ddf8] bg-white text-[14px] font-bold text-[#1B6CFB] shadow-sm hover:bg-[#F0F5FF] hover:border-[#1B6CFB] dark:border-[#31406B] dark:bg-[#0C1430] dark:text-[#A8B3CF] dark:hover:bg-[#121C46] dark:hover:border-[#1B6CFB] dark:hover:text-[#1B6CFB]" onClick={() => onViewJD(job)}>
                                        View Details
                                    </Button>
                                )}
                                {onDownloadJD && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-[#d7ddf8] bg-white px-4 shadow-sm text-[#42548d] hover:bg-[#F0F5FF] hover:text-[#1B6CFB] dark:border-[#31406B] dark:bg-[#0C1430] dark:text-[#A8B3CF] dark:hover:bg-[#121C46] dark:hover:text-[#1B6CFB]"
                                        onClick={() => onDownloadJD(job)}
                                        aria-label={`Download JD for ${job.title}`}
                                    >
                                        <Download className="h-[18px] w-[18px]" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between w-full px-1">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[13px] font-semibold">
                        <Briefcase className="w-4 h-4 text-gray-400" /> {job.job_type === 'internship' ? 'Part-time' : 'Full-time'}
                    </div>
                    <div className="w-px h-4 bg-[#E5E7EB] dark:bg-[#31406B]"></div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[13px] font-semibold">
                        <GraduationCap className="w-[18px] h-[18px] text-gray-400" /> {job.job_type === 'internship' ? 'Internship' : 'Job'}
                    </div>
                    <div className="w-px h-4 bg-[#E5E7EB] dark:bg-[#31406B]"></div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[13px] font-semibold">
                        <Clock className="w-4 h-4 text-gray-400" /> {postedMeta.label === "Today" ? "Posted today" : postedMeta.label.includes("ago") ? `Posted ${postedMeta.label}` : `Posted on ${postedMeta.value}`}
                    </div>
                </div>
            )}
        </motion.article>
    )
}
