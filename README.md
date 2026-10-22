# Student Attendance Tracker (Android APK & Offline-First App)

> **Personal Student Attendance App** | Android Native & Web Companion | 100% Offline-First | Premium Minimal Design

Student Attendance Tracker is a personal attendance application built specifically for college and university students. It operates entirely offline without any mandatory account registration, cloud subscription, or external server.

---

## Key Highlights

- **Transparent Calculations**: Explicit formulas `present / (present + absent) * 100`. Zero fake numbers, zero misleading percentages.
- **Attendance Goal Calculator**: Calculate exact consecutive classes needed to hit target, or safe absences allowed before falling below target.
- **Multi-Semester Architecture**: Keep complete historical records across semesters with simple switching and archival.
- **Location Proximity Reminders**: Configurable campus reminder with cooldown. *Core rule: Location never marks attendance; it only alerts the student to review their day.*
- **Biometric App Lock**: Secure personal attendance data with fingerprint/face unlock and PIN fallback.
- **Glance Home Screen Widget**: At-a-glance attendance percentage, low attendance warnings, and quick marking.
- **Data Portability**: Versioned JSON Backup/Restore, RFC-4180 CSV export, and high-resolution PDF attendance reports.

---

## Android Architecture Stack

- **Language**: Kotlin 2.0.0
- **UI**: Jetpack Compose with Material 3
- **Local Persistence**: Android Room Database (SQLite) + DataStore Preferences
- **Architecture**: MVI / MVVM with Clean Architecture repository pattern
- **Widgets**: Jetpack Glance AppWidget
- **Security**: Android BiometricPrompt
- **PDF & CSV**: Native Android PdfDocument & Safe RFC 4180 exporter

---

## Gradle Build Instructions

```bash
# Debug APK
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease

# Run Unit Tests
./gradlew testDebugUnitTest
```
Generated APK location:
- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `app/build/outputs/apk/release/app-release.apk`
