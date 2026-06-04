"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Mail, Shield, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

// ─── Error helper ────────────────────────────────────────────────────────────
const getErrorMessage = (error: any, fallback: string) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && detail.length > 0) return detail[0]?.msg || fallback
  return fallback
}

// ─── Star particle data ───────────────────────────────────────────────────────
const STARS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 3,
  depth: Math.random() * 30 - 15, // z-depth for 3D parallax
}))

// ─── Sparkle icon ─────────────────────────────────────────────────────────────
function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
    />
  )
}

// ─── Ornate floating 3-D key ─────────────────────────────────────────────────
function FloatingKey() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        zIndex: 10,
        left: "24.5%",
        top: "51%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", perspective: "800px" }}
        animate={{ y: [0, -18, 0], rotateY: [0, 12, 0, -12, 0], rotateZ: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Outer radiant glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 220, height: 220,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,200,60,0.30) 0%, rgba(255,160,20,0.12) 40%, transparent 70%)",
            filter: "blur(6px)",
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Light rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: 2, height: i % 2 === 0 ? 70 : 45,
              top: "50%", left: "50%",
              transformOrigin: "top center",
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-55px)`,
              background: "linear-gradient(to bottom, rgba(255,215,80,0.9), transparent)",
              borderRadius: 2,
            }}
            animate={{ opacity: [0.3, 0.9, 0.3], scaleY: [0.7, 1.2, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}

        {/* Key SVG */}
        <svg
          width="88" height="160"
          viewBox="0 0 110 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 0 18px rgba(255,200,60,0.95)) drop-shadow(0 0 6px rgba(255,255,180,0.8))" }}
        >
          <defs>
            <radialGradient id="keyGold" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff7a0" />
              <stop offset="30%" stopColor="#ffd84a" />
              <stop offset="70%" stopColor="#c8860a" />
              <stop offset="100%" stopColor="#7a4d00" />
            </radialGradient>
            <radialGradient id="bowGold" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#fffbe0" />
              <stop offset="40%" stopColor="#f5c842" />
              <stop offset="100%" stopColor="#9a6200" />
            </radialGradient>
          </defs>

          {/* ── Bow (top ornate ring) ── */}
          {/* Outer ring */}
          <circle cx="55" cy="50" r="38" fill="url(#bowGold)" stroke="#fff0a0" strokeWidth="1.5" />
          {/* Inner cut */}
          <circle cx="55" cy="50" r="26" fill="#1a0a40" />
          {/* Decorative scrollwork spokes */}
          {[0,60,120,180,240,300].map((a, i) => (
            <line
              key={i}
              x1="55" y1="50"
              x2={55 + 24 * Math.cos((a - 90) * Math.PI / 180)}
              y2={50 + 24 * Math.sin((a - 90) * Math.PI / 180)}
              stroke="#ffd84a" strokeWidth="1.8" strokeLinecap="round"
            />
          ))}
          {/* Center gem */}
          <circle cx="55" cy="50" r="7" fill="#fff7a0" stroke="#ffd84a" strokeWidth="1" />
          <circle cx="55" cy="50" r="3.5" fill="#ffffff" />
          {/* Small decorative circles on bow */}
          {[0,72,144,216,288].map((a, i) => (
            <circle
              key={i}
              cx={55 + 32 * Math.cos((a - 90) * Math.PI / 180)}
              cy={50 + 32 * Math.sin((a - 90) * Math.PI / 180)}
              r="4.5" fill="url(#bowGold)" stroke="#fff0a0" strokeWidth="1"
            />
          ))}

          {/* ── Shaft ── */}
          <rect x="50" y="84" width="10" height="90" rx="5" fill="url(#keyGold)" stroke="#ffd84a" strokeWidth="0.8" />
          {/* Shaft highlight */}
          <rect x="52.5" y="86" width="3" height="86" rx="1.5" fill="rgba(255,255,220,0.35)" />

          {/* ── Bit teeth ── */}
          <rect x="60" y="142" width="16" height="8" rx="3" fill="url(#keyGold)" stroke="#ffd84a" strokeWidth="0.8" />
          <rect x="60" y="158" width="11" height="8" rx="3" fill="url(#keyGold)" stroke="#ffd84a" strokeWidth="0.8" />
          <rect x="60" y="172" width="14" height="6" rx="3" fill="url(#keyGold)" stroke="#ffd84a" strokeWidth="0.8" />
        </svg>
      </motion.div>
    </div>
  )
}

// ─── 3-D floating lock icon ───────────────────────────────────────────────────
function FloatingLock() {
  return (
    <div style={{ perspective: "600px" }} className="flex items-center justify-center mb-6">
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
          rotateY: [0, 15, 0, -15, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
            transform: "translateZ(-10px) scale(1.5)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Icon container */}
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, #1e1b3a 0%, #2d2060 100%)",
            boxShadow: "0 0 0 1px rgba(139,92,246,0.3), 0 8px 32px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Face shine */}
          <div
            className="absolute top-2 left-3 w-6 h-3 rounded-full opacity-20"
            style={{ background: "linear-gradient(135deg, #fff 0%, transparent 100%)" }}
          />
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Orbiting dot */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-violet-400"
          style={{ top: "10%", right: "-4px" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        {/* Second orbiting dot */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-purple-300"
          style={{ bottom: "12%", left: "-3px" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
        />
      </motion.div>
    </div>
  )
}

// ─── Left illustration panel ──────────────────────────────────────────────────
function IllustrationPanel({ mouseX, mouseY }: { mouseX: any; mouseY: any }) {
  const imgX = useTransform(mouseX, [-1, 1], [-8, 8])
  const imgY = useTransform(mouseY, [-1, 1], [-6, 6])

  return (
    <div
      className="hidden lg:block relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)",
      }}
    >
      {/* Stars */}
      {STARS.map((s) => (
        <Sparkle key={s.id} x={s.x} y={s.y} size={s.size} />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a3a]/60 via-transparent to-[#1a0a3a]/80 pointer-events-none" />

      {/* Parallax illustration */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: imgX, y: imgY }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/login_illustration.jpg"
            alt="Illustration of a secure login scene"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0c29] to-transparent" />
        </div>
      </motion.div>

      {/* Floating ambient orb */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(120,60,220,0.25) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
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

  const onSubmit = async () => {
    if (!identifier.trim()) return toast.error("Please enter your email address")
    setLoading(true)
    try {
      await apiClient.startPasswordRecovery({ identifier, channel: "email", captcha_token: "dev-bypass" })
      setSent(true)
      toast.success("Recovery link sent! Check your inbox.")
      setTimeout(() => {
        router.push(`/auth/verify-otp?identifier=${encodeURIComponent(identifier)}`)
      }, 2000)
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to start recovery"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#eef3ff] dark:bg-[#09091a]">
      {/* Background ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(88,28,220,0.18) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(120,40,200,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* 3D Card wrapper */}
      <motion.div
        ref={cardRef}
        className="w-full max-w-[920px] rounded-3xl overflow-hidden grid lg:grid-cols-2 relative z-10 border border-[#d8e4ff] dark:border-transparent"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: "1200px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.15)",
          minHeight: "560px",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* ── LEFT: Illustration ─────────────────────────────── */}
        <IllustrationPanel mouseX={springX} mouseY={springY} />

        {/* ── RIGHT: Form ────────────────────────────────────── */}
        <div
          className="flex flex-col justify-center px-8 md:px-12 py-10 relative bg-gradient-to-br from-white via-[#f8faff] to-[#edf3ff] dark:from-[#0e0c22] dark:via-[#130f2e] dark:to-[#130f2e]"
          style={{ transform: "translateZ(8px)" }}
        >
          {/* Back button */}
          <motion.div
            className="absolute top-6 left-8"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-xs text-[#4f5f8f] hover:text-[#334a82] dark:text-purple-400/70 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* 3D floating lock */}
            <FloatingLock />

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-[#15244d] dark:text-white mb-2 leading-tight">
              Forgotten{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #a855f7, #7c3aed)" }}>
                Password?
              </span>
            </h1>

            {/* Diamond divider */}
            <div className="flex items-center justify-center gap-3 my-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#90a4da] dark:to-purple-700/50" />
              <motion.div
                className="w-1.5 h-1.5 bg-purple-400 rotate-45"
                animate={{ rotate: [45, 225, 45] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#90a4da] dark:to-purple-700/50" />
            </div>

            {/* Subtitle */}
            <p className="text-center text-sm text-[#5e6e98] dark:text-slate-400 leading-relaxed mb-7 px-2">
              No worries! Enter your email address and<br />
              we&apos;ll send you a link to reset your password.
            </p>

            {/* Email field */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#475a8f] dark:text-slate-300 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f83b8] dark:text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl text-sm text-[#1a2a55] dark:text-white placeholder:text-[#8ca0cf] dark:placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/40 bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#cfdaf7] dark:border-[rgba(139,92,246,0.2)] focus:border-[#8a6cff] dark:focus:border-[rgba(139,92,246,0.6)]"
                />
              </div>
            </div>

            {/* Submit button */}
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(90deg, #16a34a, #15803d)" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Link Sent! Redirecting…
                </motion.div>
              ) : (
                <motion.button
                  key="send"
                  onClick={onSubmit}
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2.5 relative overflow-hidden"
                  style={{
                    background: loading
                      ? "rgba(109,40,217,0.5)"
                      : "linear-gradient(90deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
                    boxShadow: loading ? "none" : "0 4px 24px rgba(109,40,217,0.45)",
                  }}
                  whileHover={{ scale: 1.02, boxShadow: "0 6px 32px rgba(109,40,217,0.6)" }}
                  whileTap={{ scale: 0.97, rotateX: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {/* Shine sweep */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* OR divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#d6e1ff] dark:bg-white/8" />
              <span className="text-xs text-[#6f83b8] dark:text-slate-600 font-medium">OR</span>
              <div className="flex-1 h-px bg-[#d6e1ff] dark:bg-white/8" />
            </div>

            {/* Remember password */}
            <p className="text-center text-sm text-[#5f6f98] dark:text-slate-500 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-[#6f57d6] dark:text-purple-600/70" />
              Remember your password?{" "}
              <Link href="/auth/login" className="text-[#3b5bb7] dark:text-purple-400 font-semibold hover:text-[#284894] dark:hover:text-purple-300 transition-colors ml-0.5">
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Bottom security notice */}
          <motion.div
            className="mt-8 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(139,92,246,0.15)" }}>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your security is important to us.{" "}
              <span className="text-slate-400">We&apos;ll never share your email with anyone.</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
