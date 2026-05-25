import React from "react"
import { JobItem } from "@/lib/api"
import { Building, MapPin, BadgeCheck, Clock, IndianRupee, CalendarDays, Sparkles, Briefcase, GraduationCap, Globe, Users, Contact, FolderKanban, ShieldCheck, CheckSquare, Gift, FileText, FileBadge2 } from "lucide-react"

function formatValue(value?: string | number | null) {
    return value || "Not specified"
}

function formatList(list?: string[] | null) {
    if (!list || list.length === 0) return "Not specified"
    return list.join(", ")
}

function formatBoolean(value?: boolean | null) {
    if (value === undefined || value === null) return "Not specified"
    return value ? "Yes" : "No"
}

function formatSalary(job: JobItem) {
    if (!job.ctc_min && !job.ctc_max) return "Not specified"
    const currency = job.ctc_currency || "₹"
    if (job.ctc_min && job.ctc_max) return `${currency}${job.ctc_min} - ${currency}${job.ctc_max}`
    if (job.ctc_min) return `${currency}${job.ctc_min}+`
    if (job.ctc_max) return `Up to ${currency}${job.ctc_max}`
    return "Not specified"
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

interface JobDetailsProps {
    job: JobItem
    variant: 'student' | 'corporate'
}

export function JobDetails({ job, variant }: JobDetailsProps) {
    return (
        <div className="flex flex-col space-y-6">
            {/* Company Info Header */}
            <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl border border-[#E5E7EB] dark:border-[#31406B] bg-[#F0F5FF] dark:bg-blue-900/30 text-[#1B6CFB] text-2xl font-bold flex-shrink-0">
                    {job.company_name?.[0]?.toUpperCase() || "C"}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {formatValue(job.company_name)}
                        <BadgeCheck className="w-5 h-5 text-[#1B6CFB]" />
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <MapPin className="w-4 h-4" />
                            {formatValue(job.location)}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#10B981] font-medium">
                            <BadgeCheck className="w-4 h-4" />
                            Verified Company
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {job.skills_required.map((skill) => (
                        <div key={skill} className="px-3 py-1.5 bg-[#F0F5FF] dark:bg-blue-900/20 text-[#1B6CFB] dark:text-[#8fb5ff] text-[13px] font-semibold rounded-lg border border-[#d7ddf8] dark:border-blue-900/50">
                            {skill}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#E5E7EB] dark:border-[#31406B] rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] dark:divide-[#31406B] bg-white dark:bg-[#121C46]">
                <div className="p-4 flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Salary</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-sm">
                        {formatValue(job.ctc_after_probation)} LPA
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Job Type</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-sm capitalize">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {job.job_type?.replace("_", " ") || "Not specified"}
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deadline</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-sm">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {formatDate(job.application_deadline)}
                    </div>
                </div>
            </div>

            {/* Smart Summary */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10 p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2 text-gray-900 dark:text-gray-400 font-bold text-sm">
                    <Building className="w-5 h-5 text-gray-500" />
                    About Company
                </div>
                <p className="font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{formatValue(job.company_description)}</p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-3">Job Description</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {formatValue(job.description)}
                    </div>
                </div>

                {job.requirements && (
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#1B6CFB]" />
                            Requirements & Qualifications
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            {formatValue(job.requirements)}
                        </div>
                    </div>
                )}

                {job.responsibilities && (
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-[#10B981]" />
                            Key Responsibilities
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            {formatValue(job.responsibilities)}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Eligibility & Education */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-500" />
                            Eligibility & Education
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Education Level</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatList(job.education_level)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Education Degree</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatList(job.education_degree)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Education Branch</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatList(job.education_branch)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Eligibility Criteria</p>
                                <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{formatValue(job.eligibility_criteria)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Certifications Required</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.certifications_required)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Details & Logistics */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            Job Details & Logistics
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Industry</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.industry)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Work Mode</p>
                                <p className="font-medium text-gray-900 dark:text-white capitalize">{formatValue(job.mode_of_work)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Remote Work Allowed</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatBoolean(job.remote_work)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Travel Required</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatBoolean(job.travel_required)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Number of Openings</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.number_of_openings)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Compensation & Benefits */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Gift className="w-5 h-5 text-pink-500" />
                            Compensation & Benefits
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">CTC During Probation</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.ctc_with_probation)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">CTC After Probation</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.ctc_after_probation)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Service Agreement Details</p>
                                <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{formatValue(job.service_agreement_details)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Perks and Benefits</p>
                                <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{formatValue(job.perks_and_benefits)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Selection Process */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Selection Process
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Process Description</p>
                                <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{formatValue(job.selection_process)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Campus Drive Date</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(job.campus_drive_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Contact Person</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.contact_person)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Contact Designation</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatValue(job.contact_designation)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Detailed Overview */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-500" />
                        Company Overview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-sm">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Founded</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">{formatValue(job.company_founded)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-sm">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Company Size</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">{formatValue(job.company_size)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-sm">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Company Type</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">{formatValue(job.company_type)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-sm">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Website</p>
                            <p className="font-medium text-[#1B6CFB] truncate">{job.company_website ? <a href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} target="_blank" rel="noreferrer" className="hover:underline">{job.company_website}</a> : "Not specified"}</p>
                        </div>
                    </div>


                    {(job.ongoing_project_title || job.ongoing_project_description) && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm mt-4">
                            <p className="text-xs font-bold text-[#1B6CFB] uppercase mb-2 flex items-center gap-1.5"><FolderKanban className="w-4 h-4" /> Ongoing Project</p>
                            {job.ongoing_project_title && <p className="font-bold text-gray-900 dark:text-white mb-1">{job.ongoing_project_title}</p>}
                            {job.ongoing_project_description && <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{job.ongoing_project_description}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info for Corporate */}
            {variant === 'corporate' && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4">Internal Job Data</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Status</p>
                            <p className="text-sm font-medium mt-1 text-gray-900 dark:text-white capitalize">{job.status}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Hiring Status</p>
                            <p className="text-sm font-medium mt-1 text-gray-900 dark:text-white">{job.hiring_status || "Actively Hiring"}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Applications</p>
                            <p className="text-sm font-medium mt-1 text-gray-900 dark:text-white">{job.current_applications || 0} / {job.max_applications || 0}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
