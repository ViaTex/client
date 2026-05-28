'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, ShieldCheck, Video, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';

type JourneyStep = {
  id: number;
  icon: any;
  title: string;
  description: string;
  label: string;
  sublabel: string;
};

const STEPS: JourneyStep[] = [
  {
    id: 1,
    icon: Brain,
    title: 'AI-Powered Assessment',
    description:
      'Upload your resume to trigger a domain-specific assessment analyzing your strengths and weaknesses.',
    label: 'Choose Skill',
    sublabel: 'Select from 50+ industry stacks',
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: 'Mentor AI Verification',
    description:
      'Progress through Easy, Intermediate, and Advanced tiers to earn your DES Score and professional badges.',
    label: 'Complete Project',
    sublabel: 'Build real-world solutions',
  },
  {
    id: 3,
    icon: Video,
    title: 'Live Multi-Modal Viva',
    description:
      'Join a Jitsi Meet session for a 360° evaluation by human mentors, AI evaluators, and computer vision.',
    label: 'Pass Viva',
    sublabel: '1-on-1 industry expert review',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Get Hired by Top Tech',
    description:
      'Direct placement bridge connecting your verified credentials to career opportunities at global tech companies.',
    label: 'Receive Badge',
    sublabel: 'Irrefutable proof of mastery',
  },
];

const PETAL_COUNT = 12;

export default function SkillVerificationJourney() {
  const [currentStep, setCurrentStep] = useState(1);
  const sunflowerRef = useRef<HTMLDivElement | null>(null);
  const petalsRef = useRef<HTMLDivElement[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build petals once
  useEffect(() => {
    const container = sunflowerRef.current;
    if (!container) return;
    petalsRef.current = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const angle = (i / PETAL_COUNT) * 360;
      petal.style.transform = `rotate(${angle}deg) translateY(-60px)`;
      container.appendChild(petal);
      petalsRef.current.push(petal);
    }
    return () => {
      petalsRef.current.forEach((p) => p.remove());
    };
  }, []);

  // Animate petals whenever step changes
  useEffect(() => {
    const rotationBase = (currentStep - 1) * 90;
    const configs: Record<number, [number, number, number]> = {
      1: [1, 1, 0],
      2: [1.3, 0.8, 0],
      3: [0.8, 1.2, 10],
      4: [1.5, 0.5, -10],
    };
    const [scaleY, scaleX, skew] = configs[currentStep] ?? configs[1];
    petalsRef.current.forEach((petal, i) => {
      const base = (i / PETAL_COUNT) * 360;
      petal.style.transform = `rotate(${base + rotationBase}deg) translateY(-80px) scaleX(${scaleX}) scaleY(${scaleY}) skewX(${skew}deg)`;
      petal.style.opacity = String(0.4 + currentStep * 0.1);
    });
  }, [currentStep]);

  const next = useCallback(() => setCurrentStep((s) => (s % STEPS.length) + 1), []);
  const prev = useCallback(() => setCurrentStep((s) => ((s - 2 + STEPS.length) % STEPS.length) + 1), []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(next, 6000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetTimer]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    resetTimer();
  };

  const handleNext = () => {
    next();
    resetTimer();
  };

  const handlePrev = () => {
    prev();
    resetTimer();
  };

  return (
    <section className="flex flex-col gap-8 sm:gap-10 lg:gap-12 py-6 sm:py-8">
      <h2 className="mx-auto max-w-3xl text-center text-[26px] font-extrabold leading-tight text-[#2A2D31] dark:text-white sm:text-3xl lg:text-4xl">
        Verified Talent, Not Just Claims.
      </h2>

      {/* Step indicators */}
      <div className="relative mx-auto w-full max-w-6xl px-1 sm:px-4 md:px-10">
        <div className="absolute left-[13%] right-[13%] top-5 hidden h-0.5 bg-gray-200 dark:bg-white/20 sm:block md:top-6" />
        <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-4">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className="flex w-full flex-col items-center gap-2 text-center sm:gap-3"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-all duration-300 sm:h-12 sm:w-12 sm:text-base ${currentStep === step.id ? 'scale-110 bg-[#4B32C3] shadow-[#4B32C3]/30' : 'bg-[#2A2D31] hover:scale-105 dark:bg-slate-700'
                  }`}
              >
                {step.id}
              </div>
              <div className="min-h-[48px] sm:min-h-[62px]">
                <h4 className={`text-[11px] font-bold leading-tight transition-colors sm:text-sm md:text-base ${currentStep === step.id ? 'text-[#4B32C3] dark:text-[#A78BFA]' : 'text-[#2A2D31] dark:text-slate-200'}`}>{step.label}</h4>
                <p className="mx-auto mt-1 hidden max-w-[130px] text-xs leading-snug text-[#2A2D31]/60 dark:text-slate-400 sm:block">{step.sublabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Journey Panel */}
      <div className="mesh-gradient relative mt-1 min-h-[430px] w-full overflow-hidden rounded-2xl shadow-2xl sm:min-h-[480px] md:aspect-[21/9] md:min-h-0">
        {/* Prev button */}
        <button
          onClick={handlePrev}
          aria-label="Previous step"
          className="absolute bottom-5 left-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/25 sm:left-6 sm:top-1/2 sm:bottom-auto sm:h-12 sm:w-12 sm:-translate-y-1/2"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>

        {/* Next button */}
        <button
          onClick={handleNext}
          aria-label="Next step"
          className="absolute bottom-5 right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/25 sm:right-6 sm:top-1/2 sm:bottom-auto sm:h-12 sm:w-12 sm:-translate-y-1/2"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>

        {/* Slide content */}
        <div className="relative z-20 h-full w-full">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`step-content absolute inset-0 flex h-full w-full max-w-3xl flex-col !items-start justify-center gap-4 !px-8 !pb-20 !pt-10 text-left transition-all duration-500 sm:!px-24 sm:!py-12 md:gap-6 lg:max-w-4xl lg:!px-36${currentStep === step.id
                  ? ' opacity-100 translate-y-0 pointer-events-auto'
                  : ' opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
              <div className="glass-icon mb-1 inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md md:mb-2 md:p-4">
                <step.icon className="h-8 w-8 text-white md:h-10 md:w-10" strokeWidth={2} />
              </div>
              <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">{step.title}</h3>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-white/90 drop-shadow-md sm:text-lg md:text-xl lg:text-2xl">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Sunflower */}
        <div
          ref={sunflowerRef}
          className="sunflower-container absolute top-1/2 -right-[180px] z-10 hidden -translate-y-1/2 scale-[0.72] lg:flex xl:-right-[152px] xl:scale-100"
        >
          <div className="sunflower-core" />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/20 w-full z-30">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
