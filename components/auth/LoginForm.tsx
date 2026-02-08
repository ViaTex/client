/**
 * Login Form Component
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth.context";
import { useToast } from "@/lib/toast.context";
import { LoginFormData, ROLE_DASHBOARD_ROUTES } from "@/types/auth.types";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});

  // ====================================================================
  // FORM VALIDATION
  // ====================================================================

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ====================================================================
  // FORM HANDLERS
  // ====================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name as keyof LoginFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      const loggedInUser = await login(formData);

      // Show success message
      toast.success("Login successful! Redirecting...");

      // Redirect to dashboard based on role
      if (loggedInUser?.role) {
        const dashboardRoute =
          ROLE_DASHBOARD_ROUTES[loggedInUser.role] || "/dashboard";
        router.push(dashboardRoute);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      // Show error toast
      const errorMessage =
        error?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE9E4] flex items-center justify-center p-4 antialiased text-gray-900">
      {/* MAIN CARD CONTAINER */}
      <div className="w-full max-w-[1120px] bg-white rounded-3xl p-3 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[680px]">
        {/* LEFT SIDE - BRANDING */}
        <div className="w-full md:w-[440px] bg-[#F3F2EE] rounded-3xl p-12 flex flex-col justify-between relative overflow-hidden flex-shrink-0">
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3.5 mb-20">
              <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-md">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="opacity-90"
                >
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-[19px] font-bold tracking-tight leading-none text-black">
                  DISHASETU
                </h3>
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.15em] mt-1.5">
                  PREMIUM TECH
                </p>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-[46px] font-bold text-black leading-[1.1] tracking-tight mb-5">
              Aapka Career,
              <br />
              Aapka Setu
            </h1>
            <p className="text-gray-500 text-[16px] leading-relaxed max-w-[300px]">
              Your professional bridge to the most exclusive career ecosystem.
            </p>
          </div>

          {/* Bottom Avatar Section */}
          <div className="relative z-10 flex items-center gap-4 mt-12">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-[2.5px] border-[#F3F2EE] overflow-hidden bg-gray-200"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 5}`}
                    alt="expert"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold text-gray-400 tracking-[0.12em] uppercase">
              Join 10k+ Experts
            </span>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-[#EAE8E4] rounded-full -z-0 opacity-60"></div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="flex-1 bg-white px-4 md:px-10 py-12 flex flex-col justify-center">
          <div className="max-w-[440px] w-full mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-[34px] font-bold text-black mb-2 tracking-tight">
                Swagat Hai
              </h2>
              <p className="text-[#9CA3AF] text-[15px]">
                Please enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Phone Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-[0.12em] mb-3"
                >
                  Phone Number / Email
                </label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4D4D4] group-focus-within:text-gray-500 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full bg-[#F9F9F9] border border-[#EBEBEB] rounded-xl py-4 pl-12 pr-4 text-[15px] text-black placeholder:text-[#D4D4D4] focus:outline-none focus:border-gray-400 focus:bg-white transition-all ${
                      formErrors.email ? "border-red-300 bg-red-50" : ""
                    }`}
                    placeholder="name@company.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-[0.12em]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-[#A1A1AA] hover:text-black uppercase tracking-[0.12em] transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4D4D4] group-focus-within:text-gray-500 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full bg-[#F9F9F9] border border-[#EBEBEB] rounded-xl py-4 pl-12 pr-12 text-[15px] text-black placeholder:text-[#D4D4D4] focus:outline-none focus:border-gray-400 focus:bg-white transition-all ${
                      formErrors.password ? "border-red-300 bg-red-50" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D4D4D4] hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-semibold text-[15px] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-8 shadow-sm"
              >
                <span>{isLoading ? "Signing in..." : "Aage Badhein"}</span>
                {!isLoading && (
                  <svg
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                )}
              </button>
            </form>

            {/* Social Connect */}
            <div className="mt-12">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-full border-t border-[#EDEDED]"></div>
                <span className="relative bg-white px-4 text-[10px] font-bold text-[#D4D4D4] uppercase tracking-[0.2em]">
                  Social Connect
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="group flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[#EDEDED] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path
                      className="fill-[#bab9b6] group-hover:fill-[#4285F4] duration-200"
                      fill=""
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      className="fill-[#bab9b6] group-hover:fill-[#34A853] duration-200"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      className="fill-[#bab9b6] group-hover:fill-[#FBBC05] duration-200"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      className="fill-[#bab9b6] group-hover:fill-[#EA4335] duration-200"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-[#525252] group-hover:text-black font-semibold text-[14px]">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="group flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[#EDEDED] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-[18px] h-[18px] fill-[#bab9b6] group-hover:fill-[#0A66C2] duration-200"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-[#525252] group-hover:text-black font-semibold text-[14px]">
                    LinkedIn
                  </span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-10 text-center">
              <p className="text-[13px] text-[#A3A3A3] font-medium">
                Naya account chahiye?{" "}
                <Link
                  href="/register"
                  className="text-black font-bold hover:underline ml-1"
                >
                  Naya Account Banayein
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
