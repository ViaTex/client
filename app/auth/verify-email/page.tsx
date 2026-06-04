"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const getErrorMessage = (error: any, fallback: string) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && detail.length > 0) return detail[0]?.msg || fallback
  return fallback
}

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    const run = async () => {
      try {
        await apiClient.verifyEmailByLink(token)
        toast.success("Email verified. You can login now.")
      } catch (error: any) {
        toast.error(getErrorMessage(error, "Verification link invalid/expired"))
      }
    }
    run()
  }, [token])

  const verifyOtp = async () => {
    setLoading(true)
    try {
      await apiClient.verifyEmailByOtp({ email, otp })
      toast.success("Email verified.")
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Invalid OTP"))
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    try {
      await apiClient.resendEmailVerification(email)
      toast.success("Verification email sent")
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Unable to resend"))
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121C46] p-6 shadow-xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Email</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Use verification link or OTP.</p>
      <div className="mt-5 space-y-4">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Registered email" />
        <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Verification OTP" />
        <Button className="w-full" loading={loading} onClick={verifyOtp}>Verify OTP</Button>
        <button type="button" className="w-full text-sm text-[#7199D6]" onClick={resend}>Resend verification email</button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f4fc] dark:bg-[#0A1020]">
      <Suspense fallback={<div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121C46] p-6 shadow-xl flex justify-center py-10"><span className="text-gray-500">Loading...</span></div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  )
}
