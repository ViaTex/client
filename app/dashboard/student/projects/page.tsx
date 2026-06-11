'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Upload,
  X,
  TrendingUp,
  Award,
  Users,
  Target,
} from 'lucide-react'
import { HeroOverview } from '@/components/dashboard/HeroOverview'
import { VerificationPipeline } from '@/components/dashboard/VerificationPipeline'
import { AnalyticsGrid, MetricCard, type MetricCardProps } from '@/components/dashboard/AnalyticsCards'
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline'
import { VivaWidget } from '@/components/dashboard/VivaWidget'
import { MentorEvaluationCard } from '@/components/dashboard/MentorEvaluationCard'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { VerifiedSkillsCard, RecruiterVisibilityCard, SmartMatchCard } from '@/components/dashboard/SupportCards'
import { DESGrowthChart, SkillsDistributionChart, RecruiterAnalyticsChart } from '@/components/dashboard/AnalyticsCharts'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_viva: {
    label: 'Pending Viva',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  viva_scheduled: {
    label: 'Viva Scheduled',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  viva_completed: {
    label: 'Viva Completed',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  verified: {
    label: 'Verified ✓',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: <BadgeCheck className="h-3.5 w-3.5" />,
  },
  failed: {
    label: 'Not Passed',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: <X className="h-3.5 w-3.5" />,
  },
}

const SKILL_DOMAINS = [
  'Frontend', 'Backend', 'Full Stack', 'Data Science', 'Machine Learning',
  'DevOps', 'Mobile', 'UI/UX Design', 'Cybersecurity', 'Cloud', 'Blockchain',
]

interface Project {
  id: string
  title: string
  description: string
  github_url: string
  live_url: string
  tech_stack: string[]
  skill_domain: string
  status: string
  verified_badge: string | null
  created_at: string
  mentor?: {
    name: string
    email: string
  }
}

interface StudentProfile {
  id?: string
  name?: string
  email?: string
  current_des_score?: number
}

function getToken() {
  return localStorage.getItem('access_token') ?? ''
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    github_url: '',
    live_url: '',
    tech_stack: [] as string[],
    skill_domain: '',
    newTech: '',
  })

  async function fetchStudentProfile() {
    try {
      const res = await fetch(`${API}/student/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStudentProfile(data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/projects/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load projects')
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentProfile()
    fetchProjects()
  }, [])

  function addTech() {
    const t = form.newTech.trim()
    if (t && !form.tech_stack.includes(t)) {
      setForm((f) => ({ ...f, tech_stack: [...f.tech_stack, t], newTech: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          github_url: form.github_url,
          live_url: form.live_url,
          tech_stack: form.tech_stack,
          skill_domain: form.skill_domain,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? 'Submission failed')
      }
      setShowForm(false)
      setForm({ title: '', description: '', github_url: '', live_url: '', tech_stack: [], skill_domain: '', newTech: '' })
      await fetchProjects()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Mock data for demonstration (replace with real data from API)
  const verificationPipelineStages = [
    { id: '1', label: 'Project Submitted', completed: true, current: false, date: 'May 12, 2025' },
    { id: '2', label: 'Mentor Assigned', completed: true, current: false, date: 'May 13, 2025' },
    { id: '3', label: 'Viva Scheduled', completed: projects.some(p => p.status === 'viva_scheduled'), current: projects.some(p => p.status === 'viva_scheduled'), date: 'May 20, 2025' },
    { id: '4', label: 'Viva Completed', completed: projects.some(p => p.status === 'viva_completed'), current: projects.some(p => p.status === 'viva_completed') },
    { id: '5', label: 'Verified', completed: projects.some(p => p.status === 'verified'), current: false },
    { id: '6', label: 'Talent Pool Added', completed: projects.some(p => p.status === 'verified'), current: false },
  ]

  const metrics: MetricCardProps[] = [
    { icon: <Award className="h-5 w-5" />, label: 'Total Projects', value: projects.length, color: 'blue', subtext: 'All submissions' },
    { icon: <CheckCircle2 className="h-5 w-5" />, label: 'Verified Projects', value: projects.filter(p => p.status === 'verified').length, color: 'green', subtext: '100% verified' },
    { icon: <Clock className="h-5 w-5" />, label: 'Pending Viva', value: projects.filter(p => p.status === 'pending_viva').length, color: 'orange', subtext: 'Awaiting mentor' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'DES Impact', value: `+${Math.floor(projects.length * 2.5)}`, color: 'purple', trend: 8 },
    { icon: <Users className="h-5 w-5" />, label: 'Mentor Matches', value: projects.length, color: 'blue', subtext: 'Active mentors' },
    { icon: <Target className="h-5 w-5" />, label: 'Skills Verified', value: projects.filter(p => p.status === 'verified').length, color: 'green' },
  ]

  const activityEvents = [
    {
      id: '1',
      type: 'submit' as const,
      title: 'Project Submitted',
      description: 'E-Commerce REST API submitted for verification',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      details: { 'Domain': 'Backend', 'Tech': 'Node.js, MongoDB' },
    },
    {
      id: '2',
      type: 'mentor_assigned' as const,
      title: 'Mentor Assigned',
      description: 'Deepak S. assigned as your project mentor',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      details: { 'Mentor': 'Deepak S.', 'Company': 'Google' },
    },
    {
      id: '3',
      type: 'viva_scheduled' as const,
      title: 'Viva Scheduled',
      description: 'Your viva is scheduled for May 20, 2025 at 4:00 PM',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: { 'Date': 'May 20, 2025', 'Time': '4:00 PM IST' },
    },
  ]

  const desGrowthData = [
    { month: 'Jan', score: 45 },
    { month: 'Feb', score: 52 },
    { month: 'Mar', score: 58 },
    { month: 'Apr', score: 65 },
    { month: 'May', score: 72 },
  ]

  const skillsDistribution = [
    { name: 'Frontend', value: 30 },
    { name: 'Backend', value: 25 },
    { name: 'Full Stack', value: 20 },
    { name: 'DevOps', value: 15 },
    { name: 'Others', value: 10 },
  ]

  const recruiterAnalyticsData = [
    { name: 'Week 1', views: 12, searches: 5, impressions: 25 },
    { name: 'Week 2', views: 18, searches: 8, impressions: 35 },
    { name: 'Week 3', views: 24, searches: 12, impressions: 45 },
    { name: 'Week 4', views: 31, searches: 15, impressions: 60 },
  ]

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* SECTION 1: HERO OVERVIEW */}
        <HeroOverview
          studentName={studentProfile?.name || 'Student'}
          desScore={studentProfile?.current_des_score || 72}
          verificationProgress={Math.round(
            ((projects.filter(p => p.status === 'verified').length) / Math.max(projects.length, 1)) * 100
          )}
          verifiedSkillsCount={projects.filter(p => p.status === 'verified').length}
          profileCompletion={85}
          talentPoolStatus={projects.some(p => p.status === 'verified') ? 'added' : 'not_added'}
          nextMilestone={projects.some(p => p.status === 'viva_scheduled') ? 'Viva Interview' : 'Submit Project'}
        />

        {/* SECTION 2: VERIFICATION PIPELINE */}
        <VerificationPipeline stages={verificationPipelineStages} />

        {/* SECTION 3: ANALYTICS METRICS */}
        <AnalyticsGrid metrics={metrics} />

        {/* SECTION 4: LAYOUT - MAIN CONTENT + RIGHT SIDEBAR */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">My Projects</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} submitted
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 dark:bg-blue-600"
                >
                  <PlusCircle className="h-4 w-4" />
                  Submit Project
                </button>
              </div>

              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                  <ShieldCheck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-3 font-semibold text-gray-700 dark:text-gray-300">
                    No projects submitted yet
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Submit your first project to get a Mentor Viva and earn a Verified ✓ badge.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
                  >
                    <PlusCircle className="h-4 w-4" /> Submit First Project
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      techStack={project.tech_stack}
                      skillDomain={project.skill_domain}
                      status={project.status as any}
                      githubUrl={project.github_url}
                      liveUrl={project.live_url}
                      submittedDate={new Date(project.created_at)}
                      mentorName={project.mentor?.name}
                      verifiedBadge={project.verified_badge !== null}
                      onViewDetails={() => console.log('View details for', project.id)}
                      onScheduleViva={() => console.log('Schedule viva for', project.id)}
                      onViewReport={() => console.log('View report for', project.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: MENTOR EVALUATION PREVIEW */}
            {projects.some(p => p.status === 'viva_completed') && (
              <MentorEvaluationCard
                technical={35}
                practical={28}
                communication={19}
                originality={9}
                totalScore={91}
                verdict="pass"
                strengths={[
                  'Excellent architecture design',
                  'Clean and maintainable code',
                  'Great problem-solving approach',
                ]}
                improvements={['Add more unit tests', 'Improve error handling']}
                mentorName="Deepak S."
                mentorCompany="Google"
                mentorRole="Principal Engineer"
                feedback="Impressive project with solid fundamentals. Your approach to scalability shows maturity in system design."
              />
            )}

            {/* SECTION 6: ANALYTICS CHARTS */}
            <div className="grid gap-6 lg:grid-cols-2">
              <DESGrowthChart data={desGrowthData} title="DES Score Growth" />
              <SkillsDistributionChart data={skillsDistribution} title="Skills Distribution" />
            </div>

            <RecruiterAnalyticsChart data={recruiterAnalyticsData} title="Recruiter Interest" />

            {/* SECTION 7: ACTIVITY TIMELINE */}
            <ActivityTimeline events={activityEvents} />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* VIVA WIDGET */}
            {projects.some(p => p.status === 'viva_scheduled' || p.status === 'viva_completed') && (
              <VivaWidget
                mentorName="Deepak S."
                mentorCompany="Google"
                mentorRole="Principal Engineer"
                vivaDate={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)}
                duration={45}
                meetingLink="https://meet.google.com/xyz"
                status="scheduled"
              />
            )}

            {/* VERIFIED SKILLS CARD */}
            <VerifiedSkillsCard
              skills={
                projects.filter(p => p.status === 'verified').length > 0
                  ? [
                      {
                        name: 'Backend Development',
                        score: 92,
                        verificationDate: new Date(),
                        mentorName: 'Deepak S.',
                      },
                      {
                        name: 'API Design',
                        score: 88,
                        verificationDate: new Date(),
                        mentorName: 'Deepak S.',
                      },
                    ]
                  : []
              }
            />

            {/* RECRUITER VISIBILITY CARD */}
            <RecruiterVisibilityCard
              views={31}
              searches={15}
              impressions={60}
              talentPoolRank={128}
              totalInPool={1250}
            />

            {/* SMART MATCH CARD */}
            <SmartMatchCard
              eligibleCompanies={47}
              skillMatch={85}
              recruiterDemand={8}
              hiringReadiness={78}
            />
          </div>
        </div>

        {/* PROJECT SUBMISSION MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Submit Project for Viva</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold dark:text-gray-300">
                    Project Title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. E-Commerce REST API"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What does this project do?"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold dark:text-gray-300">
                      GitHub URL *
                    </label>
                    <input
                      required
                      value={form.github_url}
                      onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                      placeholder="https://github.com/you/repo"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold dark:text-gray-300">
                      Live URL (optional)
                    </label>
                    <input
                      value={form.live_url}
                      onChange={(e) => setForm((f) => ({ ...f, live_url: e.target.value }))}
                      placeholder="https://your-app.vercel.app"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold dark:text-gray-300">
                    Skill Domain *
                  </label>
                  <select
                    required
                    value={form.skill_domain}
                    onChange={(e) => setForm((f) => ({ ...f, skill_domain: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select domain…</option>
                    {SKILL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold dark:text-gray-300">
                    Tech Stack
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.newTech}
                      onChange={(e) => setForm((f) => ({ ...f, newTech: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                      placeholder="Add technology…"
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <button type="button" onClick={addTech} className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                      Add
                    </button>
                  </div>
                  {form.tech_stack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.tech_stack.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {t}
                          <button type="button" onClick={() => setForm((f) => ({ ...f, tech_stack: f.tech_stack.filter((x) => x !== t) }))}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Submit for Viva
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
