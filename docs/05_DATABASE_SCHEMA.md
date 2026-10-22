# 05. Database Schema Specification

## Room Database: `attendance_database.db`
Schema Version: `1` with exportSchema enabled.

### 1. Table `user_profile`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | User identifier |
| `display_name` | TEXT | NULLABLE | Student name |
| `college_name` | TEXT | NULLABLE | College / University |
| `course_name` | TEXT | NULLABLE | Degree / Course |
| `roll_number` | TEXT | NULLABLE | Student ID / Roll |
| `created_at` | INTEGER | NOT NULL | Unix epoch millis |
| `updated_at` | INTEGER | NOT NULL | Unix epoch millis |

### 2. Table `semesters`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Semester UUID |
| `name` | TEXT | NOT NULL | e.g. "Semester 6" |
| `academic_year` | TEXT | NULLABLE | e.g. "2025-2026" |
| `start_date` | TEXT | NOT NULL | ISO Date YYYY-MM-DD |
| `end_date` | TEXT | NULLABLE | ISO Date YYYY-MM-DD |
| `is_active` | INTEGER | NOT NULL (0 or 1) | Currently active semester |
| `is_archived` | INTEGER | NOT NULL (0 or 1) | Archived status |
| `created_at` | INTEGER | NOT NULL | Unix epoch millis |
| `updated_at` | INTEGER | NOT NULL | Unix epoch millis |

### 3. Table `subjects`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Subject UUID |
| `semester_id` | TEXT | FOREIGN KEY -> semesters(id) ON DELETE CASCADE | Parent semester |
| `subject_name` | TEXT | NOT NULL | Course title |
| `subject_code` | TEXT | NULLABLE | e.g. "CS301" |
| `teacher_name` | TEXT | NULLABLE | Faculty name |
| `color_token` | TEXT | NOT NULL | Hex color string |
| `target_percent` | INTEGER | NOT NULL DEFAULT 75 | Target percentage |
| `total_classes` | INTEGER | NOT NULL DEFAULT 0 | Planned classes |
| `is_archived` | INTEGER | NOT NULL DEFAULT 0 | Hidden flag |

### 4. Table `attendance_records`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Record UUID |
| `subject_id` | TEXT | FOREIGN KEY -> subjects(id) ON DELETE CASCADE | Target subject |
| `semester_id` | TEXT | FOREIGN KEY -> semesters(id) ON DELETE CASCADE | Parent semester |
| `date` | TEXT | NOT NULL | ISO Date YYYY-MM-DD |
| `class_start_time`| TEXT | NULLABLE | Start time HH:mm |
| `class_end_time` | TEXT | NULLABLE | End time HH:mm |
| `status` | TEXT | NOT NULL | PRESENT, ABSENT, LEAVE, HOLIDAY, CANCELLED |
| `source` | TEXT | NOT NULL | MANUAL, LOCATION_REMINDER, IMPORTED |
| `note` | TEXT | NULLABLE | Student optional remark |
| `created_at` | INTEGER | NOT NULL | Unix epoch millis |

**Index**: Unique composite index on `(subject_id, date, class_start_time)` preventing accidental duplicates while permitting multiple classes per day with differing start times.

### 5. Table `leave_records`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Leave UUID |
| `semester_id` | TEXT | FOREIGN KEY -> semesters(id) | Linked semester |
| `date_from` | TEXT | NOT NULL | Start date |
| `date_to` | TEXT | NOT NULL | End date |
| `leave_type` | TEXT | NOT NULL | Type |
| `reason` | TEXT | NOT NULL | Reason summary |
| `status` | TEXT | NOT NULL | PERSONAL, MEDICAL, COLLEGE_HOLIDAY, OTHER |
