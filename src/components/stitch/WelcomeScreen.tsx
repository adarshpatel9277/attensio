import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="h-screen max-h-screen w-full bg-surface text-on-surface flex flex-col justify-between overflow-hidden p-6 sm:p-8 antialiased selection:bg-rose-tint selection:text-primary relative">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-tint/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-64 h-64 bg-emerald-subtle/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Badge */}
      <header className="flex items-center justify-between w-full max-w-sm mx-auto pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              fact_check
            </span>
          </div>
          <span className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface">
            Attendify
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-subtle text-tertiary">
          <span
            className="material-symbols-outlined text-[14px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
            100% Private
          </span>
        </div>
      </header>

      {/* Centerpiece Hero */}
      <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto w-full py-2">
        {/* Modern Minimal Glass Card Preview */}
        <div className="w-full bg-surface-card rounded-2xl p-5 shadow-sm border border-surface-container-high/60 mb-6 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-label-md text-label-md font-bold text-on-surface">
                Target Benchmark
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-subtle text-primary font-label-sm text-[11px] font-extrabold">
              Standard 75%
            </span>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="flex flex-col items-center">
              <span className="font-display-lg text-[38px] leading-none text-primary font-black tracking-tight">
                75%
              </span>
              <span className="font-label-sm text-[11px] text-secondary mt-1 font-semibold">
                Exam Eligible
              </span>
            </div>
            <div className="h-10 w-[1px] bg-surface-container-high" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-tertiary">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="font-headline-sm text-headline-sm font-black">
                  Zero Stress
                </span>
              </div>
              <span className="font-label-sm text-[11px] text-secondary mt-1 font-semibold">
                Smart Bunk Math
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-recessed flex items-center justify-between text-xs text-secondary font-medium">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-tertiary">check_circle</span>
              Instant 1-Tap Roll Call
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">cloud_off</span>
              Offline First
            </span>
          </div>
        </div>

        {/* Copywriting */}
        <h1 className="font-display-lg-mobile text-[26px] sm:text-[30px] leading-tight text-on-surface font-extrabold tracking-tight mb-2">
          Never fall below your attendance quota.
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-xs leading-relaxed">
          Log daily roll calls in 3 seconds, simulate safe skips, and stay confident all semester.
        </p>
      </div>

      {/* Bottom CTA Block */}
      <footer className="w-full max-w-sm mx-auto pb-4 flex flex-col items-center">
        <button
          onClick={onGetStarted}
          type="button"
          className="group w-full h-14 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center gap-2 font-headline-sm text-headline-sm shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
          style={{ boxShadow: '0 8px 24px -4px rgba(185, 5, 56, 0.38)' }}
        >
          <span className="font-bold">Get Started</span>
          <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>

        <p className="font-label-sm text-label-sm text-secondary/80 mt-2.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          Takes less than 1 minute to setup
        </p>
      </footer>
    </div>
  );
};
