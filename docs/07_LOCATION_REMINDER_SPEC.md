# 07. Location Reminder Specification

## Philosophy
Location is used strictly to trigger a helpful, timely local notification reminding the student to review their attendance when near campus. The app NEVER automatically marks a class as Present based on location.

## Geofencing Setup
1. **Coordinates**: Stored locally in SharedPreferences/DataStore.
2. **Radius Options**: 100m, 250m, 500m, 1000m.
3. **Active Days**: Bitmask or Set (Monday through Friday).
4. **Time Window**: e.g., 08:00 to 17:00.
5. **Cooldown**: Minimum 180 minutes between triggered notifications.

## Permission Handling
- **Foreground Location**: `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` requested only when user taps "Set Location".
- **Background Location**: Optional. If denied, reminders fallback to manual or periodic scheduled alarm checks.
- Zero tracking or location history recorded.

---

# 08. Notification Specification

## Channels
1. **Attendance Reminders** (`channel_attendance_reminders`): Daily evening reminder to review unmarked classes.
2. **Location Reminders** (`channel_location_reminders`): Proximity alerts when near campus.
3. **Low Attendance Alerts** (`channel_low_attendance_alerts`): Warnings when any subject dips into "At Risk" or "Below Target".
4. **Backup Reminders** (`channel_backup_reminders`): Monthly reminder to export a local JSON backup.

---

# 09. Backup & Restore Specification

## Versioned Schema (`schemaVersion: 1`)
- Data Format: Human-readable JSON.
- Contains: `metadata`, `userProfile`, `semesters`, `subjects`, `attendanceRecords`, `leaveRecords`, `holidays`, `timetable`, `settings`.
- Safe Restore: Validation prior to import. User choose between `MERGE` and `REPLACE`. Auto-generates local safety backup before replacement.

---

# 10. Export Specification

## CSV Export
- Format: RFC 4180 compliant with UTF-8 BOM (`\uFEFF`).
- Headers: `Semester`, `Subject`, `Date`, `Start Time`, `End Time`, `Status`, `Source`, `Note`.

## PDF Export
- Document Title: "Student Attendance Tracker - Personal Attendance Report".
- Layout: Student header, summary metric cards, subject table, disclaimer note.
- Output: Standard ISO A4 PDF.

---

# 11. Home Screen Widget Specification

## Technology: Jetpack Glance
- Size Modes: 4x2 (Full summary) and 4x1 (Compact gauge).
- Data displayed: Overall attendance %, low attendance subject alert count, quick tap to launch Mark screen.
- Privacy toggle: Mask subject names if privacy mode is active.

---

# 12. Security and Privacy Specification

## Threat Model & Protections
1. **No External Network Calls**: Zero servers, zero telemetry, zero analytics, zero ad SDKs.
2. **Biometric Security**: Android `BiometricPrompt` with `BIOMETRIC_STRONG` and `DEVICE_CREDENTIAL` fallback. Biometric templates are never accessed or stored.
3. **Local Storage**: SQLite Room database stored in app's private internal storage (`/data/data/com.example.studentattendancetracker/databases/`).
4. **Delete All Data**: Complete purge mechanism wiping databases and preferences.
