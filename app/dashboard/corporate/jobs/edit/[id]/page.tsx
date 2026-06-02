"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { jobService } from "@/services/job.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

type JobType = "full_time" | "part_time" | "contract" | "internship" | "freelance"
type StepId = "job_basics" | "candidate_eligibility" | "compensation_company" | "hiring_process"

const STEPS: { id: StepId; label: string }[] = [
    { id: "job_basics", label: "1. Job Basics" },
    { id: "candidate_eligibility", label: "2. Candidate Eligibility" },
    { id: "compensation_company", label: "3. Compensation & Company" },
    { id: "hiring_process", label: "4. Hiring Process" },
]

export default function EditJobPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.id as string
    
    const [loading, setLoading] = useState(true)
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
    const [hiringStatus, setHiringStatus] = useState("Actively Hiring")
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
    const currentStepId = STEPS[currentStep].id
    
    const canGoNext = useMemo(() => {
        if (currentStepId === "job_basics") {
            return Boolean(title.trim() && description.trim() && location.trim() && jobType)
        }
        return true
    }, [currentStepId, title, description, location, jobType])

    useEffect(() => {
        if (!jobId) return;

        jobService.getById(jobId)
            .then((job) => {
                setTitle(job.title || "")
                setDescription(job.description || "")
                setRequirements(job.requirements || "")
                setResponsibilities(job.responsibilities || "")
                setLocation(job.location || "")
                setJobType(job.job_type || "full_time")
                setRemoteWork(job.remote_work || false)
                setTravelRequired(job.travel_required || false)
                setModeOfWork(job.mode_of_work || "onsite")
                setHiringStatus(job.hiring_status || "Actively Hiring")
                setSalaryMin(job.salary_min?.toString() || "")
                setSalaryMax(job.salary_max?.toString() || "")
                setSalaryCurrency(job.salary_currency || "INR")
                setCtcWithProbation(job.ctc_with_probation || "")
                setCtcAfterProbation(job.ctc_after_probation || "")
                setExperienceMin(job.experience_min?.toString() || "")
                setExperienceMax(job.experience_max?.toString() || "")
                setOpenings(job.number_of_openings?.toString() || "")
                setEducationLevel(job.education_level?.join(", ") || "")
                setEducationDegree(job.education_degree?.join(", ") || "")
                setEducationBranch(job.education_branch?.join(", ") || "")
                setSkillsRequired(job.skills_required?.join(", ") || "")
                setCertificationsRequired(job.certifications_required || "")
                
                // Format datetime-local strings
                const formatDT = (dtStr?: string) => dtStr ? new Date(dtStr).toISOString().slice(0, 16) : ""
                setApplicationDeadline(formatDT(job.application_deadline))
                setCampusDriveDate(formatDT(job.campus_drive_date))
                setExpirationDate(formatDT(job.expiration_date))
                
                setMaxApplications(job.max_applications?.toString() || "100")
                setCompanyName(job.company_name || "")
                setCompanyLogo(job.company_logo || "")
                setCompanyWebsite(job.company_website || "")
                setCompanyAddress(job.company_address || "")
                setCompanySize(job.company_size || "")
                setCompanyType(job.company_type || "")
                setCompanyFounded(job.company_founded?.toString() || "")
                setCompanyDescription(job.company_description || "")
                setContactPerson(job.contact_person || "")
                setContactDesignation(job.contact_designation || "")
                setIndustry(job.industry || "")
                setSelectionProcess(job.selection_process || "")
                setServiceAgreementDetails(job.service_agreement_details || "")
                setPerksAndBenefits(job.perks_and_benefits || "")
                setEligibilityCriteria(job.eligibility_criteria || "")
                setMinDesScore(job.min_des_score?.toString() || "")
                setMaxDesScore(job.max_des_score?.toString() || "")
                setOngoingProjectTitle(job.ongoing_project_title || "")
                setOngoingProjectDescription(job.ongoing_project_description || "")
                
                setLoading(false)
            })
            .catch((e) => {
                setError(e?.response?.data?.detail || "Failed to load job details")
                setLoading(false)
            })
    }, [jobId])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setSuccess("")

        try {
            await jobService.update(jobId, {
                title,
                description,
                requirements: requirements || undefined,
                responsibilities: responsibilities || undefined,
                location,
                job_type: jobType,
                remote_work: remoteWork,
                travel_required: travelRequired,
                mode_of_work: modeOfWork,
                hiring_status: hiringStatus,
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
                application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
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
                campus_drive_date: campusDriveDate ? new Date(campusDriveDate).toISOString() : undefined,
                service_agreement_details: serviceAgreementDetails || undefined,
                expiration_date: expirationDate ? new Date(expirationDate).toISOString() : undefined,
                perks_and_benefits: perksAndBenefits || undefined,
                eligibility_criteria: eligibilityCriteria || undefined,
                min_des_score: minDesScore ? Number(minDesScore) : undefined,
                max_des_score: maxDesScore ? Number(maxDesScore) : undefined,
                ongoing_project_title: ongoingProjectTitle || undefined,
                ongoing_project_description: ongoingProjectDescription || undefined,
            })
            setSuccess("Job updated successfully")
            setTimeout(() => {
                router.push("/dashboard/corporate/jobs")
            }, 1000)
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to update job")
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-[#edf4ff] border border-[#d7ddf8] p-6 shadow-[0_18px_40px_rgba(121,144,198,0.14)] dark:border-[#2f3b68] dark:bg-[#253261] dark:shadow-[0_18px_40px_rgba(7,10,27,0.28)]">
                <div className="mb-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Job</h1>
                        <p className="text-sm text-[#5f6f98] mt-1 dark:text-[#aeb7d6]">Update the details of your job listing.</p>
                    </div>
                    <Button variant="outline" className="border-[#cdd8f7] bg-white text-[#42548d] hover:bg-[#eef3ff] hover:text-[#16213f] dark:border-[#46517f] dark:bg-transparent dark:text-[#d9dff3] dark:hover:bg-[#1b2346] dark:hover:text-white" onClick={() => router.push("/dashboard/corporate/jobs")}>
                        Cancel
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 rounded-xl border border-[#d7ddf8] bg-white dark:border-[#3a4677] dark:bg-[#222d58] overflow-hidden mb-6">
                    {STEPS.map((step, index) => {
                        const isDone = index < currentStep
                        const isActive = index === currentStep
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setCurrentStep(index)}
                                className={`px-3 py-3 text-sm font-semibold border-r last:border-r-0 border-[#d7ddf8] dark:border-[#3a4677] ${
                                    isActive ? "bg-[#e9eeff] text-[#2a52d6]" : isDone ? "bg-emerald-50 text-emerald-700 dark:bg-[#1b3b34] dark:text-[#71e0aa]" : "bg-white text-[#5f6f98] dark:bg-[#182247] dark:text-[#dbe3ff]"
                                }`}
                            >
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${isDone ? "bg-emerald-600 text-white" : isActive ? "bg-blue-600 text-white dark:bg-[#2a52d6]" : "bg-gray-200 text-gray-600 dark:bg-[#f2f5ff] dark:text-[#334372]"}`}>
                                    {isDone ? "✓" : index + 1}
                                </span>
                                {step.label}
                            </button>
                        )
                    })}
                </div>

                <form onSubmit={onSubmit} className="rounded-xl border border-[#d7ddf8] bg-white overflow-hidden [&_input]:border-[#d7ddf8] [&_input]:bg-white [&_input]:text-[#16213f] [&_input]:placeholder:text-[#8b97bf] [&_textarea]:border-[#d7ddf8] [&_textarea]:bg-white [&_textarea]:text-[#16213f] [&_textarea]:placeholder:text-[#8b97bf] [&_select]:border-[#d7ddf8] [&_select]:bg-white [&_select]:text-[#16213f] [&_label]:text-[#16213f] dark:border-[#36426e] dark:bg-[#253261] dark:text-[#dbe3ff] dark:[&_input]:border-[#46517f] dark:[&_input]:bg-[#121938] dark:[&_input]:text-white dark:[&_input]:placeholder:text-[#7d88aa] dark:[&_textarea]:border-[#46517f] dark:[&_textarea]:bg-[#121938] dark:[&_textarea]:text-white dark:[&_textarea]:placeholder:text-[#7d88aa] dark:[&_select]:border-[#46517f] dark:[&_select]:bg-[#121938] dark:[&_select]:text-white dark:[&_label]:text-white">
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
                                        className="w-full min-h-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]"
                                        placeholder="Describe responsibilities, goals, and impact."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Requirements</label>
                                    <textarea className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" placeholder="Required qualifications" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Responsibilities</label>
                                    <textarea className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" placeholder="Key responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Location</label>
                                        <Input placeholder="Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Job type</label>
                                        <select
                                            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 w-full dark:border-[#46517f] dark:bg-[#121938] dark:text-white"
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
                                        <select className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 w-full dark:border-[#46517f] dark:bg-[#121938] dark:text-white" value={modeOfWork} onChange={(e) => setModeOfWork(e.target.value as "onsite" | "remote" | "hybrid")}>
                                            <option value="onsite">Onsite</option>
                                            <option value="remote">Remote</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Hiring status</label>
                                        <select className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 w-full dark:border-[#46517f] dark:bg-[#121938] dark:text-white" value={hiringStatus} onChange={(e) => setHiringStatus(e.target.value)}>
                                            <option value="Actively Hiring">Actively Hiring</option>
                                            <option value="Immediate Joiners">Immediate Joiners</option>
                                            <option value="Urgent Opening">Urgent Opening</option>
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
                                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Company description</label><textarea className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} /></div>
                                </div>
                            </div>
                        )}

                        {currentStepId === "hiring_process" && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Selection process</label>
                                        <textarea className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={selectionProcess} onChange={(e) => setSelectionProcess(e.target.value)} />
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
                                        <textarea className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={serviceAgreementDetails} onChange={(e) => setServiceAgreementDetails(e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Perks and benefits</label>
                                        <textarea className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={perksAndBenefits} onChange={(e) => setPerksAndBenefits(e.target.value)} />
                                    </div>
                                    <div><label className="block text-sm font-semibold mb-2">Ongoing project title</label><Input value={ongoingProjectTitle} onChange={(e) => setOngoingProjectTitle(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Application deadline</label><Input type="datetime-local" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Ongoing project description</label><textarea className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={ongoingProjectDescription} onChange={(e) => setOngoingProjectDescription(e.target.value)} /></div>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-[#d7ddf8] dark:border-[#36426e] p-4 flex items-center justify-between gap-3">
                            <Button type="button" variant="outline" className="border-[#cdd8f7] bg-white text-[#42548d] hover:bg-[#eef3ff] hover:text-[#16213f] dark:border-[#46517f] dark:bg-transparent dark:text-[#d9dff3] dark:hover:bg-[#1b2346] dark:hover:text-white" disabled={currentStep === 0} onClick={() => setCurrentStep((p) => p - 1)}>
                                Back
                            </Button>
                            <div className="flex items-center gap-3">
                                {success ? <p className="text-sm text-green-600 dark:text-green-400">{success}</p> : null}
                                {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                                {currentStep < STEPS.length - 1 ? (
                                    <Button type="button" className="bg-[#2f7fff] text-white hover:bg-[#246dea] dark:bg-[#8b5cf6] dark:text-white dark:hover:bg-[#7c46ee]" disabled={!canGoNext} onClick={() => setCurrentStep((p) => p + 1)}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="submit" className="bg-[#2f7fff] text-white hover:bg-[#246dea] dark:bg-[#8b5cf6] dark:text-white dark:hover:bg-[#7c46ee]" disabled={submitting}>
                                        {submitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
