"use client"

import { useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const scorePassword = (value: string) => {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value)) score++
  return score
}

const getErrorMessage = (error: any, fallback: string) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && detail.length > 0) return detail[0]?.msg || fallback
  return fallback
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const score = useMemo(() => scorePassword(password), [password])

  const onReset = async () => {
    if (!token) return toast.error("Invalid reset token")
    if (password !== confirm) return toast.error("Passwords do not match")
    setLoading(true)
    try {
      await apiClient.completePasswordRecovery({ reset_token: token, new_password: password })
      toast.success("Password reset successful")
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to reset password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f4fc] dark:bg-[#0A1020]">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121C46] p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <div className="mt-5 space-y-4">
          <Input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            rightIcon={<button type="button" onClick={() => setShow((v) => !v)}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
          />
          <div className="h-2 w-full rounded bg-gray-200 dark:bg-[#17213F]">
            <div className="h-2 rounded bg-[#7199D6]" style={{ width: `${(score / 5) * 100}%` }} />
          </div>
          <Input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" />
          <Button className="w-full" loading={loading} onClick={onReset}>Save New Password</Button>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f4fc] dark:bg-[#0A1020]">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
