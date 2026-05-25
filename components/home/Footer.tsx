'use client';

import { ShieldCheck } from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Compliance', href: '#' },
  { label: 'Contact', href: '#' },
];

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-gray-200 bg-white dark:border-white/10 dark:bg-[#070D1F]">
      <div className="max-w-7xl mx-auto py-16 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="animated-logo-bg flex-shrink-0 flex items-center justify-center">
              <img
                src="images/dishasetu_logo.png"
                alt="Dishasetu Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className="font-extrabold text-[#2A2D31] dark:text-white text-xl tracking-tight">Dishasetu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B32C3] to-[#7C3AED]">Platform</span></span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-300 font-medium max-w-sm">
            Join 100,000+ Students and 5,000+ Companies. Elevate your career with verifiable skills.
          </p>
          <div className="flex gap-4 mt-2">
            {['Google', 'LinkedIn'].map((provider) => (
              <button
                key={provider}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-white/15 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300 hover:text-[#2A2D31] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-[#5EEAD4]/50 transition-all shadow-sm"
              >
                Register with {provider}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-6 md:gap-8 w-full md:w-auto">
          <nav className="flex flex-wrap gap-x-8 gap-y-4 text-[11px] uppercase tracking-[0.2em] font-extrabold text-gray-400 dark:text-slate-400">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="hover:text-[#4B32C3] transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col md:items-end gap-3 mt-auto">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#00D1C1]/10 rounded-full border border-[#00D1C1]/20">
              <ShieldCheck className="w-4 h-4 text-[#00D1C1]" strokeWidth={2.5} />
              <span className="text-[10px] font-black text-[#00D1C1] tracking-widest uppercase">
                GDPR / DPDP Compliant
              </span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-slate-400 uppercase tracking-widest font-semibold mt-2">
              © 2024 Dishasetu Platform. Secure &amp; Academic Environment.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
