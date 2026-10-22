import React, { useState, useEffect } from 'react';
import { ExternalLink, X, ChevronUp, Sparkles } from 'lucide-react';
import { SPONSORED_PROMOS, openSmartlink, BANNER_ADS, generateBannerSrcDoc } from '../data/adConfig';

interface StickyBottomAdProps {
  initialMinimized?: boolean;
}

export const StickyBottomAd: React.FC<StickyBottomAdProps> = ({
  initialMinimized = false,
}) => {
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [isClosed, setIsClosed] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [showLiveBanner, setShowLiveBanner] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cycle through promotions every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % SPONSORED_PROMOS.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const promo = SPONSORED_PROMOS.length > 0 ? SPONSORED_PROMOS[promoIndex % SPONSORED_PROMOS.length] : null;

  if (!isOnline || isClosed || !promo) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-4 z-30">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/95 px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-md backdrop-blur-md transition-all hover:bg-pink-50 hover:text-[#FF4F81] cursor-pointer"
          title="Show sponsored student perk"
        >
          <span className="rounded bg-amber-500 px-1 py-0.2 text-[8px] font-black text-white">
            AD
          </span>
          <span>{promo.badge}</span>
          <ChevronUp className="h-3 w-3 text-pink-500" />
        </button>
      </div>
    );
  }

  return (
    <aside
      id="bottom-ad-banner"
      aria-label="Sponsored advertisement"
      className="fixed bottom-22 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="overflow-hidden rounded-2xl border border-pink-200/90 bg-white/95 p-2 sm:p-2.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          {/* Main Clickable Ad Area */}
          <div
            onClick={() => openSmartlink()}
            className="flex flex-1 cursor-pointer items-center gap-2.5 min-w-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openSmartlink()}
          >
            {/* Promo Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 text-base shadow-2xs">
              {promo.icon}
            </div>

            {/* Ad Texts */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 rounded bg-amber-500 px-1 py-0.2 text-[9px] font-black text-white leading-none">
                  AD
                </span>
                <span className="truncate text-xs font-bold text-zinc-900 leading-tight">
                  {promo.title}
                </span>
              </div>
              <p className="hidden xs:block truncate text-[11px] text-zinc-500 mt-0.5">
                {promo.description}
              </p>
            </div>
          </div>

          {/* Actions: Open CTA + Minimize + Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => openSmartlink()}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#FF4F81] to-[#FB7185] px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
            >
              <span>Open</span>
              <ExternalLink className="h-3 w-3" />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-slate-100 hover:text-zinc-600 transition-colors cursor-pointer"
              title="Minimize banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
