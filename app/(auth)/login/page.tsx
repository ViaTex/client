"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      {/* Login Form - Full Page */}
      <LoginForm />

      {/* Footer Links - Absolute positioned at bottom */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest font-medium transition-colors"
            >
              PRIVACY
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest font-medium transition-colors"
            >
              TERMS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
