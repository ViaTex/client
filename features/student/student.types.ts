/**
 * Student profile and applications – aligned with server students + student_applications
 */

export interface SkillItem {
  name: string
  level: number
  verified: boolean
}

export interface ProjectItem {
  title: string
  tech: string[]
  verified: boolean
}

export interface JobPreferences {
  roles?: string[]
  locations?: string[]
  job_type?: string
  expected_salary?: number
}

export interface StudentProfile {
  id: string
  userId?: string
  fullName: string
  email: string
  phone?: string
  accountStatus: string
  createdAt: string
  updatedAt: string
  profilePhoto?: string
  collegeName?: string
  degree?: string
  branch?: string
  graduationYear?: number
  currentCity?: string
  aboutMe?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  resumeFileUrl?: string
  resumeAtsScore?: number
  skillsJson?: SkillItem[]
  projectsJson?: ProjectItem[]
  technicalScore?: number
  communicationScore?: number
  aptitudeScore?: number
  projectScore?: number
  overallDes?: number
  jobPreferencesJson?: JobPreferences
  showPhone?: boolean
  showEmail?: boolean
  showResume?: boolean
  showDes?: boolean
  mockInterviewScore?: number
  mentorFeedback?: string
  applications?: StudentApplication[]
}

export interface Job {
  id: string
  companyId: string
  title: string
  description?: string
  requiredSkills: string[]
  locationType?: string
  salaryRange?: string
  postedAt: string
  expiresAt?: string
  status: string
  company?: Company
}

export interface Company {
  id: string
  name: string
  location?: string
}

export interface StudentApplication {
  id: string
  studentId: string
  jobId: string
  applicationStatus: string
  appliedAt: string
  lastUpdated: string
  job?: Job
}
