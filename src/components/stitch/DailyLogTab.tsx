import React, { useState, useMemo } from 'react';
import { DayRecord, DayStatus, DayAppSettings } from '../../types';
import { calculateDayAttendanceStats } from '../../utils/calculator';
import { formatFullDisplayDate } from '../../utils/dateUtils';
import { AdBanner } from '../AdBanner';
import { InFeedAdCard } from '../InFeedAdCard';
import { MessageSquare, Trash2, CalendarX, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

interface DailyLogTabProps {
  records: DayRecord[];
  settings: DayAppSettings;
  onMarkDay: (
    date: string,
    status: DayStatus,
    note?: string,
    isSpecial?: boolean,
    details?: { subjectName?: string; subjectCode?: string; timeSlot?: string; location?: string }
  ) => void;
  onDeleteRecord: (date: string) => void;
  onOpenBackdate?: () => void;
  onMarkToday?: () => void;
}

export const DailyLogTab: React.FC<DailyLogTabProps> = ({
  records,
  settings,
  onMarkDay,
  onDeleteRecord,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'present' | 'absent' | 'holiday'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openStatusPickerDate, setOpenStatusPickerDate] = useState<string | null>(null);

  const targetPct = settings.targetPercentage || 75;
  const stats = useMemo(() => {
    return calculateDayAttendanceStats(records, targetPct, settings.warningMargin || 5);
  }, [records, targetPct, settings.warningMargin]);

  // Helper to check if a note is a system boilerplate string that should NOT be shown
  const isCustomUserNote = (note?: string) => {
    if (!note) return false;
    const clean = note.trim().toLowerCase();
    if (
      clean === '' ||
      clean === 'session attended' ||
      clean === 'unattended' ||
      clean === 'class called off / recess' ||
      clean === 'regular class'
    ) {
      return false;
    }
    return true;
  };

  // Counts for filters
  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let holiday = 0;
    records.forEach((r) => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') absent++;
      else if (r.status === 'HOLIDAY') holiday++;
    });
    return { all: records.length, present, absent, holiday };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (activeFilter === 'present' && r.status !== 'PRESENT') return false;
        if (activeFilter === 'absent' && r.status !== 'ABSENT') return false;
        if (activeFilter === 'holiday' && r.status !== 'HOLIDAY') return false;

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesDate = r.date.toLowerCase().includes(query);
          const matchesNote = r.note ? r.note.toLowerCase().includes(query) : false;
          return matchesDate || matchesNote;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
  }, [records, activeFilter, searchQuery]);

  const formatDayDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = String(d).padStart(2, '0');
      return { dayName, dayNum, monthName };
    } catch {
      return { dayName: 'DAY', dayNum: '01', monthName: 'Mon' };
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 pt-2 px-4 sm:px-6 max-w-md mx-auto space-y-3.5">
      {/* 1. Header & Summary Bar */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-xl font-extrabold text-on-surface tracking-tight leading-tight">
              Attendance Log
            </h1>
            <p className="text-xs text-secondary font-medium">
              Historical day-by-day academic sessions
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {records.length} Logs Total
          </span>
        </div>

        {/* Compact Micro Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-surface-card p-2.5 rounded-2xl border border-surface-container-high/60 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
              Current Rate
            </span>
            <span className="text-base font-black text-primary mt-0.5 leading-none">
              {stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : '--%'}
            </span>
          </div>

          <div className="bg-emerald-subtle/80 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">
              Attended
            </span>
            <span className="text-base font-black text-tertiary mt-0.5 leading-none">
              {stats.presentDays} <span className="text-[10px] font-semibold">days</span>
            </span>
          </div>

          <div className="bg-rose-subtle/80 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              Missed
            </span>
            <span className="text-base font-black text-primary mt-0.5 leading-none">
              {stats.absentDays} <span className="text-[10px] font-semibold">days</span>
            </span>
          </div>
        </div>
      </section>

      {/* Top Header Sponsored Placement Ad */}
      <div className="w-full">
        <AdBanner unitId="mobile_320x50" className="w-full shadow-2xs" />
      </div>

      {/* 2. Responsive Filter Controls */}
      <div className="w-full flex items-center justify-between gap-1 p-1 bg-surface-recessed rounded-2xl">
        <button
          onClick={() => setActiveFilter('all')}
          type="button"
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-surface-card text-on-surface shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setActiveFilter('present')}
          type="button"
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'present'
              ? 'bg-emerald-subtle text-tertiary shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Present ({counts.present})
        </button>
        <button
          onClick={() => setActiveFilter('absent')}
          type="button"
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'absent'
              ? 'bg-rose-subtle text-primary shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Absent ({counts.absent})
        </button>
        <button
          onClick={() => setActiveFilter('holiday')}
          type="button"
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'holiday'
              ? 'bg-amber-subtle text-amber-warning shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Off ({counts.holiday})
        </button>
      </div>

      {/* 3. Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-secondary pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by date or remark..."
          className="w-full bg-surface-card text-on-surface text-xs pl-10 pr-9 py-2.5 rounded-2xl border border-surface-container-high/60 placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Mid In-Feed Sponsored Perk Card */}
      <div className="w-full pt-0.5">
        <InFeedAdCard />
      </div>

      {/* 5. Logs Feed List */}
      <div className="flex flex-col gap-2.5 pt-1">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-card rounded-3xl border border-surface-container-high/60 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-subtle text-primary flex items-center justify-center mb-2.5">
              <CalendarX className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">No Attendance Logs</h3>
            <p className="text-xs text-secondary mt-1 max-w-xs">
              {records.length === 0
                ? 'No attendance has been recorded yet.'
                : 'No records match the current filter or search criteria.'}
            </p>
          </div>
        ) : (
          filteredRecords.map((item) => {
            const { dayName, dayNum, monthName } = formatDayDisplay(item.date);
            const isPresent = item.status === 'PRESENT';
            const isAbsent = item.status === 'ABSENT';

            const badgeBg = isPresent
              ? 'bg-emerald-subtle text-tertiary'
              : isAbsent
              ? 'bg-rose-subtle text-primary'
              : 'bg-amber-subtle text-amber-warning';

            const pillBg = isPresent
              ? 'bg-emerald-subtle text-tertiary border-emerald-500/20'
              : isAbsent
              ? 'bg-rose-subtle text-primary border-rose-500/20'
              : 'bg-amber-subtle text-amber-warning border-amber-500/20';

            const dotBg = isPresent ? 'bg-tertiary' : isAbsent ? 'bg-primary' : 'bg-amber-warning';

            const statusLabel = isPresent ? 'Present' : isAbsent ? 'Absent' : 'Off';

            const isPickerOpen = openStatusPickerDate === item.date;
            const hasUserCustomComment = isCustomUserNote(item.note);

            return (
              <div
                key={item.date}
                className="bg-surface-card rounded-2xl p-3.5 border border-surface-container-high/60 shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left Date Node */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl ${badgeBg} flex flex-col items-center justify-center flex-shrink-0 font-bold`}
                    >
                      <span className="text-[9px] uppercase tracking-wider leading-none">
                        {dayName}
                      </span>
                      <span className="text-sm font-black leading-none mt-0.5">{dayNum}</span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {formatFullDisplayDate(item.date)}
                      </span>
                      <span className="text-[11px] text-secondary font-medium">
                        {monthName} {item.date.split('-')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Toggle & Menu */}
                  <div className="relative flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        setOpenStatusPickerDate(isPickerOpen ? null : item.date)
                      }
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border ${pillBg} text-xs font-bold transition-all active:scale-95 cursor-pointer`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />
                      <span>{statusLabel}</span>
                      {isPickerOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-secondary" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                      )}
                    </button>

                    {/* Popover Menu with strictly contained bounds */}
                    {isPickerOpen && (
                      <div className="absolute right-0 top-full mt-1.5 z-40 bg-surface-card rounded-2xl shadow-xl border border-surface-container-high p-1.5 flex flex-col gap-1 min-w-[130px] animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            onMarkDay(item.date, 'PRESENT', item.note);
                            setOpenStatusPickerDate(null);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-emerald-subtle text-left text-xs font-bold text-tertiary cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-tertiary" />
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onMarkDay(item.date, 'ABSENT', item.note);
                            setOpenStatusPickerDate(null);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-rose-subtle text-left text-xs font-bold text-primary cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onMarkDay(item.date, 'HOLIDAY', item.note);
                            setOpenStatusPickerDate(null);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-amber-subtle text-left text-xs font-bold text-amber-warning cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-warning" />
                          Off
                        </button>
                      </div>
                    )}

                    {/* Delete Log Button */}
                    <button
                      onClick={() => onDeleteRecord(item.date)}
                      title="Delete log"
                      type="button"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Only Show Remark IF An Actual Custom User Comment Exists (Never boilerplate) */}
                {hasUserCustomComment && (
                  <div className="mt-2.5 pt-2 border-t border-surface-container-high/60 flex items-center gap-1.5 text-xs text-secondary font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{item.note}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Bottom Sponsored Ad Banner */}
      <div className="w-full pt-1">
        <AdBanner unitId="classic_468x60" className="w-full shadow-2xs" />
      </div>
    </div>
  );
};
