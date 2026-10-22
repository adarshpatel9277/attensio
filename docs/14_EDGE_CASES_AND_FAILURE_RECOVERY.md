# 14 — Edge Cases & Failure Recovery
**Student Attendance Tracker** • *Robustness & Resiliency Guide*

---

## 1. Handled Edge Cases

### A. Zero Classes Logged
- **Risk**: Division by zero in attendance calculation (`present / total`).
- **Resolution**: `calculatePercentage(0, 0)` explicitly returns `null`. The UI renders `No Data` or `—` instead of `0%` or `NaN%`.

### B. Duplicate Class Entries
- **Risk**: User accidentally taps "Present" twice on the same subject on the same date.
- **Resolution**: Room composite unique index on `(subject_id, date, class_start_time)`. In repository, existing record is updated in place, preventing duplicates.

### C. Leap Years, Semester Transitions & Time Zones
- **Resolution**: Dates are stored in ISO 8601 string format (`YYYY-MM-DD`). Computations rely on day-based parsing without timezone shift errors.

### D. Extreme Absences & Target Math
- **Case**: Student has 10 absences and 0 presents with 75% target.
  - Needed classes formula: `ceil((0.75 * 10 - 0) / 0.25) = 30 consecutive classes`.
  - Accurately reports 30 classes needed, highlighting feasibility.

### E. Database Migration Crash Recovery
- **Resolution**: Room migrations use fallback destructive migration only if migration fails, with a pre-migration JSON snapshot saved to internal cache for emergency recovery.
