"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth.context";
import { useToast } from "@/lib/toast.context";
import { LoginFormData, ROLE_DASHBOARD_ROUTES } from "@/types/auth.types";
import { Mail, Lock, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      toast.success("Login successful! Redirecting...");

      if (loggedInUser?.role) {
        const dashboardRoute =
          ROLE_DASHBOARD_ROUTES[loggedInUser.role] || "/dashboard";
        router.push(dashboardRoute);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage =
        error?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 pt-24 md:pt-32 relative z-10 w-full min-h-screen bg-gray-50">
      <div
        className="w-full max-w-[519px] bg-white rounded-lg border border-[#AEAEAE] p-[24px]"
        style={{
          boxShadow: '2px -2px 4px 0px rgba(0, 0, 0, 0.25), -2px 2px 4px 0px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-[32px] font-semibold text-black leading-[24px] mb-2 font-['Poppins']">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600">
            Login to your account to continue your journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-black flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              id="email"
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="your@email.com"
              className={`w-full h-[50px] px-4 bg-white text-gray-700 border ${formErrors.email ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500 font-medium">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-black flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your password"
              className={`w-full h-[50px] px-4 bg-white text-gray-700 border ${formErrors.password ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
            />
            {formErrors.password && (
              <p className="text-xs text-red-500 font-medium">{formErrors.password}</p>
            )}
          </div>

          <div className="flex justify-end -mt-2">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-black hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] text-base font-medium bg-[#00BAE8] hover:bg-[#009bc2] text-white rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Login"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>

          <div className="text-center">
            <p className="text-sm text-black font-medium">
              Need an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline"
              >
                Signup
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
