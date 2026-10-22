# 10 — Glance AppWidget Specification
**Student Attendance Tracker** • *Jetpack Glance Material 3 Widget*

---

## 1. Widget Types & Sizes

### 4x2 Landscape Widget (Comprehensive)
- **Top Bar**: Active semester name, overall attendance percentage badge, quick refresh button.
- **Body List**: Displays up to 3 subjects with color tokens, attendance percentage, and target gap.
- **Interactive Action**: Quick `Present` (green check) and `Absent` (red minus) buttons for today's classes directly inside the Glance UI.
- **Footer**: Status pill (`On Track` / `Attention`) and timestamp.

### 2x2 Compact Widget (Summary)
- **Header**: Overall semester percentage in prominent display typography.
- **Body**: List of top 2 critical subjects or subjects below target.
- **Tap Behavior**: Launches `MainActivity` directly into the `Dashboard` or `QuickMark` sheet.

---

## 2. Glance Implementation Architecture
- **Library**: `androidx.glance:glance-appwidget:1.0.0`
- **Receiver**: `AttendanceGlanceReceiver : GlanceAppWidgetReceiver`
- **Widget Provider**: `AttendanceGlanceWidget : GlanceAppWidget`
- **State Definition**: Uses `GlanceStateDefinition` backed by Datastore or lightweight Room snapshot.

```kotlin
class AttendanceGlanceWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val repository = EntryPointAccessors.fromApplication(context, WidgetEntryPoint::class.java).repository()
        val summaries = repository.getSubjectSummariesSync()

        provideContent {
            GlanceTheme {
                AttendanceWidgetContent(summaries)
            }
        }
    }
}
```

---

## 3. Interactive Glance Action Callbacks
- Uses `ActionCallback` for zero-activity-launch background writes:
  ```kotlin
  class QuickMarkActionCallback : ActionCallback {
      override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
          val subjectId = parameters[SubjectIdKey] ?: return
          val status = parameters[StatusKey] ?: return
          val repository = ...
          repository.saveAttendanceRecord(...)
          AttendanceGlanceWidget().update(context, glanceId)
      }
  }
  ```

---

## 4. Privacy Mode Behavior
- If `settings.widgetPrivacyMode == true`:
  - Strips numeric percentages (e.g. replaces `68.2%` with `Review Needed`).
  - Hides sensitive course names on locked devices if device lock screen widgets are enabled.
