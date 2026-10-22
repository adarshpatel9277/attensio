/**
 * Transparent Attendance Calculation Formulas
 * Strictly mathematically validated according to Section 6 of requirements
 */

import { AttendanceRecord, Subject, SubjectAttendanceSummary } from '../types';

export interface GoalCalculationResult {
  currentPercentage: number | null;
  targetPercentage: number;
  isAboveTarget: boolean;
  isExactlyTarget: boolean;
  classesNeeded: number; // minimum consecutive present classes needed
  classesCanBeMissed: number; // consecutive absences allowed before falling below target
  isImpossible: boolean;
  explanation: string;
}

/**
 * Calculates subject attendance summary accurately
 */
export function calculateSubjectAttendance(
  subject: Subject,
  records: AttendanceRecord[],
  countLeaveInDenominator: boolean = false,
  warningMarginPercent: number = 5
): SubjectAttendanceSummary {
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let holidayCount = 0;
  let cancelledCount = 0;
  let unmarkedCount = 0;

  for (const record of records) {
    if (record.subjectId !== subject.id) continue;
    switch (record.status) {
      case 'PRESENT':
        presentCount++;
        break;
      case 'ABSENT':
        absentCount++;
        break;
      case 'LEAVE':
        leaveCount++;
        break;
      case 'HOLIDAY':
        holidayCount++;
        break;
      case 'CANCELLED':
        cancelledCount++;
        break;
      case 'UNMARKED':
        unmarkedCount++;
        break;
    }
  }

  const totalCounted = countLeaveInDenominator
    ? presentCount + absentCount + leaveCount
    : presentCount + absentCount;

  let attendancePercentage: number | null = null;
  let status: SubjectAttendanceSummary['status'] = 'NO_DATA';
  let classesNeededForTarget = 0;
  let classesCanBeMissed = 0;

  const target = subject.targetAttendancePercent || 75;

  if (totalCounted > 0) {
    // Formula: presentClasses / (presentClasses + absentClasses) * 100
    const rawPercent = (presentCount / totalCounted) * 100;
    // Round to 1 decimal place cleanly
    attendancePercentage = Math.round(rawPercent * 10) / 10;

    const goal = calculateGoal(presentCount, absentCount, target, countLeaveInDenominator ? leaveCount : 0);
    classesNeededForTarget = goal.classesNeeded;
    classesCanBeMissed = goal.classesCanBeMissed;

    if (attendancePercentage >= target) {
      status = 'ON_TRACK';
    } else if (attendancePercentage >= target - warningMarginPercent) {
      status = 'AT_RISK';
    } else {
      status = 'BELOW_TARGET';
    }
  }

  return {
    subject,
    presentCount,
    absentCount,
    leaveCount,
    holidayCount,
    cancelledCount,
    unmarkedCount,
    totalCountedClasses: totalCounted,
    attendancePercentage,
    targetPercentage: target,
    status,
    classesNeededForTarget,
    classesCanBeMissed,
  };
}

/**
 * Calculates overall attendance across multiple subjects
 */
export function calculateOverallAttendance(
  summaries: SubjectAttendanceSummary[]
): {
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  totalCounted: number;
  overallPercentage: number | null;
  status: 'ON_TRACK' | 'AT_RISK' | 'BELOW_TARGET' | 'NO_DATA';
  averageTarget: number;
} {
  let present = 0;
  let absent = 0;
  let leave = 0;
  let totalTargets = 0;

  for (const s of summaries) {
    present += s.presentCount;
    absent += s.absentCount;
    leave += s.leaveCount;
    totalTargets += s.targetPercentage;
  }

  const totalCounted = present + absent;
  const avgTarget = summaries.length > 0 ? Math.round(totalTargets / summaries.length) : 75;

  if (totalCounted === 0) {
    return {
      presentCount: 0,
      absentCount: 0,
      leaveCount: leave,
      totalCounted: 0,
      overallPercentage: null,
      status: 'NO_DATA',
      averageTarget: avgTarget,
    };
  }

  const pct = Math.round((present / totalCounted) * 1000) / 10;
  let status: 'ON_TRACK' | 'AT_RISK' | 'BELOW_TARGET' = 'ON_TRACK';
  if (pct < avgTarget - 5) {
    status = 'BELOW_TARGET';
  } else if (pct < avgTarget) {
    status = 'AT_RISK';
  }

  return {
    presentCount: present,
    absentCount: absent,
    leaveCount: leave,
    totalCounted,
    overallPercentage: pct,
    status,
    averageTarget: avgTarget,
  };
}

/**
 * Explicit attendance goal calculator
 * Formula for additional present classes x:
 * (present + x) / (present + absent + x) >= target / 100
 */
export function calculateGoal(
  present: number,
  absent: number,
  targetPercent: number,
  otherCounted: number = 0
): GoalCalculationResult {
  const effectiveAbsent = absent + otherCounted;
  const total = present + effectiveAbsent;

  if (targetPercent <= 0 || targetPercent > 100) {
    return {
      currentPercentage: total > 0 ? Math.round((present / total) * 1000) / 10 : null,
      targetPercentage: targetPercent,
      isAboveTarget: false,
      isExactlyTarget: false,
      classesNeeded: 0,
      classesCanBeMissed: 0,
      isImpossible: true,
      explanation: 'Target percentage must be between 1% and 100%.',
    };
  }

  if (total === 0) {
    return {
      currentPercentage: null,
      targetPercentage: targetPercent,
      isAboveTarget: false,
      isExactlyTarget: false,
      classesNeeded: 1,
      classesCanBeMissed: 0,
      isImpossible: false,
      explanation: 'No classes have been recorded yet. Attending your upcoming classes will keep you on track.',
    };
  }

  const currentRatio = present / total;
  const currentPercentage = Math.round(currentRatio * 1000) / 10;
  const targetRatio = targetPercent / 100;

  if (Math.abs(currentRatio - targetRatio) < 0.0001) {
    // Exactly at target
    return {
      currentPercentage,
      targetPercentage: targetPercent,
      isAboveTarget: true,
      isExactlyTarget: true,
      classesNeeded: 0,
      classesCanBeMissed: 0,
      isImpossible: false,
      explanation: `You are exactly at your target of ${targetPercent}%. Attend the next class to maintain or improve this.`,
    };
  }

  if (currentRatio > targetRatio) {
    // Above target: Calculate how many absences allowed
    // present / (present + effectiveAbsent + y) >= targetRatio
    // y <= (present - targetRatio * (present + effectiveAbsent)) / targetRatio
    const allowedAbsences = Math.floor((present - targetRatio * total) / targetRatio);
    return {
      currentPercentage,
      targetPercentage: targetPercent,
      isAboveTarget: true,
      isExactlyTarget: false,
      classesNeeded: 0,
      classesCanBeMissed: Math.max(0, allowedAbsences),
      isImpossible: false,
      explanation: allowedAbsences > 0
        ? `You are currently above your target (${currentPercentage}% > ${targetPercent}%). You can safely miss ${allowedAbsences} upcoming ${allowedAbsences === 1 ? 'class' : 'classes'} without falling below target.`
        : `You are currently at ${currentPercentage}%, safely above target, but missing even 1 class will drop your attendance below ${targetPercent}%.`,
    };
  }

  // Below target: Calculate how many consecutive classes needed
  // (present + x) / (total + x) >= targetRatio
  // x >= (targetRatio * total - present) / (1 - targetRatio)
  if (targetPercent === 100) {
    // If target is 100% and effectiveAbsent > 0, mathematically impossible to reach 100% again
    return {
      currentPercentage,
      targetPercentage: targetPercent,
      isAboveTarget: false,
      isExactlyTarget: false,
      classesNeeded: 0,
      classesCanBeMissed: 0,
      isImpossible: true,
      explanation: `Because you have already recorded ${effectiveAbsent} absence(s), reaching 100% attendance is mathematically impossible. Consider setting a target between 75% and 95%.`,
    };
  }

  const denominator = 1 - targetRatio;
  const numerator = targetRatio * total - present;
  const classesNeeded = Math.ceil(numerator / denominator);

  return {
    currentPercentage,
    targetPercentage: targetPercent,
    isAboveTarget: false,
    isExactlyTarget: false,
    classesNeeded: Math.max(1, classesNeeded),
    classesCanBeMissed: 0,
    isImpossible: false,
    explanation: `You are currently below target (${currentPercentage}% < ${targetPercent}%). Attend the next ${classesNeeded} consecutive ${classesNeeded === 1 ? 'class' : 'classes'} to reach ${targetPercent}%.`,
  };
}

/**
 * Calculates day-wise attendance statistics
 */
export function calculateDayAttendanceStats(
  records: { status: 'PRESENT' | 'ABSENT' | 'HOLIDAY' }[],
  targetPercentage: number = 75,
  warningMarginPercent: number = 5
): {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  holidayDays: number;
  percentage: number | null;
  targetPercentage: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BELOW_TARGET' | 'NO_DATA';
  daysCanBeMissed: number;
  daysNeeded: number;
  isAboveTarget: boolean;
  adviceMessage: string;
} {
  let presentDays = 0;
  let absentDays = 0;
  let holidayDays = 0;

  for (const r of records) {
    if (r.status === 'PRESENT') presentDays++;
    else if (r.status === 'ABSENT') absentDays++;
    else if (r.status === 'HOLIDAY') holidayDays++;
  }

  const totalDays = presentDays + absentDays;
  if (totalDays === 0) {
    return {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      holidayDays,
      percentage: null,
      targetPercentage,
      status: 'NO_DATA',
      daysCanBeMissed: 0,
      daysNeeded: 0,
      isAboveTarget: true,
      adviceMessage: 'No classes recorded yet. Tap "Present" or "Absent" to mark today!',
    };
  }

  const rawPercent = (presentDays / totalDays) * 100;
  const percentage = Math.round(rawPercent * 10) / 10;
  const targetRatio = targetPercentage / 100;

  if (rawPercent >= targetPercentage) {
    const safeMisses = Math.max(
      0,
      Math.floor((presentDays - targetRatio * totalDays) / targetRatio)
    );
    const isAtRisk = percentage < targetPercentage + warningMarginPercent;
    const adviceMessage =
      safeMisses > 0
        ? `You can safely miss ${safeMisses} ${safeMisses === 1 ? 'day' : 'days'} without dropping below ${targetPercentage}%.`
        : `You are right at your ${targetPercentage}% target. Marking present tomorrow will create a safety buffer.`;

    return {
      totalDays,
      presentDays,
      absentDays,
      holidayDays,
      percentage,
      targetPercentage,
      status: isAtRisk ? 'AT_RISK' : 'ON_TRACK',
      daysCanBeMissed: safeMisses,
      daysNeeded: 0,
      isAboveTarget: true,
      adviceMessage,
    };
  } else {
    let needed = 0;
    let adviceMessage = '';
    if (targetPercentage >= 100) {
      needed = 0;
      adviceMessage = `You cannot reach 100% because ${absentDays} absence(s) were recorded. Try a 75% or 80% goal.`;
    } else {
      const denominator = 1 - targetRatio;
      const numerator = targetRatio * totalDays - presentDays;
      needed = Math.max(1, Math.ceil(numerator / denominator));
      adviceMessage = `You need to attend the next ${needed} consecutive ${needed === 1 ? 'day' : 'days'} to reach ${targetPercentage}%.`;
    }

    return {
      totalDays,
      presentDays,
      absentDays,
      holidayDays,
      percentage,
      targetPercentage,
      status: 'BELOW_TARGET',
      daysCanBeMissed: 0,
      daysNeeded: needed,
      isAboveTarget: false,
      adviceMessage,
    };
  }
}
