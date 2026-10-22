import React, { useState } from 'react';
import { DayAppSettings } from '../../types';

interface Step3AttendanceTargetProps {
  initialSettings: DayAppSettings;
  onFinish: (data: Partial<DayAppSettings>) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step3AttendanceTarget: React.FC<Step3AttendanceTargetProps> = ({
  initialSettings,
  onFinish,
  onBack,
  onSkip,
}) => {
  const [targetPercentage, setTargetPercentage] = useState(
    initialSettings.targetPercentage || 75
  );

  const getBadgeText = (val: number) => {
    if (val < 70) return 'High Absence Tolerance';
    if (val < 75) return 'Relaxed Threshold';
    if (val === 75) return 'Standard University Requirement';
    if (val <= 80) return 'High Confidence Target';
    return 'Honor Roll & Distinctions';
  };

  const getSafeMissProjection = (val: number) => {
    const est = Math.max(0, Math.round((100 - val) / 7));
    return `~${est} lectures/course`;
  };

  const presets = [
    { target: 70, label: 'Relaxed', desc: '~4 lectures/course' },
    { target: 75, label: 'Standard', desc: '~3 lectures/course' },
    { target: 80, label: 'Strict', desc: '~2 lectures/course' },
    { target: 85, label: 'Honor Roll', desc: '~1 lecture/course' },
  ];

  const handleLaunch = () => {
    onFinish({
      targetPercentage,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="bg-surface min-h-screen font-body-md text-on-surface flex flex-col antialiased selection:bg-rose-tint selection:text-primary">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Go back"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Notification Preferences
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={onSkip}
              className="min-w-[44px] min-h-[44px] px-3 flex items-center justify-center rounded-full bg-rose-subtle text-primary font-label-md text-label-md hover:bg-rose-tint active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              Skip
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {initialSettings.avatarUrl ? (
                <img
                  src={initialSettings.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-20 pb-safe bg-surface min-h-screen max-w-md mx-auto px-margin">
        <div className="flex flex-col w-full pb-space-xl">
          {/* Progress Indicator */}
          <div className="flex flex-col gap-space-sm mb-space-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-subtle text-primary font-label-md text-label-md font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Step 3 of 3 • Attendance Target
              </span>
              <span className="font-label-md text-label-md text-secondary font-medium">
                Final Step 🎉
              </span>
            </div>
            {/* Segmented Step Bar */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
              <div className="h-1.5 rounded-full bg-primary" />
              <div className="h-1.5 rounded-full bg-primary" />
              <div className="h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(185,5,56,0.35)]" />
            </div>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-1 mb-space-md">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Set your attendance target
            </h1>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              We will calculate your safe bunks and exam eligibility based on this benchmark.
            </p>
          </div>

          {/* Main Target Bento Card */}
          <div className="bg-surface-card rounded-lg p-space-lg shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04),0_2px_6px_-1px_rgba(15,23,42,0.02)] flex flex-col gap-space-lg relative overflow-hidden mb-space-md">
            {/* Ambient glow backdrop */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-tint/40 rounded-full blur-2xl pointer-events-none" />

            {/* Percentage Display & Badge */}
            <div className="flex flex-col items-center justify-center text-center gap-2 pt-space-xs relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-subtle text-tertiary font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>{getBadgeText(targetPercentage)}</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display-lg text-[64px] leading-none text-on-surface tracking-tighter transition-all font-extrabold">
                  {targetPercentage}
                </span>
                <span className="font-headline-md text-headline-md text-primary font-extrabold">
                  %
                </span>
              </div>
              <p className="font-label-md text-label-md text-secondary flex items-center gap-1">
                <span>Safe to miss:</span>
                <span className="font-bold text-on-surface bg-surface-recessed px-2 py-0.5 rounded-full">
                  {getSafeMissProjection(targetPercentage)}
                </span>
              </p>
            </div>

            {/* Range Slider Track */}
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center px-1 font-label-sm text-label-sm text-secondary">
                <span>60% (Minimum)</span>
                <span className="text-primary font-bold">Recommended 75%</span>
                <span>95% (Strict)</span>
              </div>
              <div className="relative flex items-center w-full py-2">
                <input
                  aria-label="Attendance target slider"
                  className="w-full h-3 bg-surface-recessed rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
                  max="95"
                  min="60"
                  step="1"
                  type="range"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(parseInt(e.target.value, 10))}
                />
              </div>
              {/* Safe Zone Spectrum Bar */}
              <div className="h-1.5 w-full bg-surface-recessed rounded-full overflow-hidden flex">
                <div className="w-[30%] bg-amber-subtle" />
                <div className="w-[45%] bg-rose-tint" />
                <div className="w-[25%] bg-emerald-subtle" />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const isSelected = targetPercentage === preset.target;
                  return (
                    <button
                      key={preset.target}
                      onClick={() => setTargetPercentage(preset.target)}
                      className={`py-3 px-3 rounded-full text-left font-label-md text-label-md transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-[0_8px_18px_-4px_rgba(185,5,56,0.35)]'
                          : 'bg-surface-recessed text-on-surface hover:bg-rose-subtle'
                      }`}
                      type="button"
                    >
                      <span className="font-bold">{preset.target}%</span>
                      <span
                        className={`font-normal text-[11px] ${
                          isSelected ? 'text-on-primary opacity-90' : 'text-secondary'
                        }`}
                      >
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Explainer Card */}
          <div className="bg-surface-card rounded-lg p-space-md shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] flex items-start gap-space-sm mb-space-md">
            <div className="w-10 h-10 rounded-full bg-rose-subtle text-primary flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_with_heart
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Why 75% by default?
              </span>
              <p className="font-body-md text-body-md text-secondary leading-snug">
                Most accredited universities require at least 75% attendance to avoid debarment or
                penalty exams. Our safety engine will always alert you 2 absences before danger.
              </p>
            </div>
          </div>

          {/* Setup Ready Recap Card */}
          <div className="bg-surface-card rounded-lg p-space-md shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] flex flex-col gap-space-sm mb-space-lg">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-bold">
                Setup Ready Recap
              </span>
              <span className="flex items-center gap-1 font-label-md text-label-md text-tertiary font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                All Set
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-recessed rounded-DEFAULT p-3 flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-secondary">Profile</span>
                <span className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                  {initialSettings.studentName || 'Adarsh'}
                </span>
              </div>
              <div className="bg-surface-recessed rounded-DEFAULT p-3 flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-secondary">Schedule</span>
                <span className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                  {initialSettings.saturdayOff ? 'Mon–Fri' : 'Mon–Sat'}
                </span>
              </div>
              <div className="bg-surface-recessed rounded-DEFAULT p-3 flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-secondary">Target</span>
                <span className="font-headline-sm text-headline-sm text-primary truncate font-bold">
                  {targetPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col items-center gap-space-sm pt-space-xs mt-auto">
            <button
              onClick={handleLaunch}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0_8px_18px_-4px_rgba(185,5,56,0.35)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-primary-container cursor-pointer font-bold"
              type="button"
            >
              <span>Launch My Dashboard</span>
              <span className="text-[18px]">🚀</span>
            </button>
            <p className="font-body-sm text-body-sm text-secondary text-center px-4">
              All settings can be customized anytime from the Settings tab.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
