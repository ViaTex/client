'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTheme } from 'next-themes'

interface PipelineStage {
  id: string
  label: string
  completed: boolean
  current: boolean
  date?: string
}

interface VerificationPipelineProps {
  stages: PipelineStage[]
}

export function VerificationPipeline({ stages }: VerificationPipelineProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className={`rounded-[1.75rem] border p-6 shadow-sm sm:p-7 ${
      isDark
        ? 'border-[#243056] bg-[#121C46]'
        : 'border-[#E5E7EB] bg-white'
    }`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-[#8ea1d6]' : 'text-[#4f7ffb]'}`}>
            Verification
          </p>
          <h3 className={`mt-2 text-xl font-bold sm:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Verification Pipeline
          </h3>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Follow every milestone from submission to mentor approval in a responsive timeline.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isDark ? 'border-[#32406f] bg-[#17234c] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
          Live progress
        </span>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <motion.div
          className="flex min-w-[820px] items-start gap-3 xl:min-w-0 xl:flex-nowrap"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stages.map((stage, idx) => {
            const isComplete = Boolean(stage.completed)
            const isCurrent = Boolean(stage.current)

            return (
              <motion.div
                key={stage.id}
                variants={itemVariants}
                className="relative flex min-w-[180px] flex-1 flex-col items-start xl:min-w-0"
              >
                <div className="flex w-full items-center gap-3">
                  <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                    isComplete
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isDark
                          ? 'border-[#243056] bg-[#17234c] text-slate-300'
                          : 'border-slate-200 bg-white text-slate-500'
                  }`}>
                    {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  {idx < stages.length - 1 && (
                    <span className={`hidden h-[2px] flex-1 xl:block ${
                      isComplete
                        ? 'bg-emerald-400'
                        : isDark
                          ? 'bg-[#243056]'
                          : 'bg-slate-200'
                    }`} />
                  )}
                </div>

                <article className={`mt-3 w-full rounded-[1.35rem] border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                  isComplete
                    ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                    : isCurrent
                      ? 'border-blue-200 bg-blue-50/90 dark:border-blue-500/30 dark:bg-blue-500/10'
                      : isDark
                        ? 'border-[#243056] bg-[#17234c]'
                        : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex flex-col gap-2">
                    <p className={`text-xs font-semibold sm:text-sm ${
                      isComplete
                        ? 'text-emerald-700 line-through decoration-2 dark:text-emerald-200'
                        : isCurrent
                          ? 'text-blue-700 dark:text-blue-200'
                          : isDark
                            ? 'text-slate-100'
                            : 'text-slate-900'
                    }`}>
                      {stage.label}
                    </p>
                    {stage.date && (
                      <p className={`text-[11px] sm:text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                        {stage.date}
                      </p>
                    )}
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] ${
                      isComplete
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                        : isCurrent
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100'
                          : isDark
                            ? 'bg-[#243056] text-slate-200'
                            : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isComplete ? 'Done' : isCurrent ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </article>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
