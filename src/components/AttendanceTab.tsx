import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  MinusCircle,
  Clock,
  Trash2,
  Edit2,
  Filter,
  Plus,
  ArrowUpDown,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Semester, Subject } from '../types';

interface AttendanceTabProps {
  activeSemester: Semester | null;
  subjects: Subject[];
  records: AttendanceRecord[];
  onSaveRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDeleteRecord: (id: string) => void;
  initialSubjectId?: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  activeSemester,
  subjects,
  records,
  onSaveRecord,
  onDeleteRecord,
  initialSubjectId,
}) => {
  // Routine recording form state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (subjects.length > 0 ? subjects[0].id : '')
  );
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('PRESENT');
  const [note, setNote] = useState<string>('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Filters for logs
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (filterSubjectId !== 'ALL' && r.subjectId !== filterSubjectId) return false;
        if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return sortOrder === 'NEWEST' ? -cmp : cmp;
      });
  }, [records, filterSubjectId, filterStatus, sortOrder]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !activeSemester) return;

    onSaveRecord({
      id: editingRecordId || undefined,
      subjectId: selectedSubjectId,
      semesterId: activeSemester.id,
      date: selectedDate,
      classStartTime: startTime || undefined,
      classEndTime: endTime || undefined,
      status: selectedStatus,
      source: 'MANUAL',
      note: note.trim() || undefined,
    });

    // Reset editing
    setEditingRecordId(null);
    setNote('');
  };

  const startEdit = (rec: AttendanceRecord) => {
    setEditingRecordId(rec.id);
    setSelectedSubjectId(rec.subjectId);
    setSelectedDate(rec.date);
    setStartTime(rec.classStartTime || '09:00');
    setEndTime(rec.classEndTime || '10:00');
    setSelectedStatus(rec.status);
    setNote(rec.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingRecordId(null);
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Quick Mark Attendance Form Card */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D95D29]/10 text-[#D95D29] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#23211E]">
                {editingRecordId ? 'Edit Attendance Entry' : 'Record Class Attendance'}
              </h3>
              <p className="text-xs text-[#7A746E]">
                Manually record or update an individual lecture or lab attendance
              </p>
            </div>
          </div>
          {editingRecordId && (
            <button
              onClick={cancelEdit}
              className="text-xs font-semibold text-[#8C847B] hover:text-[#23211E] underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                Subject <span className="text-[#C53030]">*</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D29]/20"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subjectName} {sub.subjectCode ? `(${sub.subjectCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                Date <span className="text-[#C53030]">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D29]/20 font-mono"
              />
            </div>

            {/* Class Timing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
              Attendance Status <span className="text-[#C53030]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedStatus('PRESENT')}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedStatus === 'PRESENT'
                    ? 'bg-[#1E7F4D] text-white border-[#1E7F4D] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#23211E] border-[#D4CEBF] hover:bg-[#F3EFE9]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('ABSENT')}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedStatus === 'ABSENT'
                    ? 'bg-[#C53030] text-white border-[#C53030] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#23211E] border-[#D4CEBF] hover:bg-[#F3EFE9]'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>Absent</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('LEAVE')}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedStatus === 'LEAVE'
                    ? 'bg-[#B45309] text-white border-[#B45309] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#23211E] border-[#D4CEBF] hover:bg-[#F3EFE9]'
                }`}
              >
                <span>Leave</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('CANCELLED')}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedStatus === 'CANCELLED'
                    ? 'bg-[#4B5563] text-white border-[#4B5563] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#23211E] border-[#D4CEBF] hover:bg-[#F3EFE9]'
                }`}
              >
                <span>Cancelled</span>
              </button>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
              Note (Optional, e.g. "Lab test", "Guest lecture")
            </label>
            <input
              type="text"
              placeholder="e.g. Discussed dynamic programming algorithms"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D29]/20"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#D95D29] hover:bg-[#C84E1C] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              {editingRecordId ? 'Update Record' : 'Save Attendance Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Attendance History & Filter Bar */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#23211E]">
              Attendance Logs ({filteredRecords.length})
            </h3>
            <p className="text-xs text-[#7A746E]">
              Historical records for active semester
            </p>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
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

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D4CEBF] text-xs bg-[#FAF8F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="HOLIDAY">Holiday</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D4CEBF] text-xs bg-[#FAF8F5] text-[#4A453F] hover:bg-[#F3EFE9]"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'NEWEST' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        {/* Records Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#E6E1D8] rounded-xl bg-[#FAF8F5]">
            <p className="text-xs text-[#7A746E]">No attendance records found matching filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE3] overflow-x-auto">
            {filteredRecords.map((rec) => {
              const sub = subjectMap.get(rec.subjectId);
              return (
                <div
                  key={rec.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: sub?.colorToken || '#D95D29' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#23211E]">
                          {sub?.subjectName || 'Unknown Subject'}
                        </span>
                        {sub?.subjectCode && (
                          <span className="text-[10px] px-1 rounded bg-[#EAE4DC] text-[#4A453F] font-mono">
                            {sub.subjectCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#7A746E] mt-0.5">
                        <span className="font-mono">{rec.date}</span>
                        {rec.classStartTime && (
                          <span>
                            • {rec.classStartTime} - {rec.classEndTime || ''}
                          </span>
                        )}
                        {rec.note && <span className="italic truncate max-w-[200px]">"{rec.note}"</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status badge */}
                    {rec.status === 'PRESENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E7F4D]/10 text-[#1E7F4D]">
                        Present
                      </span>
                    )}
                    {rec.status === 'ABSENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C53030]/10 text-[#C53030]">
                        Absent
                      </span>
                    )}
                    {rec.status === 'LEAVE' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B45309]/10 text-[#B45309]">
                        Leave
                      </span>
                    )}
                    {rec.status === 'CANCELLED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6B7280]/10 text-[#6B7280]">
                        Cancelled
                      </span>
                    )}
                    {rec.status === 'HOLIDAY' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-[#3B82F6]">
                        Holiday
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(rec)}
                        className="p-1.5 text-[#7A746E] hover:text-[#23211E] rounded-md transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete this attendance record for ${rec.date}?`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        className="p-1.5 text-[#7A746E] hover:text-[#C53030] rounded-md transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
