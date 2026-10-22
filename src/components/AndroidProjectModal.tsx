import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  Terminal,
  FileCode,
  Check,
  Copy,
  Layers,
  BookOpen,
  Download,
} from 'lucide-react';

interface AndroidProjectModalProps {
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('build.gradle.kts');

  const files: Record<string, { label: string; code: string }> = {
    'build.gradle.kts': {
      label: 'app/build.gradle.kts',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
}

android {
    namespace = "com.example.studentattendancetracker"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.studentattendancetracker"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    
    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    kapt(libs.androidx.room.compiler)

    // Biometrics & Glance Widget
    implementation(libs.androidx.biometric)
    implementation(libs.androidx.glance.appwidget)
    implementation(libs.androidx.glance.material3)
}`,
    },
    'AndroidManifest.xml': {
      label: 'AndroidManifest.xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:name=".AttendanceApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.StudentAttendanceTracker">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".widget.AttendanceGlanceReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/attendance_widget_info" />
        </receiver>
    </application>
</manifest>`,
    },
    'Entities.kt': {
      label: 'Entities.kt (Room)',
      code: `package com.example.studentattendancetracker.data.local.entities

import androidx.room.*

@Entity(tableName = "semesters")
data class SemesterEntity(
    @PrimaryKey val id: String,
    val name: String,
    @ColumnInfo(name = "academic_year") val academicYear: String?,
    @ColumnInfo(name = "start_date") val startDate: String,
    @ColumnInfo(name = "end_date") val endDate: String?,
    @ColumnInfo(name = "is_active") val isActive: Boolean,
    @ColumnInfo(name = "is_archived") val isArchived: Boolean = false
)

@Entity(
    tableName = "subjects",
    foreignKeys = [ForeignKey(entity = SemesterEntity::class, parentColumns = ["id"], childColumns = ["semester_id"], onDelete = ForeignKey.CASCADE)]
)
data class SubjectEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "semester_id") val semesterId: String,
    @ColumnInfo(name = "subject_name") val subjectName: String,
    @ColumnInfo(name = "subject_code") val subjectCode: String?,
    @ColumnInfo(name = "teacher_name") val teacherName: String?,
    @ColumnInfo(name = "color_token") val colorToken: String,
    @ColumnInfo(name = "target_percent") val targetPercent: Int = 75
)

@Entity(
    tableName = "attendance_records",
    indices = [Index(value = ["subject_id", "date", "class_start_time"], unique = true)]
)
data class AttendanceRecordEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "subject_id") val subjectId: String,
    @ColumnInfo(name = "semester_id") val semesterId: String,
    val date: String,
    @ColumnInfo(name = "class_start_time") val classStartTime: String?,
    val status: String,
    val source: String,
    val note: String?
)`,
    },
    'AttendanceCalculator.kt': {
      label: 'AttendanceCalculator.kt',
      code: `package com.example.studentattendancetracker.domain.calculator

import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.roundToInt

object AttendanceCalculator {
    fun calculatePercentage(present: Int, absent: Int): Double? {
        val total = present + absent
        if (total == 0) return null
        return ((present.toDouble() / total.toDouble()) * 1000.0).roundToInt() / 10.0
    }

    fun calculateGoal(present: Int, absent: Int, targetPercent: Int): GoalResult {
        val total = present + absent
        val targetRatio = targetPercent.toDouble() / 100.0
        val currentRatio = if (total > 0) present.toDouble() / total.toDouble() else 0.0

        if (currentRatio > targetRatio) {
            val safeMisses = maxOf(0, floor((present.toDouble() - targetRatio * total.toDouble()) / targetRatio).toInt())
            return GoalResult(classesCanBeMissed = safeMisses, classesNeeded = 0, isAboveTarget = true)
        }

        val needed = maxOf(1, ceil((targetRatio * total.toDouble() - present.toDouble()) / (1.0 - targetRatio)).toInt())
        return GoalResult(classesCanBeMissed = 0, classesNeeded = needed, isAboveTarget = false)
    }
}`,
    },
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23211E]/50 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#E6E1D8] shadow-2xl p-6 space-y-5 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D95D29] text-white flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#23211E]">
                Native Android Studio Project Source & Build Instructions
              </h3>
              <p className="text-xs text-[#7A746E]">
                Kotlin • Jetpack Compose • Room Database • Glance AppWidget
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3EFE9] text-[#7A746E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Build Commands Bar */}
        <div className="p-4 rounded-xl bg-[#23211E] text-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#D95D29]" />
            <span>./gradlew assembleDebug</span>
          </div>
          <button
            onClick={() => copyCommand('./gradlew assembleDebug')}
            className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#1E7F4D]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Gradle Command'}</span>
          </button>
        </div>

        {/* File Navigator Tabs & Code Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-[#E6E1D8]">
          <div className="flex items-center gap-1 p-2 bg-[#FAF8F5] border-b border-[#E6E1D8] overflow-x-auto">
            {Object.keys(files).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFile === key
                    ? 'bg-white text-[#23211E] shadow-xs border border-[#E0DBD2]'
                    : 'text-[#7A746E] hover:text-[#23211E]'
                }`}
              >
                {files[key].label}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-[#1A1A1A] p-4 overflow-auto text-xs font-mono text-[#E6E1D8]">
            <pre className="whitespace-pre">{files[selectedFile].code}</pre>
          </div>
        </div>

        {/* Footer instructions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#7A746E]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#D95D29]" />
            <span>See full architecture guides and tests in <code>/docs</code> directory</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#23211E] text-white font-semibold self-end"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
