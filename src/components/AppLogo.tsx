import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="sat_grad_main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4F81" />
            <stop offset="55%" stopColor="#FF2E63" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          {/* Ribbon Gradient */}
          <linearGradient id="sat_grad_check" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF0F5" />
          </linearGradient>
        </defs>

        {/* Squircle Badge Base */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#sat_grad_main)"
        />

        {/* Gloss Rim */}
        <rect
          x="2.5"
          y="2.5"
          width="43"
          height="43"
          rx="11.5"
          stroke="#FFFFFF"
          strokeOpacity="0.25"
          strokeWidth="1"
        />

        {/* Calendar Ring Lugs */}
        <rect x="13.5" y="4.5" width="4" height="5" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="30.5" y="4.5" width="4" height="5" rx="2" fill="#FFFFFF" fillOpacity="0.9" />

        {/* Calendar Header Line */}
        <line
          x1="9"
          y1="16.5"
          x2="39"
          y2="16.5"
          stroke="#FFFFFF"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Calendar Date Dots */}
        <circle cx="15.5" cy="22.5" r="1.6" fill="#FFFFFF" fillOpacity="0.5" />
        <circle cx="24" cy="22.5" r="1.6" fill="#FFFFFF" fillOpacity="0.5" />
        <circle cx="32.5" cy="22.5" r="1.6" fill="#FFFFFF" fillOpacity="0.5" />

        {/* Bold Modern Attendance Checkmark */}
        <path
          d="M14 31.5 L21.5 38.5 L35 23.5"
          stroke="url(#sat_grad_check)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Amber Target Star/Dot */}
        <circle cx="36" cy="11.5" r="2.2" fill="#FBBF24" />
      </svg>
    </div>
  );
};
