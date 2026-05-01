"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient, JobItem } from "@/lib/api"
import { ArrowLeft, MapPin, Users, ExternalLink, Calendar, DollarSign, Briefcase, Clock, Building, Globe, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function JobDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = useState<JobItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const jobId = params.id as string

    useEffect(() => {
        const loadJobDetails = async () => {
            if (!jobId) return

            setLoading(true)
            setError("")
            try {
                const jobData = await apiClient.getJobById(jobId)
                setJob(jobData)
            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load job details")
            } finally {
                setLoading(false)
            }
        }

        loadJobDetails()
    }, [jobId])

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error || "Job not found"}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const salaryRange = job.salary_min && job.salary_max
        ? `${(Number(job.salary_min) / 100000).toFixed(1)}L - ${(Number(job.salary_max) / 100000).toFixed(1)}L`
        : "Not specified"

    const ctc = job.ctc_after_probation ? `${job.ctc_after_probation} LPA` : "Not specified"
    const experienceRange = job.experience_min !== undefined && job.experience_max !== undefined
        ? `${job.experience_min}-${job.experience_max} years`
        : "Not specified"

    const createdDate = job.created_at
        ? new Date(job.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : "Recently posted"

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button onClick={() => router.back()} variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Jobs
                </Button>
            </div>

            {/* Job Header Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            {/* Company Logo */}
                            <div className="relative flex-shrink-0">
                                {job.company_logo && job.company_logo !== 'hgvuiihukb.com' ? (
                                    <img
                                        src={job.company_logo}
                                        alt={job.company_name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.style.display = 'none'
                                            const fallback = target.nextElementSibling as HTMLElement
                                            if (fallback) fallback.style.display = 'flex'
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                                    style={{ display: job.company_logo && job.company_logo !== 'hgvuiihukb.com' ? 'none' : 'flex' }}
                                >
                                    <span className="text-white font-bold text-xl">
                                        {job.company_name?.[0]?.toUpperCase() || "J"}
                                    </span>
                                </div>
                            </div>

                            {/* Job and Company Info */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {job.title}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                                    <Building className="h-4 w-4" />
                                    <span className="font-medium">{job.company_name}</span>
                                    {job.company_website && (
                                        <>
                                            <span>•</span>
                                            <a
                                                href={job.company_website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Globe className="h-3 w-3" />
                                                Website
                                            </a>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {job.company_type} • {job.company_size} employees
                                </p>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="flex-shrink-0">
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                                disabled={job.status !== "active"}
                            >
                                {job.status === "active" ? 'Apply Now' : 'Applications Closed'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {/* Job Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            <Users className="h-3 w-3 mr-1" />
                            {job.job_type?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                            💼 {job.industry}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            💰 {salaryRange}
                        </Badge>
                        {job.remote_work && (
                            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                🌐 Remote Work
                            </Badge>
                        )}
                    </div>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-center">
                            <DollarSign className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">CTC</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{ctc}</p>
                        </div>
                        <div className="text-center">
                            <Briefcase className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Experience</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{experienceRange}</p>
                        </div>
                        <div className="text-center">
                            <MapPin className="h-5 w-5 mx-auto text-red-600 dark:text-red-400 mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.location}</p>
                        </div>
                        <div className="text-center">
                            <Clock className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Posted</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{createdDate}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Job Description */}
            {job.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Job Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {job.description}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Requirements */}
            {job.requirements && (
                <Card>
                    <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {job.requirements}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
                <Card>
                    <CardHeader>
                        <CardTitle>Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {job.responsibilities}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Skills Required */}
            {job.skills_required && job.skills_required.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Required Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {job.skills_required.map((skill, index) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Job Type</span>
                            <span className="font-medium capitalize">{job.job_type?.replace('_', ' ')}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Industry</span>
                            <span className="font-medium">{job.industry}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Openings</span>
                            <span className="font-medium">{job.number_of_openings || 'Not specified'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Remote Work</span>
                            <span className="font-medium">{job.remote_work ? 'Yes' : 'No'}</span>
                        </div>
                        {job.travel_required && (
                            <>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Travel Required</span>
                                    <span className="font-medium">Yes</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Application Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Application Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                            <Badge variant={job.status === "active" ? "default" : "secondary"}>
                                {job.status === "active" ? "Active" : "Closed"}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Current Applications</span>
                            <span className="font-medium">{job.current_applications || 0}</span>
                        </div>
                        {job.max_applications && (
                            <>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Max Applications</span>
                                    <span className="font-medium">{job.max_applications}</span>
                                </div>
                            </>
                        )}
                        {job.application_deadline && (
                            <>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                                    <span className="font-medium">
                                        {new Date(job.application_deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Apply Button at Bottom */}
            <div className="flex justify-center pt-6">
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
                    disabled={job.status !== "active"}
                >
                    {job.status === "active" ? 'Apply for this Position' : 'Applications Closed'}
                </Button>
            </div>
        </div>
    )
}