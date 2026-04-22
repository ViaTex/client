"use client"

import { useEffect, useState } from "react"
import { apiClient, JobItem } from "@/lib/api"
import { Search, MapPin, Briefcase, DollarSign, Users, ExternalLink, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function StudentJobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [jobAvailability, setJobAvailability] = useState<"all" | "open" | "closed">("all")
    const [selectedCompany, setSelectedCompany] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("")
    const [selectedIndustry, setSelectedIndustry] = useState("")

    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await apiClient.getJobs(false)
                setJobs(data || [])
            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load jobs")
            } finally {
                setLoading(false)
            }
        }
        loadJobs()
    }, [])

    // Filter jobs based on criteria
    const filteredJobs = jobs.filter((job) => {
        const matchSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCompany = !selectedCompany || job.company_name?.toLowerCase().includes(selectedCompany.toLowerCase())
        const matchRole = !selectedRole || job.title?.toLowerCase().includes(selectedRole.toLowerCase())
        const matchLocation = !selectedLocation || job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
        
        return matchSearch && matchCompany && matchRole && matchLocation
    })

    const stats = {
        open: jobs.filter(j => j.status === "active").length,
        closed: jobs.filter(j => j.status !== "active").length,
        total: jobs.length
    }

    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100 relative max-w-7xl mx-auto">
            {/* Header */}
            <div className="px-3 sm:px-4 md:px-6 pt-1 sm:pt-6 lg:pt-0 mb-6">
                <div className="flex flex-col gap-2 mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Job opportunities</h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Select filters to discover jobs and add them to newsletter.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 px-3 sm:px-4 md:px-6">
                {/* Filters Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 space-y-6"
                >
                    {/* Search Box */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Job Availability Filter */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                        <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Job availability</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="all"
                                    checked={jobAvailability === "all"}
                                    onChange={(e) => setJobAvailability(e.target.value as any)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">All Jobs</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="open"
                                    checked={jobAvailability === "open"}
                                    onChange={(e) => setJobAvailability(e.target.value as any)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Open ({stats.open})</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="closed"
                                    checked={jobAvailability === "closed"}
                                    onChange={(e) => setJobAvailability(e.target.value as any)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Closed ({stats.closed})</span>
                            </label>
                        </div>
                    </div>

                    {/* Company Filter */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                        <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Company name</h3>
                        <input
                            type="text"
                            placeholder="Add company"
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                        <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Role</h3>
                        <input
                            type="text"
                            placeholder="Add job role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Location Filter */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                        <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Location</h3>
                        <input
                            type="text"
                            placeholder="Add location"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </motion.div>

                {/* Jobs Listing */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3 space-y-4"
                >
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">Loading jobs...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredJobs.length === 0 && (
                        <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No jobs found matching your filters.</p>
                        </div>
                    )}

                    {/* Job Cards */}
                    {!loading && filteredJobs.length > 0 && (
                        <>
                            {filteredJobs.map((job, idx) => {
                                const salaryRange = job.salary_min && job.salary_max 
                                    ? `${(Number(job.salary_min) / 100000).toFixed(1)}L - ${(Number(job.salary_max) / 100000).toFixed(1)}L` 
                                    : "N/A"
                                const ctc = job.ctc_after_probation ? `${job.ctc_after_probation} LPA` : "N/A"
                                const createdDate = job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently"
                                const experienceRange = `${job.experience_min}-${job.experience_max} yrs`
                                
                                return (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Card Header - Company Info */}
                                        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="relative">
                                                        {job.company_logo && job.company_logo !== 'hgvuiihukb.com' ? (
                                                            <img 
                                                                src={job.company_logo} 
                                                                alt={job.company_name}
                                                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
                                                                    if (fallback) fallback.style.display = 'flex'
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0" style={{display: job.company_logo && job.company_logo !== 'hgvuiihukb.com' ? 'none' : 'flex'}}>
                                                            <span className="text-white font-bold text-lg">
                                                                {job.company_name?.[0]?.toUpperCase() || "J"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                            {job.company_name || "Company"}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                                            {job.company_type} • {job.company_size}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-shrink-0 text-gray-400 hover:text-red-500"
                                                >
                                                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </Button>
                                            </div>

                                            {/* Badges - Job Type, Salary, Industry */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium capitalize">
                                                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    {job.job_type?.replace('_', ' ') || "Full-time"}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-medium">
                                                    💼 {job.industry || "Technology"}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">
                                                    💰 {salaryRange}
                                                </span>
                                                {job.remote_work && (
                                                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm font-medium">
                                                        🌐 Remote
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Job Details */}
                                        <div className="p-4 sm:p-5 space-y-4">
                                            {/* Primary Job Listing */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                                                        {job.title || "Job Title"}
                                                    </h4>
                                                    {job.company_website && (
                                                        <a href={job.company_website} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        {job.location || "Location"}
                                                    </span>
                                                    <span>•</span>
                                                    {job.remote_work && (
                                                        <>
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                                                🌐 Remote
                                                            </span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span className="text-gray-500 dark:text-gray-500">{createdDate}</span>
                                                </div>
                                            </div>

                                            {/* Job Info Row */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                <div className="text-xs">
                                                    <p className="text-gray-500 dark:text-gray-400 font-medium">CTC</p>
                                                    <p className="text-gray-900 dark:text-white font-semibold">{ctc}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Experience</p>
                                                    <p className="text-gray-900 dark:text-white font-semibold">{experienceRange}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Openings</p>
                                                    <p className="text-gray-900 dark:text-white font-semibold">{job.number_of_openings || 0}</p>
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            {job.skills_required && job.skills_required.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Required Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {job.skills_required.slice(0, 5).map((skill, idx) => (
                                                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {job.skills_required.length > 5 && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">+{job.skills_required.length - 5} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Apply Button */}
                                            <Button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                                                {job.status === "active" ? 'Apply Now' : 'Applications Closed'}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )
                            })}

                            {/* Pagination */}
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Jobs: <span className="font-semibold">{filteredJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> results
                                </p>
                                {filteredJobs.length < jobs.length && (
                                    <Button variant="ghost" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                                        Next page
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
