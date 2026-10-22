# 11 — Notification Channels & WorkManager
**Student Attendance Tracker** • *Local Scheduling & Alert Delivery*

---

## 1. Notification Channels (Android 8.0+ O+)

| Channel ID | Channel Name | Importance | Description |
| :--- | :--- | :--- | :--- |
| `channel_attendance_reminders` | Daily Attendance Reminders | `IMPORTANCE_DEFAULT` | Reminds student at configured evening time (e.g. 17:00) to confirm today's attendance. |
| `channel_location_reminders` | Campus Location Reminders | `IMPORTANCE_LOW` | Silent banner when arriving at campus geofence. Explicitly disclaims attendance proof. |
| `channel_low_attendance` | Critical Attendance Alerts | `IMPORTANCE_HIGH` | Warning when subject dips below minimum target threshold. |
| `channel_backup_reminders` | Backup Reminders | `IMPORTANCE_MIN` | Periodic local backup reminder (e.g. monthly). |

---

## 2. WorkManager Architecture & Schedulers
All background tasks are scheduled through `androidx.work:work-runtime-ktx:2.9.0`:

### A. Daily Evening Reminder Worker (`DailyReminderWorker`)
- **Type**: `PeriodicWorkRequestBuilder<DailyReminderWorker>(24, TimeUnit.HOURS)`
- **Trigger**: Calculates initial delay to fire at student's configured `dailyReminderTime` (default `17:00`).
- **Logic**: Inspects whether any classes occurred today without recorded status. If unmarked classes exist, posts interactive notification with `Review Today` action.

### B. Geofence Transition Intent (`GeofenceBroadcastReceiver`)
- **Trigger**: Native Android `GeofencingClient.GEOFENCE_TRANSITION_ENTER`.
- **Constraint Checks**:
  1. Checks if current day is in `activeDays` (e.g. Mon-Fri).
  2. Checks if current time is within `startTime` and `endTime` (e.g. 08:30–17:00).
  3. Checks `cooldownMinutes` (default 180 min) since last triggered timestamp to prevent annoying notification loops.
- **Copy**:
  - Title: *Arrived Near Campus*
  - Body: *You are near College Campus. Open app to manually review and mark today's classes.*

---

## 3. PendingIntent Deep Links
All notifications include PendingIntents routing to:
- `sat://attendance/quickmark` -> Opens Quick Mark modal.
- `sat://attendance/dashboard` -> Opens Dashboard.
- `sat://attendance/subject/{id}` -> Opens specific subject details.
