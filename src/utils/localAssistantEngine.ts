import { DayRecord, DayAppSettings, CourseSubject, DayAttendanceStats } from '../types';
import { getLocalTodayString, formatDisplayDate, parseLocalDate } from './dateUtils';
import { MorningCallManager } from './morningCallManager';

export interface AssistantContext {
  records: DayRecord[];
  settings: DayAppSettings;
  subjects?: CourseSubject[];
  stats: DayAttendanceStats;
}

export interface AssistantResponse {
  text: string;
  suggestedAction?: {
    label: string;
    tab?: 'dashboard' | 'log' | 'forecast' | 'settings';
  };
}

/**
 * Normalizes text: trims, lowercases, removes punctuation, maps common Hindi/Hinglish synonyms
 */
function normalizeQuery(input: string): string {
  let q = input.toLowerCase().trim();
  // Remove trailing and common punctuation
  q = q.replace(/[?!.,;:'"()]/g, ' ');
  q = q.replace(/\s+/g, ' ').trim();
  return q;
}

/**
 * Evaluates whether a query matches any of a list of keywords or regex patterns
 */
function matchesAny(query: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) => {
    if (typeof p === 'string') {
      return query.includes(p);
    }
    return p.test(query);
  });
}

/**
 * Extracts a specific date mentioned in query (e.g. "2026-10-20" or "yesterday" or "today")
 */
function extractDateFromQuery(query: string): string | null {
  if (query.includes('today') || query.includes('aaj')) {
    return getLocalTodayString();
  }
  if (query.includes('yesterday') || query.includes('kal') || query.includes('beeta kal')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Look for YYYY-MM-DD
  const isoMatch = query.match(/\b(20\d\d)[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Look for DD-MM-YYYY
  const reverseMatch = query.match(/\b(0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])[-/](20\d\d)\b/);
  if (reverseMatch) {
    return `${reverseMatch[3]}-${reverseMatch[2]}-${reverseMatch[1]}`;
  }

  return null;
}

/**
 * Main 100% Client-Side Local Assistant Intelligence Engine
 */
export function processLocalQuery(query: string, context: AssistantContext): AssistantResponse {
  const q = normalizeQuery(query);
  const { records, settings, stats, subjects = [] } = context;
  const target = settings.targetPercentage || 75;

  // =========================================================================
  // F. GREETINGS & BASIC CONVERSATION
  // =========================================================================
  if (matchesAny(q, ['good morning', 'shubh prabhat'])) {
    const namePart = settings.studentName ? `, ${settings.studentName}` : '';
    return {
      text: `Good morning${namePart}! ☀️ Today is ready for your roll call. How can I help with your attendance?`,
      suggestedAction: { label: "Check Today's Status", tab: 'dashboard' },
    };
  }

  if (matchesAny(q, ['good afternoon'])) {
    return {
      text: `Good afternoon! Hope your lectures are going well today. What would you like to check?`,
      suggestedAction: { label: 'My Attendance', tab: 'dashboard' },
    };
  }

  if (matchesAny(q, ['good evening'])) {
    return {
      text: `Good evening! Make sure all of today's classes are verified in your logs before the day closes.`,
      suggestedAction: { label: 'View Logs', tab: 'log' },
    };
  }

  if (matchesAny(q, ['good night', 'shubh ratri'])) {
    return {
      text: `Good night! Rest up for your upcoming college lectures tomorrow.`,
    };
  }

  if (matchesAny(q, [/^hi\b/, /^hello\b/, /^hey\b/, /^namaste\b/, /^hola\b/, /^sup\b/])) {
    const greeting = settings.studentName ? `Hello, ${settings.studentName}! 👋` : 'Hello! 👋';
    return {
      text: `${greeting} I am Attendify AI. You can ask me about your attendance percentage, today's status, classes needed, college schedule, Morning Call reminders, or profile details.`,
      suggestedAction: { label: 'My Attendance', tab: 'dashboard' },
    };
  }

  if (matchesAny(q, ['thank you', 'thanks', 'dhanyawad', 'shukriya', 'thx'])) {
    return {
      text: "You're very welcome! I'm always here to help you stay on track with your attendance goals.",
    };
  }

  if (matchesAny(q, [/^bye\b/, /^goodbye\b/, /^see you\b/, /^cya\b/, /^alvida\b/])) {
    return {
      text: 'Goodbye! Keep up the great attendance habit and have a productive day at college.',
    };
  }

  // =========================================================================
  // A. STUDENT PROFILE
  // =========================================================================

  // Name
  if (
    matchesAny(q, [
      'my name',
      'what is my name',
      'who am i',
      'mera naam',
      'mera nam',
      'student name',
    ])
  ) {
    if (settings.studentName && settings.studentName.trim().length > 0) {
      return {
        text: `Your recorded student name is ${settings.studentName}.`,
      };
    }
    return {
      text: "Your name has not been set yet. You can add it anytime in Settings.",
      suggestedAction: { label: 'Open Settings', tab: 'settings' },
    };
  }

  // College / University
  if (
    matchesAny(q, [
      'which college',
      'what is my college',
      'where do i study',
      'college name',
      'my university',
      'campus',
      'mera college',
      'college konsa',
    ])
  ) {
    if (settings.collegeName && settings.collegeName.trim().length > 0) {
      return {
        text: `You study at ${settings.collegeName}.`,
      };
    }
    return {
      text: "Your college name has not been recorded yet. You can configure your institution in Settings.",
      suggestedAction: { label: 'Set College in Settings', tab: 'settings' },
    };
  }

  // Course / Branch
  if (
    matchesAny(q, [
      'what is my course',
      'my branch',
      'which branch',
      'my degree',
      'what do i study',
      'mera course',
      'meri branch',
      'stream',
    ])
  ) {
    if (settings.courseName && settings.courseName.trim().length > 0) {
      return {
        text: `Your course & branch is ${settings.courseName}.`,
      };
    }
    return {
      text: "Your course or branch is not set yet in your profile. You can set it in Settings.",
      suggestedAction: { label: 'Configure Course', tab: 'settings' },
    };
  }

  // Semester
  if (
    matchesAny(q, [
      'which semester',
      'what semester',
      'my semester',
      'current semester',
      'konsa semester',
      'sem konsa',
    ])
  ) {
    if (settings.semester) {
      return {
        text: `You are currently enrolled in Semester ${settings.semester}.`,
      };
    }
    return {
      text: "Your semester is not recorded yet. You can update it in Settings.",
      suggestedAction: { label: 'Set Semester', tab: 'settings' },
    };
  }

  // Full Profile / Enrollment Summary
  if (
    matchesAny(q, [
      'profile information',
      'my profile',
      'enrollment info',
      'my details',
      'student details',
      'meri profile',
    ])
  ) {
    const lines = [
      `• Name: ${settings.studentName || 'Not configured'}`,
      `• College: ${settings.collegeName || 'Not configured'}`,
      `• Course: ${settings.courseName || 'Not configured'}`,
      `• Semester: ${settings.semester ? `Semester ${settings.semester}` : 'Not configured'}`,
      `• Attendance Target: ${target}%`,
    ];
    return {
      text: `Here is your current profile summary:\n\n${lines.join('\n')}`,
      suggestedAction: { label: 'Edit Profile in Settings', tab: 'settings' },
    };
  }

  // =========================================================================
  // C. MORNING CALL & NOTIFICATIONS
  // =========================================================================

  // What is Morning Call?
  if (
    matchesAny(q, [
      'what is morning call',
      'morning call kya hai',
      'explain morning call',
      'about morning call',
    ])
  ) {
    const startTime = settings.collegeStartTime || '09:00';
    const slots = MorningCallManager.getDailySlots(startTime);
    return {
      text: `Morning Call is Attendify's smart daily attendance reminder feature. On college working days, it delivers reminders at three scheduled times:\n\n1. ${slots[0].displayTime}: College start check-in\n2. 12:00 PM: Midday reminder\n3. 03:45 PM: Pre-wrap audit\n\nIt automatically suppresses unnecessary reminders once today's attendance has been marked, and never notifies you on weekends or holidays.`,
      suggestedAction: { label: 'View Morning Call Settings', tab: 'settings' },
    };
  }

  // What time does college start?
  if (
    matchesAny(q, [
      'what time does my college start',
      'college start time',
      'what time does college start',
      'college kab shuru hota hai',
      'college timing',
      'first class time',
    ])
  ) {
    const startTime = settings.collegeStartTime || '09:00';
    const formatted = MorningCallManager.formatTime12h(startTime);
    return {
      text: `Your college start time is set to ${formatted} (${startTime}).`,
      suggestedAction: { label: 'Change in Settings', tab: 'settings' },
    };
  }

  // Is Morning Call enabled?
  if (
    matchesAny(q, [
      'is morning call enabled',
      'is morning call on',
      'morning call status',
      'is reminder active',
      'morning call chalu hai kya',
    ])
  ) {
    const isEnabled = settings.morningCallEnabled !== false;
    const overview = MorningCallManager.getScheduleOverview(settings, records);
    if (isEnabled) {
      return {
        text: `Yes, Morning Call is currently ENABLED. Next reminder: ${overview.nextReminderDisplay}.`,
        suggestedAction: { label: 'Morning Call Settings', tab: 'settings' },
      };
    } else {
      return {
        text: 'Morning Call is currently DISABLED. You can enable it in Settings to receive attendance reminders.',
        suggestedAction: { label: 'Enable in Settings', tab: 'settings' },
      };
    }
  }

  // What are my reminder times?
  if (
    matchesAny(q, [
      'reminder times',
      'when are my reminders',
      'notification schedule',
      'reminder schedule',
      'reminders timing',
      'alert times',
    ])
  ) {
    const slots = MorningCallManager.getDailySlots(settings.collegeStartTime || '09:00');
    return {
      text: `Your Morning Call reminders are scheduled for:\n\n• ${slots[0].displayTime} (College Start)\n• ${slots[1].displayTime} (Midday Check-In)\n• ${slots[2].displayTime} (Pre-Closing Confirmation)\n\nNote: Reminders only fire on working days and pause once you mark attendance today.`,
      suggestedAction: { label: 'Manage Morning Call', tab: 'settings' },
    };
  }

  // How to enable or disable Morning Call
  if (
    matchesAny(q, [
      'how to enable morning call',
      'how do i enable morning call',
      'turn on morning call',
      'enable morning call',
      'disable morning call',
      'how to disable morning call',
      'turn off morning call',
    ])
  ) {
    return {
      text: "You can toggle Morning Call on or off by going to Settings > Morning Call and flipping the switch, then tapping 'Save Preferences'.",
      suggestedAction: { label: 'Open Settings', tab: 'settings' },
    };
  }

  // Next reminder
  if (
    matchesAny(q, [
      'next reminder',
      'when is my next attendance reminder',
      'next alarm',
      'agla reminder kab hai',
    ])
  ) {
    const overview = MorningCallManager.getScheduleOverview(settings, records);
    if (settings.morningCallEnabled === false) {
      return {
        text: 'Morning Call is currently disabled, so no future reminders are scheduled.',
        suggestedAction: { label: 'Enable in Settings', tab: 'settings' },
      };
    }
    return {
      text: `Your next attendance reminder is scheduled for: ${overview.nextReminderDisplay}.`,
    };
  }

  // =========================================================================
  // D. WORKING DAYS & ROUTINE
  // =========================================================================

  // Which days are weekends / off-days?
  if (
    matchesAny(q, [
      'which days are weekends',
      'weekly off',
      'off days',
      'saturday off',
      'sunday off',
      'weekly holidays',
      'chutti ke din',
    ])
  ) {
    const sunOff = settings.sundayOff !== false ? 'Every Sunday is an off-day.' : 'Sundays are instructional.';
    let satPolicy = 'Saturdays are fully off.';
    if (settings.saturdayPolicy === 'ALTERNATE') {
      satPolicy = 'Alternate Saturdays are off (1st & 3rd off, others working).';
    } else if (settings.saturdayPolicy === 'FULL_WORKING') {
      satPolicy = 'Saturdays are full working days.';
    }
    return {
      text: `Your configured weekly holiday schedule:\n\n• ${sunOff}\n• ${satPolicy}\n• Monday through Friday are standard working days.`,
      suggestedAction: { label: 'Adjust Schedule in Settings', tab: 'settings' },
    };
  }

  // Is college open today? Is today a holiday?
  if (
    matchesAny(q, [
      'is college open today',
      'is today a holiday',
      'is today working',
      'kya college khula hai',
      'kya aaj chutti hai',
      'aaj college hai',
      'college open today',
    ])
  ) {
    const today = new Date();
    const todayStr = getLocalTodayString();
    const isWorking = MorningCallManager.isWorkingDay(today, settings, records);
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    const holidayRec = records.find((r) => r.date === todayStr && r.status === 'HOLIDAY');

    if (holidayRec) {
      const note = holidayRec.note ? ` (${holidayRec.note})` : '';
      return {
        text: `No, today (${dayName}) is recorded as a Holiday / Off-day${note}.`,
      };
    }

    if (isWorking) {
      return {
        text: `Yes, today (${dayName}) is a scheduled college working day. Remember to log your attendance!`,
        suggestedAction: { label: 'Mark Roll Call', tab: 'dashboard' },
      };
    } else {
      return {
        text: `No, today (${dayName}) is a configured weekly off-day / weekend according to your college schedule settings.`,
      };
    }
  }

  // Next working day
  if (
    matchesAny(q, [
      'next working day',
      'when is my next working day',
      'next class day',
      'agla working day',
    ])
  ) {
    const d = new Date();
    for (let i = 1; i <= 14; i++) {
      d.setDate(d.getDate() + 1);
      if (MorningCallManager.isWorkingDay(d, settings, records)) {
        const nextDayStr = formatDisplayDate(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`
        );
        return {
          text: `Your next college working day is ${nextDayStr}.`,
        };
      }
    }
    return {
      text: 'Could not calculate next working day from current settings.',
    };
  }

  // =========================================================================
  // E. DATA VAULT & EXPORT
  // =========================================================================

  // What happens when I export?
  if (
    matchesAny(q, [
      'what happens when i export',
      'what does export do',
      'exporting data',
      'export karne se kya hota hai',
    ])
  ) {
    return {
      text: 'When you export, Attendify generates a downloadable file (.csv or .json) containing your attendance records and downloads it directly to your device. It NEVER deletes, uploads, or modifies your existing attendance records.',
      suggestedAction: { label: 'Go to Data Vault', tab: 'settings' },
    };
  }

  // How to download CSV?
  if (
    matchesAny(q, [
      'how do i download my csv',
      'download csv',
      'export csv',
      'csv export',
      'csv download kaise kare',
    ])
  ) {
    return {
      text: "To download your CSV, go to Settings > Data Vault and tap 'Export CSV'. It will generate an attendance-export-YYYY-MM-DD.csv file and save it directly to your device's Downloads.",
      suggestedAction: { label: 'Open Data Vault', tab: 'settings' },
    };
  }

  // What does Download JSON do?
  if (
    matchesAny(q, [
      'what does download json do',
      'download json',
      'json backup',
      'what is data vault',
    ])
  ) {
    return {
      text: 'Download JSON creates a full, structured backup file (.json) of your attendance records, target goals, and profile settings. You can keep this backup safe and import it back into Attendify anytime.',
      suggestedAction: { label: 'Open Data Vault', tab: 'settings' },
    };
  }

  // Does exporting delete my attendance?
  if (
    matchesAny(q, [
      'does exporting delete my attendance',
      'does exporting delete',
      'will export delete',
      'kya export karne se delete hoga',
    ])
  ) {
    return {
      text: 'No! Exporting NEVER deletes or resets your attendance records. It only creates a safe local copy for your personal records.',
    };
  }

  // Where can I find my downloaded file?
  if (
    matchesAny(q, [
      'where can i find my downloaded file',
      'where is my file',
      'download location',
      'file kahan milegi',
    ])
  ) {
    return {
      text: "Your downloaded file is located in your device's default Downloads folder (or your browser's download manager). The file is named attendance-export-YYYY-MM-DD.csv.",
    };
  }

  // =========================================================================
  // B. ATTENDANCE INFORMATION
  // =========================================================================

  // Specific date query (e.g. "what happened on 2026-10-20" or "yesterday attendance")
  const mentionedDate = extractDateFromQuery(q);
  if (
    mentionedDate &&
    matchesAny(q, [
      'what happened',
      'attendance on',
      'was i present',
      'was i absent',
      'status on',
      'record on',
      'attendance',
    ]) &&
    !matchesAny(q, ['today', 'aaj'])
  ) {
    const rec = records.find((r) => r.date === mentionedDate);
    const dateFormatted = formatDisplayDate(mentionedDate);
    if (!rec) {
      return {
        text: `No attendance record found for ${dateFormatted} (${mentionedDate}). It may not have been logged.`,
        suggestedAction: { label: 'View Daily Log', tab: 'log' },
      };
    }
    const statusText =
      rec.status === 'PRESENT' ? 'Present' : rec.status === 'ABSENT' ? 'Absent' : 'Off / Holiday';
    const noteText = rec.note ? ` Note: "${rec.note}"` : '';
    return {
      text: `On ${dateFormatted}, your attendance was recorded as ${statusText}.${noteText}`,
      suggestedAction: { label: 'View in Daily Log', tab: 'log' },
    };
  }

  // Today's attendance status & short-form equivalents
  const isTodayStatusQuery =
    q === 'today status' ||
    q === 'status today' ||
    q === 'today' ||
    q === 'status' ||
    q === 'aaj' ||
    q === 'aaj ka' ||
    q === 'aaj status' ||
    q === 'current status' ||
    (q.includes('today') && (q.includes('status') || q.includes('attendance') || q.includes('mark') || q.includes('present') || q.includes('absent'))) ||
    (q.includes('aaj') && (q.includes('status') || q.includes('attendance') || q.includes('mark') || q.includes('lagi'))) ||
    matchesAny(q, [
      "today's attendance status",
      'today s attendance status',
      'today status',
      'status today',
      'todays status',
      'what is today status',
      'aaj ki attendance',
      'aaj ka attendance',
      'did i mark today',
      'aaj ka status',
      'marked today',
      'attendance status',
      'roll call today',
    ]);

  if (isTodayStatusQuery) {
    const todayStr = getLocalTodayString();
    const todayRec = records.find((r) => r.date === todayStr);
    const dateFormatted = formatDisplayDate(todayStr);

    if (todayRec) {
      const statusText =
        todayRec.status === 'PRESENT'
          ? 'Present'
          : todayRec.status === 'ABSENT'
          ? 'Absent'
          : 'Off / Holiday';
      return {
        text: `Today (${dateFormatted}) is marked as ${statusText}.`,
        suggestedAction: { label: 'View Dashboard', tab: 'dashboard' },
      };
    }

    return {
      text: `Today (${dateFormatted}) has not been marked yet. You can mark Present, Absent, or Off directly on your Dashboard.`,
      suggestedAction: { label: 'Mark Today on Dashboard', tab: 'dashboard' },
    };
  }

  // Attendance percentage & overall rate short-forms
  if (
    q === 'attendance' ||
    q === 'percentage' ||
    q === 'my attendance' ||
    q === 'percent' ||
    matchesAny(q, [
      'attendance percentage',
      'what is my attendance',
      'current attendance',
      'how much attendance do i have',
      'how much attendance',
      'percentage kitna',
      'meri attendance',
      'attendance kitni',
      'attendance rate',
      'overall attendance',
      'mera attendance',
      'mera percentage',
    ])
  ) {
    if (stats.percentage === null || stats.totalDays === 0) {
      return {
        text: "You haven't logged any attendance records yet. Once you mark your daily roll call, your overall percentage will appear here.",
        suggestedAction: { label: 'Mark Today on Dashboard', tab: 'dashboard' },
      };
    }

    const pctStr = `${stats.percentage.toFixed(1)}%`;
    let advice = '';
    if (stats.daysNeeded > 0) {
      advice = ` You need to attend the next ${stats.daysNeeded} consecutive classes to reach your ${target}% target.`;
    } else {
      advice = ` You are safely above your goal and can skip up to ${stats.daysCanBeMissed} classes.`;
    }

    return {
      text: `Your current overall attendance is ${pctStr} (Goal: ${target}%).${advice}`,
      suggestedAction: { label: 'Open Absence Simulator', tab: 'forecast' },
    };
  }

  // Attendance Goal / Target
  if (
    matchesAny(q, [
      'attendance goal',
      'what is my attendance goal',
      'target percentage',
      'attendance target',
      'target kitna hai',
      'goal kya hai',
    ])
  ) {
    return {
      text: `Your target attendance goal is ${target}%. Your current attendance is ${
        stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : 'not calculated yet'
      }.`,
      suggestedAction: { label: 'Adjust Target in Settings', tab: 'settings' },
    };
  }

  // How much needed to reach target / How many additional lectures
  if (
    matchesAny(q, [
      'how much attendance do i need',
      'need to reach',
      'how many additional lectures',
      'additional lectures must i attend',
      'classes needed',
      'kitni class chahiye',
      'kitne attend karne honge',
    ])
  ) {
    if (stats.totalDays === 0) {
      return {
        text: `No classes recorded yet. Log your first classes to calculate the exact attendance requirement for ${target}%.`,
        suggestedAction: { label: 'Mark Roll Call', tab: 'dashboard' },
      };
    }

    if (stats.daysNeeded > 0) {
      return {
        text: `You need to attend ${stats.daysNeeded} consecutive classes without absence to achieve your ${target}% target.`,
        suggestedAction: { label: 'Simulate Attendance', tab: 'forecast' },
      };
    }

    return {
      text: `You are already exceeding your ${target}% target! You do not need additional recovery classes right now (Safe buffer: ${stats.daysCanBeMissed} skips).`,
      suggestedAction: { label: 'Absence Simulator', tab: 'forecast' },
    };
  }

  // Am I meeting my target?
  if (
    matchesAny(q, [
      'am i meeting my attendance target',
      'am i meeting my target',
      'meeting my target',
      'meeting target',
      'am i safe',
      'am i on track',
      'safe hoon kya',
      'below target',
      'above target',
    ])
  ) {
    if (stats.totalDays === 0) {
      return {
        text: 'You have not recorded any attendance yet.',
        suggestedAction: { label: 'Mark Attendance', tab: 'dashboard' },
      };
    }

    if (stats.isAboveTarget) {
      return {
        text: `Yes, you are safely on track! Your attendance is ${stats.percentage?.toFixed(
          1
        )}%, which is above your ${target}% target (+${(stats.percentage! - target).toFixed(
          1
        )}% buffer).`,
      };
    }

    return {
      text: `No, you are currently below target at ${stats.percentage?.toFixed(
        1
      )}% (Goal: ${target}%). You need ${stats.daysNeeded} consecutive attendances to recover.`,
      suggestedAction: { label: 'View Recovery Forecast', tab: 'forecast' },
    };
  }

  // How many lectures have I attended? Present days
  if (
    matchesAny(q, [
      'how many lectures have i attended',
      'how many classes attended',
      'present days',
      'total attended',
      'present kitne',
      'attended lectures',
    ])
  ) {
    return {
      text: `You have attended ${stats.presentDays} class days out of ${stats.totalDays} total recorded days.`,
      suggestedAction: { label: 'View History List', tab: 'log' },
    };
  }

  // How many lectures have I missed? Absent days
  if (
    matchesAny(q, [
      'how many lectures have i missed',
      'how many classes missed',
      'absent days',
      'total missed',
      'absent kitne',
      'missed lectures',
    ])
  ) {
    return {
      text: `You have missed ${stats.absentDays} class days out of ${stats.totalDays} total recorded days.`,
      suggestedAction: { label: 'View History List', tab: 'log' },
    };
  }

  // Which days was I present?
  if (
    matchesAny(q, [
      'which days was i present',
      'days i was present',
      'list present days',
      'present kab tha',
    ])
  ) {
    const presentList = records
      .filter((r) => r.status === 'PRESENT')
      .slice(-5)
      .map((r) => `• ${formatDisplayDate(r.date)}`);

    if (presentList.length === 0) {
      return {
        text: "You haven't logged any 'Present' days yet.",
      };
    }

    return {
      text: `Here are your most recent Present days:\n\n${presentList.join(
        '\n'
      )}\n\n(Total: ${stats.presentDays} days)`,
      suggestedAction: { label: 'View All Logs', tab: 'log' },
    };
  }

  // Which days was I absent?
  if (
    matchesAny(q, [
      'which days was i absent',
      'days i was absent',
      'list absent days',
      'absent kab tha',
    ])
  ) {
    const absentList = records
      .filter((r) => r.status === 'ABSENT')
      .slice(-5)
      .map((r) => `• ${formatDisplayDate(r.date)}`);

    if (absentList.length === 0) {
      return {
        text: "Great job! You have zero recorded 'Absent' days.",
      };
    }

    return {
      text: `Here are your most recent Absent days:\n\n${absentList.join(
        '\n'
      )}\n\n(Total: ${stats.absentDays} days)`,
      suggestedAction: { label: 'View All Logs', tab: 'log' },
    };
  }

  // What was my attendance last week?
  if (
    matchesAny(q, [
      'attendance last week',
      'last week attendance',
      'pichle hafte',
      'past week',
    ])
  ) {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentRecords = records.filter((r) => {
      const d = parseLocalDate(r.date);
      return d >= sevenDaysAgo && d <= today;
    });

    const p = recentRecords.filter((r) => r.status === 'PRESENT').length;
    const a = recentRecords.filter((r) => r.status === 'ABSENT').length;
    const total = p + a;
    const pct = total > 0 ? ((p / total) * 100).toFixed(1) : null;

    if (recentRecords.length === 0) {
      return {
        text: 'No attendance records logged in the past 7 days.',
      };
    }

    return {
      text: `In the last 7 days: You were Present on ${p} days and Absent on ${a} days${
        pct ? ` (${pct}% attendance rate)` : ''
      }.`,
      suggestedAction: { label: 'View Daily Log', tab: 'log' },
    };
  }

  // =========================================================================
  // G. STRICT SCOPE GUARD & OUT-OF-SCOPE FALLBACK
  // =========================================================================
  return {
    text: "I am Attendify AI. I can answer questions about your attendance records, today's status, college schedule, Morning Call reminders, profile, and data exports.\n\nTry asking: 'Today's status', 'What is my attendance percentage?', 'Is college open today?', or 'How many classes do I need?'.",
  };
}
