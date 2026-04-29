'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Landmark, Users } from 'lucide-react';

type Stakeholder = {
  icon: any;
  title: string;
  description: string;
  color: string;
  iconColor: string;
};

const stakeholders: Stakeholder[] = [
  {
    icon: GraduationCap,
    title: 'Job-Ready Students',
    description: 'Verified profiles & AI-optimized ATS resumes that get noticed.',
    color: 'from-[#00D1C1] to-[#009B8E]',
    iconColor: 'text-[#00D1C1]',
  },
  {
    icon: Briefcase,
    title: 'Employers',
    description: 'Pre-screened pool, reducing recruitment screening time by over 50%.',
    color: 'from-[#4B32C3] to-[#7C3AED]',
    iconColor: 'text-[#4B32C3]',
  },
  {
    icon: Landmark,
    title: 'Institutions',
    description: 'Full batch management & placement tracking for TPO efficiency.',
    color: 'from-[#FFD200] to-[#F59E0B]',
    iconColor: 'text-[#F59E0B]',
  },
  {
    icon: Users,
    title: 'Mentors',
    description: 'Skill validation frameworks and structured feedback loops.',
    color: 'from-[#FF6B6B] to-[#E03131]',
    iconColor: 'text-[#FF6B6B]',
  },
];

export default function StakeholderEcosystem() {
  return (
    <section className="flex flex-col gap-12 py-10 relative">
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-[#2A2D31] mb-4 tracking-tight"
        >
          Stakeholder <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B32C3] to-[#00D1C1]">Ecosystem</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto font-medium"
        >
          Connecting every key player in the hiring landscape through a unified, intelligent platform.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stakeholders.map(({ icon: Icon, title, description, color, iconColor }, i) => (
          <motion.div 
            key={title} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,209,193,0.08)] hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-gray-50`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.08] rounded-2xl`} />
              <Icon className={`w-7 h-7 ${iconColor} relative z-10`} strokeWidth={2} />
            </div>
            
            <div className="relative z-10">
              <h4 className="font-extrabold text-xl text-[#2A2D31] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">{title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors font-medium">{description}</p>
            </div>
            
            {/* Abstract background shape for hover effect */}
            <div className={`absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br ${color} rounded-full opacity-0 group-hover:opacity-5 transition-all duration-500 blur-2xl z-0 pointer-events-none`} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
