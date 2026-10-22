/**
 * Safe CSV & PDF Exporter
 * Implements RFC 4180 escaping and high-quality PDF generation
 */

import { jsPDF } from 'jspdf';
import { AttendanceRecord, Semester, Subject, UserProfile, DayRecord, DayAppSettings } from '../types';
import { calculateSubjectAttendance } from './calculator';

// Helper to safely escape CSV cell according to RFC 4180
export function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports attendance records to RFC-4180 compliant CSV
 */
export function exportAttendanceToCsv(
  records: AttendanceRecord[],
  subjects: Subject[],
  semesters: Semester[],
  filenamePrefix: string = 'Attendance_Records'
): void {
  const subjectMap = new Map(subjects.map((s) => [s.id, s.subjectName]));
  const semesterMap = new Map(semesters.map((s) => [s.id, s.name]));

  const headers = ['Semester', 'Subject', 'Date', 'Start Time', 'End Time', 'Status', 'Source', 'Note'];
  const rows: string[] = [];
  rows.push(headers.map(escapeCsvCell).join(','));

  // Sort chronological
  const sorted = [...records].sort((a, b) => (a.date > b.date ? 1 : -1));

  for (const r of sorted) {
    const row = [
      semesterMap.get(r.semesterId) || 'Unknown Semester',
      subjectMap.get(r.subjectId) || 'Unknown Subject',
      r.date,
      r.classStartTime || '',
      r.classEndTime || '',
      r.status,
      r.source,
      r.note || '',
    ];
    rows.push(row.map(escapeCsvCell).join(','));
  }

  // Prepend UTF-8 BOM so Excel opens accented & special characters smoothly
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const fileName = `attendance-export-${year}-${month}-${day}.csv`;

  downloadFileDirectly(fileName, csvContent, 'text/csv');
}

/**
 * Direct file downloader that saves files to device without opening share dialogs
 */
export async function downloadFileDirectly(
  fileName: string,
  content: string,
  mimeType: string
): Promise<boolean> {
  // 1. Android Bridge direct download
  if (typeof (window as any).AndroidApp?.saveFile === 'function') {
    try {
      const saved = (window as any).AndroidApp.saveFile(fileName, content, mimeType);
      if (saved) return true;
    } catch (e) {
      console.warn('Android saveFile bridge error, trying browser fallback', e);
    }
  }

  // 2. File System Access API (when supported on desktop)
  if ('showSaveFilePicker' in window) {
    try {
      const ext = fileName.split('.').pop() || 'csv';
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: mimeType.includes('csv') ? 'CSV File' : 'JSON File',
            accept: { [mimeType]: [`.${ext}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
    }
  }

  // 3. Direct browser Blob download mechanism (Desktop and Android mobile browsers)
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  } catch (blobErr) {
    console.warn('Blob URL download error, trying data URI fallback', blobErr);
  }

  // 4. Data URI fallback
  try {
    const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (dataErr) {
    console.error('All file download flows failed:', dataErr);
    return false;
  }
}

/**
 * Exports current day attendance records to formatted CSV without opening share menu
 */
export async function exportDayRecordsCsv(records: DayRecord[]): Promise<boolean> {
  const headers = ['Date', 'Status', 'Note', 'Subject', 'Time Slot', 'Location', 'Updated At'];
  const rows: string[] = [headers.map(escapeCsvCell).join(',')];
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((r) => {
    const displayStatus =
      r.status === 'PRESENT' ? 'Present' : r.status === 'ABSENT' ? 'Absent' : 'Off';
    const row = [
      escapeCsvCell(r.date),
      escapeCsvCell(displayStatus),
      escapeCsvCell(r.note || ''),
      escapeCsvCell(r.subjectName || ''),
      escapeCsvCell(r.timeSlot || ''),
      escapeCsvCell(r.location || ''),
      escapeCsvCell(r.updatedAt || ''),
    ];
    rows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const fileName = `attendance-export-${year}-${month}-${day}.csv`;

  return downloadFileDirectly(fileName, csvContent, 'text/csv');
}

/**
 * Exports application Data Vault to JSON without modifying or deleting original records
 */
export async function exportDayRecordsJson(
  records: DayRecord[],
  settings: DayAppSettings
): Promise<boolean> {
  const data = {
    app: 'Student Attendance Tracker',
    version: '2.0.0',
    exportType: 'DATA_VAULT_BACKUP',
    exportedAt: new Date().toISOString(),
    notice:
      'This is a complete personal attendance backup. Exporting does not modify or delete your existing attendance records.',
    settings: {
      studentName: settings.studentName,
      collegeName: settings.collegeName,
      courseName: settings.courseName,
      semester: settings.semester,
      targetPercentage: settings.targetPercentage,
      collegeStartTime: settings.collegeStartTime,
      morningCallEnabled: settings.morningCallEnabled,
      sundayOff: settings.sundayOff,
      saturdayOff: settings.saturdayOff,
      saturdayPolicy: settings.saturdayPolicy,
    },
    records: [...records].sort((a, b) => a.date.localeCompare(b.date)),
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const fileName = `attendance-backup-${year}-${month}-${day}.json`;

  return downloadFileDirectly(fileName, jsonStr, 'application/json');
}

/**
 * Generates a clean, professional PDF Attendance Report using jsPDF
 */
export function exportAttendanceToPdf(
  profile: UserProfile,
  semester: Semester,
  subjects: Subject[],
  records: AttendanceRecord[],
  countLeaveInDenominator: boolean = false
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let currentY = margin;

  // Header Banner
  doc.setFillColor(245, 242, 237);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 3, 3, 'F');

  doc.setTextColor(217, 93, 41); // Burnt orange
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('STUDENT ATTENDANCE TRACKER', margin + 6, currentY + 11);

  doc.setTextColor(90, 85, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('PERSONAL ATTENDANCE REPORT — STRICTLY OFFLINE & PRIVACY-FIRST', margin + 6, currentY + 18);

  doc.setFontSize(8);
  doc.setTextColor(140, 135, 130);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin - 6, currentY + 11, {
    align: 'right',
  });

  currentY += 34;

  // Student Profile Card
  doc.setDrawColor(220, 215, 205);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(40, 36, 32);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.displayName || 'Student', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 95, 90);
  const collegeInfo = [profile.courseName, profile.collegeName, profile.rollNumber ? `Roll: ${profile.rollNumber}` : '']
    .filter(Boolean)
    .join('  •  ');
  doc.text(collegeInfo || 'Personal Study Profile', margin + 6, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text(`Active Semester: ${semester.name}`, pageWidth - margin - 6, currentY + 10, { align: 'right' });

  currentY += 28;

  // Overall Statistics summary
  const summaries = subjects.map((sub) => calculateSubjectAttendance(sub, records, countLeaveInDenominator));
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLeave = 0;
  for (const s of summaries) {
    totalPresent += s.presentCount;
    totalAbsent += s.absentCount;
    totalLeave += s.leaveCount;
  }
  const totalCounted = totalPresent + totalAbsent;
  const overallPercentage = totalCounted > 0 ? Math.round((totalPresent / totalCounted) * 1000) / 10 : null;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(40, 36, 32);
  doc.text('Semester Attendance Overview', margin, currentY);

  currentY += 6;

  const statWidth = (pageWidth - margin * 2 - 9) / 4;
  const stats = [
    { label: 'Overall Attendance', val: overallPercentage !== null ? `${overallPercentage}%` : 'N/A' },
    { label: 'Present Classes', val: totalPresent.toString() },
    { label: 'Absent Classes', val: totalAbsent.toString() },
    { label: 'Recorded Leaves', val: totalLeave.toString() },
  ];

  stats.forEach((st, idx) => {
    const x = margin + idx * (statWidth + 3);
    doc.setFillColor(250, 248, 245);
    doc.roundedRect(x, currentY, statWidth, 16, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 115, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(st.label, x + 4, currentY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(40, 36, 32);
    doc.setFont('helvetica', 'bold');
    doc.text(st.val, x + 4, currentY + 12);
  });

  currentY += 22;

  // Subject Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Subject-Wise Breakdown', margin, currentY);

  currentY += 5;

  const colX = {
    sub: margin,
    code: margin + 68,
    target: margin + 95,
    attended: margin + 115,
    percent: margin + 140,
    status: margin + 162,
  };

  doc.setFillColor(235, 230, 222);
  doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 65, 60);
  doc.setFont('helvetica', 'bold');

  doc.text('SUBJECT', colX.sub + 2, currentY + 5);
  doc.text('CODE', colX.code, currentY + 5);
  doc.text('TARGET', colX.target, currentY + 5);
  doc.text('ATTENDED', colX.attended, currentY + 5);
  doc.text('CURRENT %', colX.percent, currentY + 5);
  doc.text('STATUS', colX.status, currentY + 5);

  currentY += 7;

  // Subject Table Rows
  summaries.forEach((s, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(252, 250, 248);
      doc.rect(margin, currentY, pageWidth - margin * 2, 8, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 36, 32);

    // Subject name truncate if too long
    const subName = s.subject.subjectName.length > 34 ? s.subject.subjectName.substring(0, 32) + '...' : s.subject.subjectName;
    doc.text(subName, colX.sub + 2, currentY + 5.5);

    doc.setTextColor(110, 105, 100);
    doc.text(s.subject.subjectCode || '—', colX.code, currentY + 5.5);
    doc.text(`${s.targetPercentage}%`, colX.target, currentY + 5.5);

    doc.setTextColor(40, 36, 32);
    doc.text(`${s.presentCount} / ${s.totalCountedClasses}`, colX.attended, currentY + 5.5);

    const pctStr = s.attendancePercentage !== null ? `${s.attendancePercentage}%` : 'No Data';
    doc.setFont('helvetica', 'bold');
    doc.text(pctStr, colX.percent, currentY + 5.5);

    // Status label
    if (s.status === 'ON_TRACK') {
      doc.setTextColor(30, 127, 77);
      doc.text('On Track', colX.status, currentY + 5.5);
    } else if (s.status === 'AT_RISK') {
      doc.setTextColor(180, 83, 9);
      doc.text('At Risk', colX.status, currentY + 5.5);
    } else if (s.status === 'BELOW_TARGET') {
      doc.setTextColor(197, 48, 48);
      doc.text('Below Target', colX.status, currentY + 5.5);
    } else {
      doc.setTextColor(140, 135, 130);
      doc.text('No Records', colX.status, currentY + 5.5);
    }

    currentY += 8;
  });

  currentY += 10;

  // Disclaimer / Core Principle Notice
  doc.setDrawColor(230, 225, 218);
  doc.setFillColor(250, 248, 245);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 95, 90);
  doc.text('CONFIDENTIAL STUDENT RECORD NOTICE', margin + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(130, 125, 120);
  const noteLines = [
    '• This document is an uncertified personal attendance record produced by the student on their private device.',
    '• Attendance calculation formula: [Present Classes / (Present + Absent Classes)] × 100.',
    '• Location data is never used to certify attendance; all records represent student manual entries.',
  ];
  noteLines.forEach((line, i) => {
    doc.text(line, margin + 5, currentY + 11 + i * 4);
  });

  // Footer page number
  doc.setFontSize(7.5);
  doc.setTextColor(160, 155, 150);
  doc.text('Student Attendance Tracker — Offline Android Architecture • Page 1 of 1', pageWidth / 2, 287, { align: 'center' });

  // Save PDF
  doc.save(`Personal_Attendance_Report_${semester.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
