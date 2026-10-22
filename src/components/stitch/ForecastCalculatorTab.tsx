import React, { useState, useMemo } from 'react';
import { DayRecord, DayAppSettings, CourseSubject } from '../../types';
import { calculateDayAttendanceStats } from '../../utils/calculator';
import { AdBanner } from '../AdBanner';
import { InFeedAdCard } from '../InFeedAdCard';
import { Flag, CheckCircle2, AlertTriangle, AlertCircle, Moon, Info } from 'lucide-react';

interface ForecastCalculatorTabProps {
  records: DayRecord[];
  settings: DayAppSettings;
  subjects?: CourseSubject[];
}

export const ForecastCalculatorTab: React.FC<ForecastCalculatorTabProps> = ({
  records,
  settings,
}) => {
  const [plannedSkips, setPlannedSkips] = useState(0);

  const target = settings.targetPercentage || 75;
  const stats = useMemo(() => {
    return calculateDayAttendanceStats(records, target, settings.warningMargin || 5);
  }, [records, target, settings.warningMargin]);

  // Simulation calculations
  const simPresent = stats.presentDays;
  const simAbsent = stats.absentDays + plannedSkips;
  const simTotal = simPresent + simAbsent;
  const simPercent =
    simTotal > 0 ? Math.round(((simPresent / simTotal) * 100) * 10) / 10 : 0;

  const targetRatio = target / 100;
  let simNeeded = 0;
  if (simPercent < target) {
    const denominator = 1 - targetRatio;
    const numerator = targetRatio * simTotal - simPresent;
    simNeeded = Math.max(1, Math.ceil(numerator / denominator));
  }

  // Simulator feedback
  const simFeedback = useMemo(() => {
    if (plannedSkips === 0) {
      return {
        badge: '0 Skips',
        badgeBg: 'bg-emerald-subtle text-tertiary',
        icon: 'verified',
        title: 'Current Baseline Track',
        desc:
          stats.totalDays === 0 ? (
            <span>No classes logged yet. Set your baseline by marking today's roll call.</span>
          ) : stats.percentage! >= target ? (
            <span>
              You are currently safely at{' '}
              <strong className="font-bold text-tertiary">{stats.percentage?.toFixed(1)}%</strong>.
              You have a buffer of{' '}
              <strong className="font-bold text-tertiary">{stats.daysCanBeMissed} safe skips</strong>.
            </span>
          ) : (
            <span>
              Currently at{' '}
              <strong className="font-bold text-primary">{stats.percentage?.toFixed(1)}%</strong>.
              Attending next{' '}
              <strong className="font-bold text-primary">{stats.daysNeeded} classes</strong> in a
              row reaches your {target}% target.
            </span>
          ),
      };
    } else if (plannedSkips <= 2) {
      const dropAmount =
        stats.percentage !== null ? (stats.percentage - simPercent).toFixed(1) : '0';
      return {
        badge: `${plannedSkips} Planned ${plannedSkips === 1 ? 'Skip' : 'Skips'}`,
        badgeBg: 'bg-amber-subtle text-amber-warning',
        icon: 'warning',
        title: `Projected Rate Drops to ${simPercent.toFixed(1)}% (-${dropAmount}%)`,
        desc: (
          <span>
            With {plannedSkips} missed {plannedSkips === 1 ? 'day' : 'days'}, you will need{' '}
            <strong className="font-bold text-primary">{simNeeded} consecutive attendances</strong> to
            restore your {target}% requirement.
          </span>
        ),
      };
    } else {
      return {
        badge: `${plannedSkips} Risky Skips`,
        badgeBg: 'bg-rose-subtle text-primary',
        icon: 'error',
        title: `High Debarment Risk: ${simPercent.toFixed(1)}%`,
        desc: (
          <span>
            Excessive absence! Attendance falls significantly below target. You will require{' '}
            <strong className="font-bold text-primary">{simNeeded} uninterrupted classes</strong> to
            re-enter exam eligibility.
          </span>
        ),
      };
    }
  }, [plannedSkips, stats, target, simPercent, simNeeded]);

  return (
    <div className="flex flex-col w-full pb-24 pt-2 px-4 sm:px-6 max-w-md mx-auto space-y-4">
      {/* 1. Page Header (Tight, Balanced Spacing) */}
      <section className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-headline-md text-xl font-extrabold text-on-surface tracking-tight leading-tight">
            Attendance Forecast
          </h1>
          <p className="text-xs text-secondary font-medium">
            {settings.collegeName || 'Academic'} • Target {target}%
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-subtle text-primary font-bold text-xs shadow-xs">
          <Flag className="w-3.5 h-3.5" />
          <span>{target}% Benchmark</span>
        </div>
      </section>

      {/* Top Header Sponsored Placement Ad */}
      <div className="w-full">
        <AdBanner unitId="mobile_320x50" className="w-full shadow-2xs" />
      </div>

      {/* 2. Current Total & Progress Card (Correct Alignment & Hierarchy) */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Current Total
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight leading-none">
                {stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : '--%'}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  stats.isAboveTarget
                    ? 'bg-emerald-subtle text-tertiary'
                    : 'bg-rose-subtle text-primary'
                }`}
              >
                {stats.isAboveTarget ? 'On Track' : 'Below Target'}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[11px] font-semibold text-secondary">Threshold</span>
            <span className="text-sm font-bold text-on-surface mt-0.5">{target}.0%</span>
          </div>
        </div>

        {/* Progress Bar with Exact Benchmark Marker */}
        <div className="space-y-1.5">
          <div className="relative w-full h-3 rounded-full bg-surface-recessed overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                stats.isAboveTarget ? 'bg-tertiary' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, stats.percentage || 0)}%` }}
            />
            {/* Guide line indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-on-surface/40 z-10"
              style={{ left: `${target}%` }}
              title={`Target ${target}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-secondary font-medium">
            <span>0%</span>
            <span className="font-bold text-on-surface">Target {target}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-3 rounded-2xl bg-surface-recessed/80 flex items-start gap-2.5 text-xs">
          {stats.isAboveTarget ? (
            <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          )}
          <p className="text-secondary leading-relaxed font-medium">
            {stats.totalDays === 0 ? (
              <span>Mark your daily attendance on the Dashboard to calculate live projections.</span>
            ) : stats.daysNeeded > 0 ? (
              <span>
                Need <strong className="text-primary font-bold">{stats.daysNeeded} consecutive attendances</strong> to
                cross the {target}% boundary.
              </span>
            ) : (
              <span>
                You currently have{' '}
                <strong className="text-tertiary font-bold">{stats.daysCanBeMissed} safe skips</strong>{' '}
                before dropping below {target}%.
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Mid In-Feed Sponsored Perk Card */}
      <div className="w-full">
        <InFeedAdCard />
      </div>

      {/* 3. Bunk Simulator (Clean Header & Perfectly Aligned 0-5 Combinations) */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-subtle text-primary flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Absence Simulator
              </h2>
              <p className="text-[11px] text-secondary font-medium">
                Test the impact of upcoming skips
              </p>
            </div>
          </div>

          {/* Cleanly Integrated Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${simFeedback.badgeBg}`}
          >
            {simFeedback.badge}
          </span>
        </div>

        {/* Stepped Combinations */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-secondary">Planned Scripts:</span>
            <span className="text-lg font-black text-primary leading-none">{plannedSkips} missed</span>
          </div>

          {/* Interactive Stepped Selector (0 to 5) */}
          <div className="grid grid-cols-6 gap-1 bg-surface-recessed p-1.5 rounded-2xl border border-surface-container-high/60">
            {[0, 1, 2, 3, 4, 5].map((val) => {
              const isSelected = plannedSkips === val;
              const isSafe = val === 0;
              const isRisky = val >= 3;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPlannedSkips(val)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? isSafe
                        ? 'bg-emerald-subtle text-tertiary ring-2 ring-tertiary/40 shadow-xs font-black'
                        : isRisky
                        ? 'bg-rose-subtle text-primary ring-2 ring-primary/40 shadow-xs font-black'
                        : 'bg-amber-subtle text-amber-warning ring-2 ring-amber-warning/40 shadow-xs font-black'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-card'
                  }`}
                >
                  <span className="text-sm font-bold leading-none">{val}</span>
                  <span className="text-[10px] font-semibold mt-1 leading-none opacity-80">
                    {val === 0 ? 'None' : `${val}d`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Projection Result Card */}
        <div className="p-3.5 rounded-2xl bg-surface-recessed flex items-start gap-3 transition-all">
          {plannedSkips === 0 ? (
            <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
          ) : plannedSkips <= 2 ? (
            <AlertTriangle className="w-5 h-5 text-amber-warning shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-bold text-on-surface leading-snug">
              {simFeedback.title}
            </span>
            <div className="text-xs text-secondary leading-relaxed font-medium">
              {simFeedback.desc}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsored Student Perk Banner */}
      <section className="w-full pt-1">
        <AdBanner unitId="classic_468x60" className="w-full shadow-2xs" />
      </section>
    </div>
  );
};
