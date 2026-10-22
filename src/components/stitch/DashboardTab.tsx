import React, { useState, useEffect, useMemo } from 'react';
import { DayRecord, DayStatus, DayAppSettings } from '../../types';
import { calculateDayAttendanceStats } from '../../utils/calculator';
import {
  getLocalTodayString,
  formatDisplayDate,
  getMonthCalendarData,
} from '../../utils/dateUtils';
import {
  TrendingUp,
  Check,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CalendarCheck2,
} from 'lucide-react';

interface DashboardTabProps {
  records: DayRecord[];
  settings: DayAppSettings;
  onMarkDay: (
    date: string,
    status: DayStatus,
    note?: string,
    isSpecial?: boolean,
    details?: { subjectName?: string; subjectCode?: string; timeSlot?: string; location?: string }
  ) => void;
  onDeleteRecord?: (date: string) => void;
  onSelectDateToLog?: (date: string) => void;
  onNavigateTab?: (tab: 'log' | 'forecast' | 'settings') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  records,
  settings,
  onMarkDay,
  onDeleteRecord,
  onSelectDateToLog,
  onNavigateTab,
}) => {
  // Midnight-aware local date state
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => getLocalTodayString());
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => getLocalTodayString());

  // Check for midnight rollover every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const freshToday = getLocalTodayString();
      if (freshToday !== currentDateStr) {
        setCurrentDateStr(freshToday);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [currentDateStr]);

  // Attendance Statistics
  const targetPct = settings.targetPercentage || 75;
  const stats = useMemo(() => {
    return calculateDayAttendanceStats(records, targetPct, settings.warningMargin || 5);
  }, [records, targetPct, settings.warningMargin]);

  // Today Record & Status
  const todayRecord = useMemo(() => {
    return records.find((r) => r.date === currentDateStr);
  }, [records, currentDateStr]);

  const todayFormatted = useMemo(() => {
    return formatDisplayDate(currentDateStr);
  }, [currentDateStr]);



  // Gauge calculations
  const percentageVal = stats.percentage ?? 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset =
    stats.percentage !== null
      ? circumference - (Math.min(100, Math.max(0, percentageVal)) / 100) * circumference
      : circumference;

  const diffFromTarget =
    stats.percentage !== null ? (stats.percentage - targetPct).toFixed(1) : null;
  const diffNum = diffFromTarget !== null ? parseFloat(diffFromTarget) : null;

  // Roll call action: marks attendance or clears if active status is clicked again
  const handleRollCall = (status: DayStatus) => {
    if (todayRecord?.status === status) {
      if (onDeleteRecord) {
        onDeleteRecord(currentDateStr);
      }
      return;
    }

    onMarkDay(currentDateStr, status);
  };

  // Calendar math for optional expandable section
  const calendarData = useMemo(() => {
    return getMonthCalendarData(calendarViewDate);
  }, [calendarViewDate]);

  const prevMonth = () => {
    setCalendarViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToTodayMonth = () => {
    const now = new Date();
    setCalendarViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedCalendarDate(getLocalTodayString());
  };

  const selectedDateRecord = useMemo(() => {
    return records.find((r) => r.date === selectedCalendarDate);
  }, [records, selectedCalendarDate]);

  return (
    <div className="flex flex-col w-full pb-24 pt-2 px-4 sm:px-6 max-w-md mx-auto space-y-4">
      {/* 1. Header: Student Greeting & Target Status Chip */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="min-w-0">
          <h1 className="font-headline-md text-xl sm:text-[22px] font-black text-on-surface tracking-tight leading-tight truncate">
            {settings.studentName ? `Hi, ${settings.studentName}` : 'Semester Overview'}
          </h1>
          <p className="text-xs text-secondary font-medium truncate mt-0.5">
            Semester {settings.semester || 1} • {settings.collegeName || 'Attendance Tracker'}
          </p>
        </div>

        {/* Target Status Chip */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-subtle text-primary border border-primary/10 shadow-xs flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
          <span className="font-label-sm text-xs font-bold whitespace-nowrap">
            {stats.daysNeeded > 0
              ? `Need ${stats.daysNeeded} for ${targetPct}%`
              : `Safe +${stats.daysCanBeMissed} skips`}
          </span>
        </div>
      </div>

      {/* 2. Primary Attendance Hero Card with Sized Donut Gauge */}
      <section className="relative w-full rounded-3xl bg-surface-card p-5 sm:p-6 shadow-sm border border-surface-container-high/60 overflow-hidden">
        {/* Soft Ambient Radial Accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-rose-tint/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-emerald-subtle/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Circular Progress Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Recessed Track */}
              <circle
                cx="65"
                cy="65"
                fill="transparent"
                r={radius}
                stroke="#F1F5F9"
                strokeLinecap="round"
                strokeWidth="11"
              />
              {/* Target Guide Dash */}
              <circle
                className="opacity-25"
                cx="65"
                cy="65"
                fill="transparent"
                r={radius}
                stroke="#00855b"
                strokeDasharray="3 6"
                strokeWidth="2"
              />
              {/* Dynamic Percentage Stroke */}
              <circle
                className="transition-all duration-1000 ease-out"
                cx="65"
                cy="65"
                fill="transparent"
                r={radius}
                stroke={stats.isAboveTarget ? '#10B981' : '#E11D48'}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="11"
              />
            </svg>

            {/* Metric Center Cluster */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 max-w-[120px] mx-auto text-center pointer-events-none">
              <span className="font-display-lg text-2xl sm:text-[27px] leading-tight text-on-surface tracking-tight font-black">
                {stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : '--%'}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5 text-[10px]">
                <span className="text-secondary font-medium">Goal: {targetPct}%</span>
                {diffNum !== null && (
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded-full text-[9px] leading-tight ${
                      diffNum >= 0
                        ? 'bg-emerald-subtle text-tertiary'
                        : 'bg-rose-subtle text-primary'
                    }`}
                  >
                    {diffNum >= 0 ? `+${diffNum}%` : `${diffNum}%`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Advice Headline */}
          <p className="text-xs sm:text-sm text-secondary max-w-xs mt-2 mb-4 leading-relaxed font-medium">
            {stats.totalDays === 0 ? (
              <span>Start by marking today's roll call below to activate attendance insights.</span>
            ) : stats.daysNeeded > 0 ? (
              <span>
                Attend the next{' '}
                <strong className="text-primary font-bold">{stats.daysNeeded} classes</strong> in a
                row to cross your {targetPct}% target.
              </span>
            ) : (
              <span>
                You are safe! You can skip up to{' '}
                <strong className="text-tertiary font-bold">{stats.daysCanBeMissed} classes</strong>{' '}
                while staying above {targetPct}%.
              </span>
            )}
          </p>

          {/* Unified Metric Bar */}
          <div className="grid grid-cols-3 gap-2 w-full pt-1 border-t border-surface-container-high/60">
            <div className="flex flex-col items-center py-2 px-1 rounded-2xl bg-emerald-subtle/70">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-tertiary">
                Present
              </span>
              <span className="text-lg font-black text-on-surface mt-0.5">
                {stats.presentDays}
              </span>
            </div>

            <div className="flex flex-col items-center py-2 px-1 rounded-2xl bg-rose-subtle/80">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary">
                Absent
              </span>
              <span className="text-lg font-black text-on-surface mt-0.5">{stats.absentDays}</span>
            </div>

            <div className="flex flex-col items-center py-2 px-1 rounded-2xl bg-surface-recessed">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-secondary">
                Total Days
              </span>
              <span className="text-lg font-black text-on-surface mt-0.5">{stats.totalDays}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Today's Attendance Action (Daily Roll Call) */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-subtle text-primary flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                Today's Attendance
              </h2>
              <span className="text-[11px] text-secondary font-medium">{todayFormatted}</span>
            </div>
          </div>

          {/* Current today status chip */}
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              todayRecord?.status === 'PRESENT'
                ? 'bg-emerald-subtle text-tertiary'
                : todayRecord?.status === 'ABSENT'
                ? 'bg-rose-subtle text-primary'
                : todayRecord?.status === 'HOLIDAY'
                ? 'bg-amber-subtle text-amber-warning'
                : 'bg-surface-recessed text-secondary'
            }`}
          >
            {todayRecord?.status === 'PRESENT'
              ? 'Marked: Present'
              : todayRecord?.status === 'ABSENT'
              ? 'Marked: Absent'
              : todayRecord?.status === 'HOLIDAY'
              ? 'Marked: Off'
              : 'Unmarked'}
          </span>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Present */}
          <button
            onClick={() => handleRollCall('PRESENT')}
            type="button"
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
              todayRecord?.status === 'PRESENT'
                ? 'bg-emerald-subtle text-tertiary ring-2 ring-tertiary/40 shadow-xs scale-[1.02]'
                : 'bg-surface-recessed hover:bg-emerald-subtle/40 text-on-surface'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                todayRecord?.status === 'PRESENT'
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-emerald-subtle text-tertiary'
              }`}
            >
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Present</span>
          </button>

          {/* Absent */}
          <button
            onClick={() => handleRollCall('ABSENT')}
            type="button"
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
              todayRecord?.status === 'ABSENT'
                ? 'bg-rose-subtle text-primary ring-2 ring-primary/40 shadow-xs scale-[1.02]'
                : 'bg-surface-recessed hover:bg-rose-subtle/40 text-on-surface'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                todayRecord?.status === 'ABSENT'
                  ? 'bg-primary text-on-primary'
                  : 'bg-rose-subtle text-primary'
              }`}
            >
              <X className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Absent</span>
          </button>

          {/* Off */}
          <button
            onClick={() => handleRollCall('HOLIDAY')}
            type="button"
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
              todayRecord?.status === 'HOLIDAY'
                ? 'bg-amber-subtle text-amber-warning ring-2 ring-amber-warning/40 shadow-xs scale-[1.02]'
                : 'bg-surface-recessed hover:bg-amber-subtle/40 text-on-surface'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                todayRecord?.status === 'HOLIDAY'
                  ? 'bg-amber-warning text-surface-card'
                  : 'bg-amber-subtle text-amber-warning'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">Off / Holiday</span>
          </button>
        </div>

      </section>

      {/* 4. Monthly Calendar (Always open & visible directly on dashboard) */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <h2 className="font-headline-sm text-sm font-bold text-on-surface">
              {calendarData.monthName} {calendarData.year}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToTodayMonth}
              type="button"
              className="px-2 py-0.5 rounded-md bg-surface-recessed text-secondary hover:text-on-surface text-[10px] font-bold cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              type="button"
              className="p-1 rounded-md bg-surface-recessed text-secondary hover:text-on-surface cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              type="button"
              className="p-1 rounded-md bg-surface-recessed text-secondary hover:text-on-surface cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>


            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-secondary">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="py-0.5">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
              {calendarData.prevMonthDays.map((d) => (
                <div
                  key={`prev-${d}`}
                  className="h-8 flex items-center justify-center opacity-20 text-secondary pointer-events-none"
                >
                  <span>{d}</span>
                </div>
              ))}

              {calendarData.currentMonthDays.map((dayNum) => {
                const dateKey = `${calendarData.year}-${String(calendarData.month + 1).padStart(
                  2,
                  '0'
                )}-${String(dayNum).padStart(2, '0')}`;
                const rec = records.find((r) => r.date === dateKey);
                const isToday = dateKey === currentDateStr;
                const isSelected = dateKey === selectedCalendarDate;

                let surfaceClass = 'bg-surface-recessed/50 hover:bg-surface-recessed text-on-surface';
                if (rec?.status === 'PRESENT') surfaceClass = 'bg-emerald-subtle text-tertiary font-bold';
                else if (rec?.status === 'ABSENT') surfaceClass = 'bg-rose-subtle text-primary font-bold';
                else if (rec?.status === 'HOLIDAY') surfaceClass = 'bg-amber-subtle text-amber-warning font-bold';

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedCalendarDate(dateKey);
                      if (onSelectDateToLog) onSelectDateToLog(dateKey);
                    }}
                    className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-xs ${surfaceClass} ${
                      isToday ? 'ring-2 ring-primary font-black' : ''
                    } ${isSelected ? 'ring-2 ring-on-surface' : ''}`}
                  >
                    <span>{dayNum}</span>
                  </button>
                );
              })}

              {calendarData.nextMonthDays.map((d) => (
                <div
                  key={`next-${d}`}
                  className="h-8 flex items-center justify-center opacity-20 text-secondary pointer-events-none"
                >
                  <span>{d}</span>
                </div>
              ))}
            </div>

            {/* Selected Date Summary */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs">
              <span className="font-medium text-secondary">
                {formatDisplayDate(selectedCalendarDate)}:
                <strong className="ml-1 text-on-surface">
                  {selectedDateRecord?.status === 'PRESENT'
                    ? 'Present'
                    : selectedDateRecord?.status === 'ABSENT'
                    ? 'Absent'
                    : selectedDateRecord?.status === 'HOLIDAY'
                    ? 'Off'
                    : 'Unlogged'}
                </strong>
              </span>

              {selectedDateRecord && onDeleteRecord && (
                <button
                  type="button"
                  onClick={() => onDeleteRecord(selectedCalendarDate)}
                  className="text-secondary hover:text-primary p-1 rounded-md"
                  title="Remove record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
      </section>
    </div>
  );
};
