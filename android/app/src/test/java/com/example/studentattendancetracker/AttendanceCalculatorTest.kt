package com.example.studentattendancetracker

import com.example.studentattendancetracker.domain.calculator.AttendanceCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AttendanceCalculatorTest {

    @Test
    fun calculatePercentage_zeroClasses_returnsNull() {
        val result = AttendanceCalculator.calculatePercentage(0, 0)
        assertNull(result)
    }

    @Test
    fun calculatePercentage_perfectAttendance_returns100() {
        val result = AttendanceCalculator.calculatePercentage(10, 0)
        assertEquals(100.0, result!!, 0.01)
    }

    @Test
    fun calculatePercentage_standardRatio_returnsAccurate() {
        val result = AttendanceCalculator.calculatePercentage(15, 5)
        assertEquals(75.0, result!!, 0.01)
    }

    @Test
    fun goalCalculator_belowTarget_calculatesNeededClasses() {
        // 10 present, 5 absent -> 10/15 = 66.7%. Target 75%.
        // (10 + x) / (15 + x) >= 0.75 -> 10 + x >= 11.25 + 0.75x -> 0.25x >= 1.25 -> x = 5.
        val goal = AttendanceCalculator.calculateGoal(10, 5, 75)
        assertFalse(goal.isAboveTarget)
        assertEquals(5, goal.classesNeeded)
        assertEquals(0, goal.classesCanBeMissed)
    }

    @Test
    fun goalCalculator_aboveTarget_calculatesAbsencesAllowed() {
        // 20 present, 2 absent -> 20/22 = 90.9%. Target 75%.
        // 20 / (22 + y) >= 0.75 -> 20 >= 16.5 + 0.75y -> 0.75y <= 3.5 -> y = floor(4.66) = 4.
        val goal = AttendanceCalculator.calculateGoal(20, 2, 75)
        assertTrue(goal.isAboveTarget)
        assertEquals(0, goal.classesNeeded)
        assertEquals(4, goal.classesCanBeMissed)
    }

    @Test
    fun goalCalculator_target100WithAbsence_reportsImpossible() {
        val goal = AttendanceCalculator.calculateGoal(10, 1, 100)
        assertTrue(goal.isImpossible)
    }
}
