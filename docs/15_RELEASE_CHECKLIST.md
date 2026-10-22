# 15 — Release Checklist
**Student Attendance Tracker** • *Pre-Release & Play Store Validation*

---

## Pre-Release Validation Gates

- [x] **Zero Backend Dependency**: Verified zero HTTP network calls, external trackers, or third-party analytics.
- [x] **Room Schema Integrity**: All tables define explicit foreign keys with cascading deletes where appropriate.
- [x] **Calculations Unit Tests**: 100% pass on boundary conditions, safe absences, and needed classes.
- [x] **Biometric Authenticator Fallback**: PIN fallback verified when device has no registered biometric sensor.
- [x] **Glance AppWidget**: Verified interactive click callbacks and privacy mode toggling.
- [x] **Export/Import Losslessness**: Roundtrip export -> wipe -> import retains identical record count.
- [x] **ProGuard / R8 Rules**: Ensured Room entity and model classes are kept from obfuscation.
- [x] **Accessibility (WCAG AA)**: Color contrast ratio > 4.5:1 across all subject badges and state chips.
- [x] **Android 14 (API 34) Compliance**: Target SDK 34 with `POST_NOTIFICATIONS` runtime checks.
