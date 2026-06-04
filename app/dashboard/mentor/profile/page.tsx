"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
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
}

const MAX_MOTIVATION_LENGTH = 240

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, evals] = await Promise.all([
          mentorService.getProfile(),
          mentorService.getEvaluations().catch(() => []),
        ])

        setProfile(profileData)
        setEvaluations(evals || [])
        setForm({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          current_role: profileData.current_role || "",
          experience_years: profileData.experience_years?.toString() || "",
          expertise_areas: (profileData.expertise_areas || []).join(", "),
          motivation: profileData.motivation || "",
        })
      } catch {
        toast.error("Unable to load mentor profile")
      } finally {
        setLoading(false)
      }
    }

    load()
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
    const skills = form?.expertise_areas
      ? form.expertise_areas.split(",").map((item) => item.trim()).filter(Boolean)
      : []
    return skills.length > 0 ? skills : ["AI/ML", "Python", "MERN Stack", "System Design", "Cloud Computing"]
  }, [form?.expertise_areas])

  const stats = useMemo(() => {
    const total = evaluations.length
    const completed = evaluations.filter((item) => item.status === "evaluated").length
    const pending = evaluations.filter((item) => item.status !== "evaluated").length
    const rated = evaluations.filter((item) => typeof item.student_rating_of_mentor === "number")
    const averageRating = rated.length
      ? rated.reduce((sum, item) => sum + (item.student_rating_of_mentor || 0), 0) / rated.length
      : profile?.average_rating || 0

    return { total, completed, pending, averageRating }
  }, [evaluations, profile?.average_rating])

  const recentEvaluations = useMemo(() => evaluations.slice(0, 4), [evaluations])

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
      })
      toast.success("Mentor profile updated")
      setIsEditing(false)
    } catch {
      toast.error("Failed to update mentor profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-white/55">Loading mentor profile...</p>
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

  return (
    <div className="mx-auto w-full max-w-7xl pb-6">
      <div className="space-y-4 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#f6f7ff_0%,#ffffff_100%)] p-4 shadow-[0_20px_60px_rgba(46,60,120,0.10)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,#11182f_0%,#0c1224_48%,#070b18_100%)] dark:text-white sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/mentor"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
              <p className="text-xs text-slate-500 dark:text-white/55">View and manage your mentor profile and performance.</p>
            </div>
          </div>

        </header>

        <section className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr] 2xl:items-start">
          <div className="relative self-start overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#0f1530_0%,#0a1021_100%)] sm:p-5">
            <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-70">
              <div className="absolute right-10 top-4 h-24 w-24 rounded-full bg-[#7b61ff]/10 blur-3xl dark:bg-[#7b61ff]/20" />
              <div className="absolute left-1/2 top-10 h-16 w-16 rounded-full bg-[#c8ee44]/15 blur-3xl dark:bg-[#c8ee44]/10" />
            </div>

            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto sm:mx-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[linear-gradient(180deg,#f3f5ff_0%,#cfc8ff_100%)] text-3xl font-black text-[#151b2f] shadow-[0_18px_50px_rgba(0,0,0,0.20)] dark:border-white/10 dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
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
                  <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#2a2f4a] text-white shadow-lg">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {form.name}
                    </h2>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-200">
                      Mentor
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-white/60 sm:justify-start">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {form.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-3.5 w-3.5" />
                      {form.current_role || "Mentor"}
                    </span>
                    <span>
                      {form.experience_years ? `${form.experience_years}+ years of experience` : "Experience pending"}
                    </span>
                  </div>

                  <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/68">
                    {form.motivation || "Passionate about mentoring and evaluating projects with fair, structured feedback."}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/68">
                      {stats.total} total evaluations
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/68">
                      {stats.pending} pending reviews
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/68">
                      {rating} average rating
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-[#7b61ff]/25 bg-[#7b61ff]/10 px-4 py-2.5 text-sm font-semibold text-[#6b4dff] transition-colors hover:bg-[#7b61ff]/15 dark:border-[#7b61ff]/40 dark:bg-[#7b61ff]/15 dark:text-white"
              >
                <PencilLine className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="self-start grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard title="Total Evaluations" value={stats.total} note={`${stats.completed} completed`} />
            <StatCard title="Pending Reviews" value={stats.pending} note="Needs your attention" accent="amber" />
            <StatCard title="Completed Vivas" value={stats.completed} note="Evaluated and closed" accent="emerald" />
            <StatCard title="Avg. Student Rating" value={rating} note="From student feedback" accent="blue" />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#11182f_0%,#0b1020_100%)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Skills & Expertise</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/45">Your mentor focus areas.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                {displaySkills.length} skills
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {displaySkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">About Me</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-white/68">
                {form.motivation || "Passionate about mentoring and evaluating projects with fair, structured feedback."}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#11182f_0%,#0b1020_100%)] sm:p-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Professional Information</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-white/42">Structured mentor profile details.</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoItem label="Current Role" value={form.current_role || "Mentor"} />
              <InfoItem label="Years of Experience" value={form.experience_years ? `${form.experience_years} years` : "Not set"} />
              <InfoItem label="Email Address" value={form.email} />
              <InfoItem label="Phone Number" value={form.phone || "Not provided"} />
            </div>

            <div className="mt-3">
              <InfoItem label="Skills & Expertise" value={form.expertise_areas || "Not provided"} />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ExternalField label="LinkedIn Profile" icon={Linkedin} />
              <ExternalField label="GitHub Profile" icon={Github} />
            </div>

            <div className="mt-3">
              <ExternalField label="Portfolio Website (Optional)" icon={Globe} />
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/48">
              These links are shown as placeholders until the mentor backend adds those fields.
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#11182f_0%,#0b1020_100%)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Evaluations</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/42">Your latest mentor reviews.</p>
              </div>
              <Link
                href="/dashboard/mentor/evaluations"
                className="text-sm font-semibold text-[#6b4dff] hover:underline dark:text-[#c8ee44]"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentEvaluations.length === 0 ? (
                <EmptyState text="No evaluations assigned yet." />
              ) : (
                recentEvaluations.map((item) => (
                  <div
                    key={item.evaluation_id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.project?.title || `Evaluation #${item.evaluation_id.slice(0, 8)}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-white/42">
                        {item.student?.name || item.student_id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-white/32">Score</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {item.total_score ? `${item.total_score}/100` : "--"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#11182f_0%,#0b1020_100%)] sm:p-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Performance Overview</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/42">Last 30 days</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MiniMetric label="Total Evaluations" value={stats.total} icon={CheckCircle2} />
              <MiniMetric label="Completed Vivas" value={stats.completed} icon={CheckCircle2} />
              <MiniMetric label="Pending Reviews" value={stats.pending} icon={Clock3} />
              <MiniMetric label="Avg. Student Rating" value={rating} icon={Star} />
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-400/15 dark:bg-emerald-500/10 dark:text-emerald-100">
              All scores are verified and projects are mentor-validated.
            </div>
          </div>
        </section>
      </div>

      {isEditing && form && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/40 p-3 backdrop-blur-md dark:bg-slate-950/80 sm:items-center sm:p-4"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#10172c_0%,#0b1020_100%)] dark:text-white dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight sm:text-lg">Edit Profile</h3>
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
                  <p className="text-[18px] font-semibold leading-none text-slate-900 dark:text-white">{form.name}</p>
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
                      className={`${modalInputClass} min-h-[150px] resize-none`}
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
                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/55">
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
                  <ModalExternalField label="LinkedIn Profile" icon={Linkedin} />
                  <ModalExternalField label="GitHub Profile" icon={Github} />
                </div>

                <div className="mt-4">
                  <ModalExternalField label="Portfolio Website (Optional)" icon={Globe} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
                All visible links are styled as placeholders until the backend profile fields are added.
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
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  note,
  accent = "violet",
}: {
  title: string
  value: string | number
  note: string
  accent?: "violet" | "amber" | "emerald" | "blue"
}) {
  const accentClasses =
    accent === "amber"
      ? "border-amber-400/20 bg-[linear-gradient(180deg,rgba(255,225,170,0.65)_0%,rgba(255,244,210,0.75)_100%)] dark:border-amber-400/15 dark:bg-[linear-gradient(180deg,rgba(58,45,16,0.95)_0%,rgba(23,20,14,0.98)_100%)]"
      : accent === "emerald"
        ? "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(195,247,224,0.7)_0%,rgba(233,251,241,0.8)_100%)] dark:border-emerald-400/15 dark:bg-[linear-gradient(180deg,rgba(17,53,41,0.95)_0%,rgba(12,21,24,0.98)_100%)]"
        : accent === "blue"
          ? "border-sky-400/20 bg-[linear-gradient(180deg,rgba(196,231,255,0.75)_0%,rgba(228,243,255,0.85)_100%)] dark:border-sky-400/15 dark:bg-[linear-gradient(180deg,rgba(15,36,61,0.95)_0%,rgba(12,18,32,0.98)_100%)]"
          : "border-violet-400/20 bg-[linear-gradient(180deg,rgba(233,225,255,0.82)_0%,rgba(246,242,255,0.92)_100%)] dark:border-violet-400/15 dark:bg-[linear-gradient(180deg,rgba(34,26,64,0.95)_0%,rgba(12,16,29,0.98)_100%)]"

  return (
    <div className={`rounded-2xl border p-4 shadow-inner ${accentClasses}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">{title}</p>
      <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</div>
      <p className="mt-1 text-xs text-slate-600 dark:text-white/65">{note}</p>
    </div>
  )
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: typeof CheckCircle2
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function Field({
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
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/70">
          {label}
        </label>
        {hint && <span className="text-[11px] text-slate-400 dark:text-white/35">{hint}</span>}
      </div>
      {children}
    </div>
  )
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

function ExternalField({
  label,
  icon: Icon,
}: {
  label: string
  icon: typeof Linkedin
}) {
  return (
    <Field label={label}>
      <div className={`${inputClass} flex items-center justify-between gap-3`}>
        <span className="truncate text-slate-400 dark:text-white/50">Not connected</span>
        <Icon className="h-4 w-4 text-slate-400 dark:text-white/55" />
      </div>
    </Field>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white/85">{value}</p>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white/90">{title}</h4>
}

function skillChipsFromValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
      {text}
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#7b61ff] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 dark:focus:bg-white/7"

const modalInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#7b61ff] focus:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#7b61ff] dark:focus:bg-white/7"
