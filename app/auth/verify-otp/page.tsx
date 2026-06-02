"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const getErrorMessage = (error: any, fallback: string) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (detail && typeof detail === "object" && typeof detail.message === "string") return detail.message
  if (Array.isArray(detail) && detail.length > 0) return detail[0]?.msg || fallback
  return fallback
}

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState("")
  const [otp, setOtp] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    setIdentifier(searchParams.get("identifier") || "")
  }, [searchParams])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const onVerify = async () => {
    setLoading(true)
    try {
      const res = await apiClient.verifyPasswordRecoveryOtp({ identifier, otp, captcha_token: "dev-bypass" })
      const token = res?.data?.reset_token
      if (!token) throw new Error("Missing token")
      router.push(`/auth/reset-password?token=${encodeURIComponent(token)}`)
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Invalid OTP"))
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (resendLoading || cooldown > 0) return
    setResendLoading(true)
    try {
      const response = await apiClient.resendPasswordRecoveryOtp({ identifier, channel: "email" })
      const serverCooldown = Number(response?.cooldown_seconds || 60)
      setCooldown(Number.isFinite(serverCooldown) && serverCooldown > 0 ? serverCooldown : 60)
      toast.success("OTP resent")
    } catch (error: any) {
      const retryAfterJson = Number(error?.response?.data?.detail?.retry_after_seconds)
      const retryAfterHeader = error?.response?.headers?.["retry-after"]
      const retryAfter = Number(retryAfterHeader)
      if (Number.isFinite(retryAfterJson) && retryAfterJson > 0) {
        setCooldown(retryAfterJson)
      }
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setCooldown(retryAfter)
      }
      toast.error(getErrorMessage(error, "Unable to resend OTP"))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f4fc] dark:bg-[#0A1020]">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121C46] p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify OTP</h1>
        <div className="mt-5 space-y-4">
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or phone" />
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
          <Button className="w-full" loading={loading} onClick={onVerify}>Verify OTP</Button>
          <button
            type="button"
            className="w-full text-sm text-[#7199D6] disabled:text-gray-400"
            onClick={onResend}
            disabled={cooldown > 0 || resendLoading}
          >
            {resendLoading ? "Sending OTP..." : cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  )
}
