import React, { useState } from 'react';
import { DayAppSettings } from '../../types';

interface Step2CollegeScheduleProps {
  initialSettings: DayAppSettings;
  onNext: (data: Partial<DayAppSettings>, subjects?: string[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step2CollegeSchedule: React.FC<Step2CollegeScheduleProps> = ({
  initialSettings,
  onNext,
  onBack,
  onSkip,
}) => {
  const [sundayOff, setSundayOff] = useState(
    initialSettings.sundayOff !== undefined ? initialSettings.sundayOff : true
  );
  const [saturdayPolicy, setSaturdayPolicy] = useState<'FULL_OFF' | 'ALTERNATE' | 'FULL_WORKING'>(
    initialSettings.saturdayPolicy || 'FULL_OFF'
  );
  const [collegeStartTime, setCollegeStartTime] = useState(
    initialSettings.collegeStartTime || '09:00'
  );
  const [morningCallEnabled, setMorningCallEnabled] = useState(
    initialSettings.morningCallEnabled !== false
  );

  const getOverviewText = () => {
    if (saturdayPolicy === 'FULL_OFF') {
      return sundayOff ? '5 Working Days / Week (Mon – Fri)' : '6 Working Days / Week (Inc. Sun)';
    } else if (saturdayPolicy === 'ALTERNATE') {
      return sundayOff
        ? '5.5 Avg Days / Week (Mon – Alt Sat)'
        : '6.5 Avg Days / Week';
    } else {
      return sundayOff ? '6 Working Days / Week (Mon – Sat)' : '7 Working Days / Week';
    }
  };

  const handleSubmit = () => {
    onNext({
      sundayOff,
      saturdayOff: saturdayPolicy === 'FULL_OFF',
      saturdayPolicy,
      trackCourses: false,
      collegeStartTime,
      morningCallEnabled,
      morningRollCallAlarm: morningCallEnabled,
      preCollegeAlarm: morningCallEnabled,
      eveningAuditAlarm: morningCallEnabled,
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
              Course Schedule Import
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
          {/* Progress & Stepper Header */}
          <div className="flex flex-col gap-space-xs mt-space-sm mb-space-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-subtle text-primary font-label-md text-label-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Step 2 of 3 • College Schedule
              </span>
              <span className="font-label-md text-label-md text-secondary">66% complete</span>
            </div>
            {/* Stepper Indicator Bars */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="h-1.5 rounded-full bg-primary transition-all duration-300" />
              <div className="h-1.5 rounded-full bg-primary transition-all duration-300" />
              <div className="h-1.5 rounded-full bg-surface-container transition-all duration-300" />
            </div>
          </div>

          {/* Headline */}
          <div className="flex flex-col mb-space-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              When do you have college?
            </h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Select weekly holidays so you never get accidentally marked absent on off-days.
            </p>
          </div>

          {/* Schedule Settings Card */}
          <div className="w-full bg-surface-card rounded-lg p-space-lg shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04),0_2px_6px_-1px_rgba(15,23,42,0.02)] flex flex-col gap-space-lg mb-space-md">
            {/* Sunday Off Toggle */}
            <div className="flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-subtle text-amber-warning flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    wb_sunny
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Every Sunday Off
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Always non-instructional
                  </span>
                </div>
              </div>
              <button
                aria-checked={sundayOff}
                onClick={() => setSundayOff(!sundayOff)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                  sundayOff ? 'bg-primary' : 'bg-surface-container-high'
                }`}
                role="switch"
                type="button"
              >
                <span className="sr-only">Toggle Sunday off</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface-container-lowest shadow-md ring-0 transition duration-200 ease-in-out ${
                    sundayOff ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-surface-recessed w-full" />

            {/* Saturday Policy */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  calendar_view_week
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Saturday Policy
                </span>
              </div>
              <div
                aria-label="Saturday attendance options"
                className="flex flex-col gap-2.5"
                role="radiogroup"
              >
                {/* Saturday Full Off */}
                <label
                  onClick={() => setSaturdayPolicy('FULL_OFF')}
                  className={`sat-option flex items-center justify-between p-3.5 rounded-DEFAULT cursor-pointer transition-all duration-200 ${
                    saturdayPolicy === 'FULL_OFF'
                      ? 'bg-rose-subtle text-on-surface'
                      : 'bg-surface-recessed text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`radio-indicator flex items-center justify-center w-5 h-5 rounded-full ${
                        saturdayPolicy === 'FULL_OFF'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-card text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-label-lg text-label-lg font-semibold ${
                          saturdayPolicy === 'FULL_OFF' ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        Saturday Full Off
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        Weekend starts Friday evening
                      </span>
                    </div>
                  </div>
                  {saturdayPolicy === 'FULL_OFF' && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-card text-primary shadow-sm">
                      Popular
                    </span>
                  )}
                </label>

                {/* Alternate Saturdays Working */}
                <label
                  onClick={() => setSaturdayPolicy('ALTERNATE')}
                  className={`sat-option flex items-center justify-between p-3.5 rounded-DEFAULT cursor-pointer transition-all duration-200 ${
                    saturdayPolicy === 'ALTERNATE'
                      ? 'bg-rose-subtle text-on-surface'
                      : 'bg-surface-recessed text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`radio-indicator flex items-center justify-center w-5 h-5 rounded-full ${
                        saturdayPolicy === 'ALTERNATE'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-card text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-label-lg text-label-lg font-semibold ${
                          saturdayPolicy === 'ALTERNATE' ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        Alternate Saturdays Working
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        1st &amp; 3rd off, others working
                      </span>
                    </div>
                  </div>
                </label>

                {/* Saturday Full Working */}
                <label
                  onClick={() => setSaturdayPolicy('FULL_WORKING')}
                  className={`sat-option flex items-center justify-between p-3.5 rounded-DEFAULT cursor-pointer transition-all duration-200 ${
                    saturdayPolicy === 'FULL_WORKING'
                      ? 'bg-rose-subtle text-on-surface'
                      : 'bg-surface-recessed text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`radio-indicator flex items-center justify-center w-5 h-5 rounded-full ${
                        saturdayPolicy === 'FULL_WORKING'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-card text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-label-lg text-label-lg font-semibold ${
                          saturdayPolicy === 'FULL_WORKING' ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        Saturday Full Working
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        6-day academic schedule
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Morning Call Reminder Settings */}
          <div className="w-full bg-surface-card rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3 mb-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  notifications_active
                </span>
                <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                  Morning Call
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-secondary">
                  {morningCallEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  aria-checked={morningCallEnabled}
                  onClick={() => setMorningCallEnabled(!morningCallEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    morningCallEnabled ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                  role="switch"
                  type="button"
                >
                  <span className="sr-only">Toggle Morning Call</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      morningCallEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {morningCallEnabled && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-surface-recessed rounded-xl">
                  <span className="text-xs font-semibold text-secondary">
                    College Start Time:
                  </span>
                  <input
                    type="time"
                    value={collegeStartTime}
                    onChange={(e) => setCollegeStartTime(e.target.value)}
                    className="px-2 py-1 bg-surface-card rounded-md text-xs font-bold text-on-surface border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[10px] text-secondary font-semibold">Quick Set:</span>
                  {['08:30', '09:00', '09:30', '10:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setCollegeStartTime(time)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        collegeStartTime === time
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-recessed text-secondary hover:text-on-surface'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-surface-recessed text-[11px] text-secondary space-y-1">
                  <span className="font-semibold text-on-surface block text-[10px] uppercase tracking-wider">
                    3 Scheduled Daily Reminders:
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span>• <strong>{collegeStartTime}</strong>: College start check-in</span>
                    <span>• <strong>12:00 PM</strong>: Midday status reminder</span>
                    <span>• <strong>03:45 PM</strong>: Day wrap confirmation</span>
                  </div>
                  <span className="block text-[10px] text-tertiary pt-0.5 font-medium">
                    ✓ Suppresses reminders once today's attendance is marked.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Working Days Overview Pill */}
          <div className="w-full py-3 px-4 rounded-full bg-emerald-subtle flex items-center justify-center gap-2 shadow-sm mb-space-md">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span className="font-label-lg text-label-lg text-tertiary font-bold">
              {getOverviewText()}
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-space-md flex flex-col gap-3 mt-auto">
            <button
              onClick={handleSubmit}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0_8px_18px_-4px_rgba(244,63,94,0.32)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
              type="button"
            >
              <span>Continue to Attendance Goal</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <div className="flex items-center justify-center gap-1 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Auto-sync enabled • Stored locally</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
