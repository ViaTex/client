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
    <section className="flex flex-col gap-xl">
      <h2 className="text-[28px] md:text-3xl font-extrabold text-[#2A2D31] text-center mb-4">
        Verified Talent, Not Just Claims.
      </h2>

      {/* Step indicators */}
      <div className="relative px-4 py-8 md:px-12 w-full max-w-5xl mx-auto">
        <div className="hidden md:block step-line absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className="flex flex-col items-center text-center gap-3 w-full"
            >
              <div
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold step-indicator shadow-md transition-all duration-300${currentStep === step.id ? ' scale-110' : ' hover:scale-105'
                  }`}
                style={{ backgroundColor: currentStep === step.id ? '#4B32C3' : '#2A2D31' }}
              >
                {step.id}
              </div>
              <div className="mt-2">
                <h4 className={`font-bold text-sm md:text-base transition-colors ${currentStep === step.id ? 'text-[#4B32C3]' : 'text-[#2A2D31]'}`}>{step.label}</h4>
                <p className="text-xs text-[#2A2D31]/60 mt-1 max-w-[120px] mx-auto hidden sm:block">{step.sublabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Journey Panel */}
      <div className="w-full min-h-[500px] md:aspect-[21/9] rounded-2xl mesh-gradient relative overflow-hidden shadow-2xl mt-4">
        {/* Prev button */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Slide content */}
        <div className="relative w-full h-full z-20">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`step-content flex flex-col !items-start justify-center text-left gap-4 md:gap-6 w-full max-w-3xl !pl-16 md:!pl-28 lg:!pl-36 !pr-16 transition-all duration-500 absolute h-full${currentStep === step.id
                  ? ' opacity-100 translate-y-0 pointer-events-auto'
                  : ' opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
              <div className="glass-icon p-3 md:p-4 mb-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg inline-flex items-center justify-center">
                <step.icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg tracking-tight">{step.title}</h3>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-md font-medium max-w-2xl">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Sunflower */}
        <div
          ref={sunflowerRef}
          className="sunflower-container z-10 scale-[0.6] md:scale-100 absolute top-1/2 -translate-y-1/2 -right-[172px] md:-right-[152px]"
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
