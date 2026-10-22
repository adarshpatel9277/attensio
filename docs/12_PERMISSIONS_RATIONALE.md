# 12 — Permissions Rationale & User Disclosure
**Student Attendance Tracker** • *Ethical Privacy & Permission Strategy*

---

## 1. Required & Optional Permissions

| Permission | Protection Level | Status in App | Explicit In-App Rationale |
| :--- | :--- | :--- | :--- |
| `POST_NOTIFICATIONS` | Runtime (API 33+) | Optional (User Opt-in) | Needed only to send daily review alerts and low-attendance warnings. |
| `ACCESS_FINE_LOCATION` | Runtime | Optional (Strictly Opt-in) | Used solely for college campus arrival reminder. **Never used for tracking or attendance proof**. |
| `ACCESS_COARSE_LOCATION` | Runtime | Optional | Fallback battery-friendly geofence trigger. |
| `USE_BIOMETRIC` | Normal | Optional | Authenticates fingerprint / face unlock locally on device. |
| `RECEIVE_BOOT_COMPLETED` | Normal | Automatic | Re-registers geofence and daily alarm when device reboots. |

---

## 2. In-App Permission Education Flow
Before requesting Android system permission dialogs:
1. **Educational Sheet**: Shows an explanatory card explaining why the permission is useful.
2. **Clear Decline**: The user can decline without any degradation of core manual attendance tracking.
3. **Location Disclaimer (Mandatory)**:
   > *"GPS location is used solely to trigger a local notification when you arrive near campus. The app never records GPS trails, never sends coordinates to any server, and never claims location proves attendance."*

---

## 3. Battery & Privacy Optimization
- Geofences use Android system-managed hardware geofencing (WiFi/Cell tower assists), avoiding continuous GPS polling.
- Location queries stop immediately when outside campus hours or on weekends.
