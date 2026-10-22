import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  BookOpen,
  ArrowRight,
  TrendingUp,
  MinusCircle,
  CalendarCheck,
} from 'lucide-react';
import { Semester, Subject, SubjectAttendanceSummary, AppSettings } from '../types';
import { ACCESSIBLE_COLORS } from '../data/localStorageManager';

interface DashboardTabProps {
  activeSemester: Semester | null;
  summaries: SubjectAttendanceSummary[];
  overall: {
    presentCount: number;
    absentCount: number;
    leaveCount: number;
    totalCounted: number;
    overallPercentage: number | null;
    status: 'ON_TRACK' | 'AT_RISK' | 'BELOW_TARGET' | 'NO_DATA';
    averageTarget: number;
  };
  onQuickMark: (subjectId: string, status: 'PRESENT' | 'ABSENT') => void;
  onOpenAddSubject: () => void;
  onNavigateToGoal: (subjectId?: string) => void;
  onNavigateToAttendance: (subjectId?: string) => void;
  settings: AppSettings;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  activeSemester,
  summaries,
  overall,
  onQuickMark,
  onOpenAddSubject,
  onNavigateToGoal,
  onNavigateToAttendance,
  settings,
}) => {
  const atRiskSubjects = summaries.filter((s) => s.status === 'AT_RISK' || s.status === 'BELOW_TARGET');

  return (
    <div className="space-y-6">
      {/* Top Banner / Semester Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#23211E] tracking-tight">
            {activeSemester ? activeSemester.name : 'Semester Overview'}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A746E]">
            {activeSemester?.academicYear ? `Academic Year ${activeSemester.academicYear} • ` : ''}
            Target baseline: {settings.defaultTargetPercent}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddSubject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#23211E] text-xs font-semibold border border-[#E0DBD2] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#D95D29]" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Overall Attendance Summary KPI Card */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          {/* Main Percentage Gauge */}
          <div className="sm:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left border-b sm:border-b-0 sm:border-r border-[#E6E1D8] pb-4 sm:pb-0 sm:pr-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C847B]">
              Overall Attendance
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#23211E] tracking-tight font-mono">
                {overall.overallPercentage !== null ? `${overall.overallPercentage}%` : '—'}
              </span>
            </div>
            <div className="mt-2">
              {overall.status === 'ON_TRACK' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E7F4D]/10 text-[#1E7F4D] border border-[#1E7F4D]/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                </span>
              )}
              {overall.status === 'AT_RISK' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20">
                  <AlertTriangle className="w-3.5 h-3.5" /> At Risk
                </span>
              )}
              {overall.status === 'BELOW_TARGET' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C53030]/10 text-[#C53030] border border-[#C53030]/20">
                  <AlertCircle className="w-3.5 h-3.5" /> Below Target
                </span>
              )}
              {overall.status === 'NO_DATA' && (
                <span className="text-xs text-[#8C847B]">No attendance data yet</span>
              )}
            </div>
          </div>

          {/* Sub statistics */}
          <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EBE6DE]">
              <span className="text-xs text-[#7A746E] font-medium block">Present</span>
              <span className="text-2xl font-bold text-[#1E7F4D] font-mono mt-0.5 block">
                {overall.presentCount}
              </span>
              <span className="text-[11px] text-[#8C847B]">Recorded present</span>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EBE6DE]">
              <span className="text-xs text-[#7A746E] font-medium block">Absent</span>
              <span className="text-2xl font-bold text-[#C53030] font-mono mt-0.5 block">
                {overall.absentCount}
              </span>
              <span className="text-[11px] text-[#8C847B]">Recorded absent</span>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EBE6DE]">
              <span className="text-xs text-[#7A746E] font-medium block">Approved Leaves</span>
              <span className="text-2xl font-bold text-[#B45309] font-mono mt-0.5 block">
                {overall.leaveCount}
              </span>
              <span className="text-[11px] text-[#8C847B]">
                {settings.countLeaveInDenominator ? 'Counted in denominator' : 'Excluded from total'}
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EBE6DE]">
              <span className="text-xs text-[#7A746E] font-medium block">Target Goal</span>
              <span className="text-2xl font-bold text-[#23211E] font-mono mt-0.5 block">
                {overall.averageTarget}%
              </span>
              <span className="text-[11px] text-[#8C847B]">Average target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Attendance Warning Alert (Non-shaming, constructive advice) */}
      {atRiskSubjects.length > 0 && (
        <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#B45309] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-bold text-[#92400E]">
                Attendance Attention Needed
              </h3>
              <p className="text-xs sm:text-sm text-[#78350F] mt-1">
                {atRiskSubjects.length === 1
                  ? `1 subject is currently below or near its attendance target.`
                  : `${atRiskSubjects.length} subjects are currently below or near their attendance targets.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {atRiskSubjects.map((s) => (
                  <button
                    key={s.subject.id}
                    onClick={() => onNavigateToGoal(s.subject.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#FCD34D] text-xs font-semibold text-[#92400E] hover:bg-[#FEF3C7] transition-colors"
                  >
                    <span>{s.subject.subjectName}</span>
                    <span className="font-mono">
                      ({s.attendancePercentage !== null ? `${s.attendancePercentage}%` : '0%'} / {s.targetPercentage}%)
                    </span>
                    <span className="text-[11px] text-[#B45309] underline ml-1">Plan Goal &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-[#23211E]">
            Subjects ({summaries.length})
          </h3>
          <span className="text-xs text-[#7A746E]">
            One-tap quick mark for today's classes
          </span>
        </div>

        {summaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4CEBF] p-8 text-center bg-[#FAF8F5]">
            <BookOpen className="w-8 h-8 text-[#8C847B] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[#23211E]">No subjects in this semester</h4>
            <p className="text-xs text-[#7A746E] mt-1 max-w-sm mx-auto">
              Add your enrolled subjects with target percentages to start tracking your attendance.
            </p>
            <button
              onClick={onOpenAddSubject}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D95D29] text-white text-xs font-semibold hover:bg-[#C84E1C] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaries.map((item) => {
              const { subject, attendancePercentage, targetPercentage, status, presentCount, absentCount, totalCountedClasses, classesNeededForTarget, classesCanBeMissed } = item;
              const percentDisplay = attendancePercentage !== null ? `${attendancePercentage}%` : 'No data';

              return (
                <div
                  key={subject.id}
                  className="rounded-2xl bg-white border border-[#E6E1D8] p-5 hover:border-[#D4CEBF] transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header with subject color bar and status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: subject.colorToken || '#D95D29' }}
                        />
                        <div>
                          <h4 className="text-base font-bold text-[#23211E] tracking-tight line-clamp-1">
                            {subject.subjectName}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#7A746E] mt-0.5">
                            {subject.subjectCode && (
                              <span className="font-mono font-medium px-1.5 py-0.2 rounded bg-[#F3EFE9] text-[#4A453F]">
                                {subject.subjectCode}
                              </span>
                            )}
                            {subject.teacherName && (
                              <span className="truncate max-w-[150px]">
                                {subject.teacherName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="shrink-0">
                        {status === 'ON_TRACK' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E7F4D]/10 text-[#1E7F4D]">
                            On Track
                          </span>
                        )}
                        {status === 'AT_RISK' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B45309]/10 text-[#B45309]">
                            At Risk
                          </span>
                        )}
                        {status === 'BELOW_TARGET' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C53030]/10 text-[#C53030]">
                            Below Target
                          </span>
                        )}
                        {status === 'NO_DATA' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3EFE9] text-[#7A746E]">
                            No Records
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Numerical stats */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-lg text-[#23211E] font-mono">
                            {percentDisplay}
                          </span>
                          <span className="text-[#8C847B]">
                            / Target {targetPercentage}%
                          </span>
                        </div>
                        <span className="text-xs text-[#7A746E] font-medium font-mono">
                          {presentCount} attended of {totalCountedClasses}
                        </span>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full h-2.5 rounded-full bg-[#EBE6DE] relative overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, attendancePercentage || 0)}%`,
                            backgroundColor:
                              status === 'ON_TRACK'
                                ? '#1E7F4D'
                                : status === 'AT_RISK'
                                ? '#B45309'
                                : status === 'BELOW_TARGET'
                                ? '#C53030'
                                : '#8C847B',
                          }}
                        />
                        {/* Target Marker Needle */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-[#23211E]/80"
                          style={{ left: `${targetPercentage}%` }}
                          title={`Target: ${targetPercentage}%`}
                        />
                      </div>
                    </div>

                    {/* Insight Pill */}
                    <div className="mt-3 text-[11px] text-[#6A635B] bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE6DE]">
                      {attendancePercentage === null ? (
                        <span>No attendance recorded yet. Tap "+ Present" to start.</span>
                      ) : attendancePercentage >= targetPercentage ? (
                        <span>
                          Safe margin: Can miss{' '}
                          <strong className="text-[#1E7F4D]">{classesCanBeMissed}</strong> more class
                          {classesCanBeMissed === 1 ? '' : 'es'} safely.
                        </span>
                      ) : (
                        <span>
                          Action plan: Attend next{' '}
                          <strong className="text-[#C53030]">{classesNeededForTarget}</strong> consecutive
                          class{classesNeededForTarget === 1 ? '' : 'es'} to reach {targetPercentage}%.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions: Quick Mark Today */}
                  <div className="mt-4 pt-3 border-t border-[#F0EBE3] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onQuickMark(subject.id, 'PRESENT')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E7F4D]/10 hover:bg-[#1E7F4D]/20 text-[#1E7F4D] text-xs font-semibold transition-colors"
                        title="Mark Present for Today"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>+ Present</span>
                      </button>

                      <button
                        onClick={() => onQuickMark(subject.id, 'ABSENT')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C53030]/10 hover:bg-[#C53030]/20 text-[#C53030] text-xs font-semibold transition-colors"
                        title="Mark Absent for Today"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>+ Absent</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onNavigateToGoal(subject.id)}
                        className="p-1.5 text-[#7A746E] hover:text-[#D95D29] hover:bg-[#F3EFE9] rounded-lg transition-colors text-xs font-medium"
                        title="Calculate goal & recovery plan"
                      >
                        Goal &rarr;
                      </button>
                      <button
                        onClick={() => onNavigateToAttendance(subject.id)}
                        className="p-1.5 text-[#7A746E] hover:text-[#23211E] hover:bg-[#F3EFE9] rounded-lg transition-colors text-xs font-medium"
                        title="View full class history"
                      >
                        Logs
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
