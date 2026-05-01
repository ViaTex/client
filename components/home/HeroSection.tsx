'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left: Copy */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6 sm:gap-8 items-center lg:items-start text-center lg:text-left"
      >
        <h1
          className="text-[#2A2D31] font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.15] sm:leading-[1.1]"
        >
          Revolutionizing India's <br className="hidden lg:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1C1] to-[#009B8E]">Employment Landscape</span>
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-[#2A2D31]/70 max-w-xl font-medium px-4 sm:px-0">
          Bridging the gap between ambitious candidates and industry demands through a verified,
          skill-first ecosystem built on trust and academic serenity.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mt-2 w-full px-4 sm:px-0">
          <button className="primary-btn-gradient text-[#2A2D31] px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto">
            Complete Your Profile
          </button>
          <button className="bg-white border-2 border-[#E5E7EB] text-[#2A2D31] px-8 py-3.5 rounded-xl font-semibold shadow-sm hover:border-[#C0BFBD] hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto">
            Verify Your Skills
          </button>
        </div>

        {/* Stat card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 sm:mt-6 flex w-full justify-center lg:justify-start px-4 sm:px-0"
        >
          <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all w-full sm:w-auto text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00D1C1]/10 flex-shrink-0 flex items-center justify-center">
              <TrendingUp className="text-[#00D1C1] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#2A2D31]/50 font-bold mb-1">
                Academic Excellence
              </p>
              <p className="font-extrabold text-lg sm:text-xl text-[#2A2D31]">
                Average Package: <span className="text-[#00D1C1]">26.5 LPA</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right: Illustration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[400px] sm:h-[500px] w-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00D1C1]/10 to-[#FCE7F3]/20 rounded-[3rem] blur-3xl -z-10" />
        
        <img 
          src="/Achievement-bro.svg" 
          alt="Achievement Illustration" 
          className="w-full h-full object-contain object-center lg:object-right drop-shadow-2xl" 
        />
      </motion.div>
    </section>
  );
}
