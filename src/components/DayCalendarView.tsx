import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Calendar as CalendarIcon,
  Palmtree,
  CalendarRange,
  FileText,
  Edit3,
} from 'lucide-react';
import { DayRecord, DayStatus } from '../types';

interface DayCalendarViewProps {
  records: DayRecord[];
  todayStr: string;
  saturdayOff?: boolean;
  sundayOff?: boolean;
  onMarkDay: (date: string, status: DayStatus, note?: string, isSpecialClass?: boolean) => void;
  onClearDay: (date: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DayCalendarView: React.FC<DayCalendarViewProps> = ({
  records,
  todayStr,
  saturdayOff = true,
  sundayOff = true,
  onMarkDay,
  onClearDay,
}) => {
  const initialDate = new Date(todayStr + 'T00:00:00');
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  // Month & Year picker modal state
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  // Active selected date for quick action modal/popover
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Selected date note state
  const [showDateNoteInput, setShowDateNoteInput] = useState(false);
  const [dateNoteText, setDateNoteText] = useState('');

  // Register with global calendar subviews closer for Android back button
  useEffect(() => {
    (window as any)._calendarCloseActiveSubview = () => {
      if (showMonthYearPicker) {
        setShowMonthYearPicker(false);
        return true;
      }
      if (selectedDate) {
        setSelectedDate(null);
        setShowDateNoteInput(false);
        return true;
      }
      return false;
    };
    return () => {
      delete (window as any)._calendarCloseActiveSubview;
    };
  }, [showMonthYearPicker, selectedDate]);

  // Sync note text when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const rec = records.find((r) => r.date === selectedDate);
      setDateNoteText(rec?.note || '');
      setShowDateNoteInput(false);
    }
  }, [selectedDate, records]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const d = new Date(todayStr + 'T00:00:00');
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDate(todayStr);
  };

  // Map of records for quick lookup by date 'YYYY-MM-DD'
  const recordMap = new Map<string, DayRecord>();
  records.forEach((r) => recordMap.set(r.date, r));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
  const startingDayIndex = (firstDayOfMonth + 6) % 7; // Monday = 0, Sunday = 6

  // Check if a day of week is configured as weekend off
  const isWeekendDay = (dayOfWeek: number) => {
    if (dayOfWeek === 6) return saturdayOff;
    if (dayOfWeek === 0) return sundayOff;
    return false;
  };

  // Month stats calculation
  let monthPresent = 0;
  let monthAbsent = 0;
  let monthHolidays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const padDay = String(day).padStart(2, '0');
    const padMonth = String(currentMonth + 1).padStart(2, '0');
    const dateKey = `${currentYear}-${padMonth}-${padDay}`;
    const rec = recordMap.get(dateKey);
    if (rec?.status === 'PRESENT') monthPresent++;
    else if (rec?.status === 'ABSENT') monthAbsent++;
    else if (rec?.status === 'HOLIDAY') monthHolidays++;
  }
  const monthTotal = monthPresent + monthAbsent;
  const monthPercent =
    monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 1000) / 10 : null;

  const daysOfWeek = [
    { en: 'Mon', isWeekend: false },
    { en: 'Tue', isWeekend: false },
    { en: 'Wed', isWeekend: false },
    { en: 'Thu', isWeekend: false },
    { en: 'Fri', isWeekend: false },
    { en: 'Sat', isWeekend: saturdayOff },
    { en: 'Sun', isWeekend: sundayOff },
  ];

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const isSelectedDateWeekend = selectedDateObj
    ? isWeekendDay(selectedDateObj.getDay())
    : false;
  const currentSelectedRecord = selectedDate ? recordMap.get(selectedDate) : null;

  const handleSaveDateNote = () => {
    if (!selectedDate) return;
    const currentStatus = currentSelectedRecord?.status || 'PRESENT';
    onMarkDay(selectedDate, currentStatus, dateNoteText.trim() || undefined, isSelectedDateWeekend);
    setShowDateNoteInput(false);
  };

  return (
    <div
      id="day-calendar-view"
      className="bg-white/95 rounded-3xl p-3.5 sm:p-5 shadow-xl shadow-pink-500/5 border border-pink-100/70 backdrop-blur-md"
    >
      {/* Calendar Header with Clickable Month/Year Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-[#F5F9FC]">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-[#FF4F81] uppercase">
            <div className="w-5 h-5 rounded-md bg-pink-50 text-[#FF4F81] flex items-center justify-center">
              <CalendarIcon className="w-3 h-3 text-[#FF4F81]" />
            </div>
            <span>Monthly Attendance Grid</span>
          </div>

          <button
            onClick={() => setShowMonthYearPicker(true)}
            className="group flex items-center gap-2 text-left mt-1 cursor-pointer"
            title="Click to jump to any Month or Year"
          >
            <h2 className="text-lg sm:text-2xl font-black text-[#292929] group-hover:text-[#FF4F81] transition-colors">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-pink-50 text-[#FF4F81] border border-pink-100 group-hover:bg-[#FF4F81] group-hover:text-white transition-all flex items-center gap-1 shadow-2xs">
              <CalendarRange className="w-3 h-3" />
              <span>Change</span>
            </span>
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={goToToday}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#F5F9FC] hover:bg-pink-50 text-[#292929] hover:text-[#FF4F81] rounded-xl border border-pink-200 transition-all cursor-pointer shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center border border-pink-200 rounded-xl overflow-hidden bg-[#F5F9FC] shadow-2xs">
            <button
              onClick={prevMonth}
              aria-label="Previous Month"
              className="p-2 text-[#292929] hover:text-[#FF4F81] hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-pink-200" />
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="p-2 text-[#292929] hover:text-[#FF4F81] hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="my-2.5 sm:my-3 py-2 px-3 bg-gradient-to-r from-pink-50/50 via-[#F5F9FC] to-pink-50/20 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-pink-100/70 text-xs">
        <div className="flex items-center gap-3 sm:gap-4 text-[#292929]/80 font-medium">
          <span>
            Present: <strong className="text-[#FF4F81] font-bold">{monthPresent}</strong>
          </span>
          <span>
            Absent: <strong className="text-[#292929] font-bold">{monthAbsent}</strong>
          </span>
          {monthHolidays > 0 && (
            <span>
              Off Days: <strong className="text-[#FB7185] font-bold">{monthHolidays}</strong>
            </span>
          )}
          <span>
            Total Classes: <strong className="text-[#292929] font-bold">{monthTotal}</strong>
          </span>
        </div>
        <div className="text-[#292929] font-semibold">
          Monthly Attendance:{' '}
          <strong className="font-black text-[#FF4F81] font-['JetBrains_Mono']">
            {monthPercent !== null ? `${monthPercent}%` : '—'}
          </strong>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-[#292929]/70">
        {daysOfWeek.map((day) => (
          <div
            key={day.en}
            className={`py-1.5 rounded-xl ${
              day.isWeekend
                ? 'text-[#FB7185] bg-[#FB7185]/10 font-black'
                : 'text-[#292929]'
            }`}
          >
            <span>{day.en}</span>
            {day.isWeekend && <span className="hidden sm:inline text-[10px] ml-1">Off</span>}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Empty slots before the 1st day */}
        {Array.from({ length: startingDayIndex }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="h-16 sm:h-20 rounded-2xl bg-transparent border border-transparent opacity-0"
          />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNumber = idx + 1;
          const padDay = String(dayNumber).padStart(2, '0');
          const padMonth = String(currentMonth + 1).padStart(2, '0');
          const dateStr = `${currentYear}-${padMonth}-${padDay}`;

          const dateObj = new Date(currentYear, currentMonth, dayNumber);
          const dayOfWeek = dateObj.getDay();
          const isWeekend = isWeekendDay(dayOfWeek);

          const record = recordMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;

          // Status colors
          let statusStyle = 'bg-white hover:bg-pink-50/50 border-slate-200/70 text-[#292929]';
          if (record?.status === 'PRESENT') {
            statusStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold';
          } else if (record?.status === 'ABSENT') {
            statusStyle = 'bg-rose-50/80 border-rose-300 text-rose-950 font-bold';
          } else if (record?.status === 'HOLIDAY') {
            statusStyle = 'bg-amber-50/80 border-amber-300 text-amber-950';
          } else if (isWeekend) {
            statusStyle = 'bg-slate-50/60 border-slate-200/50 text-[#292929]/50';
          }

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`relative h-16 sm:h-20 rounded-2xl p-1.5 sm:p-2 border text-left flex flex-col justify-between transition-all cursor-pointer ${statusStyle} ${
                isSelected
                  ? 'ring-2 ring-[#FF4F81] ring-offset-2 scale-[1.03] z-10 shadow-md'
                  : 'hover:border-pink-300'
              } ${isToday ? 'ring-2 ring-[#FF4F81]/60' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-black ${
                    isToday
                      ? 'w-6 h-6 rounded-full bg-[#FF4F81] text-white flex items-center justify-center -ml-0.5 -mt-0.5 shadow-2xs'
                      : ''
                  }`}
                >
                  {dayNumber}
                </span>

                {/* Status Dot / Icon */}
                {record?.status === 'PRESENT' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                )}
                {record?.status === 'ABSENT' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                )}
                {record?.status === 'HOLIDAY' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                )}
              </div>

              {/* Status pill & note badge */}
              <div className="w-full">
                {record ? (
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase font-black tracking-tight ${
                        record.status === 'PRESENT'
                          ? 'text-emerald-700'
                          : record.status === 'ABSENT'
                          ? 'text-rose-700'
                          : 'text-amber-800'
                      }`}
                    >
                      {record.status === 'PRESENT'
                        ? 'P'
                        : record.status === 'ABSENT'
                        ? 'A'
                        : 'Off'}
                    </span>
                    {record.note && (
                      <span className="text-[9px] text-[#FF4F81] font-bold" title={record.note}>
                        📝
                      </span>
                    )}
                  </div>
                ) : isWeekend ? (
                  <span className="text-[9px] text-[#292929]/40 font-medium">Off</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Action Drawer / Panel */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-gradient-to-br from-pink-50/70 via-white to-pink-50/30 rounded-2xl border border-pink-200/90 shadow-md animate-in slide-in-from-top-2 duration-150 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-pink-100">
            <div>
              <div className="text-[11px] font-black text-[#FF4F81] uppercase tracking-wider">
                Selected Date Roll Call
              </div>
              <div className="text-sm sm:text-base font-black text-[#292929] mt-0.5">
                {selectedDateObj?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Status:</span>
              {currentSelectedRecord ? (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                    currentSelectedRecord.status === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : currentSelectedRecord.status === 'ABSENT'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {currentSelectedRecord.status === 'PRESENT' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  {currentSelectedRecord.status === 'ABSENT' && <X className="w-3.5 h-3.5 text-rose-600" />}
                  {currentSelectedRecord.status === 'HOLIDAY' && <Palmtree className="w-3.5 h-3.5 text-amber-700" />}
                  <span>
                    {currentSelectedRecord.status === 'PRESENT'
                      ? 'Present'
                      : currentSelectedRecord.status === 'ABSENT'
                      ? 'Absent'
                      : 'College Off'}
                  </span>
                </span>
              ) : isSelectedDateWeekend ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-zinc-600 border border-slate-200">
                  Weekend Off
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-zinc-400 border border-slate-200 italic">
                  Not Recorded Yet
                </span>
              )}
            </div>
          </div>

          {/* Notes display & editor: User explicitly asked where to see notes! */}
          <div className="p-3 bg-white rounded-xl border border-pink-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FF4F81]" />
                <span>Note / Reason for this day:</span>
              </span>
              <button
                onClick={() => setShowDateNoteInput(!showDateNoteInput)}
                className="text-[#FF4F81] font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{currentSelectedRecord?.note ? (showDateNoteInput ? 'Cancel' : 'Edit Note') : (showDateNoteInput ? 'Cancel' : '+ Add Note')}</span>
              </button>
            </div>

            {currentSelectedRecord?.note && !showDateNoteInput && (
              <p className="p-2 rounded-lg bg-pink-50/50 text-zinc-800 italic border border-pink-100/60 font-medium">
                &ldquo;{currentSelectedRecord.note}&rdquo;
              </p>
            )}

            {!currentSelectedRecord?.note && !showDateNoteInput && (
              <p className="text-zinc-400 text-[11px] italic">
                No note recorded for this date. Click &ldquo;+ Add Note&rdquo; to add a reason (e.g. sick leave, lab).
              </p>
            )}

            {showDateNoteInput && (
              <div className="flex gap-2 pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={dateNoteText}
                  onChange={(e) => setDateNoteText(e.target.value)}
                  placeholder="e.g. Sick leave, College fest, Exam, Personal reason..."
                  className="flex-1 rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-[#FF4F81] focus:outline-hidden"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveDateNote()}
                />
                <button
                  onClick={handleSaveDateNote}
                  className="rounded-xl bg-gradient-to-r from-[#FF4F81] to-[#FB7185] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer hover:opacity-95"
                >
                  Save Note
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Present, Absent, College Off, Clear, and Done */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mark Present */}
              <button
                onClick={() => {
                  onMarkDay(selectedDate, 'PRESENT', dateNoteText.trim() || undefined, isSelectedDateWeekend);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSelectedRecord?.status === 'PRESENT'
                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Present</span>
              </button>

              {/* Mark Absent */}
              <button
                onClick={() => {
                  onMarkDay(selectedDate, 'ABSENT', dateNoteText.trim() || undefined, isSelectedDateWeekend);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSelectedRecord?.status === 'ABSENT'
                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                    : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                }`}
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>Absent</span>
              </button>

              {/* Mark College Off */}
              <button
                onClick={() => {
                  onMarkDay(selectedDate, 'HOLIDAY', dateNoteText.trim() || 'College Off', false);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSelectedRecord?.status === 'HOLIDAY'
                    ? 'bg-amber-600 text-white shadow-xs scale-105'
                    : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <Palmtree className="w-4 h-4 stroke-[2.5]" />
                <span>College Off</span>
              </button>
            </div>

            {/* Clear & Done Buttons */}
            <div className="flex items-center gap-2">
              {currentSelectedRecord && (
                <button
                  onClick={() => onClearDay(selectedDate)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="Remove record for this date"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedDate(null);
                  setShowDateNoteInput(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month & Year Picker Modal (Clean 3x4 Layout with Year Stepper) */}
      {showMonthYearPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowMonthYearPicker(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-pink-100 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-[#FF4F81]" />
                <h3 className="font-black text-base text-[#292929]">
                  Select Month &amp; Year
                </h3>
              </div>
              <button
                onClick={() => setShowMonthYearPicker(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Year Selector with Stepper & Chips */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-[#FF4F81] uppercase tracking-wider">
                Year
              </label>

              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setCurrentYear((y) => y - 1)}
                  className="p-2 rounded-xl bg-white hover:bg-pink-50 text-zinc-700 hover:text-[#FF4F81] shadow-2xs border border-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-black text-base text-zinc-900 font-['JetBrains_Mono']">
                  {currentYear}
                </span>
                <button
                  onClick={() => setCurrentYear((y) => y + 1)}
                  className="p-2 rounded-xl bg-white hover:bg-pink-50 text-zinc-700 hover:text-[#FF4F81] shadow-2xs border border-slate-200 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Year Chips */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <button
                    key={y}
                    onClick={() => setCurrentYear(y)}
                    className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentYear === y
                        ? 'bg-[#FF4F81] text-white shadow-2xs'
                        : 'bg-slate-100 text-zinc-600 hover:bg-pink-50 hover:text-[#FF4F81]'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Months 3x4 Grid with Short + Full Name */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-[#FF4F81] uppercase tracking-wider">
                Month
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((m, idx) => {
                  const isCurrent = currentMonth === idx;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setCurrentMonth(idx);
                        setShowMonthYearPicker(false);
                      }}
                      className={`py-2.5 px-2 rounded-2xl text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-br from-[#FF4F81] to-[#FF2E63] text-white shadow-md shadow-pink-500/25 ring-2 ring-[#FF4F81]/40'
                          : 'bg-slate-50 hover:bg-pink-50/70 text-zinc-700 border border-slate-200/80 hover:border-pink-200'
                      }`}
                    >
                      <span className="block text-xs font-black">{SHORT_MONTHS[idx]}</span>
                      <span
                        className={`block text-[10px] truncate ${
                          isCurrent ? 'text-pink-100 font-semibold' : 'text-zinc-400 font-normal'
                        }`}
                      >
                        {m}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
