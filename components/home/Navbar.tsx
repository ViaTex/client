'use client';

import Link from "next/link";
import { Layers } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#FCFCFB]/95 border-b border-[#C0BFBD] backdrop-blur dark:border-white/10 dark:bg-[#070D1F]/95">
      <div className="h-16 sm:h-20 flex items-center justify-between w-[90%] max-w-[95%] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="animated-logo-bg flex-shrink-0 flex items-center justify-center">
            <img
              src="images/dishasetu_logo.png"
              alt="Dishasetu Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2A2D31] dark:text-white tracking-tight">Dishasetu</h2>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#2A2D31]/60 dark:text-slate-400 hidden sm:block font-medium">Academic Serenity</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/auth/login"
            className="bg-transparent border border-[#C0BFBD] text-[#2A2D31] px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-black/5 hover:border-gray-400 transition-all dark:border-white/20 dark:text-white dark:hover:border-[#5EEAD4]/50 dark:hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="primary-btn-gradient text-[#2A2D31] px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold hover:opacity-90 hover:shadow-md transition-all shadow-sm"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
