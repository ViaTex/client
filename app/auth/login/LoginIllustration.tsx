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
          {/* <g transform="translate(480, 750)" fill="rgba(255,255,255,0.25)">
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
          </g> */}

          {/* Central Blob */}
          <path d="M 570.0 425.0 L 538.0 455.0 L 561.1 492.3 L 522.5 513.0 L 535.2 555.0 L 492.5 565.0 L 493.8 608.8 L 450.0 607.5 L 440.0 650.2 L 398.0 637.5 L 377.3 676.1 L 340.0 653.0 L 310.0 685.0 L 280.0 653.0 L 242.7 676.1 L 222.0 637.5 L 180.0 650.2 L 170.0 607.5 L 126.2 608.8 L 127.5 565.0 L 84.8 555.0 L 97.5 513.0 L 58.9 492.3 L 82.0 455.0 L 50.0 425.0 L 82.0 395.0 L 58.9 357.7 L 97.5 337.0 L 84.8 295.0 L 127.5 285.0 L 126.2 241.2 L 170.0 242.5 L 180.0 199.8 L 222.0 212.5 L 242.7 173.9 L 280.0 197.0 L 310.0 165.0 L 340.0 197.0 L 377.3 173.9 L 398.0 212.5 L 440.0 199.8 L 450.0 242.5 L 493.8 241.2 L 492.5 285.0 L 535.2 295.0 L 522.5 337.0 L 561.1 357.7 L 538.0 395.0 Z" fill="#F4F7FE" />

          {/* Image embedded in SVG to multiply blend with the background */}
          <image href="/images/login_illustration.jpg" x="80" y="200" width="450" height="450" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: 'multiply' }} />
        </svg>
      </div>
    </div>
  );
}
