'use client';

import { motion } from 'framer-motion';

type ScoreItem = {
  weight: string;
  label: string;
  fill: number;
  wide?: boolean;
};

const scoreBreakdown: ScoreItem[] = [
  { weight: '40%', label: 'Verified Technical Skills', fill: 85 },
  { weight: '30%', label: 'Project Completion Quality', fill: 70 },
  { weight: '15%', label: 'Soft Skills Assessment', fill: 90 },
  { weight: '10%', label: 'Challenge Participation', fill: 60 },
  { weight: '5%', label: 'Mentor Endorsements', fill: 45, wide: true },
];

export default function DESScoreSection() {
  const circleCircumference = 2 * Math.PI * 110;
  const strokeDashoffset = circleCircumference - (84 / 100) * circleCircumference;

  return (
    <section className="flex flex-col gap-16 relative py-10">
      {/* Futuristic Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00D1C1]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-[#2A2D31] dark:text-white mb-4 tracking-tight">Your Skills, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1C1] to-[#009B8E]">Quantified.</span></h2>
        <p className="text-[#2A2D31]/70 dark:text-white/75 max-w-2xl mx-auto text-lg font-medium">
          The Dishasetu Employability Score (DES) provides a real-time, 360-degree assessment of
          your industry readiness.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative">
        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="md:col-span-4 flex justify-center relative"
        >
          <div className="relative w-72 h-72 flex items-center justify-center bg-white dark:bg-[#0F1E44] rounded-full shadow-[0_20px_50px_rgb(0,209,193,0.15)] border border-[#00D1C1]/10">
            {/* Animated SVG Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                r="110"
                className="stroke-[#00D1C1]/10"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="120"
                cy="120"
                r="110"
                className="stroke-[#00D1C1]"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circleCircumference }}
                whileInView={{ strokeDashoffset }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                strokeDasharray={circleCircumference}
                style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,209,193,0.4))' }}
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center">
              <span className="block text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#2A2D31] to-[#2A2D31]/70 dark:from-white dark:to-white/70">
                84
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D1C1] mt-2 block bg-[#00D1C1]/10 px-3 py-1 rounded-full">
                DES Score
              </span>
            </div>
            
            {/* Pulsing glow */}
            <div className="absolute inset-4 rounded-full border border-[#00D1C1]/30 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          </div>
        </motion.div>

        {/* Breakdown Cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scoreBreakdown.map(({ weight, label, fill, wide }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative overflow-hidden bg-white dark:bg-[#0F1E44] rounded-2xl p-6 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/10 hover:border-[#00D1C1]/30 hover:shadow-[0_8px_30px_rgb(0,209,193,0.12)] transition-all group ${wide ? ' lg:col-span-2' : ''}`}
            >
              {/* Futuristic Accent line */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#00D1C1] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-center ml-2">
                <span className="text-xs font-black text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-1 rounded-md">{weight}</span>
                <span className="text-[#2A2D31]/50 dark:text-white/60 font-bold text-sm">{fill}%</span>
              </div>
              <h3 className="font-extrabold text-sm text-[#2A2D31] dark:text-white mt-1 ml-2">{label}</h3>
              
              <div className="h-2.5 w-full bg-[#E5E7EB]/70 rounded-full mt-auto overflow-hidden relative ml-2 w-[calc(100%-0.5rem)]">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${fill}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00D1C1] to-[#009B8E] rounded-full relative overflow-hidden" 
                >
                  {/* Glare effect inside progress bar */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
