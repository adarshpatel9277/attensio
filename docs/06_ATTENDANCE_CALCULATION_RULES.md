# 06. Attendance Calculation Rules

## Primary Attendance Formula
$$\text{Attendance Percentage} = \frac{\text{Present Classes}}{\text{Present Classes} + \text{Absent Classes}} \times 100$$

### Status Inclusion Policy
- `PRESENT`: Counted in numerator and denominator.
- `ABSENT`: Counted in denominator.
- `LEAVE`: Excluded from denominator by default. (If user enables "Count Leave as Missed Classes", counted in denominator).
- `HOLIDAY`: Excluded from both numerator and denominator.
- `CANCELLED`: Excluded from both numerator and denominator.
- `UNMARKED`: Excluded until status is assigned.

## Zero Counted Classes Policy
- If $\text{Present} + \text{Absent} == 0$:
  - Percentage: `null` (Displayed as "No attendance data yet").
  - Never display `NaN%`, `Infinity%`, or misleading `0.0%`.

## Goal Calculator Formulas

### Case A: Current Percentage < Target Percentage ($T$)
To determine minimum consecutive present classes $x$ to reach target $T$ (where $T = \frac{\text{targetPercent}}{100}$):
$$\frac{\text{Present} + x}{\text{Total} + x} \ge T$$
$$x \cdot (1 - T) \ge T \cdot \text{Total} - \text{Present}$$
$$x = \left\lceil \frac{T \cdot (\text{Present} + \text{Absent}) - \text{Present}}{1 - T} \right\rceil$$

*Special Case*: If $T = 100\%$ and $\text{Absent} > 0$, $1 - T = 0$. Mathematically impossible to regain 100% after an absence. The app displays an honest explanation.

### Case B: Current Percentage $\ge$ Target Percentage ($T$)
To determine how many future classes $y$ can be missed consecutively before falling below $T$:
$$\frac{\text{Present}}{\text{Total} + y} \ge T$$
$$y \le \frac{\text{Present} - T \cdot \text{Total}}{T}$$
$$y = \left\lfloor \frac{\text{Present} - T \cdot (\text{Present} + \text{Absent})}{T} \right\rfloor$$
