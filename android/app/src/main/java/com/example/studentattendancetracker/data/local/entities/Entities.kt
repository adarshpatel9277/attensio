package com.example.studentattendancetracker.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "display_name") val displayName: String?,
    @ColumnInfo(name = "college_name") val collegeName: String?,
    @ColumnInfo(name = "course_name") val courseName: String?,
    @ColumnInfo(name = "roll_number") val rollNumber: String?,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at") val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "semesters")
data class SemesterEntity(
    @PrimaryKey val id: String,
    val name: String,
    @ColumnInfo(name = "academic_year") val academicYear: String?,
    @ColumnInfo(name = "start_date") val startDate: String,
    @ColumnInfo(name = "end_date") val endDate: String?,
    @ColumnInfo(name = "is_active") val isActive: Boolean,
    @ColumnInfo(name = "is_archived") val isArchived: Boolean = false,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at") val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "subjects",
    foreignKeys = [
        ForeignKey(
            entity = SemesterEntity::class,
            parentColumns = ["id"],
            childColumns = ["semester_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("semester_id")]
)
data class SubjectEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "semester_id") val semesterId: String,
    @ColumnInfo(name = "subject_name") val subjectName: String,
    @ColumnInfo(name = "subject_code") val subjectCode: String?,
    @ColumnInfo(name = "teacher_name") val teacherName: String?,
    @ColumnInfo(name = "color_token") val colorToken: String,
    @ColumnInfo(name = "target_percent") val targetPercent: Int = 75,
    @ColumnInfo(name = "total_classes") val totalClasses: Int = 0,
    @ColumnInfo(name = "is_archived") val isArchived: Boolean = false,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at") val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "attendance_records",
    foreignKeys = [
        ForeignKey(
            entity = SubjectEntity::class,
            parentColumns = ["id"],
            childColumns = ["subject_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = SemesterEntity::class,
            parentColumns = ["id"],
            childColumns = ["semester_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index("subject_id"),
        Index("semester_id"),
        Index(value = ["subject_id", "date", "class_start_time"], unique = true)
    ]
)
data class AttendanceRecordEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "subject_id") val subjectId: String,
    @ColumnInfo(name = "semester_id") val semesterId: String,
    val date: String,
    @ColumnInfo(name = "class_start_time") val classStartTime: String?,
    @ColumnInfo(name = "class_end_time") val classEndTime: String?,
    val status: String, // PRESENT, ABSENT, LEAVE, HOLIDAY, CANCELLED, UNMARKED
    val source: String, // MANUAL, LOCATION_REMINDER, IMPORTED
    val note: String?,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "leave_records",
    foreignKeys = [
        ForeignKey(
            entity = SemesterEntity::class,
            parentColumns = ["id"],
            childColumns = ["semester_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("semester_id")]
)
data class LeaveRecordEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "semester_id") val semesterId: String,
    @ColumnInfo(name = "date_from") val dateFrom: String,
    @ColumnInfo(name = "date_to") val dateTo: String,
    @ColumnInfo(name = "leave_type") val leaveType: String,
    val reason: String,
    val note: String?,
    val status: String,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)
