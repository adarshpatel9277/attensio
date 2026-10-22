import React from 'react';
import { X, CheckCircle2, MinusCircle, Clock, Check } from 'lucide-react';
import { Subject, AttendanceStatus } from '../types';

interface QuickMarkModalProps {
  subjects: Subject[];
  onClose: () => void;
  onMark: (subjectId: string, status: AttendanceStatus) => void;
}

export const QuickMarkModal: React.FC<QuickMarkModalProps> = ({
  subjects,
  onClose,
  onMark,
}) => {
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23211E]/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E6E1D8] shadow-xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
          <div>
            <h3 className="text-base font-bold text-[#23211E]">Today's Class Roll Call</h3>
            <p className="text-xs text-[#7A746E]">{todayStr} • Single-tap attendance logging</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F3EFE9] text-[#7A746E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#F0EBE3] pr-1">
          {subjects.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-7 rounded-full"
                  style={{ backgroundColor: s.colorToken || '#D95D29' }}
                />
                <div>
                  <h4 className="text-sm font-bold text-[#23211E]">{s.subjectName}</h4>
                  <span className="text-[11px] text-[#7A746E]">Target: {s.targetAttendancePercent}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onMark(s.id, 'PRESENT')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1E7F4D]/10 hover:bg-[#1E7F4D] text-[#1E7F4D] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Mark Present"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Present</span>
                </button>

                <button
                  onClick={() => onMark(s.id, 'ABSENT')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#C53030]/10 hover:bg-[#C53030] text-[#C53030] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Mark Absent"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>Absent</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#E6E1D8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#23211E] text-white text-xs font-bold hover:bg-[#3A3530]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
