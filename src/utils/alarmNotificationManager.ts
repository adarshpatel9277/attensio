import { DayAppSettings } from '../types';

declare global {
  interface Window {
    AndroidApp?: {
      exportAndShare?: (fileName: string, content: string, mimeType: string) => void;
      scheduleReminders?: (
        collegeStartTime: string,
        morningEnabled: boolean,
        preCollegeEnabled: boolean,
        eveningEnabled: boolean
      ) => void;
      triggerTestNotification?: (title: string, message: string) => void;
      requestNotificationPermission?: () => void;
      isNotificationPermissionGranted?: () => boolean;
    };
    handleAndroidBack?: () => boolean;
  }
}

export class AlarmNotificationManager {
  /**
   * Request notification permission on Android or Browser
   */
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if (window.AndroidApp?.requestNotificationPermission) {
      window.AndroidApp.requestNotificationPermission();
      return true;
    }

    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        return result === 'granted';
      } catch (e) {
        console.warn('Browser notification permission error:', e);
      }
    }
    return false;
  }

  /**
   * Synchronize active alarm schedules to native Android AlarmManager
   */
  static syncAlarms(settings: DayAppSettings): void {
    if (typeof window === 'undefined') return;

    const startTime = settings.collegeStartTime || '09:00';
    const morning = settings.morningRollCallAlarm ?? true;
    const preCollege = settings.preCollegeAlarm ?? true;
    const evening = settings.eveningAuditAlarm ?? true;

    if (window.AndroidApp?.scheduleReminders) {
      try {
        window.AndroidApp.scheduleReminders(startTime, morning, preCollege, evening);
      } catch (e) {
        console.error('Failed to sync alarms with AndroidApp bridge:', e);
      }
    }
  }

  /**
   * Fire an immediate test notification/alarm to verify working status
   */
  static triggerTestAlarm(settings?: DayAppSettings): boolean {
    const startTime = settings?.collegeStartTime || '09:00';
    const title = 'Attendify Daily Alarm Test 🔔';
    const message = `Alarms active! Morning Roll Call (9:30 AM), College Prep 30m prior (${startTime}), and Evening Audit (4:30 PM).`;

    if (typeof window !== 'undefined' && window.AndroidApp?.triggerTestNotification) {
      try {
        window.AndroidApp.triggerTestNotification(title, message);
        return true;
      } catch (e) {
        console.warn('AndroidApp triggerTestNotification failed:', e);
      }
    }

    // Web Notification API fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/app-icon.svg',
          });
          return true;
        } catch (e) {
          console.warn('Web notification dispatch failed:', e);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/app-icon.svg',
            });
          }
        });
        return true;
      }
    }

    return false;
  }
}
