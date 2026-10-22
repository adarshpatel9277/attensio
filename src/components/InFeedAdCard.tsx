import React, { useState, useEffect } from 'react';
import { ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  SPONSORED_PROMOS,
  BANNER_ADS,
  generateBannerSrcDoc,
  openSmartlink,
} from '../data/adConfig';

interface InFeedAdCardProps {
  variant?: 'banner' | 'native';
  className?: string;
}

export const InFeedAdCard: React.FC<InFeedAdCardProps> = ({
  variant = 'native',
  className = '',
}) => {
  const [promo] = useState(() => {
    return SPONSORED_PROMOS.length > 0
      ? SPONSORED_PROMOS[Math.floor(Math.random() * SPONSORED_PROMOS.length)]
      : null;
  });
  const [showLiveBanner, setShowLiveBanner] = useState(variant === 'banner');
  const [bannerError, setBannerError] = useState(false);
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

  // Strict conditional rendering: hide container completely if offline or no valid content
  if (!isOnline || !promo || (showLiveBanner && bannerError)) {
    return null;
  }

  const bannerUnit = BANNER_ADS.rectangle_300x250;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-pink-100 bg-white p-3.5 sm:p-4 shadow-2xs transition-all hover:border-pink-200 ${className}`}
    >
      {/* Top Meta info */}
      <div className="flex items-center justify-between gap-2 border-b border-pink-50 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black text-amber-700 tracking-wider">
            SPONSORED
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>Verified Campus Partner</span>
          </div>
        </div>

        <button
          onClick={() => setShowLiveBanner(!showLiveBanner)}
          className="text-[10px] font-bold text-pink-500 hover:text-pink-600 cursor-pointer"
        >
          {showLiveBanner ? 'Show Perk Card' : 'Show Banner'}
        </button>
      </div>

      {showLiveBanner ? (
        /* Live 300x250 Iframe Banner Slot */
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center max-w-full">
            <iframe
              title="Campus Sponsor Banner"
              srcDoc={generateBannerSrcDoc(bannerUnit)}
              width={bannerUnit.width}
              height={bannerUnit.height}
              className="border-0 max-w-full"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
              onError={() => setBannerError(true)}
            />
          </div>
          <button
            onClick={() => openSmartlink()}
            className="flex items-center gap-1 text-xs font-bold text-[#FF4F81] hover:underline cursor-pointer"
          >
            <span>Visit Partner Site</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      ) : (
        /* Native Rich Card */
        <div
          onClick={() => openSmartlink()}
          className="group cursor-pointer space-y-3"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openSmartlink()}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-xl shadow-2xs group-hover:scale-105 transition-transform">
              {promo.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#FF4F81] border border-pink-100">
                  {promo.badge}
                </span>
                <span className="text-[11px] font-medium text-emerald-600">Free Access</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#FF4F81] transition-colors">
                {promo.title}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                {promo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-pink-50/50 p-2 sm:px-3 text-xs border border-pink-100/60">
            <span className="font-semibold text-zinc-600 text-[11px]">
              Tap to open student offer directly in browser
            </span>
            <span className="flex items-center gap-1 font-bold text-[#FF4F81] group-hover:translate-x-0.5 transition-transform">
              <span>{promo.ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
