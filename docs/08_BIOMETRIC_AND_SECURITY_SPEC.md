# 08 — Biometric & Security Specification
**Student Attendance Tracker** • *Native Android Offline-First Architecture*

---

## 1. Threat Model & Privacy Principles
1. **Local Device Threat Only**: Because there are no backend servers or cloud databases, threats originate from device sharing, shoulder surfing, or device loss.
2. **Academic Privacy**: College students frequently share their phones with friends, peers, or family. Attendance metrics and subject records can reveal academic status, absences, or disciplinary risk.
3. **No Network Exposure**: Zero attendance data or credentials leave the device.

---

## 2. BiometricPrompt Integration
- **Framework**: `androidx.biometric:biometric:1.2.0-alpha05`
- **Authenticators**: `BIOMETRIC_STRONG | DEVICE_CREDENTIAL`
  - Allows Class 3 (strong) biometrics (Fingerprint, 3D Face Unlock).
  - Automatically cascades to device PIN/pattern/password if biometric authentication fails or is unconfigured on device.
- **CryptoObject Option**: While simple gatekeeping is default, optional Keystore-backed AES-256 GCM token authentication can be bound to key authentication validity.

---

## 3. Session Timeout & Lifecycle
- **Configuration Options**:
  - `0`: Immediate lock upon entering background / task switch.
  - `60` (1 min): Grace period for quick app switching.
  - `300` (5 min): Standard lecture session grace period.
  - `900` (15 min): Extended study session grace period.
- **Implementation**:
  - Tracked via `ProcessLifecycleOwner` in `AttendanceApplication`.
  - When `ON_STOP` fires, timestamp is recorded in memory.
  - When `ON_START` fires, elapsed time is compared against `lockTimeoutMinutes`. If exceeded and `biometricLockEnabled == true`, navigation routes immediately to `BiometricLockScreen`.

---

## 4. Privacy Mode for Glance AppWidget
- When `widgetPrivacyMode` is enabled in Settings:
  - Exact attendance percentages are stripped from the home-screen widget.
  - Subject names can be redacted to initials or generic status chips (`On Track` / `Attention`).
  - Protects against observers seeing low attendance percentages on the Android lock screen or home screen launcher.

---

## 5. Fallback PIN
- 4-digit numeric PIN hashed locally with SHA-256 + salt and stored in Android Jetpack EncryptedSharedPreferences (or DataStore).
- Rate-limited to prevent brute-force attempts: 5 failed attempts locks input for 30 seconds.
