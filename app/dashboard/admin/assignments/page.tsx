'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardList, Loader2, Search, User } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

interface Project {
  id: string
  student_id: string
  title: string
  skill_domain: string
  created_at: string
}

interface Mentor {
  id: string
  name: string
  current_role: string
  expertise_areas: string[]
  average_rating: number
}

export default function AdminAssignmentsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [projRes, mentorRes] = await Promise.all([
        fetch(`${API}/projects/admin/unassigned`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${API}/admin/users?user_type=mentor&limit=100`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
      ])
      
      if (projRes.ok) {
        setProjects(await projRes.json())
      }
      if (mentorRes.ok) {
        const mData = await mentorRes.json()
        setMentors(mData.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAssign(projectId: string) {
    if (!selectedMentor) return alert('Please select a mentor first.')
    setAssigningId(projectId)
    try {
      const res = await fetch(`${API}/projects/${projectId}/assign-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ mentor_id: selectedMentor })
      })
      if (!res.ok) throw new Error('Failed to assign mentor')
      setProjects(projects.filter(p => p.id !== projectId))
      setSelectedMentor('')
    } catch (e) {
      alert('Error assigning mentor')
    } finally {
      setAssigningId(null)
    }
  }

  const filteredMentors = mentors.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.expertise_areas || []).some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-5xl space-y-6">
        
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
          <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
            <ClipboardList className="h-8 w-8 text-[#4f8cff]" />
            Project Assignments
          </h1>
          <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
            Manually assign submitted student projects to available mentors for Viva evaluation.
          </p>
        </section>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">All projects are currently assigned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="rounded-2xl border border-[#d4def8] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#223067] dark:bg-[#111d49]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#16213f] dark:text-white">{proj.title}</p>
                      <p className="text-xs text-[#5f6f98] dark:text-[#93a4d1]">Student ID: {proj.student_id}</p>
                      {proj.skill_domain && (
                        <span className="mt-2 inline-block rounded-lg bg-[#edf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#8ea1d6]">
                          {proj.skill_domain}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        className="rounded-xl border border-[#d4def8] bg-[#f8fbff] px-3 py-2 text-sm outline-none focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 dark:border-[#2a3f7a] dark:bg-[#0e1c45] dark:text-white"
                        value={selectedMentor}
                        onChange={(e) => setSelectedMentor(e.target.value)}
                      >
                        <option value="">-- Select Mentor --</option>
                        {filteredMentors.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.current_role || 'Mentor'})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(proj.id)}
                        disabled={assigningId === proj.id || !selectedMentor}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4f8cff] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3a7de0] disabled:opacity-50"
                      >
                        {assigningId === proj.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mentor Sidebar */}
            <div className="rounded-2xl border border-[#d4def8] bg-white p-5 dark:border-[#223067] dark:bg-[#111d49]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#5f6f98] dark:text-[#93a4d1]">Available Mentors</h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3b6e5]" />
                <input 
                  type="text" 
                  placeholder="Filter by name or skill..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#d4def8] bg-[#f8fbff] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 dark:border-[#2a3f7a] dark:bg-[#0e1c45] dark:text-white"
                />
              </div>

              <div className="space-y-3">
                {filteredMentors.map(m => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-[#f8fbff] p-3 dark:bg-[#0e1c45]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dde6ff] text-[#4f8cff] dark:bg-[#1a2858]">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#16213f] dark:text-white">{m.name}</p>
                      <p className="truncate text-[11px] text-[#5f6f98] dark:text-[#93a4d1]">
                        {m.expertise_areas?.slice(0, 2).join(', ')} {m.expertise_areas?.length > 2 && '...'}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredMentors.length === 0 && (
                  <p className="text-center text-sm text-[#5f6f98]">No mentors found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
