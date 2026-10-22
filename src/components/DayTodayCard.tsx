import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  Check,
  Palmtree,
  Sparkles,
  Edit3,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { DayRecord, DayStatus, DayAppSettings } from '../types';

interface DayTodayCardProps {
  todayStr: string;
  todayRecord: DayRecord | undefined;
  settings: DayAppSettings;
  onUpdateSettings: (newSettings: DayAppSettings) => void;
  onMarkToday: (status: DayStatus, note?: string, isSpecialClass?: boolean) => void;
  onClearToday: () => void;
}

export const DayTodayCard: React.FC<DayTodayCardProps> = ({
  todayStr,
  todayRecord,
  settings,
  onMarkToday,
  onClearToday,
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [noteText, setNoteText] = useState(todayRecord?.note || '');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isWeekendSpecialClass, setIsWeekendSpecialClass] = useState(false);

  // Format today nicely
  const todayDateObj = new Date(todayStr + 'T00:00:00');
  const dayOfWeekNumber = todayDateObj.getDay(); // 0 is Sun, 6 is Sat
  const isWeekend = dayOfWeekNumber === 0 || dayOfWeekNumber === 6;
  const dayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = todayDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isMarked = !!todayRecord;
  const status = todayRecord?.status;

  const handleSelectStatus = (newStatus: DayStatus) => {
    onMarkToday(newStatus, noteText.trim() || undefined, isWeekendSpecialClass);
    setIsEditingStatus(false);
  };

  const handleSaveNote = () => {
    if (status) {
      onMarkToday(status, noteText.trim() || undefined, isWeekendSpecialClass);
    }
    setShowNoteInput(false);
  };

  return (
    <div
      id="today-attendance-card"
      className="relative overflow-hidden rounded-3xl bg-white/95 p-4 sm:p-6 shadow-xl shadow-pink-500/5 border border-pink-100/70 backdrop-blur-md transition-all space-y-3.5 sm:space-y-4"
    >
      {/* Decorative gradient glow orb in corner */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-pink-300/20 to-[#FF4F81]/10 blur-2xl" />

      {/* Top Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF4F81] to-[#FB7185] text-white shadow-md shadow-pink-500/25">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF4F81]">
                Today&apos;s Roll Call
              </span>
              {isWeekend && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                  Weekend
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-lg font-black text-zinc-900 tracking-tight leading-tight mt-0.5">
              {dayName}, {formattedDate}
            </h2>
          </div>
        </div>

        {/* Current status mini pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isMarked ? (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                status === 'PRESENT'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : status === 'ABSENT'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {status === 'PRESENT' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              {status === 'ABSENT' && <XCircle className="h-3.5 w-3.5 text-rose-600" />}
              {status === 'HOLIDAY' && <Palmtree className="h-3.5 w-3.5 text-amber-700" />}
              <span>
                {status === 'PRESENT'
                  ? 'Present'
                  : status === 'ABSENT'
                  ? 'Absent'
                  : 'College Off'}
              </span>
            </div>
          ) : isWeekend ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100/80 text-zinc-600 border border-slate-200">
              <Palmtree className="h-3.5 w-3.5 text-amber-600" />
              <span>Weekend Rest</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#FF4F81] border border-pink-200 shadow-2xs animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tap to Mark Today</span>
            </div>
          )}
        </div>
      </div>

      {/* BODY: IF ALREADY MARKED AND NOT EDITING -> COLLAPSE OPTIONS & SHOW CLEAN HERO STATUS */}
      {isMarked && !isEditingStatus ? (
        <div className="rounded-2xl p-4 sm:p-5 border transition-all animate-in fade-in duration-200 bg-gradient-to-br from-slate-50/60 to-white border-pink-100/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm ${
                  status === 'PRESENT'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                    : status === 'ABSENT'
                    ? 'bg-rose-500 text-white shadow-rose-500/25'
                    : 'bg-amber-500 text-white shadow-amber-500/25'
                }`}
              >
                {status === 'PRESENT' && <Check className="h-6 w-6 stroke-[3]" />}
                {status === 'ABSENT' && <XCircle className="h-6 w-6 stroke-[2.5]" />}
                {status === 'HOLIDAY' && <Palmtree className="h-6 w-6 stroke-[2.5]" />}
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Recorded Today
                </div>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 mt-0.5">
                  {status === 'PRESENT' && 'You are Marked Present! 🎉'}
                  {status === 'ABSENT' && 'Marked as Absent today'}
                  {status === 'HOLIDAY' && 'Marked as College Off'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {status === 'PRESENT' && 'Great job! Regular attendance keeps your streak strong.'}
                  {status === 'ABSENT' && 'Missed class recorded. Check your forecast below.'}
                  {status === 'HOLIDAY' && 'College off day (excluded from attendance total).'}
                </p>
              </div>
            </div>

            {/* Change Status Action Button (Un-collapses Absent and College Off) */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => setIsEditingStatus(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-zinc-700 hover:text-[#FF4F81] font-bold text-xs border border-slate-200 hover:border-pink-200 transition-all shadow-2xs cursor-pointer"
                title="Change today's status"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF4F81]" />
                <span>Change Status</span>
              </button>

              <button
                onClick={onClearToday}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer"
                title="Clear today's attendance"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Note preview or add note */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            {todayRecord?.note ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-pink-50/60 px-3 py-1.5 text-zinc-700 border border-pink-100 text-xs">
                <span className="font-semibold text-[#FF4F81]">Note / Reason:</span>
                <span className="italic">{todayRecord.note}</span>
                <button
                  onClick={() => {
                    setNoteText(todayRecord.note || '');
                    setShowNoteInput(true);
                  }}
                  className="text-pink-600 hover:text-pink-700 font-bold ml-1 cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#FF4F81] cursor-pointer transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#FF4F81]" />
                <span>{showNoteInput ? 'Cancel note' : '+ Add a note / reason (Lab, leave, etc.)'}</span>
              </button>
            )}

            {isWeekend && (
              <label className="inline-flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={isWeekendSpecialClass}
                  onChange={(e) => {
                    setIsWeekendSpecialClass(e.target.checked);
                    if (status) {
                      onMarkToday(status, todayRecord?.note, e.target.checked);
                    }
                  }}
                  className="rounded accent-[#FF4F81] h-3.5 w-3.5"
                />
                <span>Special Weekend Class</span>
              </label>
            )}
          </div>
        </div>
      ) : (
        /* BODY: NOT MARKED OR CURRENTLY EDITING -> SHOW TACTILE 3 ACTION BUTTONS */
        <div className="space-y-3 animate-in fade-in duration-200">
          {isEditingStatus && (
            <div className="flex items-center justify-between text-xs text-zinc-500 pb-1">
              <span className="font-bold text-zinc-700">Select new status for today:</span>
              <button
                onClick={() => setIsEditingStatus(false)}
                className="text-pink-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Cancel / Keep Current</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Present Button */}
            <button
              id="mark-present-btn"
              onClick={() => handleSelectStatus('PRESENT')}
              className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer ${
                status === 'PRESENT'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400 scale-[1.01]'
                  : 'bg-white hover:bg-emerald-50/50 text-zinc-800 border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                      status === 'PRESENT'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100/80 text-emerald-600 group-hover:scale-110'
                    }`}
                  >
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight leading-tight">
                      Present
                    </div>
                    <div
                      className={`text-[11px] font-medium leading-tight mt-0.5 ${
                        status === 'PRESENT' ? 'text-emerald-100' : 'text-zinc-500'
                      }`}
                    >
                      Attended class
                    </div>
                  </div>
                </div>
                {status === 'PRESENT' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 text-[10px] font-black">
                    ✓
                  </span>
                )}
              </div>
            </button>

            {/* Absent Button */}
            <button
              id="mark-absent-btn"
              onClick={() => handleSelectStatus('ABSENT')}
              className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer ${
                status === 'ABSENT'
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 ring-2 ring-rose-400 scale-[1.01]'
                  : 'bg-white hover:bg-rose-50/50 text-zinc-800 border border-slate-100 hover:border-rose-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                      status === 'ABSENT'
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100/80 text-rose-600 group-hover:scale-110'
                    }`}
                  >
                    <XCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight leading-tight">
                      Absent
                    </div>
                    <div
                      className={`text-[11px] font-medium leading-tight mt-0.5 ${
                        status === 'ABSENT' ? 'text-rose-100' : 'text-zinc-500'
                      }`}
                    >
                      Missed / on leave
                    </div>
                  </div>
                </div>
                {status === 'ABSENT' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-rose-600 text-[10px] font-black">
                    ✓
                  </span>
                )}
              </div>
            </button>

            {/* College Off Button */}
            <button
              id="mark-holiday-btn"
              onClick={() => handleSelectStatus('HOLIDAY')}
              className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer ${
                status === 'HOLIDAY'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 ring-2 ring-amber-300 scale-[1.01]'
                  : 'bg-white hover:bg-amber-50/50 text-zinc-800 border border-slate-100 hover:border-amber-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                      status === 'HOLIDAY'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100/80 text-amber-600 group-hover:scale-110'
                    }`}
                  >
                    <Palmtree className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight leading-tight">
                      College Off
                    </div>
                    <div
                      className={`text-[11px] font-medium leading-tight mt-0.5 ${
                        status === 'HOLIDAY' ? 'text-amber-100' : 'text-zinc-500'
                      }`}
                    >
                      Holiday / Sunday
                    </div>
                  </div>
                </div>
                {status === 'HOLIDAY' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-600 text-[10px] font-black">
                    ✓
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Add a note row when unrecorded */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#FF4F81] cursor-pointer transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-[#FF4F81]" />
              <span>{showNoteInput ? 'Cancel note' : '+ Add a note / reason'}</span>
            </button>

            {isWeekend && (
              <label className="inline-flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={isWeekendSpecialClass}
                  onChange={(e) => setIsWeekendSpecialClass(e.target.checked)}
                  className="rounded accent-[#FF4F81] h-3.5 w-3.5"
                />
                <span>Special Weekend Class</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Note Editor Drawer / Input */}
      {showNoteInput && (
        <div className="flex gap-2 pt-1 animate-in fade-in duration-150">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Lab exam, Sick leave, College fest..."
            className="flex-1 rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:border-[#FF4F81] focus:outline-hidden shadow-2xs"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
          />
          <button
            onClick={handleSaveNote}
            className="rounded-xl bg-gradient-to-r from-[#FF4F81] to-[#FB7185] px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
          >
            Save Note
          </button>
        </div>
      )}
    </div>
  );
};
