import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  MinusCircle,
  Clock,
  Trash2,
  Plus,
  Info,
} from 'lucide-react';
import { AttendanceRecord, Holiday, Semester, Subject } from '../types';

interface CalendarTabProps {
  activeSemester: Semester | null;
  subjects: Subject[];
  records: AttendanceRecord[];
  holidays: Holiday[];
  onQuickMarkDate: (subjectId: string, date: string, status: 'PRESENT' | 'ABSENT') => void;
  onDeleteRecord: (id: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  activeSemester,
  subjects,
  records,
  holidays,
  onQuickMarkDate,
  onDeleteRecord,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  // Year and month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group records by date
  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    for (const r of records) {
      if (filterSubjectId !== 'ALL' && r.subjectId !== filterSubjectId) continue;
      const list = map.get(r.date) || [];
      list.push(r);
      map.set(r.date, list);
    }
    return map;
  }, [records, filterSubjectId]);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    for (const h of holidays) {
      const list = map.get(h.date) || [];
      list.push(h);
      map.set(h.date, list);
    }
    return map;
  }, [holidays]);

  // Selected date records
  const selectedRecords = recordsByDate.get(selectedDateStr) || [];
  const selectedHolidays = holidaysByDate.get(selectedDateStr) || [];

  return (
    <div className="space-y-6">
      {/* Calendar Container */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE4DC] text-[#23211E] border border-[#D4CEBF] transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base sm:text-lg font-bold text-[#23211E] tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE4DC] text-[#23211E] border border-[#D4CEBF] transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDateStr(now.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F3EFE9] text-[#4A453F] hover:bg-[#ECE6DE]"
            >
              Today
            </button>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A746E]">Filter:</span>
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D4CEBF] text-xs bg-[#FAF8F5]"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-semibold text-[#8C847B]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 bg-[#FAF8F5]/50 rounded-xl" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDateStr === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayRecords = recordsByDate.get(dateStr) || [];
            const dayHolidays = holidaysByDate.get(dateStr) || [];

            const hasPresent = dayRecords.some((r) => r.status === 'PRESENT');
            const hasAbsent = dayRecords.some((r) => r.status === 'ABSENT');
            const hasLeave = dayRecords.some((r) => r.status === 'LEAVE');

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-16 sm:h-20 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#D95D29] bg-[#FFF8F5] shadow-xs'
                    : isToday
                    ? 'border-[#23211E] bg-white'
                    : 'border-[#EBE6DE] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold font-mono ${
                      isSelected
                        ? 'text-[#D95D29]'
                        : isToday
                        ? 'text-[#23211E] font-bold'
                        : 'text-[#4A453F]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayHolidays.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" title="Holiday" />
                  )}
                </div>

                {/* Status indicator dots */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {dayRecords.slice(0, 4).map((r) => (
                    <span
                      key={r.id}
                      className={`w-2 h-2 rounded-full ${
                        r.status === 'PRESENT'
                          ? 'bg-[#1E7F4D]'
                          : r.status === 'ABSENT'
                          ? 'bg-[#C53030]'
                          : r.status === 'LEAVE'
                          ? 'bg-[#B45309]'
                          : r.status === 'CANCELLED'
                          ? 'bg-[#6B7280]'
                          : 'bg-[#3B82F6]'
                      }`}
                      title={`${subjectMap.get(r.subjectId)?.subjectName || 'Class'}: ${r.status}`}
                    />
                  ))}
                  {dayRecords.length > 4 && (
                    <span className="text-[9px] font-mono text-[#7A746E]">
                      +{dayRecords.length - 4}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-3 border-t border-[#F0EBE3] flex flex-wrap items-center justify-center gap-4 text-xs text-[#7A746E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E7F4D]" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C53030]" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Date Inspection Panel */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#D95D29]" />
            <h4 className="text-sm sm:text-base font-bold text-[#23211E]">
              Classes for {selectedDateStr}
            </h4>
          </div>
          <span className="text-xs text-[#7A746E]">
            {selectedRecords.length} record{selectedRecords.length === 1 ? '' : 's'}
          </span>
        </div>

        {selectedHolidays.length > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF]">
            <strong>Holiday: </strong>
            {selectedHolidays.map((h) => h.title).join(', ')}
          </div>
        )}

        {selectedRecords.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#7A746E]">
            No attendance records logged for this date.
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE3]">
            {selectedRecords.map((r) => {
              const sub = subjectMap.get(r.subjectId);
              return (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-6 rounded-full"
                      style={{ backgroundColor: sub?.colorToken || '#D95D29' }}
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#23211E]">
                        {sub?.subjectName || 'Subject'}
                      </span>
                      {r.classStartTime && (
                        <div className="text-[11px] text-[#7A746E]">
                          {r.classStartTime} - {r.classEndTime || ''}
                        </div>
                      )}
                      {r.note && <div className="text-[11px] text-[#7A746E] italic">"{r.note}"</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {r.status === 'PRESENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E7F4D]/10 text-[#1E7F4D]">
                        Present
                      </span>
                    )}
                    {r.status === 'ABSENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C53030]/10 text-[#C53030]">
                        Absent
                      </span>
                    )}
                    {r.status === 'LEAVE' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B45309]/10 text-[#B45309]">
                        Leave
                      </span>
                    )}
                    {r.status === 'CANCELLED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6B7280]/10 text-[#6B7280]">
                        Cancelled
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this record?')) {
                          onDeleteRecord(r.id);
                        }
                      }}
                      className="p-1 text-[#7A746E] hover:text-[#C53030] transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Add for Selected Date */}
        {subjects.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#F0EBE3] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#7A746E]">Quick add for this date:</span>
            {subjects.slice(0, 3).map((sub) => (
              <div key={sub.id} className="flex items-center gap-1">
                <button
                  onClick={() => onQuickMarkDate(sub.id, selectedDateStr, 'PRESENT')}
                  className="px-2 py-1 rounded-lg bg-[#1E7F4D]/10 hover:bg-[#1E7F4D]/20 text-[#1E7F4D] text-[11px] font-semibold"
                  title={`Mark Present for ${sub.subjectName}`}
                >
                  +{sub.subjectCode || sub.subjectName.substring(0, 8)} Present
                </button>
                <button
                  onClick={() => onQuickMarkDate(sub.id, selectedDateStr, 'ABSENT')}
                  className="px-2 py-1 rounded-lg bg-[#C53030]/10 hover:bg-[#C53030]/20 text-[#C53030] text-[11px] font-semibold"
                  title={`Mark Absent for ${sub.subjectName}`}
                >
                  - Absent
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
