"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { corporateService } from "@/services/corporate.service"
import { jobService } from "@/services/job.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type JobType = "full_time" | "part_time" | "contract" | "internship" | "freelance"
type StepId = "job_basics" | "candidate_eligibility" | "compensation_company" | "hiring_process"

const STEPS: { id: StepId; label: string }[] = [
    { id: "job_basics", label: "1. Job Basics" },
    { id: "candidate_eligibility", label: "2. Candidate Eligibility" },
    { id: "compensation_company", label: "3. Compensation & Company" },
    { id: "hiring_process", label: "4. Hiring Process" },
]

export default function CreateJobPage() {
    const router = useRouter()
    
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
        if (currentStepId === "candidate_eligibility") {
            return Boolean(experienceMin || experienceMax || skillsRequired || educationLevel || educationDegree || educationBranch || eligibilityCriteria)
        }
        if (currentStepId === "compensation_company") {
            return Boolean(companyName.trim() || industry.trim() || openings.trim())
        }
        return true
    }, [currentStepId, title, description, location, jobType, experienceMin, experienceMax, skillsRequired, educationLevel, educationDegree, educationBranch, eligibilityCriteria, companyName, industry, openings])

    // Debug logging for step navigation
    useEffect(() => {
        console.log('Current step:', currentStep, 'Step ID:', currentStepId)
        console.log('Can go next:', canGoNext)
    }, [currentStep, currentStepId, canGoNext])

    useEffect(() => {
        corporateService
            .getProfile()
            .then((profile) => {
                setCompanyName(profile.company_name || "")
                setCompanyWebsite(profile.website_url || "")
                setCompanyAddress(profile.address || "")
                setCompanyType(profile.company_type || "")
                setIndustry(profile.industry || "")
            })
            .catch(() => {})
    }, [])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setSuccess("")

        try {
            await jobService.create({
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
            setTimeout(() => {
                router.push("/dashboard/corporate/jobs")
            }, 1000)
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to create job")
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[#d7ddf8] bg-[#EDF3FF] p-6 shadow-[0_18px_40px_rgba(121,144,198,0.14)] dark:border-[#2f3b68] dark:bg-[#131D3F] dark:shadow-[0_18px_40px_rgba(7,10,27,0.28)]">
                <div className="mb-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#16213f] dark:text-white">Create New Job</h1>
                        <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#aeb7d6]">Follow the structured flow to publish your job.</p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-[#cdd8f7] bg-white text-[#42548d] hover:bg-[#eef3ff] hover:text-[#16213f] dark:border-[#46517f] dark:bg-transparent dark:text-[#d9dff3] dark:hover:bg-[#1b2346] dark:hover:text-white"
                        onClick={() => router.push("/dashboard/corporate/jobs")}
                    >
                        Cancel
                    </Button>
                </div>

                <div className="mb-6 grid grid-cols-1 overflow-hidden rounded-xl border border-[#d7ddf8] bg-white dark:border-[#3a4677] dark:bg-[#222d58] md:grid-cols-5">
                    {STEPS.map((step, index) => {
                        const isDone = index < currentStep
                        const isActive = index === currentStep
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => {
                                console.log('Step button clicked:', index, step.id)
                                setCurrentStep(index)
                            }}
                                className={`border-r border-[#d7ddf8] px-3 py-3 text-sm font-semibold last:border-r-0 dark:border-[#3a4677] ${
                                    isActive ? "bg-[#131D3F] text-white dark:bg-[#182247] dark:text-[#dbe3ff]" : isDone ? "bg-[#eafaf1] text-[#1e9d63] dark:bg-[#1b3b34] dark:text-[#71e0aa]" : "bg-white text-[#5f6f98] dark:bg-[#182247] dark:text-[#dbe3ff]"
                                }`}
                            >
                                <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${isDone ? "bg-emerald-600 text-white" : isActive ? "bg-white text-[#131D3F] dark:bg-[#2a52d6] dark:text-white" : "bg-[#f2f5ff] text-[#334372]"}`}>
                                    {isDone ? "✓" : index + 1}
                                </span>
                                {step.label}
                            </button>
                        )
                    })}
                </div>

                <form
                    onSubmit={onSubmit}
                    className="overflow-hidden rounded-xl border border-[#d7ddf8] bg-white text-[#42548d] dark:border-[#36426e] dark:bg-[#131D3F] dark:text-[#dbe3ff] [&_input]:border-[#d7ddf8] [&_input]:bg-white [&_input]:text-[#16213f] [&_input]:placeholder:text-[#8b97bf] dark:[&_input]:border-[#46517f] dark:[&_input]:bg-[#121938] dark:[&_input]:text-white dark:[&_input]:placeholder:text-[#7d88aa] [&_textarea]:border-[#d7ddf8] [&_textarea]:bg-white [&_textarea]:text-[#16213f] [&_textarea]:placeholder:text-[#8b97bf] dark:[&_textarea]:border-[#46517f] dark:[&_textarea]:bg-[#121938] dark:[&_textarea]:text-white dark:[&_textarea]:placeholder:text-[#7d88aa] [&_select]:border-[#d7ddf8] [&_select]:bg-white [&_select]:text-[#16213f] dark:[&_select]:border-[#46517f] dark:[&_select]:bg-[#121938] dark:[&_select]:text-white [&_label]:text-[#16213f] dark:[&_label]:text-white"
                >
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
                                        className="w-full min-h-32 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]"
                                        placeholder="Describe responsibilities, goals, and impact."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Requirements</label>
                                    <textarea className="w-full min-h-24 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" placeholder="Required qualifications" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Responsibilities</label>
                                    <textarea className="w-full min-h-24 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" placeholder="Key responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Location</label>
                                        <Input placeholder="Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Job type</label>
                                        <select
                                            className="h-10 w-full rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#46517f] dark:bg-[#121938] dark:text-white"
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
                                        <select className="h-10 w-full rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#46517f] dark:bg-[#121938] dark:text-white" value={modeOfWork} onChange={(e) => setModeOfWork(e.target.value as "onsite" | "remote" | "hybrid")}>
                                            <option value="onsite">Onsite</option>
                                            <option value="remote">Remote</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Hiring status</label>
                                        <select className="h-10 w-full rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#46517f] dark:bg-[#121938] dark:text-white" value={hiringStatus} onChange={(e) => setHiringStatus(e.target.value)}>
                                            <option value="Actively Hiring">Actively Hiring</option>
                                            <option value="Immediate Joiners">Immediate Joiners</option>
                                            <option value="Urgent Opening">Urgent Opening</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-5 text-[#42548d] dark:text-[#dbe3ff]">
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
                                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Company description</label><textarea className="w-full min-h-20 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} /></div>
                                </div>
                            </div>
                        )}

                        {currentStepId === "hiring_process" && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Selection process</label>
                                        <textarea className="w-full min-h-24 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={selectionProcess} onChange={(e) => setSelectionProcess(e.target.value)} />
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
                                        <textarea className="w-full min-h-20 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={serviceAgreementDetails} onChange={(e) => setServiceAgreementDetails(e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Perks and benefits</label>
                                        <textarea className="w-full min-h-20 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={perksAndBenefits} onChange={(e) => setPerksAndBenefits(e.target.value)} />
                                    </div>
                                    <div><label className="block text-sm font-semibold mb-2">Ongoing project title</label><Input value={ongoingProjectTitle} onChange={(e) => setOngoingProjectTitle(e.target.value)} /></div>
                                    <div><label className="block text-sm font-semibold mb-2">Application deadline</label><Input type="datetime-local" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Ongoing project description</label><textarea className="w-full min-h-20 rounded-md border border-[#d7ddf8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#8b97bf] dark:border-[#46517f] dark:bg-[#121938] dark:text-white dark:placeholder:text-[#7d88aa]" value={ongoingProjectDescription} onChange={(e) => setOngoingProjectDescription(e.target.value)} /></div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-[#d7ddf8] p-4 dark:border-[#36426e]">
                            <Button type="button" variant="outline" className="border-[#cdd8f7] bg-white text-[#42548d] hover:bg-[#eef3ff] hover:text-[#16213f] dark:border-[#46517f] dark:bg-transparent dark:text-[#d9dff3] dark:hover:bg-[#1b2346] dark:hover:text-white" disabled={currentStep === 0} onClick={() => setCurrentStep((p) => p - 1)}>
                                Back
                            </Button>
                            <div className="flex items-center gap-3">
                                {success ? <p className="text-sm text-green-600 dark:text-green-400">{success}</p> : null}
                                {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                                {currentStep < STEPS.length - 1 ? (
                                    <Button type="button" className="bg-[#131D3F] text-white hover:bg-[#0f1733] dark:bg-[#8b5cf6] dark:hover:bg-[#7c46ee]" disabled={!canGoNext} onClick={() => {
                                        console.log('Next button clicked, current step:', currentStep, 'canGoNext:', canGoNext)
                                        setCurrentStep((p) => p + 1)
                                    }}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="submit" className="bg-[#131D3F] text-white hover:bg-[#0f1733] dark:bg-[#8b5cf6] dark:hover:bg-[#7c46ee]" disabled={submitting}>
                                        {submitting ? "Creating..." : "Create Job"}
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
