import React from 'react';
import { User } from 'lucide-react';

interface AppHeaderProps {
  subtitle: string;
  percentage: number | null;
  avatarUrl?: string;
  studentName?: string;
  onAvatarClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  subtitle,
  percentage,
  avatarUrl,
  studentName,
  onAvatarClick,
}) => {
  const displayPercent = percentage !== null ? `${percentage.toFixed(1)}%` : '--%';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe transition-all border-b border-surface-container-high/60">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF4F81] to-[#E11D48] flex items-center justify-center text-white shadow-xs flex-shrink-0 ring-1 ring-white/20 p-1">
            <svg
              className="w-full h-full"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              <path d="M9 16l2 2 4-4" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-[15px] font-extrabold text-on-surface leading-tight truncate">
              {studentName || 'Attendify'}
            </span>
            <span className="text-[11px] font-medium text-secondary truncate leading-tight">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Live % Pill & Profile Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-subtle text-primary border border-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-[11px] font-extrabold leading-none">
              {displayPercent}
            </span>
          </div>

          <button
            type="button"
            onClick={onAvatarClick}
            aria-label="Student profile settings"
            className="w-9 h-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 bg-surface-recessed flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover aspect-square"
              />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

