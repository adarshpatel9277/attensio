// ==========================================================================
// ADVERTISING CONFIGURATION & MONETIZATION HUB
// Unified integration with high-CPM ad units & smartlinks
// ==========================================================================

export interface BannerAdUnit {
  id: string;
  name: string;
  key: string;
  width: number;
  height: number;
  format: 'iframe';
  scriptUrl: string;
}

export interface SponsoredPromo {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  icon: string;
  accentColor: string;
}

export const SMARTLINKS = [
  'https://www.profitableratecpmnetwork.com/c0y2q2ex8?key=a784dab4d4c5af1618ceb59813721704',
  'https://www.profitableratecpmnetwork.com/p1xs67f455?key=4d28663416197dd148e3fe96bec5e70e',
  'https://www.profitableratecpmnetwork.com/ty6nva3ket?key=f3c2a70b072fb4e9a7385fb53c911d88',
];

export const BANNER_ADS: Record<string, BannerAdUnit> = {
  mobile_320x50: {
    id: 'mobile_320x50',
    name: 'Mobile Leaderboard',
    key: 'af98cc528397f57da1b8c280a14a6c91',
    width: 320,
    height: 50,
    format: 'iframe',
    scriptUrl: 'https://www.highrevenueformat.com/af98cc528397f57da1b8c280a14a6c91/invoke.js',
  },
  classic_468x60: {
    id: 'classic_468x60',
    name: 'Classic Horizontal Banner',
    key: 'a6a84461130264e98d3d6512260e3f79',
    width: 468,
    height: 60,
    format: 'iframe',
    scriptUrl: 'https://www.highrevenueformat.com/a6a84461130264e98d3d6512260e3f79/invoke.js',
  },
  rectangle_300x250: {
    id: 'rectangle_300x250',
    name: 'Medium Rectangle (MPU)',
    key: 'c8c2af4ce7c4d0118a6a4555a26cfd94',
    width: 300,
    height: 250,
    format: 'iframe',
    scriptUrl: 'https://www.highrevenueformat.com/c8c2af4ce7c4d0118a6a4555a26cfd94/invoke.js',
  },
  desktop_728x90: {
    id: 'desktop_728x90',
    name: 'Desktop Leaderboard',
    key: '9c51f3159ec33e00fd1d9e238bb75e0d',
    width: 728,
    height: 90,
    format: 'iframe',
    scriptUrl: 'https://www.highrevenueformat.com/9c51f3159ec33e00fd1d9e238bb75e0d/invoke.js',
  },
};

export const SPONSORED_PROMOS: SponsoredPromo[] = [
  {
    id: 'study-tools',
    badge: 'STUDENT DEAL',
    title: 'Top AI Study Assistant & Notes Summarizer',
    description: 'Instant exam preparation, PDF summaries, and flashcards tailored for college students.',
    ctaText: 'Claim Free Access ↗',
    icon: '🎓',
    accentColor: '#FF4F81',
  },
  {
    id: 'pdf-tools',
    badge: 'CAMPUS PERK',
    title: 'Fast PDF & Attendance Report Exporter',
    description: 'High-speed document converter and cloud storage bonus for university projects.',
    ctaText: 'Get Tools ↗',
    icon: '⚡',
    accentColor: '#8B5CF6',
  },
];

let smartlinkIndex = 0;

export function getNextSmartlink(): string {
  const url = SMARTLINKS[smartlinkIndex % SMARTLINKS.length];
  smartlinkIndex = (smartlinkIndex + 1) % SMARTLINKS.length;
  return url;
}

export function openSmartlink(customUrl?: string): void {
  const targetUrl = customUrl || getNextSmartlink();
  try {
    const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Fallback for pop-up blockers or webview
      window.location.href = targetUrl;
    }
  } catch {
    window.location.href = targetUrl;
  }
}

export function generateBannerSrcDoc(ad: BannerAdUnit): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
      background: transparent;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${ad.key}',
      'format' : '${ad.format}',
      'height' : ${ad.height},
      'width' : ${ad.width},
      'params' : {}
    };
  <\/script>
  <script type="text/javascript" src="${ad.scriptUrl}"><\/script>
</body>
</html>`;
}
