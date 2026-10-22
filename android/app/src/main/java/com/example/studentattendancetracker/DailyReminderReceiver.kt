package com.example.studentattendancetracker

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.Calendar

class DailyReminderReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "AttendifyReminder"
        const val CHANNEL_ID = "attendify_reminders"
        const val PREFS_NAME = "attendify_alarm_prefs"

        const val ACTION_REMINDER = "com.example.studentattendancetracker.REMINDER_ALARM"
        const val EXTRA_ALARM_TYPE = "extra_alarm_type"

        const val TYPE_MORNING = "MORNING_ROLL_CALL"
        const val TYPE_PRE_COLLEGE = "PRE_COLLEGE"
        const val TYPE_EVENING = "EVENING_AUDIT"
        const val TYPE_TEST = "TEST_ALARM"

        const val ID_MORNING = 1001
        const val ID_PRE_COLLEGE = 1002
        const val ID_EVENING = 1003
        const val ID_TEST = 1004

        fun createNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val name = "Attendance Reminders"
                val descriptionText = "Daily alarms and alerts to track college attendance"
                val importance = NotificationManager.IMPORTANCE_HIGH
                val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                    description = descriptionText
                    enableLights(true)
                    lightColor = Color.parseColor("#4F46E5") // Indigo
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 300, 200, 300)
                }
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }

        fun savePreferences(
            context: Context,
            collegeStartTime: String,
            morningEnabled: Boolean,
            preCollegeEnabled: Boolean,
            eveningEnabled: Boolean
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putString("college_start_time", collegeStartTime)
                .putBoolean("morning_enabled", morningEnabled)
                .putBoolean("pre_college_enabled", preCollegeEnabled)
                .putBoolean("evening_enabled", eveningEnabled)
                .apply()
        }

        fun scheduleAll(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val collegeStartTime = prefs.getString("college_start_time", "09:00") ?: "09:00"
            val morningEnabled = prefs.getBoolean("morning_enabled", true)

            if (!morningEnabled) {
                cancelAlarm(context, ID_MORNING, TYPE_MORNING)
                cancelAlarm(context, ID_PRE_COLLEGE, TYPE_PRE_COLLEGE)
                cancelAlarm(context, ID_EVENING, TYPE_EVENING)
                return
            }

            // 1. College Start Time (e.g. 09:30 AM)
            val (hour, minute) = parseTime(collegeStartTime)
            scheduleDailyAlarm(context, ID_MORNING, TYPE_MORNING, hour, minute)

            // 2. Midday Reminder at 12:00 PM
            scheduleDailyAlarm(context, ID_PRE_COLLEGE, TYPE_PRE_COLLEGE, 12, 0)

            // 3. Pre-Closing Wrap-up at 15:45 (3:45 PM)
            scheduleDailyAlarm(context, ID_EVENING, TYPE_EVENING, 15, 45)
        }

        private fun parseTime(timeStr: String): Pair<Int, Int> {
            return try {
                val parts = timeStr.trim().split(":")
                val h = parts[0].toInt()
                val m = if (parts.size > 1) parts[1].toInt() else 0
                Pair(h, m)
            } catch (e: Exception) {
                Pair(9, 0)
            }
        }

        private fun scheduleDailyAlarm(context: Context, requestCode: Int, type: String, hour: Int, minute: Int) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, DailyReminderReceiver::class.java).apply {
                action = ACTION_REMINDER
                putExtra(EXTRA_ALARM_TYPE, type)
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getBroadcast(context, requestCode, intent, flags)

            val now = Calendar.getInstance()
            val target = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (before(now)) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        target.timeInMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        target.timeInMillis,
                        pendingIntent
                    )
                }
                Log.d(TAG, "Scheduled alarm $type ($requestCode) for ${target.time}")
            } catch (e: SecurityException) {
                Log.w(TAG, "Exact alarm permission missing, falling back to non-exact set", e)
                alarmManager.set(AlarmManager.RTC_WAKEUP, target.timeInMillis, pendingIntent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to schedule alarm $type", e)
            }
        }

        fun cancelAlarm(context: Context, requestCode: Int, type: String) {
            try {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                val intent = Intent(context, DailyReminderReceiver::class.java).apply {
                    action = ACTION_REMINDER
                    putExtra(EXTRA_ALARM_TYPE, type)
                }
                val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
                val pendingIntent = PendingIntent.getBroadcast(context, requestCode, intent, flags)
                alarmManager.cancel(pendingIntent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to cancel alarm $type", e)
            }
        }

        fun triggerNotification(context: Context, notificationId: Int, title: String, message: String) {
            createNotificationChannel(context)
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getActivity(context, notificationId, intent, flags)

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_alarm)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setColor(Color.parseColor("#4F46E5"))
                .setContentIntent(pendingIntent)

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notificationId, builder.build())
        }
    }

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return
        Log.d(TAG, "Received action: $action")

        if (action == Intent.ACTION_BOOT_COMPLETED) {
            scheduleAll(context)
            return
        }

        if (action == ACTION_REMINDER) {
            val now = Calendar.getInstance()
            val dayOfWeek = now.get(Calendar.DAY_OF_WEEK)
            // Never send reminders on Sunday
            if (dayOfWeek == Calendar.SUNDAY) {
                scheduleAll(context)
                return
            }

            val type = intent.getStringExtra(EXTRA_ALARM_TYPE) ?: TYPE_MORNING
            when (type) {
                TYPE_MORNING -> {
                    triggerNotification(
                        context,
                        ID_MORNING,
                        "Morning Call • College Started 🔔",
                        "College has started. Remember to mark your attendance."
                    )
                }
                TYPE_PRE_COLLEGE -> {
                    triggerNotification(
                        context,
                        ID_PRE_COLLEGE,
                        "Morning Call • Midday Check-In 📝",
                        "Have you marked your attendance today? Please update your record."
                    )
                }
                TYPE_EVENING -> {
                    triggerNotification(
                        context,
                        ID_EVENING,
                        "Morning Call • College Closing Soon 🏫",
                        "Before college closes, confirm today's attendance status."
                    )
                }
                TYPE_TEST -> {
                    triggerNotification(
                        context,
                        ID_TEST,
                        "Morning Call Active 🔔",
                        "Morning Call is configured! You will receive 3 smart reminders on college working days."
                    )
                }
            }
            // Reschedule for next day cycle
            scheduleAll(context)
        }
    }
}
