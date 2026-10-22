import React, { useState } from 'react';
import {
  ListFilter,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowUpDown,
  Calendar,
  Search,
  Palmtree,
} from 'lucide-react';
import { DayRecord, DayStatus } from '../types';

interface DayHistoryListProps {
  records: DayRecord[];
  onMarkDay: (date: string, status: DayStatus, note?: string) => void;
  onDeleteDay: (date: string) => void;
}

export const DayHistoryList: React.FC<DayHistoryListProps> = ({
  records,
  onMarkDay,
  onDeleteDay,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'HOLIDAY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const holidayCount = records.filter((r) => r.status === 'HOLIDAY').length;

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (filter === 'PRESENT' && r.status !== 'PRESENT') return false;
    if (filter === 'ABSENT' && r.status !== 'ABSENT') return false;
    if (filter === 'HOLIDAY' && r.status !== 'HOLIDAY') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const dateMatch = r.date.toLowerCase().includes(q);
      const noteMatch = r.note?.toLowerCase().includes(q);
      return dateMatch || noteMatch;
    }
    return true;
  });

  const cycleStatus = (current: DayStatus): DayStatus => {
    if (current === 'PRESENT') return 'ABSENT';
    if (current === 'ABSENT') return 'HOLIDAY';
    return 'PRESENT';
  };

  return (
    <div
      id="day-history-list"
      className="bg-white/95 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm border border-pink-100/70 backdrop-blur-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-[#F5F9FC]">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#FB7185] uppercase">
            <div className="w-5 h-5 rounded-md bg-pink-50 text-[#FF4F81] flex items-center justify-center">
              <ListFilter className="w-3 h-3 text-[#FF4F81]" />
            </div>
            <span>Attendance Log</span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#292929] mt-0.5 font-['Plus_Jakarta_Sans']">
            Daily Attendance Records ({records.length})
          </h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-2.5 sm:my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Filter Pills - Single Line */}
        <div className="flex items-center gap-1 bg-[#F5F9FC] p-1 rounded-xl border border-pink-100/80 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'ALL'
                ? 'bg-[#FF4F81] text-white shadow-2xs'
                : 'text-[#292929]/70 hover:text-[#292929]'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setFilter('PRESENT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'PRESENT'
                ? 'bg-[#FF4F81] text-white shadow-2xs'
                : 'text-[#FF4F81] hover:bg-[#FF4F81]/10'
            }`}
          >
            Present ({presentCount})
          </button>
          <button
            onClick={() => setFilter('ABSENT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'ABSENT'
                ? 'bg-[#292929] text-white shadow-2xs'
                : 'text-[#292929] hover:bg-[#292929]/5'
            }`}
          >
            Absent ({absentCount})
          </button>
          {holidayCount > 0 && (
            <button
              onClick={() => setFilter('HOLIDAY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filter === 'HOLIDAY'
                  ? 'bg-[#FB7185] text-white shadow-2xs'
                  : 'text-[#FB7185] hover:bg-[#FB7185]/10'
              }`}
            >
              College Off ({holidayCount})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative sm:w-60">
          <Search className="w-3.5 h-3.5 text-[#FB7185] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F9FC] border border-pink-100 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#292929] placeholder-[#292929]/40 focus:outline-none focus:ring-2 focus:ring-[#FF4F81]"
          />
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="py-12 text-center text-[#292929]/60">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-[#FB7185]/40" />
          <p className="text-sm font-semibold">No attendance records found</p>
          <p className="text-xs text-[#292929]/50 mt-0.5">
            {records.length === 0
              ? 'Mark attendance for today or add past dates above.'
              : 'Try changing your filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F5F9FC]">
          {filteredRecords.map((record) => {
            const isPresent = record.status === 'PRESENT';
            const isAbsent = record.status === 'ABSENT';
            const isHoliday = record.status === 'HOLIDAY';

            const dateObj = new Date(record.date + 'T00:00:00');
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={record.date}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-[#F5F9FC]/60 px-2 rounded-xl transition-colors"
              >
                {/* Date & Note */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isPresent
                        ? 'bg-[#FF4F81]/15 text-[#FF4F81]'
                        : isAbsent
                        ? 'bg-[#292929]/10 text-[#292929]'
                        : 'bg-[#FB7185]/20 text-[#FB7185]'
                    }`}
                  >
                    {dayOfWeek}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#292929]">
                      {formattedDate}
                    </div>
                    {record.note && (
                      <div className="text-xs text-[#292929]/60 italic mt-0.5">
                        {record.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2">
                  {/* Status Pill with click to toggle */}
                  <button
                    onClick={() =>
                      onMarkDay(record.date, cycleStatus(record.status), record.note)
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                      isPresent
                        ? 'bg-[#FF4F81]/10 text-[#FF4F81] border-[#FF4F81]/30 hover:bg-[#FF4F81]/20'
                        : isAbsent
                        ? 'bg-[#292929]/5 text-[#292929] border-[#292929]/20 hover:bg-[#292929]/10'
                        : 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/30 hover:bg-[#FB7185]/20'
                    }`}
                    title="Tap to switch (Present -> Absent -> Holiday)"
                  >
                    {isPresent && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4F81]" />}
                    {isAbsent && <XCircle className="w-3.5 h-3.5 text-[#292929]" />}
                    {isHoliday && <Palmtree className="w-3.5 h-3.5 text-[#FB7185]" />}
                    <span>
                      {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Holiday'}
                    </span>
                    <ArrowUpDown className="w-3 h-3 text-[#FB7185] ml-0.5 opacity-70" />
                  </button>

                  {/* Delete record */}
                  <button
                    onClick={() => onDeleteDay(record.date)}
                    className="p-1.5 text-[#292929]/40 hover:text-[#FF4F81] hover:bg-[#FF4F81]/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
