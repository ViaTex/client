"use client"

import { FormEvent, useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

const industryOptions = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "E-commerce",
    "Other",
]

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]
const companyTypeOptions = ["Startup", "MNC", "SME", "Enterprise", "Government", "NGO", "Other"]

export default function CorporateProfilePage() {
    const [activeTab, setActiveTab] = useState<"basic" | "company">("basic")
    const [editing, setEditing] = useState<"basic" | "company" | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        email: "",
        name: "",
        bio: "",
        company_name: "",
        phone: "",
        contact_person: "",
        contact_designation: "",
        website_url: "",
        industry: "",
        company_size: "",
        founded_year: "",
        company_type: "",
        description: "",
        address: "",
    })

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await apiClient.getCorporateProfile()
                setForm({
                    email: data.email || "",
                    name: data.name || "",
                    bio: data.bio || "",
                    company_name: data.company_name || "",
                    phone: data.phone || "",
                    contact_person: data.contact_person || "",
                    contact_designation: data.contact_designation || "",
                    website_url: data.website_url || "",
                    industry: data.industry || "",
                    company_size: data.company_size || "",
                    founded_year: data.founded_year ? String(data.founded_year) : "",
                    company_type: data.company_type || "",
                    description: data.description || "",
                    address: data.address || "",
                })
            } catch (e: any) {
                const detail = e?.response?.data?.detail
                setError(typeof detail === "string" ? detail : "Failed to load profile")
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setSaving(true)
        setMessage("")
        setError("")
        try {
            await apiClient.updateCorporateProfile({
                name: form.name || undefined,
                bio: form.bio || undefined,
                company_name: form.company_name || undefined,
                phone: form.phone || undefined,
                contact_person: form.contact_person || undefined,
                contact_designation: form.contact_designation || undefined,
                website_url: form.website_url || undefined,
                industry: form.industry || undefined,
                company_size: form.company_size || undefined,
                founded_year: form.founded_year ? Number(form.founded_year) : undefined,
                company_type: form.company_type || undefined,
                description: form.description || undefined,
                address: form.address || undefined,
            })
            setEditing(null)
            setMessage("Company profile updated successfully")
        } catch (e: any) {
            const detail = e?.response?.data?.detail
            setError(typeof detail === "string" ? detail : "Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="rounded-3xl border border-[#ded9cf] bg-white p-6">
                <div className="text-sm text-stone-500">Loading company profile...</div>
            </div>
        )
    }

    return (
        <div className="rounded-3xl border border-[#ddd8ce] bg-[#f5f4f1] p-5 md:p-6 shadow-sm">
            <h1 className="text-[40px] leading-[1.05] font-bold tracking-tight text-[#221910] dark:text-white mb-1">Company Profile</h1>
            <p className="text-[15px] text-stone-500 mb-5">Manage your company information and contact details</p>

            <div className="border-b border-[#e5e1d8] mb-5">
                <nav className="flex gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("basic")}
                        className={`py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "basic" ? "border-[#2f65cb] text-[#2f65cb]" : "border-transparent text-stone-500 hover:text-stone-700"}`}
                    >
                        Basic Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("company")}
                        className={`py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "company" ? "border-[#2f65cb] text-[#2f65cb]" : "border-transparent text-stone-500 hover:text-stone-700"}`}
                    >
                        Company
                    </button>
                </nav>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTab === "basic" ? (
                    <>
                        <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-[#e5e1d8] bg-[#f8f7f4] p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-7 h-7 text-black"/>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#221910] dark:text-white">Basic Information</h3>
                                    <p className="text-xs text-stone-500">Company details and contact information</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="text-stone-600 hover:text-stone-800" onClick={() => setEditing("basic")}>
                                Edit
                            </Button>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Company Name</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} disabled={editing !== "basic"} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Email</label>
                            <Input className="h-11 bg-[#f3f3f3] rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Email" value={form.email} disabled />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Phone</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Phone (10 digits)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) }))} disabled={editing !== "basic"} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Contact Person Name</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Contact Person Name" value={form.contact_person} onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") }))} disabled={editing !== "basic"} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Contact Person Designation</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Contact Person Designation" value={form.contact_designation} onChange={(e) => setForm((p) => ({ ...p, contact_designation: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") }))} disabled={editing !== "basic"} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Bio</label>
                            <textarea className="md:col-span-2 min-h-28 w-full rounded-lg border border-[#e2ddd2] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 disabled:opacity-70" placeholder="Enter your bio" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} disabled={editing !== "basic"} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-[#e5e1d8] bg-[#f8f7f4] p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-[#1fb885] flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#221910] dark:text-white">Company Information</h3>
                                    <p className="text-xs text-stone-500">Business details and company profile</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="text-stone-600 hover:text-stone-800" onClick={() => setEditing("company")}>
                                Edit
                            </Button>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Company Name</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Website URL</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" placeholder="Website URL" value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Industry</label>
                            <select className="h-11 w-full rounded-lg border border-[#e2ddd2] bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-70" value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} disabled={editing !== "company"}>
                                <option value="">Select industry</option>
                                {industryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Company Size</label>
                            <select className="h-11 w-full rounded-lg border border-[#e2ddd2] bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-70" value={form.company_size} onChange={(e) => setForm((p) => ({ ...p, company_size: e.target.value }))} disabled={editing !== "company"}>
                                <option value="">Select company size</option>
                                {companySizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Founded Year</label>
                            <Input className="h-11 bg-white rounded-lg border-[#e2ddd2] placeholder:text-[14px]" type="number" placeholder="Founded year" value={form.founded_year} onChange={(e) => setForm((p) => ({ ...p, founded_year: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Company Type</label>
                            <select className="h-11 w-full rounded-lg border border-[#e2ddd2] bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-70" value={form.company_type} onChange={(e) => setForm((p) => ({ ...p, company_type: e.target.value }))} disabled={editing !== "company"}>
                                <option value="">Select company type</option>
                                {companyTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">Description</label>
                            <textarea className="md:col-span-2 min-h-28 w-full rounded-lg border border-[#e2ddd2] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 disabled:opacity-70" placeholder="Enter your description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                    </>
                )}

                <div className="md:col-span-2 flex items-center gap-3">
                    <Button type="button" variant="outline" className="rounded-lg h-10 px-5 border-[#d8d2c7]" onClick={() => setEditing(null)}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={saving} disabled={!editing} className="rounded-lg h-10 px-5 bg-[#2f65cb] hover:bg-[#2a59b2] text-white">
                        Save Changes
                    </Button>
                    {message ? <p className="text-sm text-green-600">{message}</p> : null}
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                </div>
            </form>
        </div>
    )
}
