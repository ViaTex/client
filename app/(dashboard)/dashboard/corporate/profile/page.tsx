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
            <div className="rounded-3xl border border-[#d4def8] bg-white p-6 dark:border-[#223067] dark:bg-[#111d49]">
                <div className="text-sm text-[#5f6f98] dark:text-[#93a4d1]">Loading company profile...</div>
            </div>
        )
    }

    const labelClass = "mb-1.5 block text-xs font-medium text-[#5f6f98] dark:text-[#93a4d1]"
    const inputClass =
        "h-11 rounded-lg border-[#d4def8] bg-white text-[#16213f] placeholder:text-[14px] placeholder:text-[#91a1c7] dark:border-[#223067] dark:bg-[#0f183f] dark:text-white dark:placeholder:text-[#6f84bb]"
    const textareaClass =
        "min-h-28 w-full rounded-lg border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#91a1c7] disabled:opacity-70 dark:border-[#223067] dark:bg-[#0f183f] dark:text-white dark:placeholder:text-[#6f84bb]"
    const selectClass =
        "h-11 w-full rounded-lg border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] disabled:opacity-70 dark:border-[#223067] dark:bg-[#0f183f] dark:text-white"

    return (
        <div className="rounded-3xl border border-[#d4def8] bg-[#eef3ff] p-4 shadow-[0_10px_30px_rgba(66,98,170,0.12)] sm:p-5 md:p-6 dark:border-[#223067] dark:bg-[#0d1635] dark:shadow-[0_8px_32px_rgba(3,8,26,0.35)]">
            <h1 className="mb-1 text-[30px] font-bold leading-[1.05] tracking-tight text-[#16213f] sm:text-[34px] md:text-[40px] dark:text-white">Company Profile</h1>
            <p className="mb-5 text-sm text-[#5f6f98] sm:text-[15px] dark:text-[#93a4d1]">Manage your company information and contact details</p>

            <div className="mb-5 border-b border-[#d4def8] dark:border-[#223067]">
                <nav className="flex flex-wrap gap-4 sm:gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("basic")}
                        className={`border-b-2 py-2 text-sm font-semibold transition-colors ${
                            activeTab === "basic"
                                ? "border-[#2f65cb] text-[#2f65cb]"
                                : "border-transparent text-[#5f6f98] hover:text-[#16213f] dark:text-[#93a4d1] dark:hover:text-white"
                        }`}
                    >
                        Basic Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("company")}
                        className={`border-b-2 py-2 text-sm font-semibold transition-colors ${
                            activeTab === "company"
                                ? "border-[#2f65cb] text-[#2f65cb]"
                                : "border-transparent text-[#5f6f98] hover:text-[#16213f] dark:text-[#93a4d1] dark:hover:text-white"
                        }`}
                    >
                        Company
                    </button>
                </nav>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {activeTab === "basic" ? (
                    <>
                        <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border border-[#d4def8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#223067] dark:bg-[#111d49]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3ff] dark:bg-[#1a2858]">
                                    <Building2 className="h-6 w-6 text-[#2f65cb] dark:text-[#9bb6ff]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#16213f] dark:text-white">Basic Information</h3>
                                    <p className="text-xs text-[#5f6f98] dark:text-[#93a4d1]">Company details and contact information</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="self-start text-[#5f6f98] hover:text-[#16213f] dark:text-[#93a4d1] dark:hover:text-white sm:self-auto" onClick={() => setEditing("basic")}>
                                Edit
                            </Button>
                        </div>
                        <div>
                            <label className={labelClass}>Company Name</label>
                            <Input className={inputClass} placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} disabled={editing !== "basic"} />
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <Input className={`${inputClass} bg-[#f4f7ff] dark:bg-[#19234e]`} placeholder="Email" value={form.email} disabled />
                        </div>
                        <div>
                            <label className={labelClass}>Phone</label>
                            <Input className={inputClass} placeholder="Phone (10 digits)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) }))} disabled={editing !== "basic"} />
                        </div>
                        <div>
                            <label className={labelClass}>Contact Person Name</label>
                            <Input className={inputClass} placeholder="Contact Person Name" value={form.contact_person} onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") }))} disabled={editing !== "basic"} />
                        </div>
                        <div>
                            <label className={labelClass}>Contact Person Designation</label>
                            <Input className={inputClass} placeholder="Contact Person Designation" value={form.contact_designation} onChange={(e) => setForm((p) => ({ ...p, contact_designation: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") }))} disabled={editing !== "basic"} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Bio</label>
                            <textarea className={textareaClass} placeholder="Enter your bio" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} disabled={editing !== "basic"} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border border-[#d4def8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#223067] dark:bg-[#111d49]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1fb885] text-white">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#16213f] dark:text-white">Company Information</h3>
                                    <p className="text-xs text-[#5f6f98] dark:text-[#93a4d1]">Business details and company profile</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="self-start text-[#5f6f98] hover:text-[#16213f] dark:text-[#93a4d1] dark:hover:text-white sm:self-auto" onClick={() => setEditing("company")}>
                                Edit
                            </Button>
                        </div>
                        <div>
                            <label className={labelClass}>Company Name</label>
                            <Input className={inputClass} placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                        <div>
                            <label className={labelClass}>Website URL</label>
                            <Input className={inputClass} placeholder="Website URL" value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                        <div>
                            <label className={labelClass}>Industry</label>
                            <select className={selectClass} value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} disabled={editing !== "company"}>
                                <option value="">Select industry</option>
                                {industryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Company Size</label>
                            <select className={selectClass} value={form.company_size} onChange={(e) => setForm((p) => ({ ...p, company_size: e.target.value }))} disabled={editing !== "company"}>
                                <option value="">Select company size</option>
                                {companySizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Founded Year</label>
                            <Input className={inputClass} type="number" placeholder="Founded year" value={form.founded_year} onChange={(e) => setForm((p) => ({ ...p, founded_year: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                        <div>
                            <label className={labelClass}>Company Type</label>
                            <select className={selectClass} value={form.company_type} onChange={(e) => setForm((p) => ({ ...p, company_type: e.target.value }))} disabled={editing !== "company"}>
                                <option value="">Select company type</option>
                                {companyTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea className={textareaClass} placeholder="Enter your description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} disabled={editing !== "company"} />
                        </div>
                    </>
                )}

                <div className="md:col-span-2 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button type="button" variant="outline" className="h-10 rounded-lg border-[#ccd7f5] bg-transparent px-5 text-[#42548d] hover:bg-[#edf3ff] hover:text-[#16213f] dark:border-[#223067] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858] dark:hover:text-white" onClick={() => setEditing(null)}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={saving} disabled={!editing} className="h-10 rounded-lg bg-[#2f65cb] px-5 text-white hover:bg-[#2a59b2]">
                        Save Changes
                    </Button>
                    {message ? <p className="text-sm text-green-600">{message}</p> : null}
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                </div>
            </form>
        </div>
    )
}
