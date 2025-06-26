import React from 'react';

interface LionFlameLogoProps {
  className?: string;
  size?: number;
}

export const LionFlameLogo: React.FC<LionFlameLogoProps> = ({ 
  className = "", 
  size = 32 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lion Face - Left Side */}
      <g>
        {/* Lion's mane */}
        <circle cx="18" cy="24" r="16" fill="#FF6B00" opacity="0.3"/>
        <circle cx="18" cy="24" r="13" fill="#FF4D00" opacity="0.5"/>
        
        {/* Lion's head */}
        <circle cx="18" cy="24" r="10" fill="#FFB366"/>
        
        {/* Lion's ears */}
        <ellipse cx="12" cy="18" rx="3" ry="4" fill="#FF8533" transform="rotate(-20 12 18)"/>
        <ellipse cx="24" cy="18" rx="3" ry="4" fill="#FF8533" transform="rotate(20 24 18)"/>
        
        {/* Inner ears */}
        <ellipse cx="12.5" cy="18.5" rx="1.5" ry="2" fill="#FF4D00" transform="rotate(-20 12.5 18.5)"/>
        <ellipse cx="23.5" cy="18.5" rx="1.5" ry="2" fill="#FF4D00" transform="rotate(20 23.5 18.5)"/>
        
        {/* Lion's eyes */}
        <circle cx="15" cy="22" r="2" fill="#2C1810"/>
        <circle cx="21" cy="22" r="2" fill="#2C1810"/>
        <circle cx="15.5" cy="21.5" r="0.5" fill="white"/>
        <circle cx="21.5" cy="21.5" r="0.5" fill="white"/>
        
        {/* Lion's nose */}
        <ellipse cx="18" cy="26" rx="1.5" ry="1" fill="#2C1810"/>
        
        {/* Lion's mouth */}
        <path d="M18 27 Q16 29 14 28" stroke="#2C1810" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M18 27 Q20 29 22 28" stroke="#2C1810" strokeWidth="1" fill="none" strokeLinecap="round"/>
        
        {/* Lion's whiskers */}
        <line x1="8" y1="24" x2="12" y2="23" stroke="#2C1810" strokeWidth="0.5"/>
        <line x1="8" y1="26" x2="12" y2="25" stroke="#2C1810" strokeWidth="0.5"/>
        <line x1="24" y1="23" x2="28" y2="24" stroke="#2C1810" strokeWidth="0.5"/>
        <line x1="24" y1="25" x2="28" y2="26" stroke="#2C1810" strokeWidth="0.5"/>
      </g>
      
      {/* Flame Spikes - Right Side */}
      <g>
        {/* Large central flame */}
        <path 
          d="M32 40 Q34 35 36 30 Q38 25 40 20 Q42 15 44 10 Q42 12 40 15 Q38 18 36 22 Q34 26 32 30 Q30 35 32 40Z" 
          fill="url(#flameGradient1)"
        />
        
        {/* Medium flame spike */}
        <path 
          d="M38 38 Q40 33 42 28 Q44 23 46 18 Q44 20 42 23 Q40 26 38 30 Q36 33 38 38Z" 
          fill="url(#flameGradient2)"
        />
        
        {/* Small flame spike */}
        <path 
          d="M30 36 Q32 31 34 26 Q36 21 38 16 Q36 18 34 21 Q32 24 30 28 Q28 31 30 36Z" 
          fill="url(#flameGradient3)"
        />
        
        {/* Tiny flame spike */}
        <path 
          d="M42 35 Q44 30 46 25 Q44 27 42 30 Q40 32 42 35Z" 
          fill="url(#flameGradient4)"
        />
      </g>
      
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="flameGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF4D00"/>
          <stop offset="50%" stopColor="#FF6B00"/>
          <stop offset="100%" stopColor="#FFB366"/>
        </linearGradient>
        <linearGradient id="flameGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF6B00"/>
          <stop offset="50%" stopColor="#FF8533"/>
          <stop offset="100%" stopColor="#FFD700"/>
        </linearGradient>
        <linearGradient id="flameGradient3" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF8533"/>
          <stop offset="50%" stopColor="#FFB366"/>
          <stop offset="100%" stopColor="#FFEB99"/>
        </linearGradient>
        <linearGradient id="flameGradient4" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FFB366"/>
          <stop offset="100%" stopColor="#FFEB99"/>
        </linearGradient>
      </defs>
    </svg>
  );
};