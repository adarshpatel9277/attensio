import React, { useState } from 'react';
import {
  Palmtree,
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Holiday, LeaveRecord, LeaveStatus, Semester } from '../types';

interface LeaveHolidayTabProps {
  activeSemester: Semester | null;
  leaves: LeaveRecord[];
  holidays: Holiday[];
  onSaveLeave: (leave: Omit<LeaveRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteLeave: (id: string) => void;
  onSaveHoliday: (holiday: Omit<Holiday, 'id' | 'createdAt'>) => void;
  onDeleteHoliday: (id: string) => void;
}

export const LeaveHolidayTab: React.FC<LeaveHolidayTabProps> = ({
  activeSemester,
  leaves,
  holidays,
  onSaveLeave,
  onDeleteLeave,
  onSaveHoliday,
  onDeleteHoliday,
}) => {
  const [activeSection, setActiveSection] = useState<'LEAVES' | 'HOLIDAYS'>('LEAVES');

  // Leave form
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveType, setLeaveType] = useState<string>('Medical Leave');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveStatus, setLeaveStatus] = useState<LeaveStatus>('MEDICAL');

  // Holiday form
  const [holidayDate, setHolidayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [holidayTitle, setHolidayTitle] = useState<string>('');
  const [holidayNote, setHolidayNote] = useState<string>('');

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSemester || !leaveReason.trim()) return;

    onSaveLeave({
      semesterId: activeSemester.id,
      dateFrom,
      dateTo,
      leaveType,
      reason: leaveReason.trim(),
      status: leaveStatus,
    });

    setLeaveReason('');
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayTitle.trim()) return;

    onSaveHoliday({
      semesterId: activeSemester?.id,
      date: holidayDate,
      title: holidayTitle.trim(),
      note: holidayNote.trim() || undefined,
    });

    setHolidayTitle('');
    setHolidayNote('');
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#23211E] tracking-tight">
            Leaves & College Holidays
          </h2>
          <p className="text-xs sm:text-sm text-[#7A746E]">
            Track official leaves and institutional vacations that do not penalize your attendance
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F3EFE9] rounded-xl border border-[#E0DBD2]">
          <button
            onClick={() => setActiveSection('LEAVES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'LEAVES'
                ? 'bg-white text-[#23211E] shadow-xs'
                : 'text-[#6A635B] hover:text-[#23211E]'
            }`}
          >
            Leaves ({leaves.length})
          </button>
          <button
            onClick={() => setActiveSection('HOLIDAYS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'HOLIDAYS'
                ? 'bg-white text-[#23211E] shadow-xs'
                : 'text-[#6A635B] hover:text-[#23211E]'
            }`}
          >
            Holidays ({holidays.length})
          </button>
        </div>
      </div>

      {/* LEAVES SECTION */}
      {activeSection === 'LEAVES' && (
        <div className="space-y-6">
          {/* Add Leave Form */}
          <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B] mb-4">
              Record Approved Leave
            </h3>
            <form onSubmit={handleAddLeave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                    Category
                  </label>
                  <select
                    value={leaveStatus}
                    onChange={(e) => setLeaveStatus(e.target.value as LeaveStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5]"
                  >
                    <option value="MEDICAL">Medical / Health</option>
                    <option value="PERSONAL">Personal Reason</option>
                    <option value="COLLEGE_HOLIDAY">College Sanctioned</option>
                    <option value="OTHER">Other Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                  Reason & Details <span className="text-[#C53030]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attending family function / Medical appointment with doctor certificate"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D29]/20"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#D95D29] text-white text-xs font-bold hover:bg-[#C84E1C] transition-colors"
                >
                  Save Leave Entry
                </button>
              </div>
            </form>
          </div>

          {/* Leaves List */}
          <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 shadow-xs">
            <h4 className="text-base font-bold text-[#23211E] mb-3">Logged Leaves</h4>
            {leaves.length === 0 ? (
              <p className="text-xs text-[#7A746E] text-center py-6">
                No leave records added for this semester.
              </p>
            ) : (
              <div className="divide-y divide-[#F0EBE3]">
                {leaves.map((l) => (
                  <div key={l.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#23211E]">
                          {l.reason}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B45309]/10 text-[#B45309]">
                          {l.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#7A746E] font-mono mt-0.5">
                        {l.dateFrom} {l.dateFrom !== l.dateTo ? `→ ${l.dateTo}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this leave entry?')) {
                          onDeleteLeave(l.id);
                        }
                      }}
                      className="p-1.5 text-[#7A746E] hover:text-[#C53030] transition-colors"
                      title="Delete leave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOLIDAYS SECTION */}
      {activeSection === 'HOLIDAYS' && (
        <div className="space-y-6">
          {/* Add Holiday Form */}
          <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B] mb-4">
              Add College Holiday
            </h3>
            <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                  Date <span className="text-[#C53030]">*</span>
                </label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                  Holiday Name <span className="text-[#C53030]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Founder's Day / Diwali Vacation"
                  value={holidayTitle}
                  onChange={(e) => setHolidayTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#D95D29] text-white text-xs font-bold hover:bg-[#C84E1C] transition-colors"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>

          {/* Holidays List */}
          <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 shadow-xs">
            <h4 className="text-base font-bold text-[#23211E] mb-3">Institutional Holidays</h4>
            {holidays.length === 0 ? (
              <p className="text-xs text-[#7A746E] text-center py-6">
                No holidays recorded.
              </p>
            ) : (
              <div className="divide-y divide-[#F0EBE3]">
                {holidays.map((h) => (
                  <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#23211E] block">
                        {h.title}
                      </span>
                      <span className="text-xs text-[#7A746E] font-mono">{h.date}</span>
                      {h.note && <span className="text-xs text-[#8C847B] ml-2">({h.note})</span>}
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete holiday "${h.title}"?`)) {
                          onDeleteHoliday(h.id);
                        }
                      }}
                      className="p-1.5 text-[#7A746E] hover:text-[#C53030] transition-colors"
                      title="Delete holiday"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
