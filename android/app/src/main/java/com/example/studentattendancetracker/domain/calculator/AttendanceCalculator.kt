package com.example.studentattendancetracker.domain.calculator

import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.roundToInt

data class GoalResult(
    val currentPercentage: Double?,
    val targetPercentage: Int,
    val isAboveTarget: Boolean,
    val isExactlyTarget: Boolean,
    val classesNeeded: Int,
    val classesCanBeMissed: Int,
    val isImpossible: Boolean,
    val explanation: String
)

object AttendanceCalculator {

    fun calculatePercentage(present: Int, absent: Int): Double? {
        val total = present + absent
        if (total == 0) return null
        return ((present.toDouble() / total.toDouble()) * 1000.0).roundToInt() / 10.0
    }

    fun calculateGoal(present: Int, absent: Int, targetPercent: Int): GoalResult {
        val total = present + absent
        if (targetPercent <= 0 || targetPercent > 100) {
            return GoalResult(
                currentPercentage = calculatePercentage(present, absent),
                targetPercentage = targetPercent,
                isAboveTarget = false,
                isExactlyTarget = false,
                classesNeeded = 0,
                classesCanBeMissed = 0,
                isImpossible = true,
                explanation = "Target percentage must be between 1% and 100%."
            )
        }

        if (total == 0) {
            return GoalResult(
                currentPercentage = null,
                targetPercentage = targetPercent,
                isAboveTarget = false,
                isExactlyTarget = false,
                classesNeeded = 1,
                classesCanBeMissed = 0,
                isImpossible = false,
                explanation = "No attendance recorded yet. Attend your next class to get started."
            )
        }

        val currentRatio = present.toDouble() / total.toDouble()
        val currentPercent = ((currentRatio * 1000.0).roundToInt()) / 10.0
        val targetRatio = targetPercent.toDouble() / 100.0

        if (Math.abs(currentRatio - targetRatio) < 0.0001) {
            return GoalResult(
                currentPercentage = currentPercent,
                targetPercentage = targetPercent,
                isAboveTarget = true,
                isExactlyTarget = true,
                classesNeeded = 0,
                classesCanBeMissed = 0,
                isImpossible = false,
                explanation = "You are exactly at your target of $targetPercent%."
            )
        }

        if (currentRatio > targetRatio) {
            val allowedAbsences = floor((present.toDouble() - targetRatio * total.toDouble()) / targetRatio).toInt()
            val safe = maxOf(0, allowedAbsences)
            return GoalResult(
                currentPercentage = currentPercent,
                targetPercentage = targetPercent,
                isAboveTarget = true,
                isExactlyTarget = false,
                classesNeeded = 0,
                classesCanBeMissed = safe,
                isImpossible = false,
                explanation = if (safe > 0) {
                    "You are currently above target ($currentPercent% > $targetPercent%). You can miss $safe upcoming class(es) safely."
                } else {
                    "You are currently at $currentPercent%, but missing even 1 class will drop you below $targetPercent%."
                }
            )
        }

        if (targetPercent == 100) {
            return GoalResult(
                currentPercentage = currentPercent,
                targetPercentage = targetPercent,
                isAboveTarget = false,
                isExactlyTarget = false,
                classesNeeded = 0,
                classesCanBeMissed = 0,
                isImpossible = true,
                explanation = "Because you already have $absent absence(s), reaching 100% is mathematically impossible."
            )
        }

        val numerator = targetRatio * total.toDouble() - present.toDouble()
        val denominator = 1.0 - targetRatio
        val needed = maxOf(1, ceil(numerator / denominator).toInt())

        return GoalResult(
            currentPercentage = currentPercent,
            targetPercentage = targetPercent,
            isAboveTarget = false,
            isExactlyTarget = false,
            classesNeeded = needed,
            classesCanBeMissed = 0,
            isImpossible = false,
            explanation = "You are currently below target ($currentPercent% < $targetPercent%). Attend the next $needed consecutive class(es) to reach $targetPercent%."
        )
    }
}
