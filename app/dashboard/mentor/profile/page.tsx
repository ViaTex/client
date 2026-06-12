"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  BadgeCheck,
  Github,
  Globe,
  Linkedin,
  Mail,
  PencilLine,
  Star,
  UserRound,
  X,
  Award,
  ShieldCheck,
  Users,
  ClipboardCheck,
  ChevronRight,
  Hourglass,
  Clock
} from "lucide-react"
import type { MentorProfile, SkillEvaluationItem } from "@/lib/types"
import { mentorService } from "@/services/mentor.service"

type FormState = {
  name: string
  email: string
  phone: string
  current_role: string
  experience_years: string
  expertise_areas: string
  motivation: string
  linkedin_profile: string
  github_profile: string
  personal_website: string
}

const MAX_MOTIVATION_LENGTH = 240

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [form, setForm] = useState<FormState | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await mentorService.getProfile()
        setProfile(profileData)
        setForm({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          current_role: profileData.current_role || "",
          experience_years: profileData.experience_years?.toString() || "",
          expertise_areas: (profileData.expertise_areas || []).join(", "),
          motivation: profileData.motivation || "",
          linkedin_profile: profileData.linkedin_profile || "",
          github_profile: profileData.github_profile || "",
          personal_website: profileData.personal_website || "",
        })
      } catch {
        toast.error("Unable to load mentor profile")
      } finally {
        setLoading(false)
      }
    }

    const loadEvaluations = async () => {
      try {
        const evals = await mentorService.getEvaluations()
        setEvaluations(evals || [])
      } catch {
        // Silent catch for secondary metrics
      }
    }

    loadProfile().then(() => {
      loadEvaluations()
    })
  }, [])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const initials = useMemo(() => {
    const base = form?.name?.trim() || profile?.name?.trim() || "Mentor"
    return base
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [form?.name, profile?.name])

  const displaySkills = useMemo(() => {
    if (form?.expertise_areas) {
      return form.expertise_areas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    }
    if (profile?.expertise_areas && profile.expertise_areas.length > 0) {
      return profile.expertise_areas
    }
    return ["AI/ML", "Python", "MERN Stack", "System Design", "Data Science", "Cloud Computing", "Docker", "PostgreSQL", "Git & GitHub", "REST APIs"]
  }, [form?.expertise_areas, profile?.expertise_areas])

  const stats = useMemo(() => {
    const total = evaluations.length
    const completed = evaluations.filter((item) => item.status === "evaluated").length
    const pending = evaluations.filter((item) => item.status !== "evaluated").length
    const rated = evaluations.filter((item) => typeof item.student_rating_of_mentor === "number")
    const averageRating = rated.length
      ? rated.reduce((sum, item) => sum + (item.student_rating_of_mentor || 0), 0) / rated.length
      : profile?.average_rating || 0

    return { total, completed, pending, averageRating, ratedCount: rated.length }
  }, [evaluations, profile?.average_rating])

  // Mock list of recent evaluations matching the design exactly
  const mockRecentEvaluations = useMemo(() => [
    {
      evaluation_id: "mock-1",
      mentor_id: "mock-mentor",
      student_id: "aryan",
      proposed_slots: [],
      student: { name: "Aryan Sharma", email: "aryan@gmail.com", profile_picture_url: null },
      project: { title: "AI Chatbot" },
      total_score: 38,
      status: "evaluated",
      created_at: "2025-05-26T10:00:00Z"
    },
    {
      evaluation_id: "mock-2",
      mentor_id: "mock-mentor",
      student_id: "priya",
      proposed_slots: [],
      student: { name: "Priya Patel", email: "priya@gmail.com", profile_picture_url: null },
      project: { title: "Smart Attendance System" },
      total_score: null,
      status: "assigned",
      created_at: "2025-05-25T10:00:00Z"
    },
    {
      evaluation_id: "mock-3",
      mentor_id: "mock-mentor",
      student_id: "aman",
      proposed_slots: [],
      student: { name: "Aman Kumar", email: "aman@gmail.com", profile_picture_url: null },
      project: { title: "E-commerce API" },
      total_score: 35,
      status: "evaluated",
      created_at: "2025-05-24T10:00:00Z"
    },
    {
      evaluation_id: "mock-4",
      mentor_id: "mock-mentor",
      student_id: "neha",
      proposed_slots: [],
      student: { name: "Neha Singh", email: "neha@gmail.com", profile_picture_url: null },
      project: { title: "Portfolio Website" },
      total_score: null,
      status: "assigned",
      created_at: "2025-05-23T10:00:00Z"
    }
  ], [])

  // Combine real recent evaluations with mockup fallbacks
  const recentEvaluations = useMemo(() => {
    if (evaluations.length > 0) {
      const list = [...evaluations]
      if (list.length < 4) {
        list.push(...mockRecentEvaluations.slice(list.length))
      }
      return list.slice(0, 4)
    }
    return mockRecentEvaluations
  }, [evaluations, mockRecentEvaluations])

  const onSave = async () => {
    if (!profile || !form) return

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        current_role: form.current_role.trim() || undefined,
        experience_years: form.experience_years ? Number(form.experience_years) : undefined,
        motivation: form.motivation.trim() || undefined,
        expertise_areas: form.expertise_areas
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        linkedin_profile: form.linkedin_profile.trim() || null,
        github_profile: form.github_profile.trim() || null,
        personal_website: form.personal_website.trim() || null,
      }

      const updated = await mentorService.updateProfile(payload)
      setProfile(updated)
      setForm({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        current_role: updated.current_role || "",
        experience_years: updated.experience_years?.toString() || "",
        expertise_areas: (updated.expertise_areas || []).join(", "),
        motivation: updated.motivation || "",
        linkedin_profile: updated.linkedin_profile || "",
        github_profile: updated.github_profile || "",
        personal_website: updated.personal_website || "",
      })
      toast.success("Mentor profile updated")
      setIsEditing(false)
    } catch {
      toast.error("Failed to update mentor profile")
    } finally {
      setSaving(false)
    }
  }

  // Generate a premium dynamic background color based on name initials
  const getAvatarBg = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = [
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20"
    ]
    return colors[hash % colors.length]
  }

  const formatScore = (score?: number | null) => {
    if (score === undefined || score === null) return "--"
    if (score <= 40) return `${score}/40`
    return `${Math.round((score / 100) * 40)}/40`
  }

  const formatDateString = (iso?: string | null) => {
    if (!iso) return "—"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-6 text-slate-900 dark:text-white">
        {/* Title Header Card */}
        <div className="rounded-[24px] border border-slate-200/60 bg-[#f8fafc] p-6 dark:border-white/5 dark:bg-[#0d1527] transition-all">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            My Profile <span className="text-xl">👤</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/55 mt-1.5">
            View and manage your mentor profile, expertise areas, and performance. ✨
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              👤 Profile Details
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              🔒 Account Settings
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              📈 Social Profiles
            </span>
          </div>
        </div>

        {/* Hero Skeleton */}
        <div className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6 dark:border-[#243056]/80 dark:bg-[#0c1224] space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-28 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile || !form) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
        <p className="text-sm text-red-500">Mentor profile not found.</p>
      </div>
    )
  }

  const rating = (stats.averageRating || 0).toFixed(1)
  const displayId = `MTR-2024-${profile.id.slice(0, 4).toUpperCase()}`

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-6 text-slate-900 dark:text-white">
      {/* Title Header Card */}
      <div className="rounded-[24px] border border-slate-200/60 bg-[#f8fafc] p-6 dark:border-white/5 dark:bg-[#0d1527] transition-all">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          My Profile <span className="text-xl">👤</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-white/55 mt-1.5">
          View and manage your mentor profile, expertise areas, and performance. ✨
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            👤 Profile Details
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            🔒 Account Settings
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            📈 Social Profiles
          </span>
        </div>
      </div>

      {/* Hero Section Card */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_rgba(46,60,120,0.05)] dark:border-[#243056]/80 dark:bg-[linear-gradient(135deg,#101735_0%,#0a0f24_100%)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Animated wave pattern overlay inside card */}
        <svg className="absolute right-0 bottom-0 h-48 w-full md:w-1/2 pointer-events-none opacity-30 dark:opacity-50" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 150 C 100 120, 150 180, 250 140 C 350 100, 380 160, 400 110 L400 200 L0 200 Z" fill="url(#wave-gradient)" opacity="0.15" />
          <path d="M0 160 C 80 140, 160 160, 240 120 C 320 80, 360 140, 400 90" stroke="url(#line-gradient-1)" strokeWidth="1.5" />
          <path d="M0 140 C 120 110, 180 190, 280 130 C 340 90, 370 120, 400 80" stroke="url(#line-gradient-2)" strokeWidth="1" opacity="0.6" />
          <defs>
            <linearGradient id="wave-gradient" x1="200" y1="100" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7b61ff" stopOpacity="0.8"/>
              <stop offset="1" stopColor="#7b61ff" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="line-gradient-1" x1="0" y1="120" x2="400" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7b61ff" stopOpacity="0"/>
              <stop offset="0.5" stopColor="#9a75ff"/>
              <stop offset="1" stopColor="#c8ee44" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="line-gradient-2" x1="0" y1="120" x2="400" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c8ee44" stopOpacity="0"/>
              <stop offset="0.5" stopColor="#7b61ff"/>
              <stop offset="1" stopColor="#7b61ff" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {/* Profile Picture with online status */}
            <div className="relative mx-auto md:mx-0 flex-shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-[linear-gradient(180deg,#f3f5ff_0%,#cfc8ff_100%)] text-3xl font-black text-[#151b2f] shadow-lg dark:border-[#243056]">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt="Mentor profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials || "M"}</span>
                )}
              </div>
              <span className="absolute bottom-1 right-1 flex h-4.5 w-4.5 rounded-full border-3 border-white bg-emerald-500 dark:border-[#101735]" />
            </div>

            {/* Profile Info */}
            <div className="space-y-2.5 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {form.name}
                </h2>
                <span className="rounded-full bg-[#7b61ff]/10 px-3 py-1 text-[11px] font-bold text-[#7b61ff] dark:bg-[#7b61ff]/20 dark:text-[#a291ff]">
                  Mentor
                </span>
                <BadgeCheck className="h-5.5 w-5.5 text-blue-500 stroke-[2.5]" />
              </div>

              <div className="grid gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <span className="inline-flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                  {form.email}
                </span>
                <span className="inline-flex items-center gap-2 justify-center md:justify-start">
                  <UserRound className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                  Mentor ID: {displayId}
                </span>
                <span className="inline-flex items-center gap-2 justify-center md:justify-start">
                  <Clock3 className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                  {form.experience_years ? `${form.experience_years}+ years of experience` : "Experience pending"}
                </span>
                <span className="inline-flex items-center gap-2 justify-center md:justify-start text-[#7b61ff] dark:text-[#a291ff] italic font-semibold">
                  <span className="text-lg font-serif">“</span> Evaluating. Guiding. Empowering.
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
                {profile?.linkedin_profile && (
                  <a
                    href={profile.linkedin_profile.startsWith("http") ? profile.linkedin_profile : `https://${profile.linkedin_profile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile?.github_profile && (
                  <a
                    href={profile.github_profile.startsWith("http") ? profile.github_profile : `https://${profile.github_profile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    <Github className="h-3.5 w-3.5 text-slate-900 dark:text-white" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile?.personal_website && (
                  <a
                    href={profile.personal_website.startsWith("http") ? profile.personal_website : `https://${profile.personal_website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    <Globe className="h-3.5 w-3.5 text-teal-500" />
                    <span>Website</span>
                  </a>
                )}
                {!profile?.linkedin_profile && !profile?.github_profile && !profile?.personal_website && (
                  <span className="text-xs text-slate-400 dark:text-white/35 italic">No social profiles connected</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mx-auto md:mx-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-[#7b61ff]/40 dark:bg-transparent dark:hover:bg-[#7b61ff]/10 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-[#a291ff] shadow-sm transition-all duration-200"
          >
            <PencilLine className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-slate-100 dark:border-[#243056]/50" />

        {/* About Me Section */}
        <div className="relative">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">About Me</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 font-medium">
            {form.motivation || "Passionate about mentoring and evaluating projects. I help students showcase their true potential through fair and structured evaluations."}
          </p>
        </div>
      </div>

      {/* Middle Section: Skills & Performance */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Skills & Expertise Card */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#243056]/80 dark:bg-[#0c1224]">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Skills & Expertise</h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">Your mentor focus areas.</p>
          
          <div className="mt-5 flex flex-wrap gap-2.5">
            {displaySkills.map((skill) => (
              <span
                key={skill}
                className="rounded-2xl border border-slate-200/60 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-[#2b2b5c]/70 dark:bg-[#1a1c3a]/50 dark:text-[#a3b8cc] dark:hover:bg-[#252852]/50 transition-colors duration-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Performance Overview Card */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#243056]/80 dark:bg-[#0c1224]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Performance Overview</h3>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">Mentor activity metrics.</p>
            </div>
            {/* Selector Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 dark:border-[#243056] dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200">
              <span>Last 30 days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Total Evaluations */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-[#243056] dark:bg-[#101428]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Evaluations</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <ClipboardCheck className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
              <p className="mt-1.5 text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                {stats.total > 0 ? "↑ 16% from last month" : "No evaluations yet"}
              </p>
            </div>

            {/* Completed Vivas */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-[#243056] dark:bg-[#101428]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Vivas</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stats.completed}</p>
              <p className="mt-1.5 text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                {stats.completed > 0 ? "↑ 14% from last month" : "No completed vivas"}
              </p>
            </div>

            {/* Pending Reviews */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-[#243056] dark:bg-[#101428]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Reviews</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Hourglass className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
              <p className={`mt-1.5 text-[11px] font-bold ${stats.pending > 0 ? "text-amber-500 dark:text-amber-400/80" : "text-emerald-500"}`}>
                {stats.pending > 0 ? "Needs your attention" : "All caught up ✨"}
              </p>
            </div>

            {/* Avg. Student Rating */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-[#243056] dark:bg-[#101428]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg. Student Rating</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <Star className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{rating} <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ 5</span></p>
              <p className="mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400/80">
                {stats.ratedCount > 0 ? `From ${stats.ratedCount} ratings` : "No ratings yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Evaluations & Achievements */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[1.8fr_1.2fr]">
        {/* Recent Evaluations Table */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#243056]/80 dark:bg-[#0c1224] flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Evaluations</h3>
            <Link
              href="/dashboard/mentor/evaluations"
              className="text-sm font-bold text-[#7b61ff] dark:text-[#a291ff] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#243056]">
                  <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 w-[25%]">Student</th>
                  <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 w-[25%]">Project</th>
                  <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 w-[15%]">Score</th>
                  <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 w-[20%]">Verdict</th>
                  <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3 w-[15%] text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEvaluations.map((item) => {
                  const studentName = item.student?.name || item.student_id?.slice(0, 8) || "Student"
                  const initialBubble = initials.length > 0 ? initials : studentName.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("")
                  
                  return (
                    <tr
                      key={item.evaluation_id}
                      className="border-b border-slate-100/50 dark:border-[#243056]/30 hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/mentor/evaluations`}
                    >
                      {/* Student Details */}
                      <td className="py-3.5 flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-sm ${getAvatarBg(studentName)}`}>
                          {initialBubble}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{studentName}</span>
                      </td>

                      {/* Project title */}
                      <td className="py-3.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <div className="truncate max-w-[150px]">
                          {item.project?.title || `Evaluation #${item.evaluation_id.slice(0, 8)}`}
                        </div>
                      </td>

                      {/* Score */}
                      <td className={`py-3.5 text-sm font-extrabold ${item.status === "evaluated" ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}>
                        {formatScore(item.total_score)}
                      </td>

                      {/* Verdict Badge */}
                      <td className="py-3.5">
                        {item.status === "evaluated" ? (
                          <span className="inline-flex px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Evaluated
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Pending Review
                          </span>
                        )}
                      </td>

                      {/* Date with chevron */}
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{formatDateString(item.created_at)}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#243056]/80 dark:bg-[#0c1224]">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            🏆 Achievements
          </h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium mb-5">Your milestones as an evaluator.</p>

          <div className="space-y-4">
            {/* Milestone 1 */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 dark:border-[#243056]/50 dark:bg-[#101428] hover:border-slate-200 dark:hover:border-[#243056] transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                <Award className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Top Rated Mentor</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Maintained 4.5+ rating</p>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 dark:border-[#243056]/50 dark:bg-[#101428] hover:border-slate-200 dark:hover:border-[#243056] transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                <ShieldCheck className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">100+ Projects Verified</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Trusted by DishaSetu</p>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 dark:border-[#243056]/50 dark:bg-[#101428] hover:border-slate-200 dark:hover:border-[#243056] transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 flex-shrink-0">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">500+ Students Evaluated</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Helping students grow</p>
              </div>
            </div>

            {/* Milestone 4 */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 dark:border-[#243056]/50 dark:bg-[#101428] hover:border-slate-200 dark:hover:border-[#243056] transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                <BadgeCheck className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Consistent Evaluator</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">95%+ on-time reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && form && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md dark:bg-slate-950/80 sm:items-center sm:p-4"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#10172c_0%,#0b1020_100%)] dark:text-white dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold tracking-tight sm:text-lg">Edit Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                  aria-label="Close edit dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-col items-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[linear-gradient(180deg,#f3f5ff_0%,#cfc8ff_100%)] text-2xl font-black text-[#151b2f] shadow-sm dark:border-white/10">
                    {profile.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt="Mentor profile"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{initials || "M"}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg dark:border-white/10 dark:bg-[#2b3150] dark:text-white"
                    aria-label="Change avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-[18px] font-bold leading-none text-slate-900 dark:text-white">{form.name}</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-white/55">{form.email}</p>
                </div>
              </div>

              <div className="mt-5">
                <SectionHeading title="Personal Information" />
                <div className="mt-4 space-y-4">
                  <ModalField label="Full Name">
                    <input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className={modalInputClass}
                    />
                  </ModalField>

                  <ModalField label="Email Address">
                    <input value={form.email} disabled className={`${modalInputClass} cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-white/5 dark:opacity-70`} />
                  </ModalField>

                  <ModalField label="Short Bio" hint={`${form.motivation.length}/${MAX_MOTIVATION_LENGTH}`}>
                    <textarea
                      value={form.motivation}
                      onChange={(e) => setField("motivation", e.target.value.slice(0, MAX_MOTIVATION_LENGTH))}
                      className={`${modalInputClass} min-h-[120px] resize-none`}
                    />
                  </ModalField>
                </div>
              </div>

              <div className="mt-6">
                <SectionHeading title="Professional Information" />

                <div className="mt-4">
                  <ModalField label="Current Role">
                    <input
                      value={form.current_role}
                      onChange={(e) => setField("current_role", e.target.value)}
                      className={modalInputClass}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </ModalField>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/55">
                      Skills & Expertise
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-white/35">Comma separated</span>
                  </div>
                  <input
                    value={form.expertise_areas}
                    onChange={(e) => setField("expertise_areas", e.target.value)}
                    className={modalInputClass}
                    placeholder="e.g. DevOps, Python, AI/ML"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillChipsFromValue(form.expertise_areas).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-white/90"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <ModalField label="Years of Experience">
                    <div className="relative">
                      <input
                        value={form.experience_years}
                        onChange={(e) => setField("experience_years", e.target.value)}
                        className={modalInputClass}
                        inputMode="numeric"
                      />
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                    </div>
                  </ModalField>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <ModalField label="LinkedIn Profile">
                    <div className="relative">
                      <input
                        value={form.linkedin_profile}
                        onChange={(e) => setField("linkedin_profile", e.target.value)}
                        className={`${modalInputClass} pr-10`}
                        placeholder="linkedin.com/in/username"
                      />
                      <Linkedin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                    </div>
                  </ModalField>

                  <ModalField label="GitHub Profile">
                    <div className="relative">
                      <input
                        value={form.github_profile}
                        onChange={(e) => setField("github_profile", e.target.value)}
                        className={`${modalInputClass} pr-10`}
                        placeholder="github.com/username"
                      />
                      <Github className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                    </div>
                  </ModalField>
                </div>

                <div className="mt-4">
                  <ModalField label="Portfolio Website (Optional)">
                    <div className="relative">
                      <input
                        value={form.personal_website}
                        onChange={(e) => setField("personal_website", e.target.value)}
                        className={`${modalInputClass} pr-10`}
                        placeholder="https://mywebsite.com"
                      />
                      <Globe className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                    </div>
                  </ModalField>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
                Connecting your social profiles helps students and admins view your professional credentials.
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7b61ff_0%,#6b4dff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(107,77,255,0.35)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return <h4 className="text-[13px] font-bold text-slate-900 dark:text-white/90">{title}</h4>
}

function ModalField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/55">{label}</label>
        {hint && <span className="text-[11px] text-slate-400 dark:text-white/35">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ModalExternalField({
  label,
  icon: Icon,
}: {
  label: string
  icon: typeof Linkedin
}) {
  return (
    <ModalField label={label}>
      <div className={`${modalInputClass} flex items-center justify-between gap-3`}>
        <span className="truncate text-slate-400 dark:text-white/40">Not connected</span>
        <Icon className="h-4 w-4 text-slate-400 dark:text-white/45" />
      </div>
    </ModalField>
  )
}

function skillChipsFromValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const modalInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#7b61ff] focus:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#7b61ff] dark:focus:bg-white/7"
