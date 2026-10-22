/**
 * Robust Local Date & Calendar Utility
 * Guarantees local timezone accuracy without UTC offset shifts
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getLocalTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD as a local midnight Date
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formats YYYY-MM-DD for human display (e.g., "Wed, Oct 8")
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats YYYY-MM-DD for full display (e.g., "Wednesday, October 8, 2026")
 */
export function formatFullDisplayDate(dateStr: string): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns month and year info for a given Date
 */
export function getMonthCalendarData(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const monthName = date.toLocaleString('en-US', { month: 'long' });

  // First day of current month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Total days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Days from previous month to fill first row
  const prevMonthDays = Array.from(
    { length: firstDayOfWeek },
    (_, i) => daysInPrevMonth - firstDayOfWeek + 1 + i
  );

  // Days of current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Days from next month to complete last row (fill up to 35 or 42 cells)
  const totalCells = firstDayOfWeek + daysInMonth;
  const nextMonthCellsCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({ length: nextMonthCellsCount }, (_, i) => i + 1);

  return {
    year,
    month,
    monthName,
    prevMonthDays,
    currentMonthDays,
    nextMonthDays,
  };
}
