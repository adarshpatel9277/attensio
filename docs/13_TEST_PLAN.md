# 13. Test Plan & QA Strategy

## Unit Tests
- `AttendanceCalculatorTest`:
  - Verify attendance percentage for 100%, 0%, partial ratios.
  - Verify zero counted classes returns null / "No attendance data yet".
  - Verify goal calculator for classes needed when below target.
  - Verify goal calculator for absences allowed when above target.
  - Verify 100% target with existing absences reports impossible status.
- `CsvExportTest`:
  - RFC 4180 escaping with commas, quotes, and newlines.
- `BackupRestoreTest`:
  - JSON serialization, deserialization, and schema validation.

## UI / Instrumented Scenarios
1. First Launch onboarding flow creates default profile and semester.
2. Mark Present, Absent, Leave, and Cancelled updates stats immediately.
3. Multiple semesters switching filters dashboard and preserves history.
4. Biometric lock locks on background and unlocks with PIN/biometric.
5. Location reminder toggle displays permission rationale without harassment.

---

# 14. Release Checklist

- [x] Target SDK 34 / Min SDK 26 verified.
- [x] Room database migrations and exportSchema configured.
- [x] Notification channels registered on Android 13+ with `POST_NOTIFICATIONS`.
- [x] Proximity reminder complies with location disclosure policies.
- [x] Biometric authentication tested with fingerprint and PIN fallback.
- [x] Proguard / R8 rules verified for Kotlin Serialization and Room.
- [x] Release APK signed with keystore or debug build ready.

---

# 15. Changelog

## [1.0.0] - 2026-09-21
- Initial release of Student Attendance Tracker.
- Multi-semester management.
- Transparent mathematical attendance calculator & goal planner.
- Location proximity reminders with cooldown.
- Biometric app lock.
- Glance AppWidget support.
- Local JSON backup/restore & CSV/PDF export.

---

# 16. Setup Guide

## Building with Android Studio
1. Open the project in Android Studio Iguana / Jellyfish (Electric Eel or newer).
2. Ensure JDK 17 or JDK 21 is selected in Gradle Settings.
3. Sync project with Gradle files.
4. Select `app` run configuration and target an Android device (API 26+).
5. Click **Run** or execute `./gradlew assembleDebug`.

---

# 17. Troubleshooting Guide

| Issue | Cause | Solution |
|---|---|---|
| Notification not appearing | Notification permission disabled or Android 13+ permission denied | Go to Settings > Notifications and grant permission; use the in-app "Test Notification" button |
| Location reminder not firing | Power saving mode or background battery optimization active | Add app to battery optimization whitelist; verify geofence radius is at least 150m |
| Biometric lock failing | No fingerprint registered on device | Register fingerprint in Android System Settings or use device PIN |

---

# 18. Requirements & Technology Versions

- **Language**: Kotlin 2.0.0
- **UI Framework**: Jetpack Compose 1.7.0 (Compose BOM 2024.06.00)
- **Design System**: Material 3 (1.2.1)
- **Local Storage**: Room Database 2.6.1
- **Preferences**: Jetpack DataStore Preferences 1.1.1
- **Widget**: AndroidX Glance 1.1.0
- **Security**: AndroidX Biometric 1.2.0-alpha05
- **Exporting**: Android PdfDocument & safe RFC-4180 CSV
- **Build System**: Gradle 8.7 with Android Gradle Plugin (AGP) 8.4.1
- **Target SDK**: Android 14 (API 34)
- **Min SDK**: Android 8.0 Oreo (API 26)
