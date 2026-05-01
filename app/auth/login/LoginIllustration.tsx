import React from 'react';

export default function LoginIllustration() {
  return (
    <div className="hidden lg:flex w-full bg-[#7199D6] p-8 flex-col items-center justify-center relative overflow-hidden h-full">
      {/* Background graphic layer */}
      <div className="absolute inset-0 w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          {/* Top right circles */}
          <circle cx="550" cy="50" r="150" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="550" cy="50" r="100" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="40" />
          <circle cx="550" cy="50" r="40" fill="rgba(255,255,255,0.1)" />
          
          {/* Top left decorative elements */}
          <circle cx="80" cy="150" r="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          <circle cx="80" cy="150" r="6" fill="rgba(255,255,255,0.3)" />
          <g transform="translate(40, 40)" fill="rgba(255,255,255,0.25)">
            <circle cx="0" cy="0" r="2.5" />
            <circle cx="15" cy="0" r="2.5" />
            <circle cx="30" cy="0" r="2.5" />
            <circle cx="0" cy="15" r="2.5" />
            <circle cx="15" cy="15" r="2.5" />
            <circle cx="30" cy="15" r="2.5" />
            <circle cx="0" cy="30" r="2.5" />
            <circle cx="15" cy="30" r="2.5" />
            <circle cx="30" cy="30" r="2.5" />
          </g>

          {/* Bottom right decorative elements */}
          <circle cx="520" cy="700" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <circle cx="520" cy="700" r="6" fill="rgba(255,255,255,0.3)" />
          <g transform="translate(480, 750)" fill="rgba(255,255,255,0.25)">
            <circle cx="0" cy="0" r="2.5" />
            <circle cx="15" cy="0" r="2.5" />
            <circle cx="30" cy="0" r="2.5" />
            <circle cx="45" cy="0" r="2.5" />
            <circle cx="0" cy="15" r="2.5" />
            <circle cx="15" cy="15" r="2.5" />
            <circle cx="30" cy="15" r="2.5" />
            <circle cx="45" cy="15" r="2.5" />
            <circle cx="0" cy="30" r="2.5" />
            <circle cx="15" cy="30" r="2.5" />
            <circle cx="30" cy="30" r="2.5" />
            <circle cx="45" cy="30" r="2.5" />
          </g>

          {/* Central Blob */}
          <path d="M500,550 C540,500 580,450 560,370 C540,290 420,260 350,240 C280,220 210,210 150,240 C90,270 40,350 60,430 C80,510 160,600 230,620 C300,640 460,600 500,550 Z" fill="#F4F7FE" />
          
          {/* Floor Shadow */}
          <ellipse cx="330" cy="630" rx="160" ry="18" fill="#9AB9F0" />
          <ellipse cx="320" cy="635" rx="130" ry="12" fill="#6189C8" />
        </svg>
      </div>

      {/* Main Illustration Overlay */}
      <div className="relative z-10 w-full max-w-lg mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" className="w-full h-auto drop-shadow-xl">
          {/* Desk */}
          <rect x="60" y="150" width="230" height="6" fill="#FDE68A" />
          <rect x="90" y="156" width="6" height="94" fill="#FDE68A" />
          <rect x="250" y="156" width="6" height="94" fill="#FDE68A" />
          
          {/* Plant */}
          <path d="M95,150 Q100,125 110,150 Q105,115 95,150 Q85,125 95,150" fill="#10B981" />
          <path d="M95,150 Q95,130 105,150 Q85,140 95,150" fill="#059669" />
          <rect x="88" y="150" width="16" height="18" fill="#B45309" rx="2" />
          <rect x="86" y="150" width="20" height="4" fill="#92400E" rx="1" />

          {/* Laptop */}
          <path d="M150,150 L190,150 L170,100 Z" fill="#4B5563" />
          <rect x="140" y="100" width="50" height="35" rx="2" fill="#6B7280" />
          <circle cx="165" cy="117" r="4" fill="#F9FAFB" />
          
          {/* Chair */}
          <rect x="280" y="120" width="8" height="60" fill="#FDE68A" rx="4" />
          <rect x="260" y="180" width="35" height="6" fill="#FDE68A" rx="3" />
          <rect x="265" y="186" width="6" height="64" fill="#FDE68A" />
          <rect x="285" y="186" width="6" height="64" fill="#FDE68A" />

          {/* Character */}
          {/* Legs */}
          <path d="M270,175 L250,230 L265,235 L275,180 Z" fill="#111827" />
          <path d="M275,175 L230,230 L245,235 L285,180 Z" fill="#1F2937" />
          {/* Shoes */}
          <path d="M230,230 Q220,235 235,238 L245,235 Z" fill="#000000" />
          <path d="M250,230 Q240,235 255,238 L265,235 Z" fill="#000000" />
          {/* Body */}
          <path d="M260,100 Q250,70 275,75 Q295,80 280,120 Q260,125 260,100" fill="#5A83CD" />
          <path d="M270,120 L260,180 L285,180 L290,120 Z" fill="#1F2937" />
          {/* Arms */}
          <path d="M270,100 Q250,130 195,140" fill="none" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
          <path d="M275,95 Q260,125 205,135" fill="none" stroke="#5A83CD" strokeWidth="8" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="195" cy="140" r="4" fill="#FCA5A5" />
          <circle cx="205" cy="135" r="4" fill="#FCA5A5" />
          {/* Head & Neck */}
          <rect x="265" y="60" width="6" height="15" fill="#FCA5A5" />
          <circle cx="268" cy="55" r="14" fill="#FCA5A5" />
          {/* Hair */}
          <path d="M255,55 Q255,35 275,40 Q295,45 285,75 Q275,85 255,55 Z" fill="#451A03" />
          <path d="M280,45 Q300,50 295,80 Q280,100 280,75 Z" fill="#451A03" />
          {/* Headset */}
          <path d="M265,40 Q255,45 255,55" fill="none" stroke="#E5E7EB" strokeWidth="2" />
          <rect x="252" y="50" width="4" height="8" fill="#4B5563" rx="1" />
        </svg>
      </div>
    </div>
  );
}
