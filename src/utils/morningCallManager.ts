import { DayAppSettings, DayRecord } from '../types';
import { getLocalTodayString } from './dateUtils';

export interface ReminderSlot {
  id: 'slot_1' | 'slot_2' | 'slot_3';
  time: string; // HH:mm format (24h)
  displayTime: string; // e.g. "09:30 AM"
  label: string;
  defaultMessage: string;
}

export interface MorningCallScheduleInfo {
  enabled: boolean;
  collegeStartTime: string;
  slots: ReminderSlot[];
  isTodayWorkingDay: boolean;
  isTodayMarked: boolean;
  todayMarkedStatus: string | null;
  nextReminderDisplay: string;
  backgroundSupportNotice: string;
}

class MorningCallManagerService {
  private activeTimerId: any = null;

  /**
   * Helper to format HH:mm into 12-hour AM/PM string
   */
  public formatTime12h(timeStr: string): string {
    try {
      const [hStr, mStr] = timeStr.trim().split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr || '0', 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
      return timeStr;
    }
  }

  /**
   * Calculates the 3 daily reminder slots based on college start time
   */
  public getDailySlots(collegeStartTime: string = '09:00'): ReminderSlot[] {
    const startTime = collegeStartTime || '09:00';
    const [startH, startM] = startTime.split(':').map(Number);

    // Slot 1: Exact college start time
    const slot1Time = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    // Slot 2: Midday (12:00 PM, or 2.5 hours after start if start is late)
    let slot2H = 12;
    let slot2M = 0;
    if (startH >= 11) {
      slot2H = Math.min(14, startH + 2);
      slot2M = startM;
    }
    const slot2Time = `${String(slot2H).padStart(2, '0')}:${String(slot2M).padStart(2, '0')}`;

    // Slot 3: Before college wrap-up (15:45 / 3:45 PM)
    const slot3Time = '15:45';

    return [
      {
        id: 'slot_1',
        time: slot1Time,
        displayTime: this.formatTime12h(slot1Time),
        label: 'College Start',
        defaultMessage: 'College has started. Remember to mark your attendance.',
      },
      {
        id: 'slot_2',
        time: slot2Time,
        displayTime: this.formatTime12h(slot2Time),
        label: 'Midday Check-In',
        defaultMessage: 'Have you marked your attendance today? Please update your record.',
      },
      {
        id: 'slot_3',
        time: slot3Time,
        displayTime: this.formatTime12h(slot3Time),
        label: 'Pre-Wrap Confirmation',
        defaultMessage: "Before college closes, confirm today's attendance status.",
      },
    ];
  }

  /**
   * Determines if a specific calendar date is a working day using the student's settings
   */
  public isWorkingDay(date: Date, settings: DayAppSettings, records: DayRecord[] = []): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // 1. Sunday Check
    if (dayOfWeek === 0) {
      return settings.sundayOff === false; // If sundayOff is not explicitly false, Sunday is off
    }

    // 2. Saturday Check
    if (dayOfWeek === 6) {
      const policy = settings.saturdayPolicy || (settings.saturdayOff !== false ? 'FULL_OFF' : 'FULL_WORKING');
      if (policy === 'FULL_OFF') return false;
      if (policy === 'FULL_WORKING') return true;
      if (policy === 'ALTERNATE') {
        // 1st and 3rd Saturdays are holidays; 2nd, 4th, 5th are working
        const dayOfMonth = date.getDate();
        const saturdayIndex = Math.ceil(dayOfMonth / 7);
        return saturdayIndex === 2 || saturdayIndex === 4 || saturdayIndex === 5;
      }
    }

    // 3. College holiday check from recorded days
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const existingRecord = records.find((r) => r.date === dateStr);
    if (existingRecord && existingRecord.status === 'HOLIDAY') {
      return false;
    }

    // Mon - Fri are standard working days
    return true;
  }

  /**
   * Returns comprehensive schedule overview and next reminder timing
   */
  public getScheduleOverview(
    settings: DayAppSettings,
    records: DayRecord[] = []
  ): MorningCallScheduleInfo {
    const enabled = settings.morningCallEnabled !== false;
    const startTime = settings.collegeStartTime || '09:00';
    const slots = this.getDailySlots(startTime);

    const todayStr = getLocalTodayString();
    const today = new Date();
    const isTodayWorking = this.isWorkingDay(today, settings, records);

    const todayRecord = records.find((r) => r.date === todayStr);
    const isTodayMarked = !!todayRecord && (todayRecord.status === 'PRESENT' || todayRecord.status === 'ABSENT');
    const todayMarkedStatus = todayRecord?.status || null;

    // Determine next upcoming reminder time
    let nextReminderDisplay = 'Disabled';
    if (enabled) {
      if (!isTodayWorking) {
        nextReminderDisplay = 'Next college day at ' + slots[0].displayTime;
      } else if (isTodayMarked) {
        nextReminderDisplay = 'Attendance marked for today';
      } else {
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        const upcomingSlot = slots.find((s) => {
          const [h, m] = s.time.split(':').map(Number);
          return h * 60 + m > nowMinutes;
        });

        if (upcomingSlot) {
          nextReminderDisplay = `Today at ${upcomingSlot.displayTime}`;
        } else {
          nextReminderDisplay = `Next college day at ${slots[0].displayTime}`;
        }
      }
    }

    // Honest platform capability reporting
    const isNativeAndroid = typeof window !== 'undefined' && !!(window as any).AndroidApp;
    const backgroundSupportNotice = isNativeAndroid
      ? 'Android AlarmManager enabled • Delivers reliable reminders even when device is locked'
      : 'Web notifications active while app or browser is running. For standalone system alarms while closed, use the Android app.';

    return {
      enabled,
      collegeStartTime: startTime,
      slots,
      isTodayWorkingDay: isTodayWorking,
      isTodayMarked,
      todayMarkedStatus,
      nextReminderDisplay,
      backgroundSupportNotice,
    };
  }

  /**
   * Request permission for Web or Native notifications
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Android Native app bridge
    if (typeof (window as any).AndroidApp?.requestNotificationPermission === 'function') {
      (window as any).AndroidApp.requestNotificationPermission();
      return true;
    }

    // 2. Web Notification API
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        return result === 'granted';
      } catch (err) {
        console.warn('Web notification permission prompt error:', err);
      }
    }

    return false;
  }

  /**
   * Fire a notification immediately (used for testing or scheduled triggers)
   */
  public dispatchNotification(title: string, body: string): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Android App Bridge
    if (typeof (window as any).AndroidApp?.triggerTestNotification === 'function') {
      try {
        (window as any).AndroidApp.triggerTestNotification(title, body);
        return true;
      } catch (e) {
        console.warn('Android bridge notification dispatch failed', e);
      }
    }

    // 2. Web Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        return true;
      } catch (e) {
        console.warn('Web notification dispatch failed', e);
      }
    }

    return false;
  }

  /**
   * Synchronize schedule with native Android AlarmManager and web timer
   */
  public syncSchedule(settings: DayAppSettings, records: DayRecord[] = []): void {
    if (typeof window === 'undefined') return;

    const enabled = settings.morningCallEnabled !== false;
    const startTime = settings.collegeStartTime || '09:00';

    // 1. Synchronize to Android Native bridge
    if (typeof (window as any).AndroidApp?.scheduleReminders === 'function') {
      try {
        (window as any).AndroidApp.scheduleReminders(startTime, enabled, enabled, enabled);
      } catch (e) {
        console.warn('Failed to sync Morning Call with Android bridge:', e);
      }
    }

    // 2. Clear any pending web timers to prevent memory leaks / duplicate timers
    if (this.activeTimerId) {
      clearTimeout(this.activeTimerId);
      this.activeTimerId = null;
    }

    if (!enabled) return;

    // 3. Setup in-app next timer
    const today = new Date();
    const todayStr = getLocalTodayString();
    const isWorking = this.isWorkingDay(today, settings, records);
    if (!isWorking) return;

    const todayRecord = records.find((r) => r.date === todayStr);
    if (todayRecord && (todayRecord.status === 'PRESENT' || todayRecord.status === 'ABSENT')) {
      return; // Suppress reminders if attendance already marked
    }

    const slots = this.getDailySlots(startTime);
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    const upcomingSlot = slots.find((s) => {
      const [h, m] = s.time.split(':').map(Number);
      return h * 60 + m > nowMinutes;
    });

    if (upcomingSlot) {
      const [targetH, targetM] = upcomingSlot.time.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(targetH, targetM, 0, 0);

      const delayMs = Math.max(1000, targetTime.getTime() - Date.now());

      this.activeTimerId = setTimeout(() => {
        // Double check duplicate guard for today
        const key = `attendify_mc_sent_${todayStr}_${upcomingSlot.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          this.dispatchNotification('Morning Call 🔔', upcomingSlot.defaultMessage);
        }
        // Recalculate next timer
        this.syncSchedule(settings, records);
      }, delayMs);
    }
  }

  /**
   * Triggers an immediate test of the Morning Call notification
   */
  public triggerTestCall(settings: DayAppSettings): boolean {
    const startTime = settings.collegeStartTime || '09:00';
    const slots = this.getDailySlots(startTime);
    const title = 'Morning Call Test 🔔';
    const body = `Morning Call active! Today's schedule: ${slots[0].displayTime} (College Start), ${slots[1].displayTime} (Midday), ${slots[2].displayTime} (Day Wrap).`;
    return this.dispatchNotification(title, body);
  }
}

export const MorningCallManager = new MorningCallManagerService();
