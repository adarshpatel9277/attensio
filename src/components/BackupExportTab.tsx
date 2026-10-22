import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  AppBackupData,
  AttendanceRecord,
  Semester,
  Subject,
  UserProfile,
  AppSettings,
} from '../types';
import { exportAttendanceToCsv, exportAttendanceToPdf } from '../utils/exporter';

interface BackupExportTabProps {
  profile: UserProfile;
  activeSemester: Semester | null;
  semesters: Semester[];
  subjects: Subject[];
  records: AttendanceRecord[];
  settings: AppSettings;
  onCreateBackup: () => AppBackupData;
  onRestoreBackup: (backup: AppBackupData, mode: 'REPLACE' | 'MERGE') => { success: boolean; message: string };
}

export const BackupExportTab: React.FC<BackupExportTabProps> = ({
  profile,
  activeSemester,
  semesters,
  subjects,
  records,
  settings,
  onCreateBackup,
  onRestoreBackup,
}) => {
  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import preview state
  const [pendingBackup, setPendingBackup] = useState<AppBackupData | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // CSV export scope
  const [csvScope, setCsvScope] = useState<'ACTIVE_SEMESTER' | 'ALL_DATA'>('ACTIVE_SEMESTER');

  // Handle Export JSON Backup
  const handleExportJson = () => {
    const backup = onCreateBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const fileName = `Student_Attendance_Backup_v${backup.metadata.schemaVersion}_${new Date().toISOString().split('T')[0]}.json`;

    // Native Android Bridge support
    if (typeof (window as any).AndroidApp?.exportAndShare === 'function') {
      (window as any).AndroidApp.exportAndShare(fileName, jsonString, 'application/json');
      return;
    }

    // Data URI fallback for mobile WebViews
    try {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch (e) {
      console.warn('Data URI export fallback, trying blob URL', e);
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle File Select for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: AppBackupData = JSON.parse(text);

        // Basic schema validation
        if (!parsed.metadata || typeof parsed.metadata.schemaVersion !== 'number') {
          setImportStatusMessage({
            type: 'error',
            text: 'Invalid backup file: Missing metadata or schemaVersion.',
          });
          return;
        }

        setPendingBackup(parsed);
        setImportStatusMessage(null);
      } catch (err) {
        setImportStatusMessage({
          type: 'error',
          text: 'Failed to read JSON file. Please ensure the file is valid JSON.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Confirm Restore
  const handleConfirmRestore = (mode: 'REPLACE' | 'MERGE') => {
    if (!pendingBackup) return;
    const res = onRestoreBackup(pendingBackup, mode);
    if (res.success) {
      setImportStatusMessage({ type: 'success', text: res.message });
      setPendingBackup(null);
    } else {
      setImportStatusMessage({ type: 'error', text: res.message });
    }
  };

  // Handle CSV Download
  const handleDownloadCsv = () => {
    const recordsToExport =
      csvScope === 'ACTIVE_SEMESTER' && activeSemester
        ? records.filter((r) => r.semesterId === activeSemester.id)
        : records;

    exportAttendanceToCsv(
      recordsToExport,
      subjects,
      semesters,
      csvScope === 'ACTIVE_SEMESTER' ? `Attendance_${activeSemester?.name || 'Semester'}` : 'Attendance_All_Semesters'
    );
  };

  // Handle PDF Download
  const handleDownloadPdf = () => {
    if (!activeSemester) return;
    exportAttendanceToPdf(
      profile,
      activeSemester,
      subjects,
      records,
      settings.countLeaveInDenominator
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#E6E1D8]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#23211E] tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-[#D95D29]" />
          Data Backup & Document Export
        </h2>
        <p className="text-xs sm:text-sm text-[#7A746E]">
          Export RFC-4180 CSV tables, high-resolution PDF attendance reports, or full offline JSON backups
        </p>
      </div>

      {importStatusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-semibold ${
            importStatusMessage.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          {importStatusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{importStatusMessage.text}</span>
        </div>
      )}

      {/* SECTION 1: PDF & CSV EXPORT */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
            Report Generation & Document Export
          </h3>
          <p className="text-xs text-[#7A746E] mt-0.5">
            Download your personal attendance history in standard readable formats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PDF Report Card */}
          <div className="p-4 rounded-xl border border-[#EBE6DE] bg-[#FAF8F5] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#C53030]/10 text-[#C53030] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#23211E]">PDF Attendance Report</h4>
                  <span className="text-[11px] text-[#7A746E]">
                    Printable ISO A4 report with summary cards and subject tables
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#6A635B] mt-2">
                Includes student profile details, overall attendance percentage, subject targets, and
                complete personal log disclaimer.
              </p>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#23211E] hover:bg-[#3A3530] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Report ({activeSemester?.name || 'Current'})</span>
            </button>
          </div>

          {/* CSV Spreadsheet Card */}
          <div className="p-4 rounded-xl border border-[#EBE6DE] bg-[#FAF8F5] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#1E7F4D]/10 text-[#1E7F4D] flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#23211E]">CSV Spreadsheet Data</h4>
                  <span className="text-[11px] text-[#7A746E]">
                    RFC-4180 escaped CSV with UTF-8 BOM for Excel & Sheets
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-[#7A746E]">Scope:</span>
                <select
                  value={csvScope}
                  onChange={(e) => setCsvScope(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-[#D4CEBF] bg-white text-xs"
                >
                  <option value="ACTIVE_SEMESTER">Active Semester ({activeSemester?.name})</option>
                  <option value="ALL_DATA">All Semesters ({records.length} records)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#1E7F4D] hover:bg-[#166534] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: JSON LOCAL BACKUP & RESTORE */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
            Local JSON Backup & Safe Restore
          </h3>
          <p className="text-xs text-[#7A746E] mt-0.5">
            Full portable snapshot including semesters, subjects, logs, leaves, and settings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON Button */}
          <div className="p-4 rounded-xl border border-[#EBE6DE] bg-[#FAF8F5]">
            <h4 className="text-sm font-bold text-[#23211E] mb-1">Create Local Backup</h4>
            <p className="text-xs text-[#7A746E] mb-3">
              Generates a versioned JSON file with your complete student profile and attendance history.
            </p>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 px-3 rounded-xl bg-[#D95D29] hover:bg-[#C84E1C] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Complete Backup (JSON)</span>
            </button>
          </div>

          {/* Import JSON Button */}
          <div className="p-4 rounded-xl border border-[#EBE6DE] bg-[#FAF8F5]">
            <h4 className="text-sm font-bold text-[#23211E] mb-1">Restore from Backup</h4>
            <p className="text-xs text-[#7A746E] mb-3">
              Inspects backup contents and provides merge or replace options with an auto safety backup.
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#D4CEBF] hover:bg-[#F3EFE9] text-[#23211E] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#D95D29]" />
              <span>Select Backup File (.json)</span>
            </button>
          </div>
        </div>

        {/* Import Preview Modal / Card */}
        {pendingBackup && (
          <div className="mt-4 p-5 rounded-xl border border-[#D95D29] bg-[#FFF8F5] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#D95D29] flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  Backup File Inspection Summary
                </h4>
                <p className="text-xs text-[#7A746E]">
                  Exported on: {new Date(pendingBackup.metadata.exportedAt).toLocaleString()} • Schema v
                  {pendingBackup.metadata.schemaVersion}
                </p>
              </div>
              <button
                onClick={() => setPendingBackup(null)}
                className="text-xs text-[#8C847B] hover:text-[#23211E] font-medium underline"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-[#EBE6DE]">
                <span className="text-[#7A746E] block">Semesters</span>
                <strong className="text-base font-bold text-[#23211E]">
                  {pendingBackup.semesters?.length || 0}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#EBE6DE]">
                <span className="text-[#7A746E] block">Subjects</span>
                <strong className="text-base font-bold text-[#23211E]">
                  {pendingBackup.subjects?.length || 0}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#EBE6DE]">
                <span className="text-[#7A746E] block">Attendance Logs</span>
                <strong className="text-base font-bold text-[#23211E]">
                  {pendingBackup.attendanceRecords?.length || 0}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#EBE6DE]">
                <span className="text-[#7A746E] block">Leave Records</span>
                <strong className="text-base font-bold text-[#23211E]">
                  {pendingBackup.leaveRecords?.length || 0}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-lg border border-[#E0DBD2] text-xs text-[#6A635B] space-y-1">
              <p>
                <strong>Safety Guarantee:</strong> An automatic safety snapshot of your current
                database will be saved before performing any changes.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleConfirmRestore('MERGE')}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#ECE6DE] text-[#23211E] text-xs font-bold border border-[#D4CEBF]"
              >
                Merge with Existing Data
              </button>
              <button
                onClick={() => handleConfirmRestore('REPLACE')}
                className="px-4 py-2 rounded-xl bg-[#D95D29] hover:bg-[#C84E1C] text-white text-xs font-bold"
              >
                Replace All Existing Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
