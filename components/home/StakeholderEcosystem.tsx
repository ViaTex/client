'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Landmark, Brain, Layers, ShieldCheck } from 'lucide-react';

export default function StakeholderEcosystem() {
  return (
    <section className="flex flex-col gap-10">
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-[#2A2D31] tracking-tight"
        >
          Stakeholder <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B32C3] to-[#00D1C1]">Ecosystem</span>
        </motion.h2>
      </div>

      <div className="bg-transparent py-4 relative w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(80px,auto)] md:auto-rows-[minmax(180px,auto)] lg:auto-rows-[minmax(80px,auto)] gap-3 w-full">
          
          {/* Job-Ready Students: Large Top Left */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 lg:col-span-8 lg:row-span-3 bg-white border border-[#C0BFBD] rounded-2xl p-8 relative overflow-hidden z-10 flex flex-col justify-between group transition-all duration-500"
          >
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD200] transition-all duration-500 ease-out group-hover:h-full -z-10" />
            <div className="flex flex-col gap-4 h-full justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-[#4B32C3] group-hover:text-[#2A2D31] transition-colors duration-500" strokeWidth={2.5} />
                <h4 className="font-bold text-2xl text-[#2A2D31] transition-colors duration-500">Job-Ready Students</h4>
              </div>
              <p className="text-base leading-relaxed text-[#2A2D31]/80 group-hover:text-[#2A2D31] transition-colors duration-500 max-w-md">
                Verified profiles & AI-optimized ATS resumes that get noticed by top recruiters instantly through skill-first hiring. Stand out from the crowd with a verified DES score.
              </p>
            </div>
          </motion.div>

          {/* Employers: Tall Right Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-1 lg:col-span-4 lg:row-span-5 bg-white border border-[#C0BFBD] rounded-2xl p-6 relative overflow-hidden z-10 flex flex-col justify-between group transition-all duration-500"
          >
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD200] transition-all duration-500 ease-out group-hover:h-full -z-10" />
            <div className="flex flex-col h-full gap-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-[#00D1C1] group-hover:text-[#2A2D31] transition-colors duration-500" strokeWidth={2.5} />
                <h4 className="font-bold text-xl text-[#2A2D31] transition-colors duration-500">Employers</h4>
              </div>
              <p className="text-sm leading-relaxed text-[#2A2D31]/80 group-hover:text-[#2A2D31] transition-colors duration-500">
                Pre-screened pool, reducing recruitment screening time by over 50% with verified talent and direct skill verification reports. Access candidates with proven technical proficiency and soft skills.
              </p>
              <div className="mt-auto pt-4 border-t border-black/5 group-hover:border-[#2A2D31]/20 transition-colors duration-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00D1C1] group-hover:text-[#2A2D31] transition-colors duration-500" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-[#2A2D31] transition-colors duration-500">50% faster hiring</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Institutions: Wide Middle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-1 lg:col-span-5 lg:row-span-2 bg-white border border-[#C0BFBD] rounded-2xl p-6 relative overflow-hidden z-10 flex flex-col justify-between group transition-all duration-500"
          >
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD200] transition-all duration-500 ease-out group-hover:h-full -z-10" />
            <div className="flex items-center gap-4 h-full">
              <Landmark className="w-10 h-10 text-[#2A2D31]/40 group-hover:text-[#2A2D31] transition-colors duration-500" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-lg mb-1 text-[#2A2D31] transition-colors duration-500">Institutions</h4>
                <p className="text-xs text-[#2A2D31]/70 group-hover:text-[#2A2D31] transition-colors duration-500">
                  Full batch management & placement tracking for TPO efficiency and institutional excellence.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mentors: Small Square */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-1 lg:col-span-3 lg:row-span-2 bg-white border border-[#C0BFBD] rounded-2xl p-6 relative overflow-hidden z-10 flex flex-col justify-between group transition-all duration-500"
          >
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD200] transition-all duration-500 ease-out group-hover:h-full -z-10" />
            <div className="flex flex-col h-full justify-center">
              <Brain className="w-7 h-7 mb-2 text-[#4B32C3] group-hover:text-[#2A2D31] transition-colors duration-500" strokeWidth={2.5} />
              <h4 className="font-bold text-base mb-1 text-[#2A2D31] transition-colors duration-500">Mentors</h4>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#2A2D31]/60 group-hover:text-[#2A2D31] transition-colors duration-500">
                Expert Validation
              </p>
            </div>
          </motion.div>

          {/* Unified Platform: Wide Bottom */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-1 md:col-span-2 lg:col-span-8 lg:row-span-2 bg-white border border-[#C0BFBD] rounded-2xl p-8 relative overflow-hidden z-10 flex flex-col justify-between group transition-all duration-500"
          >
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD200] transition-all duration-500 ease-out group-hover:h-full -z-10" />
            <div className="flex items-center justify-between gap-8 h-full">
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-2xl text-[#2A2D31] transition-colors duration-500">Unified Platform</h4>
                <p className="text-sm text-[#2A2D31]/70 group-hover:text-[#2A2D31] transition-colors duration-500 max-w-xl">
                  Connecting all stakeholders through a single, intelligent ecosystem designed for transparency and academic growth. A bridge between potential and professional success.
                </p>
              </div>
              <Layers className="w-14 h-14 text-[#2A2D31]/10 group-hover:text-[#2A2D31]/30 transition-colors duration-500 hidden sm:block" strokeWidth={1.5} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
