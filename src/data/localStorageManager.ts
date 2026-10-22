/**
 * Local Storage Repository & Database Layer
 * Simulates Room Database persistence with reactive subscriptions and versioned schema
 */

import {
  AppBackupData,
  AppSettings,
  DayAppSettings,
  AttendanceRecord,
  DayRecord,
  Holiday,
  LeaveRecord,
  LocationReminder,
  Semester,
  Subject,
  TimetableEntry,
  UserProfile,
  AppNotification,
} from '../types';

const STORAGE_KEY_PREFIX = 'sat_v1_';
const SCHEMA_VERSION = 1;
const APP_VERSION = '1.0.0';

export const INITIAL_SETTINGS: AppSettings = {
  themeMode: 'light',
  defaultTargetPercent: 75,
  warningMarginPercent: 5,
  notificationsEnabled: true,
  channelAttendanceReminders: true,
  channelLocationReminders: true,
  channelLowAttendanceAlerts: true,
  channelBackupReminders: true,
  locationReminderEnabled: false,
  biometricLockEnabled: false,
  lockTimeoutMinutes: 0,
  showWidgetSummary: true,
  widgetPrivacyMode: false,
  firstDayOfWeek: 'MONDAY',
  defaultReminderMinutes: 15,
  countLeaveInDenominator: false,
  updatedAt: new Date().toISOString(),
};

// Accessible color tokens for subjects
export const ACCESSIBLE_COLORS = [
  '#D95D29', // Burnt Orange (Primary accent)
  '#2563EB', // Cobalt Blue
  '#059669', // Forest Emerald
  '#7C3AED', // Deep Violet
  '#D97706', // Warm Amber
  '#DB2777', // Magenta Berry
  '#0891B2', // Pacific Teal
  '#4F46E5', // Indigo
  '#475569', // Slate
];

// Fallback in-memory storage for environments where localStorage is restricted
const memoryStorage = new Map<string, string>();

function safeStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`localStorage read error for key ${key}:`, e);
  }
  return memoryStorage.get(key) ?? null;
}

function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`localStorage write error for key ${key}:`, e);
  }
  memoryStorage.set(key, value);
}

function safeStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`localStorage remove error for key ${key}:`, e);
  }
  memoryStorage.delete(key);
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = safeStorageGet(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    safeStorageSet(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Simple event bus for reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToDatabase(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

// One-time cleanup for fresh initialization ensuring no demo data persists
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const hasCleaned = window.localStorage.getItem(STORAGE_KEY_PREFIX + 'v2_clean_init');
    if (!hasCleaned) {
      const rawRecords = window.localStorage.getItem(STORAGE_KEY_PREFIX + 'day_records');
      if (rawRecords && rawRecords.includes('Dijkstra implementation passed tests')) {
        window.localStorage.removeItem(STORAGE_KEY_PREFIX + 'day_records');
        window.localStorage.removeItem(STORAGE_KEY_PREFIX + 'course_subjects');
        window.localStorage.removeItem(STORAGE_KEY_PREFIX + 'day_app_settings');
      }
      window.localStorage.setItem(STORAGE_KEY_PREFIX + 'v2_clean_init', 'true');
    }
  }
} catch {
  // Ignore in SSR / non-browser env
}

export class LocalDatabaseRepository {
  // Profiles
  static getUserProfile(): UserProfile {
    return getItem<UserProfile>('profile', {
      id: 'default_profile',
      displayName: 'Adarsh',
      collegeName: 'National Institute of Technology',
      courseName: 'Computer Science & Engineering',
      rollNumber: 'CS2026-042',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  static saveUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    setItem('profile', updated);
    return updated;
  }

  // Semesters
  static getSemesters(): Semester[] {
    const list = getItem<Semester[]>('semesters', []);
    if (list.length === 0) {
      // Seed default active semester
      const initialSem: Semester = {
        id: 'sem_current_6',
        name: 'Semester 6',
        academicYear: '2025-2026',
        startDate: '2026-01-05',
        endDate: '2026-05-25',
        isActive: true,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItem('semesters', [initialSem]);
      return [initialSem];
    }
    return list;
  }

  static saveSemester(semester: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Semester {
    const semesters = this.getSemesters();
    const now = new Date().toISOString();
    let updatedSemester: Semester;

    if (semester.id) {
      const idx = semesters.findIndex((s) => s.id === semester.id);
      if (idx !== -1) {
        updatedSemester = { ...semesters[idx], ...semester, updatedAt: now };
        semesters[idx] = updatedSemester;
      } else {
        updatedSemester = { ...semester, id: semester.id, createdAt: now, updatedAt: now };
        semesters.push(updatedSemester);
      }
    } else {
      updatedSemester = {
        ...semester,
        id: 'sem_' + Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      semesters.push(updatedSemester);
    }

    // If marked active, ensure other semesters are inactive
    if (updatedSemester.isActive) {
      for (const s of semesters) {
        if (s.id !== updatedSemester.id) {
          s.isActive = false;
        }
      }
    }

    setItem('semesters', semesters);
    return updatedSemester;
  }

  static setActiveSemester(id: string): void {
    const semesters = this.getSemesters();
    for (const s of semesters) {
      s.isActive = s.id === id;
    }
    setItem('semesters', semesters);
  }

  static getActiveSemester(): Semester | null {
    const semesters = this.getSemesters();
    return semesters.find((s) => s.isActive && !s.isArchived) || semesters[0] || null;
  }

  static getSubjectsBySemester(semesterId: string): Subject[] {
    return this.getSubjects(semesterId);
  }

  static saveAttendanceRecord(
    record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): AttendanceRecord {
    return this.markAttendance(record).record;
  }

  static archiveSemester(id: string, isArchived: boolean): void {
    const semesters = this.getSemesters();
    const target = semesters.find((s) => s.id === id);
    if (target) {
      target.isArchived = isArchived;
      if (isArchived && target.isActive) {
        target.isActive = false;
        const fallback = semesters.find((s) => !s.isArchived && s.id !== id);
        if (fallback) fallback.isActive = true;
      }
      setItem('semesters', semesters);
    }
  }

  static deleteSemester(id: string): { success: boolean; message: string } {
    const semesters = this.getSemesters();
    const target = semesters.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Semester not found.' };

    const remaining = semesters.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      return { success: false, message: 'Cannot delete the only semester. Create another one first.' };
    }

    if (target.isActive) {
      remaining[0].isActive = true;
    }

    // Also delete linked subjects and attendance
    const subjects = this.getSubjects().filter((s) => s.semesterId !== id);
    const records = this.getAttendanceRecords().filter((r) => r.semesterId !== id);
    const leaves = this.getLeaveRecords().filter((l) => l.semesterId !== id);

    setItem('semesters', remaining);
    setItem('subjects', subjects);
    setItem('attendance', records);
    setItem('leaves', leaves);

    return { success: true, message: `Semester "${target.name}" and associated records were removed.` };
  }

  // Subjects
  static getSubjects(semesterId?: string): Subject[] {
    let subjects = getItem<Subject[]>('subjects', []);
    if (subjects.length === 0) {
      const sem = this.getSemesters()[0];
      const initialSubjects: Subject[] = [
        {
          id: 'sub_algo',
          semesterId: sem.id,
          subjectName: 'Design & Analysis of Algorithms',
          subjectCode: 'CS301',
          teacherName: 'Prof. Ramesh Sharma',
          colorToken: '#D95D29',
          targetAttendancePercent: 75,
          totalClasses: 32,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sub_os',
          semesterId: sem.id,
          subjectName: 'Operating Systems & Virtualization',
          subjectCode: 'CS302',
          teacherName: 'Dr. Anita Roy',
          colorToken: '#2563EB',
          targetAttendancePercent: 80,
          totalClasses: 28,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sub_cn',
          semesterId: sem.id,
          subjectName: 'Computer Networks',
          subjectCode: 'CS303',
          teacherName: 'Prof. K. Venkatesh',
          colorToken: '#059669',
          targetAttendancePercent: 75,
          totalClasses: 30,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sub_dbms',
          semesterId: sem.id,
          subjectName: 'Database Management Systems Lab',
          subjectCode: 'CS304',
          teacherName: 'Prof. Sneha Patil',
          colorToken: '#7C3AED',
          targetAttendancePercent: 85,
          totalClasses: 18,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setItem('subjects', initialSubjects);
      subjects = initialSubjects;

      // Also seed realistic initial records so user sees immediate live data
      this.seedInitialRecords(initialSubjects, sem.id);
    }

    if (semesterId) {
      return subjects.filter((s) => s.semesterId === semesterId);
    }
    return subjects;
  }

  static saveSubject(subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Subject {
    const subjects = getItem<Subject[]>('subjects', []);
    const now = new Date().toISOString();
    let saved: Subject;

    if (subject.id) {
      const idx = subjects.findIndex((s) => s.id === subject.id);
      if (idx !== -1) {
        saved = { ...subjects[idx], ...subject, updatedAt: now };
        subjects[idx] = saved;
      } else {
        saved = { ...subject, id: subject.id, createdAt: now, updatedAt: now };
        subjects.push(saved);
      }
    } else {
      saved = {
        ...subject,
        id: 'sub_' + Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      subjects.push(saved);
    }

    setItem('subjects', subjects);
    return saved;
  }

  static deleteSubject(id: string): void {
    const subjects = getItem<Subject[]>('subjects', []).filter((s) => s.id !== id);
    const records = getItem<AttendanceRecord[]>('attendance', []).filter((r) => r.subjectId !== id);
    setItem('subjects', subjects);
    setItem('attendance', records);
  }

  // Attendance Records
  static getAttendanceRecords(semesterId?: string, subjectId?: string): AttendanceRecord[] {
    let records = getItem<AttendanceRecord[]>('attendance', []);
    if (semesterId) {
      records = records.filter((r) => r.semesterId === semesterId);
    }
    if (subjectId) {
      records = records.filter((r) => r.subjectId === subjectId);
    }
    return records;
  }

  static markAttendance(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): {
    record: AttendanceRecord;
    isUpdate: boolean;
  } {
    const records = getItem<AttendanceRecord[]>('attendance', []);
    const now = new Date().toISOString();

    // Check for duplicate policy: combination of subjectId + date + optional classStartTime
    const existingIndex = records.findIndex(
      (r) =>
        r.subjectId === record.subjectId &&
        r.date === record.date &&
        (record.classStartTime ? r.classStartTime === record.classStartTime : !r.classStartTime || r.classStartTime === '')
    );

    let finalRecord: AttendanceRecord;
    let isUpdate = false;

    if (record.id) {
      const idx = records.findIndex((r) => r.id === record.id);
      if (idx !== -1) {
        finalRecord = { ...records[idx], ...record, updatedAt: now };
        records[idx] = finalRecord;
        isUpdate = true;
      } else {
        finalRecord = { ...record, id: record.id, createdAt: now, updatedAt: now };
        records.push(finalRecord);
      }
    } else if (existingIndex !== -1) {
      // Update existing record for same subject, date and time
      finalRecord = {
        ...records[existingIndex],
        status: record.status,
        source: record.source,
        note: record.note !== undefined ? record.note : records[existingIndex].note,
        updatedAt: now,
      };
      records[existingIndex] = finalRecord;
      isUpdate = true;
    } else {
      finalRecord = {
        ...record,
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: now,
        updatedAt: now,
      };
      records.push(finalRecord);
    }

    setItem('attendance', records);
    return { record: finalRecord, isUpdate };
  }

  static deleteAttendanceRecord(id: string): void {
    const records = getItem<AttendanceRecord[]>('attendance', []).filter((r) => r.id !== id);
    setItem('attendance', records);
  }

  // Seed sample records so dashboard is instantly informative and testable
  private static seedInitialRecords(subjects: Subject[], semesterId: string) {
    const records: AttendanceRecord[] = [];
    const today = new Date();

    // Generate past 3 weeks of attendances
    for (let dayOffset = 21; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // weekend

      const dateStr = d.toISOString().split('T')[0];

      subjects.forEach((sub, subIdx) => {
        // Distribute realistic patterns:
        // sub 0 (Algorithms): High attendance (~85%)
        // sub 1 (OS): Needs attention (~71% below 80%)
        // sub 2 (Networks): Borderline (~74% near 75%)
        // sub 3 (DBMS Lab): Very high (~90%)
        let status: AttendanceRecord['status'] = 'PRESENT';
        if (subIdx === 1 && (dayOffset === 2 || dayOffset === 8 || dayOffset === 15)) {
          status = 'ABSENT';
        } else if (subIdx === 2 && (dayOffset === 4 || dayOffset === 11 || dayOffset === 18)) {
          status = 'ABSENT';
        } else if (subIdx === 0 && dayOffset === 12) {
          status = 'ABSENT';
        } else if (dayOffset === 16) {
          status = 'HOLIDAY';
        }

        records.push({
          id: `seed_${sub.id}_${dateStr}`,
          subjectId: sub.id,
          semesterId,
          date: dateStr,
          classStartTime: `${9 + subIdx}:00`,
          classEndTime: `${10 + subIdx}:00`,
          status,
          source: 'MANUAL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    setItem('attendance', records);
  }

  // Leaves & Holidays
  static getLeaveRecords(semesterId?: string): LeaveRecord[] {
    let leaves = getItem<LeaveRecord[]>('leaves', []);
    if (leaves.length === 0) {
      const sem = this.getSemesters()[0];
      const initialLeave: LeaveRecord = {
        id: 'leave_1',
        semesterId: sem.id,
        dateFrom: '2026-02-10',
        dateTo: '2026-02-11',
        leaveType: 'Medical Sick Leave',
        reason: 'Viral fever diagnosed by campus health center',
        status: 'MEDICAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItem('leaves', [initialLeave]);
      leaves = [initialLeave];
    }
    if (semesterId) {
      return leaves.filter((l) => l.semesterId === semesterId);
    }
    return leaves;
  }

  static saveLeaveRecord(leave: Omit<LeaveRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): LeaveRecord {
    const leaves = getItem<LeaveRecord[]>('leaves', []);
    const now = new Date().toISOString();
    let saved: LeaveRecord;

    if (leave.id) {
      const idx = leaves.findIndex((l) => l.id === leave.id);
      if (idx !== -1) {
        saved = { ...leaves[idx], ...leave, updatedAt: now };
        leaves[idx] = saved;
      } else {
        saved = { ...leave, id: leave.id, createdAt: now, updatedAt: now };
        leaves.push(saved);
      }
    } else {
      saved = {
        ...leave,
        id: 'leave_' + Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      leaves.push(saved);
    }

    setItem('leaves', leaves);
    return saved;
  }

  static deleteLeaveRecord(id: string): void {
    const leaves = getItem<LeaveRecord[]>('leaves', []).filter((l) => l.id !== id);
    setItem('leaves', leaves);
  }

  // Holidays
  static getHolidays(semesterId?: string): Holiday[] {
    let holidays = getItem<Holiday[]>('holidays', []);
    if (holidays.length === 0) {
      const initial: Holiday[] = [
        { id: 'hol_1', date: '2026-01-26', title: 'Republic Day', note: 'National Holiday', createdAt: new Date().toISOString() },
        { id: 'hol_2', date: '2026-03-03', title: 'Holi Festival', note: 'Campus closed', createdAt: new Date().toISOString() },
        { id: 'hol_3', date: '2026-04-14', title: 'Ambedkar Jayanti', note: 'Gazetted Holiday', createdAt: new Date().toISOString() },
      ];
      setItem('holidays', initial);
      holidays = initial;
    }
    if (semesterId) {
      return holidays.filter((h) => !h.semesterId || h.semesterId === semesterId);
    }
    return holidays;
  }

  static saveHoliday(holiday: Omit<Holiday, 'id' | 'createdAt'> & { id?: string }): Holiday {
    const holidays = getItem<Holiday[]>('holidays', []);
    const saved: Holiday = {
      ...holiday,
      id: holiday.id || 'hol_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const idx = holidays.findIndex((h) => h.id === saved.id);
    if (idx !== -1) {
      holidays[idx] = saved;
    } else {
      holidays.push(saved);
    }
    setItem('holidays', holidays);
    return saved;
  }

  static deleteHoliday(id: string): void {
    const holidays = getItem<Holiday[]>('holidays', []).filter((h) => h.id !== id);
    setItem('holidays', holidays);
  }

  // Location Reminder
  static getLocationReminder(): LocationReminder {
    return getItem<LocationReminder>('locationReminder', {
      id: 'loc_college_campus',
      name: 'Campus Main Gate & Academic Block',
      latitude: 12.9716, // Bangalore default coordinates
      longitude: 77.5946,
      radiusMeters: 250,
      isEnabled: false, // strictly disabled by default
      reminderTitle: 'College Campus Detected',
      reminderMessage: 'You have arrived near college. Review and record today’s classes.',
      activeDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      startTime: '08:30',
      endTime: '17:00',
      cooldownMinutes: 180,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  static saveLocationReminder(reminder: Partial<LocationReminder>): LocationReminder {
    const current = this.getLocationReminder();
    const updated: LocationReminder = {
      ...current,
      ...reminder,
      updatedAt: new Date().toISOString(),
    };
    setItem('locationReminder', updated);
    return updated;
  }

  // Settings
  static getSettings(): AppSettings {
    return getItem<AppSettings>('settings', INITIAL_SETTINGS);
  }

  static saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    setItem('settings', updated);
    return updated;
  }

  // Notifications
  static getNotifications(): AppNotification[] {
    return getItem<AppNotification[]>('notifications', [
      {
        id: 'notif_1',
        title: 'Welcome to Student Attendance Tracker',
        message: 'Your personal attendance is stored 100% offline on this device.',
        channel: 'SYSTEM',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]);
  }

  static addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const notifications = getItem<AppNotification[]>('notifications', []);
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotif);
    setItem('notifications', notifications.slice(0, 30)); // retain last 30
    return newNotif;
  }

  static markNotificationRead(id: string): void {
    const notifications = getItem<AppNotification[]>('notifications', []);
    const target = notifications.find((n) => n.id === id);
    if (target) {
      target.read = true;
      setItem('notifications', notifications);
    }
  }

  static clearAllNotifications(): void {
    setItem('notifications', []);
  }

  // Backup and Restore (JSON)
  static createBackup(): AppBackupData {
    return {
      metadata: {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        appVersion: APP_VERSION,
        deviceIndependentBackupId: 'sat_backup_' + Date.now(),
      },
      userProfile: this.getUserProfile(),
      semesters: this.getSemesters(),
      subjects: this.getSubjects(),
      attendanceRecords: this.getAttendanceRecords(),
      leaveRecords: this.getLeaveRecords(),
      holidays: this.getHolidays(),
      timetable: getItem<TimetableEntry[]>('timetable', []),
      locationReminders: [this.getLocationReminder()],
      settings: this.getSettings(),
    };
  }

  static restoreBackup(backupData: AppBackupData, mode: 'REPLACE' | 'MERGE'): { success: boolean; message: string } {
    try {
      if (!backupData.metadata || typeof backupData.metadata.schemaVersion !== 'number') {
        return { success: false, message: 'Invalid backup file: missing metadata or schemaVersion.' };
      }

      if (backupData.metadata.schemaVersion > SCHEMA_VERSION) {
        return {
          success: false,
          message: `Backup schema v${backupData.metadata.schemaVersion} is newer than supported v${SCHEMA_VERSION}. Please update the app.`,
        };
      }

      // Create safety backup of current state
      const safetyBackup = this.createBackup();
      safeStorageSet(STORAGE_KEY_PREFIX + 'safety_backup', JSON.stringify(safetyBackup));

      if (mode === 'REPLACE') {
        if (backupData.userProfile) setItem('profile', backupData.userProfile);
        if (Array.isArray(backupData.semesters)) setItem('semesters', backupData.semesters);
        if (Array.isArray(backupData.subjects)) setItem('subjects', backupData.subjects);
        if (Array.isArray(backupData.attendanceRecords)) setItem('attendance', backupData.attendanceRecords);
        if (Array.isArray(backupData.leaveRecords)) setItem('leaves', backupData.leaveRecords);
        if (Array.isArray(backupData.holidays)) setItem('holidays', backupData.holidays);
        if (Array.isArray(backupData.timetable)) setItem('timetable', backupData.timetable);
        if (backupData.locationReminders?.[0]) setItem('locationReminder', backupData.locationReminders[0]);
        if (backupData.settings) setItem('settings', backupData.settings);
      } else {
        // MERGE mode: Append missing items by ID
        const existingSemesters = this.getSemesters();
        const semMap = new Map(existingSemesters.map((s) => [s.id, s]));
        backupData.semesters.forEach((s) => semMap.set(s.id, s));
        setItem('semesters', Array.from(semMap.values()));

        const existingSubjects = this.getSubjects();
        const subMap = new Map(existingSubjects.map((s) => [s.id, s]));
        backupData.subjects.forEach((s) => subMap.set(s.id, s));
        setItem('subjects', Array.from(subMap.values()));

        const existingRecords = this.getAttendanceRecords();
        const recMap = new Map(existingRecords.map((r) => [r.id, r]));
        backupData.attendanceRecords.forEach((r) => recMap.set(r.id, r));
        setItem('attendance', Array.from(recMap.values()));
      }

      return { success: true, message: `Successfully restored backup from ${new Date(backupData.metadata.exportedAt).toLocaleDateString()}.` };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Failed to restore backup: ${errorMsg}` };
    }
  }

  // Safe Factory Reset / Delete All Data
  static resetAllData(): void {
    const keysToRemove = [
      'profile',
      'semesters',
      'subjects',
      'attendance',
      'leaves',
      'holidays',
      'timetable',
      'locationReminder',
      'settings',
      'notifications',
    ];
    for (const k of keysToRemove) {
      safeStorageRemove(STORAGE_KEY_PREFIX + k);
    }
    notifyListeners();
  }

  static clearAllData(): void {
    this.resetAllData();
  }

  static resetToDemoData(): void {
    this.resetAllData();
    // Trigger initial population
    this.getUserProfile();
    this.getSemesters();
    this.getSubjects();
    this.getAttendanceRecords();
    this.getLeaveRecords();
    this.getHolidays();
    this.getSettings();
    notifyListeners();
  }

  static clearNotifications(): void {
    this.clearAllNotifications();
  }

  static markNotificationAsRead(id: string): void {
    this.markNotificationRead(id);
  }

  // ==========================================
  // Day-Wise Attendance Methods (Stitch Redesign Overhaul)
  // ==========================================

  static getInitialDemoRecords(): DayRecord[] {
    return [
      {
        date: '2026-10-07',
        status: 'ABSENT',
        subjectName: 'CS 304 • Algorithms',
        subjectCode: 'CS-304',
        timeSlot: '09:00 AM – 11:30 AM',
        location: 'Hall B',
        note: 'Doctor Visit / Viral Fever',
        updatedAt: '2026-10-07T09:00:00.000Z',
      },
      {
        date: '2026-10-06',
        status: 'PRESENT',
        subjectName: 'Web Engineering Lab',
        subjectCode: 'IT-312',
        timeSlot: '01:30 PM – 04:30 PM',
        location: 'Lab 3',
        note: 'Full session attended • Submitted Assignment 2',
        updatedAt: '2026-10-06T13:30:00.000Z',
      },
      {
        date: '2026-10-05',
        status: 'PRESENT',
        subjectName: 'Discrete Structures',
        subjectCode: 'CS-301',
        timeSlot: '10:00 AM – 11:45 AM',
        location: 'Room 102',
        note: 'Verified via Bluetooth Roll Call',
        updatedAt: '2026-10-05T10:00:00.000Z',
      },
      {
        date: '2026-10-03',
        status: 'ABSENT',
        subjectName: 'Technical Writing',
        subjectCode: 'HS-301',
        timeSlot: '08:30 AM – 10:00 AM',
        location: 'Lecture 4',
        note: 'Unexcused Absence • Affects 75% cutoff',
        updatedAt: '2026-10-03T08:30:00.000Z',
      },
      {
        date: '2026-10-02',
        status: 'HOLIDAY',
        subjectName: 'Campus Foundation Day',
        subjectCode: 'EVENT',
        timeSlot: 'All Day',
        location: 'Campus Wide',
        note: 'Annual Cultural Gala • Exempt from quota',
        updatedAt: '2026-10-02T08:00:00.000Z',
      },
      {
        date: '2026-10-01',
        status: 'PRESENT',
        subjectName: 'Data Structures & Algo',
        subjectCode: 'CS-302',
        timeSlot: '10:00 AM – 11:30 AM',
        location: 'Hall A',
        note: 'Graph Traversals discussion',
        updatedAt: '2026-10-01T10:00:00.000Z',
      },
      {
        date: '2026-09-30',
        status: 'PRESENT',
        subjectName: 'Operating Systems',
        subjectCode: 'CS-304',
        timeSlot: '09:00 AM – 10:30 AM',
        location: 'Hall B',
        note: 'Memory management',
        updatedAt: '2026-09-30T09:00:00.000Z',
      },
      {
        date: '2026-09-29',
        status: 'PRESENT',
        subjectName: 'Database Systems',
        subjectCode: 'CS-308',
        timeSlot: '11:00 AM – 12:30 PM',
        location: 'Room 204',
        note: 'Relational algebra & SQL queries',
        updatedAt: '2026-09-29T11:00:00.000Z',
      },
      {
        date: '2026-09-28',
        status: 'ABSENT',
        subjectName: 'Computer Networks',
        subjectCode: 'CS-306',
        timeSlot: '02:00 PM – 03:30 PM',
        location: 'Room 101',
        note: 'Missed bus',
        updatedAt: '2026-09-28T14:00:00.000Z',
      },
      {
        date: '2026-09-25',
        status: 'PRESENT',
        subjectName: 'Web Engineering',
        subjectCode: 'IT-312',
        timeSlot: '10:00 AM – 11:30 AM',
        location: 'Lab 2',
        note: 'React fundamentals review',
        updatedAt: '2026-09-25T10:00:00.000Z',
      },
      {
        date: '2026-09-24',
        status: 'ABSENT',
        subjectName: 'Operating Systems',
        subjectCode: 'CS-304',
        timeSlot: '09:00 AM – 10:30 AM',
        location: 'Hall B',
        note: 'Family function',
        updatedAt: '2026-09-24T09:00:00.000Z',
      },
      {
        date: '2026-09-23',
        status: 'PRESENT',
        subjectName: 'Data Structures & Algo',
        subjectCode: 'CS-302',
        timeSlot: '11:00 AM – 12:30 PM',
        location: 'Hall A',
        note: 'AVL Tree rotations',
        updatedAt: '2026-09-23T11:00:00.000Z',
      },
      {
        date: '2026-09-22',
        status: 'PRESENT',
        subjectName: 'Database Systems',
        subjectCode: 'CS-308',
        timeSlot: '09:00 AM – 10:30 AM',
        location: 'Room 204',
        note: 'Normalization forms (1NF to BCNF)',
        updatedAt: '2026-09-22T09:00:00.000Z',
      },
      {
        date: '2026-09-21',
        status: 'ABSENT',
        subjectName: 'Discrete Structures',
        subjectCode: 'CS-301',
        timeSlot: '10:00 AM – 11:45 AM',
        location: 'Room 102',
        note: 'Personal emergency',
        updatedAt: '2026-09-21T10:00:00.000Z',
      },
      {
        date: '2026-09-18',
        status: 'PRESENT',
        subjectName: 'Algorithms Lab',
        subjectCode: 'CS-304',
        timeSlot: '01:30 PM – 04:30 PM',
        location: 'Lab 1',
        note: 'Dijkstra implementation passed tests',
        updatedAt: '2026-09-18T13:30:00.000Z',
      },
      {
        date: '2026-09-17',
        status: 'ABSENT',
        subjectName: 'Computer Networks',
        subjectCode: 'CS-306',
        timeSlot: '11:00 AM – 12:30 PM',
        location: 'Room 101',
        note: 'Traffic delay',
        updatedAt: '2026-09-17T11:00:00.000Z',
      },
      {
        date: '2026-09-16',
        status: 'PRESENT',
        subjectName: 'Data Structures',
        subjectCode: 'CS-302',
        timeSlot: '09:00 AM – 10:30 AM',
        location: 'Hall A',
        note: 'Binary Search Trees',
        updatedAt: '2026-09-16T09:00:00.000Z',
      },
      {
        date: '2026-09-15',
        status: 'PRESENT',
        subjectName: 'Operating Systems',
        subjectCode: 'CS-304',
        timeSlot: '10:00 AM – 11:30 AM',
        location: 'Hall B',
        note: 'Process synchronization semaphore',
        updatedAt: '2026-09-15T10:00:00.000Z',
      },
      {
        date: '2026-09-14',
        status: 'ABSENT',
        subjectName: 'Technical Communication',
        subjectCode: 'HS-301',
        timeSlot: '02:00 PM – 03:30 PM',
        location: 'Lecture 4',
        note: 'Health checkup appointment',
        updatedAt: '2026-09-14T14:00:00.000Z',
      },
    ];
  }

  static getDayRecords(): DayRecord[] {
    const raw = safeStorageGet(STORAGE_KEY_PREFIX + 'day_records');
    if (!raw) {
      return [];
    }
    try {
      const records = JSON.parse(raw) as DayRecord[];
      return records.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }

  static setDayRecords(records: DayRecord[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_PREFIX + 'day_initialized', 'true');
      }
    } catch {
      // ignore
    }
    setItem('day_records', records);
  }

  static notifySubscribers(): void {
    notifyListeners();
  }

  static markDay(
    date: string,
    status: import('../types').DayStatus,
    note?: string,
    isSpecialClass?: boolean,
    details?: { subjectName?: string; subjectCode?: string; timeSlot?: string; location?: string }
  ): DayRecord {
    const records = this.getDayRecords();
    const existingIndex = records.findIndex((r) => r.date === date);
    const now = new Date().toISOString();

    let finalRecord: DayRecord;
    if (existingIndex !== -1) {
      finalRecord = {
        ...records[existingIndex],
        status,
        isSpecialClass:
          isSpecialClass !== undefined ? isSpecialClass : records[existingIndex].isSpecialClass,
        note: note !== undefined ? note : records[existingIndex].note,
        subjectName: details?.subjectName ?? records[existingIndex].subjectName,
        subjectCode: details?.subjectCode ?? records[existingIndex].subjectCode,
        timeSlot: details?.timeSlot ?? records[existingIndex].timeSlot,
        location: details?.location ?? records[existingIndex].location,
        updatedAt: now,
      };
      records[existingIndex] = finalRecord;
    } else {
      finalRecord = {
        date,
        status,
        isSpecialClass,
        note,
        subjectName: details?.subjectName,
        subjectCode: details?.subjectCode,
        timeSlot: details?.timeSlot,
        location: details?.location,
        updatedAt: now,
      };
      records.unshift(finalRecord);
    }

    localStorage.setItem(STORAGE_KEY_PREFIX + 'day_initialized', 'true');
    setItem('day_records', records);
    return finalRecord;
  }

  static removeDayRecord(date: string): void {
    const records = this.getDayRecords();
    const filtered = records.filter((r) => r.date !== date);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'day_initialized', 'true');
    setItem('day_records', filtered);
  }

  static clearDayRecords(): void {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'day_initialized', 'true');
    setItem('day_records', []);
  }

  static resetToDemoDayRecords(): DayRecord[] {
    setItem('day_records', []);
    return [];
  }

  static getDayTarget(): number {
    return getItem<number>('day_target', 75);
  }

  static setDayTarget(target: number): void {
    setItem('day_target', target);
    notifyListeners();
  }

  static getDayAppSettings(): DayAppSettings {
    const defaults: DayAppSettings = {
      targetPercentage: 75,
      saturdayOff: true,
      sundayOff: true,
      saturdayPolicy: 'FULL_OFF',
      warningMargin: 5,
      studentName: '',
      collegeName: '',
      courseName: '',
      semester: 1,
      avatarUrl: '',
      trackCourses: false,
      onboardingCompleted: false,
      collegeStartTime: '09:00',
      morningRollCallAlarm: true,
      preCollegeAlarm: true,
      eveningAuditAlarm: true,
    };
    const saved = getItem<DayAppSettings>('day_app_settings', defaults);
    return {
      ...defaults,
      ...saved,
      collegeStartTime: saved.collegeStartTime ?? '09:00',
      morningRollCallAlarm: saved.morningRollCallAlarm ?? true,
      preCollegeAlarm: saved.preCollegeAlarm ?? true,
      eveningAuditAlarm: saved.eveningAuditAlarm ?? true,
    };
  }

  static setDayAppSettings(settings: DayAppSettings): void {
    setItem('day_app_settings', settings);
    setItem('day_target', settings.targetPercentage);
    notifyListeners();
  }

  // Course Subjects
  static getCourseSubjects(): import('../types').CourseSubject[] {
    return getItem<import('../types').CourseSubject[]>('course_subjects', []);
  }


  static setCourseSubjects(subjects: import('../types').CourseSubject[]): void {
    setItem('course_subjects', subjects);
    notifyListeners();
  }

  static addCourseSubject(subject: Omit<import('../types').CourseSubject, 'id'>): void {
    const subjects = this.getCourseSubjects();
    const newSub: import('../types').CourseSubject = {
      ...subject,
      id: 'sub_' + Date.now(),
    };
    subjects.push(newSub);
    this.setCourseSubjects(subjects);
  }

  static removeCourseSubject(id: string): void {
    const subjects = this.getCourseSubjects();
    const filtered = subjects.filter((s) => s.id !== id);
    this.setCourseSubjects(filtered);
  }
}

export const LocalStorageManager = LocalDatabaseRepository;

