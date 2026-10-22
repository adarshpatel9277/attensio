import React, { useState, useEffect } from 'react';
import {
  Target,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Subject, SubjectAttendanceSummary } from '../types';
import { calculateGoal } from '../utils/calculator';

interface GoalCalculatorTabProps {
  summaries: SubjectAttendanceSummary[];
  initialSubjectId?: string;
}

export const GoalCalculatorTab: React.FC<GoalCalculatorTabProps> = ({
  summaries,
  initialSubjectId,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (summaries.length > 0 ? summaries[0].subject.id : 'CUSTOM')
  );

  const [presentInput, setPresentInput] = useState<number>(18);
  const [absentInput, setAbsentInput] = useState<number>(6);
  const [targetPercentInput, setTargetPercentInput] = useState<number>(75);

  // Sync inputs when subject changes
  useEffect(() => {
    if (selectedSubjectId !== 'CUSTOM') {
      const found = summaries.find((s) => s.subject.id === selectedSubjectId);
      if (found) {
        setPresentInput(found.presentCount);
        setAbsentInput(found.absentCount);
        setTargetPercentInput(found.targetPercentage);
      }
    }
  }, [selectedSubjectId, summaries]);

  const goalResult = calculateGoal(presentInput, absentInput, targetPercentInput);
  const totalCounted = presentInput + absentInput;
  const currentRatio = totalCounted > 0 ? Math.round((presentInput / totalCounted) * 1000) / 10 : null;

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#23211E] tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-[#D95D29]" />
            Attendance Goal Calculator
          </h2>
          <p className="text-xs sm:text-sm text-[#7A746E]">
            Mathematically transparent attendance planning and absence allowances
          </p>
        </div>

        {/* Quick Subject Select */}
        {summaries.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A746E]">Load Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#D4CEBF] text-xs bg-white font-medium shadow-xs"
            >
              <option value="CUSTOM">Custom Input</option>
              {summaries.map((s) => (
                <option key={s.subject.id} value={s.subject.id}>
                  {s.subject.subjectName} ({s.presentCount}P / {s.absentCount}A)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Input Parameters Box */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B] mb-4">
          Calculator Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Present Classes */}
          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
              Current Present Classes
            </label>
            <input
              type="number"
              min="0"
              max="500"
              value={presentInput}
              onChange={(e) => {
                setPresentInput(Math.max(0, parseInt(e.target.value) || 0));
                setSelectedSubjectId('CUSTOM');
              }}
              className="w-full px-3 py-2 text-base font-bold font-mono rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D29]/20"
            />
            <span className="text-[11px] text-[#8C847B] mt-1 block">
              Classes you have already attended
            </span>
          </div>

          {/* Absent Classes */}
          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
              Current Absent Classes
            </label>
            <input
              type="number"
              min="0"
              max="500"
              value={absentInput}
              onChange={(e) => {
                setAbsentInput(Math.max(0, parseInt(e.target.value) || 0));
                setSelectedSubjectId('CUSTOM');
              }}
              className="w-full px-3 py-2 text-base font-bold font-mono rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D29]/20"
            />
            <span className="text-[11px] text-[#8C847B] mt-1 block">
              Classes you missed
            </span>
          </div>

          {/* Target Percentage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#4A453F]">
                Target Attendance Goal
              </label>
              <span className="text-xs font-bold text-[#D95D29] font-mono">
                {targetPercentInput}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={targetPercentInput}
              onChange={(e) => {
                setTargetPercentInput(parseInt(e.target.value) || 75);
                setSelectedSubjectId('CUSTOM');
              }}
              className="w-full accent-[#D95D29] h-2 bg-[#EBE6DE] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C847B] mt-1 font-mono">
              <span>50%</span>
              <span>75% (Standard)</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Calculation Outcome */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
          Calculation Analysis & Recovery Plan
        </h3>

        {/* Big result banner */}
        <div
          className={`p-5 rounded-xl border flex items-start gap-4 ${
            goalResult.isAboveTarget
              ? 'bg-[#F0FDF4] border-[#BBF7D0]'
              : goalResult.isImpossible
              ? 'bg-[#FEF2F2] border-[#FECACA]'
              : 'bg-[#FFFBEB] border-[#FDE68A]'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {goalResult.isAboveTarget ? (
              <div className="w-9 h-9 rounded-xl bg-[#1E7F4D]/20 text-[#1E7F4D] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : goalResult.isImpossible ? (
              <div className="w-9 h-9 rounded-xl bg-[#C53030]/20 text-[#C53030] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#B45309]/20 text-[#B45309] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h4
              className={`text-base sm:text-lg font-bold ${
                goalResult.isAboveTarget
                  ? 'text-[#166534]'
                  : goalResult.isImpossible
                  ? 'text-[#991B1B]'
                  : 'text-[#92400E]'
              }`}
            >
              {goalResult.isAboveTarget
                ? 'You are safely above target!'
                : goalResult.isImpossible
                ? 'Target is mathematically unreachable'
                : 'Action required to reach target'}
            </h4>

            <p
              className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                goalResult.isAboveTarget
                  ? 'text-[#14532D]'
                  : goalResult.isImpossible
                  ? 'text-[#7F1D1D]'
                  : 'text-[#78350F]'
              }`}
            >
              {goalResult.explanation}
            </p>

            {/* Key Action Pill */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {goalResult.isAboveTarget && (
                <div className="px-3 py-1.5 rounded-lg bg-white border border-[#BBF7D0] text-xs font-semibold text-[#166534]">
                  Safe Absences Allowed:{' '}
                  <strong className="text-sm font-mono">{goalResult.classesCanBeMissed}</strong> class
                  {goalResult.classesCanBeMissed === 1 ? '' : 'es'}
                </div>
              )}

              {!goalResult.isAboveTarget && !goalResult.isImpossible && (
                <div className="px-3 py-1.5 rounded-lg bg-white border border-[#FDE68A] text-xs font-semibold text-[#92400E]">
                  Consecutive Classes Needed:{' '}
                  <strong className="text-sm font-mono">{goalResult.classesNeeded}</strong> class
                  {goalResult.classesNeeded === 1 ? '' : 'es'}
                </div>
              )}

              <div className="px-3 py-1.5 rounded-lg bg-white/70 border border-current/20 text-xs font-mono">
                Current: {currentRatio !== null ? `${currentRatio}%` : 'No data'} ({presentInput}/
                {totalCounted})
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Transparent Math Explanation */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE6DE] space-y-2 text-xs text-[#6A635B]">
          <div className="flex items-center gap-1.5 font-bold text-[#23211E]">
            <Info className="w-3.5 h-3.5 text-[#D95D29]" />
            <span>Mathematical Formula Applied</span>
          </div>
          <p>
            Attendance is calculated as:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-white font-mono text-[#23211E]">
              (Present + x) / (Present + Absent + x) &ge; Target%
            </code>
          </p>
          <p>
            To reach target percentage <strong>{targetPercentInput}%</strong> with{' '}
            <strong>{presentInput}</strong> present and <strong>{absentInput}</strong> absent, each
            additional class attended increases both the numerator and denominator until the threshold is
            satisfied.
          </p>
        </div>
      </div>
    </div>
  );
};
