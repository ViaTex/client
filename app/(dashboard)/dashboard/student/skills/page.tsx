'use client'

import { useState } from 'react'
import { studentService } from '@/features/student/student.service'

export default function StudentSkillsPage() {
  const [skillName, setSkillName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      await studentService.requestSkillVerification({ skillName, projectTitle })
      setMessage({
        type: 'success',
        text: 'Skill verification request received. You will be notified when a mentor is assigned and a viva is scheduled.',
      })
      setSkillName('')
      setProjectTitle('')
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Request failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Verification</h1>
        <p className="text-gray-600">
          Request verification for a skill. A mentor will be assigned and a viva will be scheduled.
        </p>
      </div>

      <div className="max-w-xl bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill to verify</label>
            <input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              required
              placeholder="e.g. Java, React"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (optional – link to a project that demonstrates this skill)
            </label>
            <input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. E-commerce Backend"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Submitting...' : 'Request verification'}
          </button>
        </form>
      </div>
    </div>
  )
}
