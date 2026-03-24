"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, JobItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, MoreVertical, Plus } from "lucide-react"

type JobType = "full_time" | "part_time" | "contract" | "internship" | "freelance"
type StepId = "job_basics" | "candidate_eligibility" | "compensation_company" | "hiring_process"

const STEPS: { id: StepId; label: string }[] = [
    { id: "job_basics", label: "1. Job Basics" },
    { id: "candidate_eligibility", label: "2. Candidate Eligibility" },
    { id: "compensation_company", label: "3. Compensation & Company" },
    { id: "hiring_process", label: "4. Hiring Process" },
]

export default function CorporateJobsPage() {
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement | null>(null)
    const [jobs, setJobs] = useState<JobItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [requirements, setRequirements] = useState("")
    const [responsibilities, setResponsibilities] = useState("")
    const [location, setLocation] = useState("")
    const [jobType, setJobType] = useState<JobType>("full_time")
    const [remoteWork, setRemoteWork] = useState(false)
    const [travelRequired, setTravelRequired] = useState(false)
    const [modeOfWork, setModeOfWork] = useState<"onsite" | "remote" | "hybrid">("onsite")
    const [salaryMin, setSalaryMin] = useState("")
    const [salaryMax, setSalaryMax] = useState("")
    const [salaryCurrency, setSalaryCurrency] = useState("INR")
    const [ctcWithProbation, setCtcWithProbation] = useState("")
    const [ctcAfterProbation, setCtcAfterProbation] = useState("")
    const [experienceMin, setExperienceMin] = useState("")
    const [experienceMax, setExperienceMax] = useState("")
    const [openings, setOpenings] = useState("")
    const [educationLevel, setEducationLevel] = useState("")
    const [educationDegree, setEducationDegree] = useState("")
    const [educationBranch, setEducationBranch] = useState("")
    const [skillsRequired, setSkillsRequired] = useState("")
    const [certificationsRequired, setCertificationsRequired] = useState("")
    const [applicationDeadline, setApplicationDeadline] = useState("")
    const [maxApplications, setMaxApplications] = useState("100")
    const [companyName, setCompanyName] = useState("")
    const [companyLogo, setCompanyLogo] = useState("")
    const [companyWebsite, setCompanyWebsite] = useState("")
    const [companyAddress, setCompanyAddress] = useState("")
    const [companySize, setCompanySize] = useState("")
    const [companyType, setCompanyType] = useState("")
    const [companyFounded, setCompanyFounded] = useState("")
    const [companyDescription, setCompanyDescription] = useState("")
    const [contactPerson, setContactPerson] = useState("")
    const [contactDesignation, setContactDesignation] = useState("")
    const [industry, setIndustry] = useState("")
    const [selectionProcess, setSelectionProcess] = useState("")
    const [campusDriveDate, setCampusDriveDate] = useState("")
    const [serviceAgreementDetails, setServiceAgreementDetails] = useState("")
    const [expirationDate, setExpirationDate] = useState("")
    const [perksAndBenefits, setPerksAndBenefits] = useState("")
    const [eligibilityCriteria, setEligibilityCriteria] = useState("")
    const [minDesScore, setMinDesScore] = useState("")
    const [maxDesScore, setMaxDesScore] = useState("")
    const [ongoingProjectTitle, setOngoingProjectTitle] = useState("")
    const [ongoingProjectDescription, setOngoingProjectDescription] = useState("")
    const [currentStep, setCurrentStep] = useState(0)
    const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const currentStepId = STEPS[currentStep].id
    const canGoNext = useMemo(() => {
        if (currentStepId === "job_basics") {
            return Boolean(title.trim() && description.trim() && location.trim() && jobType)
        }
        return true
    }, [currentStepId, title, description, location, jobType])
    const filteredJobs = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) return jobs
        return jobs.filter((job) => {
            return (
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query)
            )
        })
    }, [jobs, searchTerm])

    const loadJobs = async () => {
        setLoading(true)
        setError("")
        try {
            const data = await apiClient.getJobs(true)
            setJobs(data)
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to load jobs")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadJobs()
        apiClient
            .getCorporateProfile()
            .then((profile) => {
                setCompanyName(profile.company_name || "")
                setCompanyWebsite(profile.website_url || "")
                setCompanyAddress(profile.address || "")
                setCompanyType(profile.company_type || "")
                setIndustry(profile.industry || "")
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        const onDocumentClick = (event: MouseEvent) => {
            if (!menuRef.current) return
            if (!menuRef.current.contains(event.target as Node)) {
                setOpenMenuJobId(null)
            }
        }
        document.addEventListener("mousedown", onDocumentClick)
        return () => document.removeEventListener("mousedown", onDocumentClick)
    }, [])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setSuccess("")

        try {
            await apiClient.createJob({
                title,
                description,
                requirements: requirements || undefined,
                responsibilities: responsibilities || undefined,
                location,
                job_type: jobType,
                remote_work: remoteWork,
                travel_required: travelRequired,
                mode_of_work: modeOfWork,
                salary_min: salaryMin ? Number(salaryMin) : undefined,
                salary_max: salaryMax ? Number(salaryMax) : undefined,
                salary_currency: salaryCurrency || "INR",
                ctc_with_probation: ctcWithProbation || undefined,
                ctc_after_probation: ctcAfterProbation || undefined,
                experience_min: experienceMin ? Number(experienceMin) : undefined,
                experience_max: experienceMax ? Number(experienceMax) : undefined,
                education_level: educationLevel ? educationLevel.split(",").map((v) => v.trim()).filter(Boolean) : undefined,
                education_degree: educationDegree ? educationDegree.split(",").map((v) => v.trim()).filter(Boolean) : undefined,
                education_branch: educationBranch ? educationBranch.split(",").map((v) => v.trim()).filter(Boolean) : undefined,
                skills_required: skillsRequired ? skillsRequired.split(",").map((v) => v.trim()).filter(Boolean) : undefined,
                certifications_required: certificationsRequired || undefined,
                application_deadline: applicationDeadline || undefined,
                max_applications: maxApplications ? Number(maxApplications) : undefined,
                number_of_openings: openings ? Number(openings) : undefined,
                company_name: companyName || undefined,
                company_logo: companyLogo || undefined,
                company_website: companyWebsite || undefined,
                company_address: companyAddress || undefined,
                company_size: companySize || undefined,
                company_type: companyType || undefined,
                company_founded: companyFounded ? Number(companyFounded) : undefined,
                company_description: companyDescription || undefined,
                contact_person: contactPerson || undefined,
                contact_designation: contactDesignation || undefined,
                industry: industry || undefined,
                selection_process: selectionProcess || undefined,
                campus_drive_date: campusDriveDate || undefined,
                service_agreement_details: serviceAgreementDetails || undefined,
                expiration_date: expirationDate || undefined,
                perks_and_benefits: perksAndBenefits || undefined,
                eligibility_criteria: eligibilityCriteria || undefined,
                min_des_score: minDesScore ? Number(minDesScore) : undefined,
                max_des_score: maxDesScore ? Number(maxDesScore) : undefined,
                ongoing_project_title: ongoingProjectTitle || undefined,
                ongoing_project_description: ongoingProjectDescription || undefined,
            })
            setSuccess("Job created successfully")
            setTitle("")
            setDescription("")
            setRequirements("")
            setResponsibilities("")
            setLocation("")
            setJobType("full_time")
            setSalaryMin("")
            setSalaryMax("")
            setOpenings("")
            setEducationLevel("")
            setEducationDegree("")
            setEducationBranch("")
            setSkillsRequired("")
            setCurrentStep(0)
            setShowCreateForm(false)
            await loadJobs()
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to create job")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-5">
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs by title, description, or location..."
                        className="md:max-w-lg"
                    />
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => setShowCreateForm((v) => !v)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            {showCreateForm ? "Close Form" : "Create Job"}
                        </Button>
                        <Button type="button" variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4 px-1">
                    <p>Showing 1 to {filteredJobs.length} of {jobs.length} jobs</p>
                    <p>Page 1 of 1 • {filteredJobs.length} jobs per page</p>
                </div>

                {loading ? <p className="text-sm text-gray-500">Loading jobs...</p> : null}
                {!loading && filteredJobs.length === 0 ? <p className="text-sm text-gray-500">No jobs found.</p> : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 dark:bg-gray-900 dark:border-gray-700">
                            <div className="p-4 border-b border-emerald-100 dark:border-gray-700">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                            {job.job_type.replace("_", " ")} • {job.status}
                                        </p>
                                    </div>
                                    <div className="relative" ref={openMenuJobId === job.id ? menuRef : null}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenMenuJobId((prev) => (prev === job.id ? null : job.id))}
                                            className="h-8 w-8 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center justify-center"
                                            aria-label={`Open actions for ${job.title}`}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {openMenuJobId === job.id ? (
                                            <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1">
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() => {
                                                        setOpenMenuJobId(null)
                                                        setCurrentStep(0)
                                                        setShowCreateForm(true)
                                                        router.push("/dashboard/corporate/jobs#create-job-form")
                                                    }}
                                                >
                                                    Go to Create Job
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200 mt-3 line-clamp-3">{job.description}</p>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-500">
                                    {job.location} • applications {job.current_applications}/{job.max_applications}
                                </p>
                                <Button type="button" variant="outline" className="w-full mt-3">
                                    View JD
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showCreateForm ? (
                <div id="create-job-form" className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Job</h1>
                    <p className="text-sm text-gray-500 mt-1">Follow the structured flow to publish your job.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                    {STEPS.map((step, index) => {
                        const isDone = index < currentStep
                        const isActive = index === currentStep
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setCurrentStep(index)}
                                className={`px-3 py-3 text-sm font-semibold border-r last:border-r-0 dark:border-gray-700 ${
                                    isActive ? "bg-blue-50 text-blue-700" : isDone ? "bg-emerald-50 text-emerald-700" : "bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-300"
                                }`}
                            >
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${isDone ? "bg-emerald-600 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                                    {isDone ? "✓" : index + 1}
                                </span>
                                {step.label}
                            </button>
                        )
                    })}
                </div>

                <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div>
                        {currentStepId === "job_basics" && (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Job title</label>
                                    <Input placeholder="Frontend Developer Intern" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Job description</label>
                                    <textarea
                                        className="w-full min-h-32 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
                                        placeholder="Describe responsibilities, goals, and impact."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Requirements</label>
                                    <textarea className="w-full min-h-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" placeholder="Required qualifications" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Responsibilities</label>
                                    <textarea className="w-full min-h-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" placeholder="Key responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Location</label>
                                        <Input placeholder="Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Job type</label>
                                        <select
                                            className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm w-full"
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value as JobType)}
                                        >
                                            <option value="full_time">Full Time</option>
                                            <option value="part_time">Part Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="internship">Internship</option>
                                            <option value="freelance">Freelance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Mode of work</label>
                                        <select className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm w-full" value={modeOfWork} onChange={(e) => setModeOfWork(e.target.value as "onsite" | "remote" | "hybrid")}>
                                            <option value="onsite">Onsite</option>
                                            <option value="remote">Remote</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={remoteWork} onChange={(e) => setRemoteWork(e.target.checked)} /> Remote work</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={travelRequired} onChange={(e) => setTravelRequired(e.target.checked)} /> Travel required</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStepId === "candidate_eligibility" && (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Experience min (years)</label>
                                    <Input type="number" placeholder="0" value={experienceMin} onChange={(e) => setExperienceMin(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Experience max (years)</label>
                                    <Input type="number" placeholder="10" value={experienceMax} onChange={(e) => setExperienceMax(e.target.value)} />
                                </div>
                                <div>
                                        <label className="block text-sm font-semibold mb-2">Skills required (comma separated)</label>
                                        <Input placeholder="Python, SQL, Communication" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Certifications required</label>
                                        <Input placeholder="Any mandatory certification" value={certificationsRequired} onChange={(e) => setCertificationsRequired(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Education level (comma separated)</label>
                                        <Input placeholder="UG, PG" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Education degree (comma separated)</label>
                                        <Input placeholder="B.Tech, MCA" value={educationDegree} onChange={(e) => setEducationDegree(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Education branch (comma separated)</label>
                                        <Input placeholder="CSE, IT, ECE" value={educationBranch} onChange={(e) => setEducationBranch(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Max applications</label>
                                        <Input type="number" value={maxApplications} onChange={(e) => setMaxApplications(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Eligibility criteria</label>
                                        <Input placeholder="Min 60% throughout" value={eligibilityCriteria} onChange={(e) => setEligibilityCriteria(e.target.value)} />
                                    </div>
                            </div>
                        )}

                        {currentStepId === "compensation_company" && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Salary min</label>
                                        <Input type="number" placeholder="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Salary max</label>
                                        <Input type="number" placeholder="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Salary currency</label>
                                        <Input placeholder="INR" value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value.toUpperCase())} maxLength={3} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Number of openings</label>
                                        <Input type="number" placeholder="1" value={openings} onChange={(e) => setOpenings(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">CTC with probation</label>
                                        <Input placeholder="e.g. 4.5 LPA" value={ctcWithProbation} onChange={(e) => setCtcWithProbation(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">CTC after probation</label>
                                        <Input placeholder="e.g. 6 LPA" value={ctcAfterProbation} onChange={(e) => setCtcAfterProbation(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Industry</label>
                                        <Input placeholder="Technology" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                                    </div>
                                    <div><label className="block text-sm font-semibold mb-2">Company name</label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Company website</label><Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Company address</label><Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Company size</label><Input value={companySize} onChange={(e) => setCompanySize(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Company type</label><Input value={companyType} onChange={(e) => setCompanyType(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Company founded year</label><Input type="number" value={companyFounded} onChange={(e) => setCompanyFounded(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Contact person</label><Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Contact designation</label><Input value={contactDesignation} onChange={(e) => setContactDesignation(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Company logo URL</label><Input value={companyLogo} onChange={(e) => setCompanyLogo(e.target.value)} /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Company description</label><textarea className="w-full min-h-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} /></div>
                                </div>
                            </div>
                        )}

                        {currentStepId === "hiring_process" && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Selection process</label>
                                        <textarea className="w-full min-h-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" value={selectionProcess} onChange={(e) => setSelectionProcess(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Campus drive date</label>
                                        <Input type="datetime-local" value={campusDriveDate} onChange={(e) => setCampusDriveDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Expiration date</label>
                                        <Input type="datetime-local" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Service agreement details</label>
                                        <textarea className="w-full min-h-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" value={serviceAgreementDetails} onChange={(e) => setServiceAgreementDetails(e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Perks and benefits</label>
                                        <textarea className="w-full min-h-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" value={perksAndBenefits} onChange={(e) => setPerksAndBenefits(e.target.value)} />
                                    </div>
                                    <div><label className="block text-sm font-semibold mb-2">Ongoing project title</label><Input value={ongoingProjectTitle} onChange={(e) => setOngoingProjectTitle(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Application deadline</label><Input type="datetime-local" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Ongoing project description</label><textarea className="w-full min-h-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm" value={ongoingProjectDescription} onChange={(e) => setOngoingProjectDescription(e.target.value)} /></div>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-3">
                            <Button type="button" variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep((p) => p - 1)}>
                                Back
                            </Button>
                            <div className="flex items-center gap-3">
                                {success ? <p className="text-sm text-green-600">{success}</p> : null}
                                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                                {currentStep < STEPS.length - 1 ? (
                                    <Button type="button" disabled={!canGoNext} onClick={() => setCurrentStep((p) => p + 1)}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "Creating..." : "Create Job"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            ) : null}
        </div>
    )
}
