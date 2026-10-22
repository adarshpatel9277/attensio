# 01. Product Requirements Document (PRD)

## Product Name
**Student Attendance Tracker**

## Vision & Objective
Student Attendance Tracker is a personal, offline-first Android application designed to help university and college students monitor their daily attendance across multiple semesters. It provides transparent attendance calculations, goal planning, privacy-first local data storage, college location reminders, and home-screen widgets without requiring any external cloud backend, user login, or third-party tracking.

## Core Principles
1. **Personal Student Tool**: Not an official college attendance system.
2. **Offline-First**: All records, calculations, and backups reside on the student's device.
3. **No Automatic GPS Marking**: GPS/location is used solely for reminders. The student must manually record attendance.
4. **Transparent Calculations**: Math formulas are explicit, reproducible, and explainable in plain English.
5. **Privacy & Security**: Zero telemetry, zero ad SDKs, optional biometric app lock, local JSON backup and restore.

## Target Audience
- College and university students wanting to stay above institutional attendance thresholds (e.g., 75% or 80%).
- Students tracking multiple subjects, labs, elective courses, and semesters.

## Key Features
- Multi-semester management (Active, Archive, Historical).
- Subject catalog with customizable target percentages and accessible color tokens.
- Fast, one-tap attendance marking (Present, Absent, Leave, Cancelled).
- Interactive Calendar with color-coded status badges and day inspection.
- Mathematical Attendance Goal Calculator (consecutive classes needed or safe absences allowed).
- Low Attendance Warnings with actionable advice.
- Location-based college proximity reminders with geofence cooldown.
- Android Glance Home-screen Widget for at-a-glance status.
- Biometric App Lock using BiometricPrompt with PIN fallback.
- Full local JSON Backup & Restore with schema migration safety.
- RFC-4180 CSV export and printable PDF attendance report generation.
