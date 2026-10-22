import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Subject, Semester } from '../types';
import { ACCESSIBLE_COLORS } from '../data/localStorageManager';

interface AddSubjectModalProps {
  activeSemester: Semester | null;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  defaultTargetPercent: number;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  activeSemester,
  onClose,
  onSave,
  defaultTargetPercent,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [targetPercent, setTargetPercent] = useState(defaultTargetPercent || 75);
  const [colorToken, setColorToken] = useState(ACCESSIBLE_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSemester || !subjectName.trim()) return;

    onSave({
      semesterId: activeSemester.id,
      subjectName: subjectName.trim(),
      subjectCode: subjectCode.trim() || undefined,
      teacherName: teacherName.trim() || undefined,
      targetAttendancePercent: targetPercent,
      colorToken,
      totalClasses: 0,
      isArchived: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23211E]/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E6E1D8] shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D95D29]/10 text-[#D95D29] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#23211E]">Add New Subject</h3>
              <p className="text-xs text-[#7A746E]">
                Enrolled in {activeSemester?.name || 'Current Semester'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F3EFE9] text-[#7A746E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1">
              Subject Name <span className="text-[#C53030]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Systems"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1">
                Subject Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS-401"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1">
                Teacher Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Vance"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#4A453F]">
                Target Attendance Goal
              </label>
              <span className="text-xs font-bold text-[#D95D29] font-mono">
                {targetPercent}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={targetPercent}
              onChange={(e) => setTargetPercent(parseInt(e.target.value) || 75)}
              className="w-full accent-[#D95D29] h-2 bg-[#EBE6DE] rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
              Subject Accent Color
            </label>
            <div className="flex items-center gap-2">
              {ACCESSIBLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorToken(color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    colorToken === color ? 'scale-115 ring-2 ring-offset-2 ring-[#23211E]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0EBE3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A746E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D95D29] hover:bg-[#C84E1C] text-white text-xs font-bold shadow-sm"
            >
              Save Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
