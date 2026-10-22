# 02. Feature Specification

## 1. Multi-Semester Management
- Create, rename, archive, and delete semesters.
- Exactly one semester is designated as "Active" at any time.
- Historical data preserved when archiving.
- Deliberate confirmation dialog before destructive deletion.

## 2. Subjects & Targets
- Attributes: Name, Code, Teacher, Target % (Default: 75%), Color Token, Archived flag.
- Color palette complies with WCAG AA contrast standards.
- Multiple classes per day supported via unique start times.

## 3. Attendance Recording
- Status options: `PRESENT`, `ABSENT`, `LEAVE`, `HOLIDAY`, `CANCELLED`, `UNMARKED`.
- Source tracking: `MANUAL`, `LOCATION_REMINDER`, `IMPORTED`.
- Instant undo toast notification.
- Duplicate prevention: Keyed on `(subjectId, date, classStartTime)`.

## 4. Attendance Calculations
- Formula: `presentClasses / (presentClasses + absentClasses) * 100`.
- Leave, Holiday, Cancelled excluded from denominator by default (optional toggle).
- Handles zero classes with informative "No attendance data yet" state.

## 5. Goal & Allowance Calculator
- If below target: Calculates minimum consecutive future classes $x$ to reach target:
  $$x = \lceil \frac{T \cdot (present + absent) - present}{1 - T} \rceil$$
- If above target: Calculates maximum safe absences $y$ allowed:
  $$y = \lfloor \frac{present - T \cdot (present + absent)}{T} \rfloor$$

## 6. Location Reminders
- Configurable college geofence coordinates, radius (100m - 1000m), and active days.
- Cooldown period (default 180 minutes) to avoid repeated buzzing.
- Clear disclaimer: Location never automatically marks student present.

## 7. Biometric App Lock
- Android BiometricPrompt with device PIN/credential fallback.
- Configurable lock timeout (Immediate, 1 min, 5 min, 15 min).
- No biometric templates ever stored or transmitted.

## 8. Backup & Export
- Versioned JSON file (`schemaVersion: 1`).
- RFC-4180 CSV export with UTF-8 BOM.
- Printable PDF report with summary metrics, subject tables, and disclaimer.
