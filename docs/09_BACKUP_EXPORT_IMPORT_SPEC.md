# 09 — Backup, Export & Import Specification
**Student Attendance Tracker** • *Data Portability & Local Persistence*

---

## 1. Export Formats & Use Cases

| Format | Purpose | File Extension | Schema Bound |
| :--- | :--- | :--- | :--- |
| **JSON Backup** | Complete lossless database restoration | `.json` | Schema v1 (`sat_backup_*.json`) |
| **CSV Attendance Logs** | Spreadsheet analysis (Excel, Google Sheets) | `.csv` | Flat tabular schema |
| **CSV Semester Summary** | Quick subject-by-subject percentage printout | `.csv` | Aggregate metrics |
| **PDF Academic Report** | Clean printable report for advisors/parents | `.pdf` | Visual tabular report with signature |

---

## 2. JSON Backup Schema Versioning
```json
{
  "metadata": {
    "schemaVersion": 1,
    "exportedAt": "2026-09-21T12:00:00.000Z",
    "appVersion": "1.0.0",
    "deviceIndependentBackupId": "sat_backup_1774267200000"
  },
  "userProfile": { ... },
  "semesters": [ ... ],
  "subjects": [ ... ],
  "attendanceRecords": [ ... ],
  "leaveRecords": [ ... ],
  "holidays": [ ... ],
  "timetable": [ ... ],
  "locationReminders": [ ... ],
  "settings": { ... }
}
```

### Validation & Migration Policy
1. Before parsing, verify `metadata.schemaVersion`.
2. Reject files missing `semesters` or `subjects` arrays.
3. If `metadata.schemaVersion > CURRENT_SCHEMA_VERSION`, warn user that backup is from a newer app version.
4. Auto-generate UUIDs for records missing primary keys.

---

## 3. Restoration Modes
- **Replace (Clean Restore)**: Wipes local Room database tables and re-populates strictly with backup contents. Useful for device migrations or fresh starts.
- **Merge**: Upserts existing records based on unique business keys (`subjectId + date + classStartTime`) and preserves non-conflicting local items.

---

## 4. Android Storage Access Framework (SAF)
- **Exporting**: `ActivityResultContracts.CreateDocument("application/json")`
  - Allows the student to save backups directly to Google Drive, SD Card, USB-OTG, or Downloads folder.
- **Importing**: `ActivityResultContracts.OpenDocument()`
  - Reads backup via `ContentResolver.openInputStream(uri)`.
