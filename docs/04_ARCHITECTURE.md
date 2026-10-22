# 04. Android Architecture Specification

## Package Structure
```
com.example.studentattendancetracker
|
+-- app/
|   +-- AttendanceApplication.kt
|   +-- MainActivity.kt
|   +-- AppContainer.kt
|
+-- core/
|   +-- designsystem/ (Theme, Color, Type, Components)
|   +-- navigation/ (NavigationGraph, Destinations)
|   +-- permissions/ (LocationPermissionHelper, NotificationPermissionHelper)
|   +-- notifications/ (AttendanceNotificationManager)
|   +-- location/ (GeofenceManager, ProximityReminderReceiver)
|   +-- security/ (BiometricAuthHelper)
|   +-- export/ (PdfReportGenerator, CsvExporter)
|   +-- backup/ (BackupManager, JsonSchemaValidator)
|
+-- data/
|   +-- local/
|   |   +-- database/ (AppDatabase.kt)
|   |   +-- dao/ (SemesterDao, SubjectDao, AttendanceDao, LeaveDao)
|   |   +-- entities/ (Room Entities)
|   +-- repository/ (AttendanceRepositoryImpl, PreferencesRepository)
|
+-- domain/
|   +-- model/ (Domain models)
|   +-- calculator/ (AttendanceCalculator.kt)
|
+-- feature/
|   +-- dashboard/
|   +-- attendance/
|   +-- calendar/
|   +-- goal/
|   +-- leave/
|   +-- reminders/
|   +-- settings/
|
+-- widget/
    +-- AttendanceGlanceWidget.kt
    +-- AttendanceGlanceReceiver.kt
```

## Clean Architecture Layers
1. **UI Layer**: Jetpack Compose + Material 3, ViewModels managing UiState with `StateFlow`.
2. **Domain Layer**: Pure Kotlin use cases and mathematical calculators (`calculateGoal`, `calculateSubjectSummary`).
3. **Data Layer**: Room Database (SQLite) + Jetpack DataStore Preferences for app settings. Repository interfaces shield the UI from direct DAO access.
