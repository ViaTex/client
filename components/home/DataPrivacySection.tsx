'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const VISIBILITY_OPTIONS = ['Public', 'Registered Employers', 'Private'] as const;

type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number];

export default function DataPrivacySection() {
  const [visibility, setVisibility] = useState<VisibilityOption>('Registered Employers');
  const [contactShared, setContactShared] = useState(true);

  return (
    <section className="max-w-4xl mx-auto w-full py-10 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00D1C1] to-[#009B8E]" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#00D1C1]/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#00D1C1]" strokeWidth={2} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#2A2D31] tracking-tight">Your Data, On Your Terms.</h2>
        </div>

        <div className="flex flex-col gap-8">
          {/* Profile Visibility */}
          <div className="flex flex-col md:flex-row md:items-center justify-between py-5 border-b border-gray-100 gap-6">
            <div>
              <p className="font-bold text-lg text-[#2A2D31]">Profile Visibility</p>
              <p className="text-sm text-gray-500 mt-1">
                Control who can find and view your full career profile.
              </p>
            </div>
            <div className="flex bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setVisibility(opt)}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                    visibility === opt ? 'bg-white text-[#4B32C3] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100' : 'text-gray-500 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Sharing */}
          <div className="flex flex-col md:flex-row md:items-center justify-between py-5 gap-6">
            <div>
              <p className="font-bold text-lg text-[#2A2D31]">Contact Sharing</p>
              <p className="text-sm text-gray-500 mt-1">
                Hide phone/email until you are shortlisted by a company.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={contactShared}
                onChange={() => setContactShared((v) => !v)}
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00D1C1] group-hover:shadow-md transition-all shadow-inner" />
            </label>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
