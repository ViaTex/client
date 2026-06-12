"use client"

import { useEffect, useState, Suspense, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api"
import { Mail, Clock, RotateCw, ArrowLeft } from "lucide-react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"

const getErrorMessage = (error: any, fallback: string) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (detail && typeof detail === "object" && typeof detail.message === "string") return detail.message
  if (Array.isArray(detail) && detail.length > 0) return detail[0]?.msg || fallback
  return fallback
}

// ─── Rainbow star particles data for background ─────────────────────────────────
const STARS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1.2,
  duration: Math.random() * 3.5 + 2,
  delay: Math.random() * 2.5,
  color: ["bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-cyan-400", "bg-yellow-400"][i % 5],
}))

function Sparkle({ x, y, size, duration, delay, color }: { x: number; y: number; size: number; duration: number; delay: number; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none opacity-40 ${color}`}
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ opacity: [0.15, 0.75, 0.15], scale: [0.8, 1.3, 0.8] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  )
}

function VerifyIllustration() {
  return (
    <div className="relative flex justify-center mb-5" style={{ transform: "translateZ(25px)" }}>
      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width="135"
          height="110"
          viewBox="0 0 160 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Vibrant colorful radial glows */}
          <circle cx="80" cy="65" r="50" fill="url(#illustGlow)" opacity="0.25" />
          <circle cx="50" cy="40" r="30" fill="url(#illustGlowPink)" opacity="0.15" />

          {/* Twinkling graphic sparkles inside the SVG */}
          <path d="M 15 28 L 16.5 30 L 18.5 30.5 L 16.5 31 L 15 33 L 13.5 31 L 11.5 30.5 L 13.5 30 Z" fill="#38bdf8" />
          <path d="M 138 88 L 139.5 90 L 141.5 90.5 L 139.5 91 L 138 93 L 136.5 91 L 134.5 90.5 L 136.5 90 Z" fill="#ec4899" />
          <circle cx="125" cy="35" r="2" fill="#eab308" />
          <circle cx="35" cy="98" r="2.5" fill="#06b6d4" />

          {/* Gradient curve trajectory */}
          <path
            d="M 85 54 C 95 38, 115 36, 122 46"
            stroke="url(#trajectoryGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          {/* Ending dot with rose color */}
          <circle cx="123" cy="48" r="2.5" fill="#f43f5e" />

          {/* Envelope Body shadow */}
          <rect x="40" y="58" width="80" height="54" rx="8" fill="#000000" opacity="0.08" transform="translate(0, 3)" />

          {/* Envelope (Closed with vibrant Indigo-Purple gradient) */}
          <rect x="40" y="58" width="80" height="54" rx="8" fill="url(#envelopeBackGrad)" stroke="url(#envelopeStroke)" strokeWidth="1.2" />
          
          {/* Envelope flap lines with Cyan-Blue gradient and seam lines */}
          <path d="M 40 58 L 80 85 L 120 58" fill="url(#envelopeFlapGrad)" stroke="url(#envelopeStroke)" strokeWidth="1.2" />
          <path d="M 40 112 L 74 81" fill="none" stroke="url(#envelopeStroke)" strokeWidth="1.2" />
          <path d="M 120 112 L 86 81" fill="none" stroke="url(#envelopeStroke)" strokeWidth="1.2" />
          <path d="M 40 112 L 80 85 L 120 112" fill="none" stroke="url(#envelopeStroke)" strokeWidth="1.2" />

          {/* Notification Message Card (Floating above envelope with light violet gradient) */}
          <motion.g
            animate={{
              y: [0, -3.5, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
          >
            {/* Triangle speech bubble pointer */}
            <path d="M 42 49 L 46 54 L 50 49 Z" fill="#ffffff" stroke="url(#envelopeStroke)" strokeWidth="1.2" />
            <path d="M 42.5 48.5 L 46 53 L 49.5 48.5 Z" fill="#ffffff" />

            {/* Rounded card body */}
            <rect x="24" y="16" width="52" height="34" rx="6" fill="url(#notificationCardGrad)" stroke="url(#envelopeStroke)" strokeWidth="1.2" />

            {/* Corner Badge fold (Vibrant Sunset Orange-to-Yellow gradient) */}
            <path
              d="M 24 28 L 24 22 A 6 6 0 0 1 30 16 L 36 16 A 12 12 0 0 0 24 28 Z"
              fill="url(#badgeGrad)"
            />

            {/* Card text line 1 (rose color) */}
            <rect x="41" y="23" width="24" height="2.5" rx="1.25" fill="#f43f5e" opacity="0.8" />
            {/* Card text line 2 (violet color) */}
            <rect x="32" y="31" width="34" height="2.5" rx="1.25" fill="#8b5cf6" opacity="0.6" />
          </motion.g>

          <defs>
            <radialGradient id="illustGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="illustGlowPink" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="trajectoryGrad" x1="85" y1="54" x2="122" y2="46">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="envelopeBackGrad" x1="40" y1="58" x2="120" y2="112">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id="envelopeFlapGrad" x1="40" y1="58" x2="120" y2="85">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="envelopeStroke" x1="40" y1="58" x2="120" y2="112">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="notificationCardGrad" x1="24" y1="16" x2="76" y2="50">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f5f3ff" />
            </linearGradient>
            <linearGradient id="badgeGrad" x1="24" y1="16" x2="36" y2="28">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  )
}

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [cooldown, setCooldown] = useState(0)
  const [expiryTime, setExpiryTime] = useState(300) // 5 minutes timer
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

  // Mouse-tracking for 3D card tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 })
  const rotateX = useTransform(springY, [-1, 1], [5, -5])
  const rotateY = useTransform(springX, [-1, 1], [-6, 6])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  useEffect(() => {
    setIdentifier(searchParams.get("identifier") || searchParams.get("email") || "")
  }, [searchParams])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  useEffect(() => {
    if (expiryTime <= 0) return
    const t = setInterval(() => setExpiryTime((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [expiryTime])

  const handleDigitChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, "")
    if (!cleanValue) {
      const newDigits = [...otpDigits]
      newDigits[index] = ""
      setOtpDigits(newDigits)
      return
    }

    const digit = cleanValue.substring(cleanValue.length - 1)
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)

    // Focus next input if not the last one
    if (index < 5 && digit) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits]
        newDigits[index - 1] = ""
        setOtpDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
      } else {
        const newDigits = [...otpDigits]
        newDigits[index] = ""
        setOtpDigits(newDigits)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    if (pastedText.length === 6) {
      const newDigits = pastedText.split("")
      setOtpDigits(newDigits)
      inputRefs.current[5]?.focus()
    }
  }

  const onVerify = async () => {
    const otp = otpDigits.join("")
    if (!identifier.trim()) {
      toast.error("Please enter your email address")
      return
    }
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP code")
      return
    }
    setLoading(true)
    try {
      const res = await apiClient.verifyPasswordRecoveryOtp({
        identifier: identifier.trim(),
        otp,
        captcha_token: "dev-bypass",
      })
      const token = res?.data?.reset_token
      if (!token) throw new Error("Missing token")
      toast.success("OTP verified successfully!")
      router.push(`/auth/reset-password?token=${encodeURIComponent(token)}`)
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Invalid OTP"))
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (!identifier.trim()) {
      toast.error("Please enter your email address to resend OTP")
      return
    }
    if (resendLoading || cooldown > 0) return
    setResendLoading(true)
    try {
      const response = await apiClient.resendPasswordRecoveryOtp({
        identifier: identifier.trim(),
        channel: "email",
      })
      const serverCooldown = Number(response?.cooldown_seconds || 60)
      setCooldown(Number.isFinite(serverCooldown) && serverCooldown > 0 ? serverCooldown : 60)
      setExpiryTime(300) // Reset OTP expiry timer back to 5 mins
      setOtpDigits(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      toast.success("OTP code resent")
    } catch (error: any) {
      const retryAfterJson = Number(error?.response?.data?.detail?.retry_after_seconds)
      const retryAfterHeader = error?.response?.headers?.["retry-after"]
      const retryAfter = Number(retryAfterHeader)
      if (Number.isFinite(retryAfterJson) && retryAfterJson > 0) {
        setCooldown(retryAfterJson)
      } else if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setCooldown(retryAfter)
      }
      toast.error(getErrorMessage(error, "Unable to resend OTP"))
    } finally {
      setResendLoading(false)
    }
  }

  const formatExpiryTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#f8fafc] via-[#f0f4fc] to-[#e2e8f0] dark:from-[#090b11] dark:via-[#110d22] dark:to-[#060814] transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 75%)" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 75%)" }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Floating rainbow stars */}
      {STARS.map((s) => (
        <Sparkle key={s.id} x={s.x} y={s.y} size={s.size} duration={s.duration} delay={s.delay} color={s.color} />
      ))}

      {/* 3D Card tilt wrapper with glowing gradient border */}
      <div className="relative group z-10 w-full max-w-[460px]">
        {/* Outer vibrant neon glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 rounded-[25px] blur opacity-25 group-hover:opacity-35 transition duration-1000 group-hover:duration-200 pointer-events-none" />
        
        <motion.div
          ref={cardRef}
          className="relative w-full rounded-[24px] bg-white dark:bg-[#0D1527] p-5 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(27,82,164,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-100/80 dark:border-gray-800/40 text-center transition-all duration-300"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            perspective: "1200px",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          
          {/* Verification Illustration SVG */}
          <VerifyIllustration />

          {/* Title & Subtitle Section */}
          <div style={{ transform: "translateZ(12px)" }}>
            <h1 className="text-2xl sm:text-[26px] font-bold bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 dark:from-white dark:via-indigo-100 dark:to-white bg-clip-text text-transparent tracking-tight leading-tight">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              We&apos;ve sent a verification code to
            </p>
            {identifier && (
              <p className="text-[15px] text-indigo-600 dark:text-cyan-400 font-semibold mt-1 break-all px-2">
                {identifier}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the 6-digit code below to verify your email.
            </p>
          </div>

          {/* Form Fields Section */}
          <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6 text-left" style={{ transform: "translateZ(18px)" }}>
            
            {/* Email input field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-11 pl-4 pr-11 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#161F38] border border-gray-200 dark:border-gray-850 outline-none transition-all focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-500/15 dark:focus:ring-cyan-500/15"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* OTP inputs */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Verification Code (OTP)
              </label>
              
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-full h-12 sm:h-13 rounded-xl text-center font-bold text-lg sm:text-xl text-gray-900 dark:text-white bg-white dark:bg-[#161F38] border border-gray-200 dark:border-gray-850 focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-500/15 dark:focus:ring-cyan-500/15 outline-none transition-all duration-150"
                  />
                ))}
              </div>

              {/* OTP Expiration timer */}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                <span>
                  {expiryTime > 0 ? (
                    <>
                      Code will expire in{" "}
                      <span className="text-indigo-600 dark:text-cyan-400 font-semibold">
                        {formatExpiryTime(expiryTime)}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 font-semibold">Code expired</span>
                  )}
                </span>
              </div>
            </div>

            {/* Verify OTP button */}
            <button
              onClick={onVerify}
              disabled={loading}
              className="w-full h-11 sm:h-12 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/20 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5 sm:my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800/80" />
              <span className="text-xs text-gray-400 dark:text-gray-600 uppercase font-bold tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800/80" />
            </div>

            {/* Resend Code button */}
            <button
              onClick={onResend}
              disabled={cooldown > 0 || resendLoading}
              className="w-full h-11 sm:h-12 rounded-xl font-semibold text-sm text-indigo-600 dark:text-cyan-400 bg-transparent hover:bg-indigo-50/50 dark:hover:bg-cyan-950/20 border border-indigo-200 dark:border-cyan-900/50 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} />
              <span>
                {resendLoading
                  ? "Resending..."
                  : cooldown > 0
                  ? `Resend Code (${cooldown}s)`
                  : "Resend Code"}
              </span>
            </button>

            {/* Back to sign in link */}
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-5 sm:mt-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </button>

          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f8fafc] via-[#f0f4fc] to-[#e2e8f0] dark:from-[#0B0F19] dark:via-[#0E1322] dark:to-[#070A10]">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
