import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Plus,
  Target,
  RefreshCw,
} from 'lucide-react';
import { SubjectAttendanceSummary, Semester, AppSettings } from '../types';

interface WidgetSimulatorModalProps {
  onClose: () => void;
  activeSemester: Semester | null;
  summaries: SubjectAttendanceSummary[];
  overallPercentage: number | null;
  settings: AppSettings;
  onQuickMark: (subjectId: string, status: 'PRESENT' | 'ABSENT') => void;
  onTogglePrivacy: () => void;
}

export const WidgetSimulatorModal: React.FC<WidgetSimulatorModalProps> = ({
  onClose,
  activeSemester,
  summaries,
  overallPercentage,
  settings,
  onQuickMark,
  onTogglePrivacy,
}) => {
  const [widgetSize, setWidgetSize] = useState<'4x2' | '2x2'>('4x2');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW_ONLY'>('ALL');

  const displayedSubjects =
    filterMode === 'LOW_ONLY'
      ? summaries.filter((s) => s.status === 'AT_RISK' || s.status === 'BELOW_TARGET')
      : summaries;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23211E]/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E6E1D8] shadow-2xl p-6 space-y-5 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#23211E]">
                Android Glance AppWidget Simulator
              </h3>
              <p className="text-xs text-[#7A746E]">
                Preview native home-screen widget behavior, privacy mode, and quick actions
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3EFE9] text-[#7A746E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulator Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#7A746E]">Size:</span>
            <button
              onClick={() => setWidgetSize('4x2')}
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                widgetSize === '4x2'
                  ? 'bg-[#23211E] text-white border-[#23211E]'
                  : 'bg-[#FAF8F5] text-[#4A453F] border-[#D4CEBF]'
              }`}
            >
              4x2 Landscape
            </button>
            <button
              onClick={() => setWidgetSize('2x2')}
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                widgetSize === '2x2'
                  ? 'bg-[#23211E] text-white border-[#23211E]'
                  : 'bg-[#FAF8F5] text-[#4A453F] border-[#D4CEBF]'
              }`}
            >
              2x2 Compact
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode(filterMode === 'ALL' ? 'LOW_ONLY' : 'ALL')}
              className="px-2.5 py-1 rounded-lg border border-[#D4CEBF] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#23211E] font-medium"
            >
              {filterMode === 'ALL' ? 'Show: All Subjects' : 'Show: Low Only'}
            </button>

            <button
              onClick={onTogglePrivacy}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                settings.widgetPrivacyMode
                  ? 'bg-[#B45309] text-white border-[#B45309]'
                  : 'bg-[#FAF8F5] text-[#4A453F] border-[#D4CEBF]'
              }`}
              title="Toggle Widget Privacy Mode"
            >
              {settings.widgetPrivacyMode ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  <span>Privacy On</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Privacy Off</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Android Phone Wallpaper Stage */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2D3748] to-[#1A202C] flex items-center justify-center min-h-[300px] overflow-y-auto">
          {/* THE GLANCE WIDGET FRAME */}
          <div
            className={`bg-[#FAF8F5] rounded-3xl p-4 shadow-2xl border border-white/20 transition-all ${
              widgetSize === '4x2' ? 'w-full max-w-md' : 'w-64'
            }`}
          >
            {/* Widget Title Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D95D29]" />
                <span className="text-[11px] font-bold text-[#23211E] tracking-tight">
                  Student Attendance
                </span>
                <span className="text-[10px] text-[#7A746E]">
                  • {activeSemester?.name || 'Current'}
                </span>
              </div>

              {/* Overall metric */}
              <div className="text-right">
                {settings.widgetPrivacyMode ? (
                  <span className="text-[11px] font-bold text-[#1E7F4D] px-1.5 py-0.2 rounded bg-[#1E7F4D]/10">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-[#23211E]">
                    {overallPercentage !== null ? `${overallPercentage}%` : '—'}
                  </span>
                )}
              </div>
            </div>

            {/* Widget Content Items */}
            <div className="mt-3 space-y-2">
              {displayedSubjects.slice(0, widgetSize === '4x2' ? 3 : 2).map((s) => (
                <div
                  key={s.subject.id}
                  className="bg-white p-2.5 rounded-xl border border-[#EBE6DE] flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="w-2 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: s.subject.colorToken || '#D95D29' }}
                    />
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-[#23211E] truncate">
                        {s.subject.subjectName}
                      </h5>
                      <span className="text-[10px] text-[#7A746E] block font-mono">
                        {settings.widgetPrivacyMode ? (
                          s.status === 'ON_TRACK' ? 'On Track' : 'Attention'
                        ) : (
                          `${s.attendancePercentage !== null ? `${s.attendancePercentage}%` : 'No Data'} (Goal ${s.targetPercentage}%)`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quick Mark directly in glance widget */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onQuickMark(s.subject.id, 'PRESENT')}
                      className="p-1.5 rounded-lg bg-[#1E7F4D]/10 hover:bg-[#1E7F4D] text-[#1E7F4D] hover:text-white transition-colors"
                      title="Quick Present"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onQuickMark(s.subject.id, 'ABSENT')}
                      className="p-1.5 rounded-lg bg-[#C53030]/10 hover:bg-[#C53030] text-[#C53030] hover:text-white transition-colors"
                      title="Quick Absent"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-[#EAE4DC] flex items-center justify-between text-[10px] text-[#8C847B]">
              <span>Jetpack Glance Material 3</span>
              <span>Updated just now</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-[#7A746E] text-center">
          In Android, this widget uses <code>androidx.glance.appwidget</code> with Room-backed
          LiveFlows and dynamic Material 3 tinting.
        </p>
      </div>
    </div>
  );
};
