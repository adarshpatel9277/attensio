/**
 * Student Attendance Tracker - Core Types & Domain Models
 * Aligned with Android Room Entities and Application Architecture
 */

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'CANCELLED' | 'UNMARKED';

export type DayStatus = 'PRESENT' | 'ABSENT' | 'HOLIDAY';

export interface DayRecord {
  date: string; // YYYY-MM-DD
  status: DayStatus;
  isSpecialClass?: boolean; // When called on Sat/Sun
  note?: string;
  subjectName?: string;
  subjectCode?: string;
  timeSlot?: string;
  location?: string;
  updatedAt: string;
}

export interface CourseSubject {
  id: string;
  name: string;
  code: string;
  schedule: string;
  present: number;
  total: number;
  percentage: number;
  status: 'SAFE' | 'AT_RISK' | 'CAUTION';
  bunkStatus: string;
}

export interface DayAppSettings {
  targetPercentage: number;
  saturdayOff: boolean;
  sundayOff: boolean;
  saturdayPolicy?: 'FULL_OFF' | 'ALTERNATE' | 'FULL_WORKING';
  warningMargin: number; // e.g. 5 means within 5% of target is AT_RISK
  studentName?: string;
  collegeName?: string;
  courseName?: string;
  semester?: number;
  avatarUrl?: string;
  trackCourses?: boolean;
  onboardingCompleted?: boolean;
  collegeStartTime?: string; // HH:mm format, default "09:00"
  morningCallEnabled?: boolean; // Single toggle for Morning Call 3-alarm reminder schedule
  morningRollCallAlarm?: boolean; // Legacy fallback
  preCollegeAlarm?: boolean; // Legacy fallback
  eveningAuditAlarm?: boolean; // Legacy fallback
}

export interface DayAttendanceStats {
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
}

export type AttendanceSource = 'MANUAL' | 'LOCATION_REMINDER' | 'IMPORTED';

export type LeaveStatus = 'PERSONAL' | 'MEDICAL' | 'COLLEGE_HOLIDAY' | 'OTHER';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface UserProfile {
  id: string;
  displayName?: string;
  collegeName?: string;
  courseName?: string;
  rollNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  name: string;
  academicYear?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  semesterId: string;
  subjectName: string;
  subjectCode?: string;
  teacherName?: string;
  colorToken: string; // Accessible hex color
  targetAttendancePercent: number; // default 75
  totalClasses?: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  semesterId: string;
  date: string; // YYYY-MM-DD
  classStartTime?: string; // HH:mm
  classEndTime?: string; // HH:mm
  status: AttendanceStatus;
  source: AttendanceSource;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRecord {
  id: string;
  semesterId: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  leaveType: string;
  reason: string;
  note?: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  semesterId?: string; // optional or global
  date: string; // YYYY-MM-DD
  title: string;
  note?: string;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  isEnabled: boolean;
}

export interface LocationReminder {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isEnabled: boolean;
  reminderTitle: string;
  reminderMessage: string;
  activeDays: DayOfWeek[];
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  cooldownMinutes: number; // e.g. 180 min
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  themeMode: 'light' | 'dark' | 'system';
  defaultTargetPercent: number;
  warningMarginPercent: number; // e.g. 5% within target is "At Risk"
  notificationsEnabled: boolean;
  channelAttendanceReminders: boolean;
  channelLocationReminders: boolean;
  channelLowAttendanceAlerts: boolean;
  channelBackupReminders: boolean;
  locationReminderEnabled: boolean;
  biometricLockEnabled: boolean;
  lockTimeoutMinutes: number; // 0 = immediate, 1, 5, 15
  showWidgetSummary: boolean;
  widgetPrivacyMode: boolean; // hide subject names on widget
  firstDayOfWeek: 'MONDAY' | 'SUNDAY';
  defaultReminderMinutes: number;
  countLeaveInDenominator: boolean;
  appPin?: string; // fallback PIN for lock
  dailyReminderTime?: string;
  updatedAt: string;
}

export interface BackupMetadata {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  deviceIndependentBackupId: string;
}

export interface AppBackupData {
  metadata: BackupMetadata;
  userProfile: UserProfile;
  semesters: Semester[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  leaveRecords: LeaveRecord[];
  holidays: Holiday[];
  timetable: TimetableEntry[];
  locationReminders: LocationReminder[];
  settings: AppSettings;
}

export interface SubjectAttendanceSummary {
  subject: Subject;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  holidayCount: number;
  cancelledCount: number;
  unmarkedCount: number;
  totalCountedClasses: number; // present + absent (unless leave configured)
  attendancePercentage: number | null; // null if 0 classes
  targetPercentage: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BELOW_TARGET' | 'NO_DATA';
  classesNeededForTarget: number;
  classesCanBeMissed: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  channel: 'ATTENDANCE' | 'LOCATION' | 'LOW_ATTENDANCE' | 'BACKUP' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  targetScreen?: string;
}
