import React from 'react';
import {
  Target,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { DayAttendanceStats } from '../types';

interface DayGoalCardProps {
  stats: DayAttendanceStats;
  targetPercent: number;
}

export const DayGoalCard: React.FC<DayGoalCardProps> = ({
  stats,
  targetPercent,
}) => {
  const percentage = stats.percentage;
  const isAbove = stats.isAboveTarget;
  const hasData = stats.totalDays > 0;
  const daysNeeded = stats.daysNeeded;
  const daysCanMiss = stats.daysCanBeMissed;

  // Status Badge Info
  const getStatusBadge = () => {
    if (!hasData) {
      return {
        label: 'Fresh Start',
        bgColor: 'bg-pink-50 text-[#FF4F81] border-pink-200',
        icon: <Sparkles className="h-3 w-3" />,
      };
    }
    if (stats.status === 'ON_TRACK') {
      return {
        label: 'Safe & On Track',
        bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <ShieldCheck className="h-3 w-3 text-emerald-600" />,
      };
    }
    if (stats.status === 'AT_RISK') {
      return {
        label: 'Near Warning Margin',
        bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <AlertTriangle className="h-3 w-3 text-amber-600" />,
      };
    }
    return {
      label: 'Below Target',
      bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <AlertTriangle className="h-3 w-3 text-rose-600" />,
    };
  };

  const badge = getStatusBadge();

  return (
    <div
      id="day-goal-card"
      className="relative overflow-hidden rounded-3xl bg-white/95 p-4 sm:p-5 shadow-xl shadow-pink-500/5 border border-pink-100/70 backdrop-blur-md transition-all space-y-3"
    >
      {/* Decorative gradient glow orb in corner */}
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tr from-rose-300/15 to-[#FF4F81]/10 blur-2xl" />

      {/* Top Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF4F81] to-[#FB7185] text-white shadow-md shadow-pink-500/20">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#FF4F81]">
              Attendance Forecast
            </div>
            <h3 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight leading-none mt-0.5">
              Goal &amp; Bunk Calculator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bgColor}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-zinc-700 border border-slate-200">
            Target: <strong className="text-[#FF4F81]">{targetPercent}%</strong>
          </span>
        </div>
      </div>

      {/* Primary Highlight: Dynamic Consecutive Days Needed or Safe Bunk Allowance */}
      <div
        className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 border transition-all ${
          !hasData
            ? 'bg-gradient-to-br from-pink-50/70 via-white to-rose-50/40 border-pink-200 text-zinc-800'
            : isAbove
            ? 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border-emerald-200/90 text-zinc-900'
            : 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/60 border-rose-200/90 text-zinc-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm text-lg ${
              !hasData
                ? 'bg-pink-100/80 text-[#FF4F81]'
                : isAbove
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {!hasData ? (
              <Sparkles className="h-5 w-5" />
            ) : isAbove ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Flame className="h-5 w-5 text-rose-600 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {!hasData ? (
              <>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#FF4F81]">
                  Ready to Start
                </div>
                <h4 className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5">
                  No attendance records marked yet.
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                  Mark classes to start tracking your progress toward{' '}
                  <strong className="text-[#FF4F81]">{targetPercent}%</strong>.
                </p>
              </>
            ) : !isAbove ? (
              <>
                {/* BELOW TARGET: "ITNE DIN AUR AAOGE TO HO JAYEGA" */}
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Target Recovery Plan</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5 leading-snug">
                  Attend next{' '}
                  <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-2 py-0.5 text-white font-black shadow-2xs font-['JetBrains_Mono'] mx-0.5">
                    {daysNeeded} {daysNeeded === 1 ? 'day' : 'days'}
                  </span>{' '}
                  continuously to reach {targetPercent}%!
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                  Current attendance is{' '}
                  <strong className="text-rose-600 font-bold">{percentage}%</strong>. Keep attending to recover!
                </p>
              </>
            ) : (
              <>
                {/* ABOVE TARGET: SAFE BUNK MARGIN */}
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Safe Attendance Zone</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5 leading-snug">
                  {daysCanMiss > 0 ? (
                    <>
                      You can safely miss up to{' '}
                      <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 text-white font-black shadow-2xs font-['JetBrains_Mono'] mx-0.5">
                        {daysCanMiss} {daysCanMiss === 1 ? 'day' : 'days'}
                      </span>{' '}
                      and stay above {targetPercent}%.
                    </>
                  ) : (
                    <>
                      You are right at your target ({percentage}%). Maintain attendance to stay safe!
                    </>
                  )}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                  Current attendance is{' '}
                  <strong className="text-emerald-700 font-bold">{percentage}%</strong> (Target:{' '}
                  {targetPercent}%).
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compact Metrics Row: Non-boxy, elegant pill strip */}
      <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-white shadow-2xs border border-emerald-100/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] text-zinc-500">Present:</span>
          <strong className="font-black text-emerald-700 font-['JetBrains_Mono'] text-xs">
            {stats.presentDays}
          </strong>
        </div>

        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-white shadow-2xs border border-rose-100/60">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="text-[11px] text-zinc-500">Absent:</span>
          <strong className="font-black text-rose-700 font-['JetBrains_Mono'] text-xs">
            {stats.absentDays}
          </strong>
        </div>

        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-white shadow-2xs border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
          <span className="text-[11px] text-zinc-500">Total:</span>
          <strong className="font-black text-zinc-800 font-['JetBrains_Mono'] text-xs">
            {stats.totalDays}
          </strong>
        </div>
      </div>
    </div>
  );
};
