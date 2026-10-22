import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  BANNER_ADS,
  BannerAdUnit,
  SPONSORED_PROMOS,
  generateBannerSrcDoc,
  openSmartlink,
} from '../data/adConfig';

interface AdBannerProps {
  unitId?: 'mobile_320x50' | 'classic_468x60' | 'rectangle_300x250' | 'desktop_728x90';
  className?: string;
  showFallbackOnEmpty?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  unitId = 'mobile_320x50',
  className = '',
}) => {
  const adUnit: BannerAdUnit = BANNER_ADS[unitId] || BANNER_ADS.mobile_320x50;
  const [iframeError, setIframeError] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setIsAdLoaded(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Strict conditional rendering:
  // If offline, error, empty, or failed: completely hide the ad container without leaving blank space
  if (!isOnline || iframeError) {
    return null;
  }

  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) {
        setIframeError(true);
        return;
      }
      // If loaded successfully, reveal container
      setIsAdLoaded(true);
    } catch {
      setIframeError(true);
    }
  };

  const handleBannerClick = () => {
    openSmartlink();
  };

  return (
    <>
      {/* Hidden preloader until ad proves it has loaded successfully */}
      {!isAdLoaded && (
        <div style={{ display: 'none' }} aria-hidden="true">
          <iframe
            ref={iframeRef}
            title={`Ad-${adUnit.name}-preload`}
            srcDoc={generateBannerSrcDoc(adUnit)}
            width={adUnit.width}
            height={adUnit.height}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={() => setIframeError(true)}
          />
        </div>
      )}

      {/* Render ad container ONLY when valid ad content is confirmed loaded */}
      {isAdLoaded && (
        <div
          className={`relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xs transition-all hover:border-pink-200 ${className}`}
        >
          {/* Header bar indicating ad / sponsor */}
          <div className="flex items-center justify-between border-b border-pink-50/80 bg-slate-50/60 px-3 py-1 text-[10px] text-zinc-400">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-extrabold text-amber-700">
                AD
              </span>
              <span>Sponsored Student Placement</span>
            </div>
            <button
              onClick={handleBannerClick}
              className="flex items-center gap-0.5 font-medium text-pink-600 hover:text-pink-700 cursor-pointer"
            >
              <span>Learn More</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Main ad display area */}
          <div className="flex items-center justify-center p-2">
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: '100%',
                maxWidth: `${adUnit.width}px`,
                minHeight: `${adUnit.height}px`,
              }}
            >
              <iframe
                title={`Ad-${adUnit.name}`}
                srcDoc={generateBannerSrcDoc(adUnit)}
                width={adUnit.width}
                height={adUnit.height}
                className="border-0 max-w-full"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="lazy"
                onError={() => setIframeError(true)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
