import React, { useState, useEffect } from 'react';
import { DayStatus, DayRecord, CourseSubject } from '../../types';
import { getLocalTodayString } from '../../utils/dateUtils';
import { History, X } from 'lucide-react';

interface BackdateModalProps {
  initialDate?: string;
  subjects?: CourseSubject[];
  records?: DayRecord[];
  onClose: () => void;
  onSave: (
    date: string,
    status: DayStatus | null,
    note?: string,
    details?: { subjectName?: string; subjectCode?: string; timeSlot?: string; location?: string }
  ) => void;
  onDelete?: (date: string) => void;
}

export const BackdateModal: React.FC<BackdateModalProps> = ({
  initialDate,
  records = [],
  onClose,
  onSave,
  onDelete,
}) => {
  const [date, setDate] = useState(initialDate || getLocalTodayString());

  // Check if selected date already has a logged record
  const existingRecord = records.find((r) => r.date === date);

  // Initial status: if existing record, use its status; if new, start with null (unselected)
  const [status, setStatus] = useState<DayStatus | null>(() => {
    return existingRecord ? existingRecord.status : null;
  });

  const [note, setNote] = useState(() => {
    return existingRecord?.note || '';
  });

  // When date changes in date picker, sync with existing record for that date
  useEffect(() => {
    const rec = records.find((r) => r.date === date);
    if (rec) {
      setStatus(rec.status);
      setNote(rec.note || '');
    } else {
      setStatus(null);
      setNote('');
    }
  }, [date, records]);

  // Handle clicking status: clicking currently selected status toggles it OFF (null / unlogged)
  const handleStatusClick = (clickedStatus: DayStatus) => {
    if (status === clickedStatus) {
      setStatus(null); // Toggled off!
    } else {
      setStatus(clickedStatus);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === null) {
      if (onDelete) {
        onDelete(date);
      } else {
        onSave(date, null);
      }
    } else {
      onSave(date, status, note.trim() || undefined);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-surface-card rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl border border-surface-container-high/60 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-subtle text-primary flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              {existingRecord ? 'Edit Attendance Entry' : 'Log Attendance Entry'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-recessed hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-recessed text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Choice: Present • Absent • Off (Toggable) */}
          <div>
            <div className="mb-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Attendance Status
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusClick('PRESENT')}
                className={`py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  status === 'PRESENT'
                    ? 'bg-emerald-subtle text-tertiary ring-2 ring-tertiary/60 shadow-xs'
                    : 'bg-surface-recessed text-secondary hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                Present
              </button>

              <button
                type="button"
                onClick={() => handleStatusClick('ABSENT')}
                className={`py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  status === 'ABSENT'
                    ? 'bg-rose-subtle text-primary ring-2 ring-primary/60 shadow-xs'
                    : 'bg-surface-recessed text-secondary hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                Absent
              </button>

              <button
                type="button"
                onClick={() => handleStatusClick('HOLIDAY')}
                className={`py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  status === 'HOLIDAY'
                    ? 'bg-amber-subtle text-amber-warning ring-2 ring-amber-warning/60 shadow-xs'
                    : 'bg-surface-recessed text-secondary hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-warning" />
                Off
              </button>
            </div>
          </div>

          {/* Note / Remark (Optional) */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Remark / Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lab experiment, Sports festival"
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-recessed text-on-surface text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Action Buttons: Cancel on LEFT, Confirm on RIGHT */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-container-high/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-surface-recessed hover:bg-surface-container text-secondary hover:text-on-surface text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

