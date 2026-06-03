"use client"

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { MentorProfile } from '@/lib/types'
import { mentorService } from '@/services/mentor.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MentorProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<MentorProfile | null>(null)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await mentorService.getProfile()
                setProfile(data)
            } catch {
                toast.error('Unable to load mentor profile')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    const onSave = async () => {
        if (!profile) return
        setSaving(true)
        try {
            const payload = {
                name: profile.name,
                phone: profile.phone,
                current_role: profile.current_role,
                experience_years: profile.experience_years,
                motivation: profile.motivation,
                expertise_areas: profile.expertise_areas,
            }
            const updated = await mentorService.updateProfile(payload)
            setProfile(updated)
            toast.success('Mentor profile updated')
        } catch {
            toast.error('Failed to update mentor profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <p className="text-sm text-gray-500">Loading mentor profile...</p>
    }

    if (!profile) {
        return <p className="text-sm text-red-500">Mentor profile not found.</p>
    }

    return (
        <div className="mx-auto max-w-3xl space-y-4 rounded-xl border bg-white p-6 dark:bg-[#0F1A3A]">
            <h1 className="text-xl font-bold">Mentor Profile</h1>
            <p className="text-sm text-gray-500">Average Rating: {profile.average_rating.toFixed(1)} / 5</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Full name" />
                <Input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
                <Input value={profile.current_role || ''} onChange={(e) => setProfile({ ...profile, current_role: e.target.value })} placeholder="Current role" />
                <Input
                    type="number"
                    value={profile.experience_years ?? ''}
                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Experience years"
                />
                <div className="md:col-span-2">
                    <Input
                        value={profile.expertise_areas.join(', ')}
                        onChange={(e) =>
                            setProfile({
                                ...profile,
                                expertise_areas: e.target.value
                                    .split(',')
                                    .map((item) => item.trim())
                                    .filter(Boolean),
                            })
                        }
                        placeholder="Expertise areas (comma separated)"
                    />
                </div>
                <div className="md:col-span-2">
                    <Input
                        value={profile.motivation || ''}
                        onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
                        placeholder="Motivation"
                    />
                </div>
            </div>

            <Button onClick={onSave} loading={saving}>Save Profile</Button>
        </div>
    )
}
