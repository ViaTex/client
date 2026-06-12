// ─────────────────────────────────────────────────────────────────────────────
// Shared API types for DishaSetu client
// Import from here instead of '@/lib/api' for tree-shaking friendliness
// ─────────────────────────────────────────────────────────────────────────────

export interface JobPayload {
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
    location: string
    remote_work?: boolean
    travel_required?: boolean
    mode_of_work?: 'onsite' | 'remote' | 'hybrid'
    salary_min?: number
    salary_max?: number
    salary_currency?: string
    ctc_min?: number
    ctc_max?: number
    ctc_currency?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    experience_min?: number
    experience_max?: number
    education_level?: string[]
    education_degree?: string[]
    education_branch?: string[]
    skills_required?: string[]
    certifications_required?: string
    application_deadline?: string
    max_applications?: number
    number_of_openings?: number
    industry?: string
    selection_process?: string
    campus_drive_date?: string
    service_agreement_details?: string
    expiration_date?: string
    perks_and_benefits?: string
    eligibility_criteria?: string
    company_name?: string
    company_logo?: string
    company_website?: string
    company_address?: string
    company_size?: string
    company_type?: string
    company_founded?: number
    company_description?: string
    contact_person?: string
    contact_designation?: string
    min_des_score?: number
    max_des_score?: number
    ongoing_project_title?: string
    ongoing_project_description?: string
    hiring_status?: string
}

export interface JobItem extends JobPayload {
    id: string
    status: string
    max_applications: number
    current_applications: number
    created_at: string
    is_public?: boolean
    can_apply?: boolean
}

export interface JobApplicationItem {
    id: string
    job_id: string
    student_id: string
    corporate_id?: string | null
    college_id?: string | null
    status: string
    expected_salary?: number | string | null
    cover_letter?: string | null
    resume_url?: string | null
    offer_letter?: string | null
    offer_letter_sent_at?: string | null
    created_at: string
    updated_at?: string | null
    student_name?: string | null
    student_email?: string | null
    student_phone?: string | null
    student_technical_skills?: string | null
    student_des_score?: number | string | null
    student_ats_score?: number | null
    job_title?: string | null
    company_name?: string | null
    salary_min?: number | string | null
    salary_max?: number | string | null
    salary_currency?: string | null
}

export interface CorporateProfile {
    id: string
    email: string
    name?: string
    bio?: string
    company_name?: string
    phone?: string
    contact_person?: string
    contact_designation?: string
    website_url?: string
    industry?: string
    company_size?: string
    founded_year?: number
    company_type?: string
    description?: string
    address?: string
}

export interface MentorProfile {
    id: string
    user_id: string
    email: string
    name: string
    profile_picture_url?: string | null
    phone?: string
    current_role?: string
    expertise_areas: string[]
    experience_years?: number
    motivation?: string
    average_rating: number
    linkedin_profile?: string | null
    github_profile?: string | null
    personal_website?: string | null
}

export interface SkillEvaluationItem {
    evaluation_id: string
    mentor_id: string
    student_id: string
    project_id?: string | null
    status: string
    proposed_slots: string[]
    confirmed_slot?: string | null
    viva_meeting_link?: string | null
    score_technical?: number | null
    score_practical?: number | null
    score_communication?: number | null
    score_originality?: number | null
    total_score?: number | null
    verdict?: string | null
    feedback_strengths?: string | null
    feedback_improvements?: string | null
    student_rating_of_mentor?: number | null
    student_technical_issues?: string | null
    created_at: string
    updated_at?: string | null
    student?: {
        name: string
        email: string
        profile_picture_url?: string | null
    } | null
    project?: {
        title: string
        description?: string | null
        github_url?: string | null
        live_url?: string | null
        skill_domain?: string | null
    } | null
}

export interface LoginResponse {
    access_token: string
    refresh_token: string
    user_id: string
    user_type: string
    name: string
}
