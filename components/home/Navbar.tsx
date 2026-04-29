'use client';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#FCFCFB] border-b border-[#C0BFBD]">
      <div className="h-20 flex items-center justify-between w-[90%] max-w-[95%] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2A2D31] flex items-center justify-center">
            <span className="material-symbols-outlined text-white">hub</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2A2D31]">Dishasetu</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#2A2D31]/60">Academic Serenity</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="bg-transparent border border-[#C0BFBD] text-[#2A2D31] px-6 py-2 rounded-xl text-sm font-semibold hover:bg-black/5 transition-colors">
            <a href="/auth/login">Login</a>
          </button>
          <button className="primary-btn-gradient text-[#2A2D31] px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
            <a href="/auth/register">Register</a>
          </button>
        </div>
      </div>
    </header>
  );
}
