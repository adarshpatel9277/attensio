import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  Sliders,
  FileSpreadsheet,
  Check,
  User,
  GraduationCap,
  Calendar,
  ChevronRight,
  Copy,
  Share2,
  FileText,
  AlertCircle,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';
import { DayAppSettings, DayRecord } from '../types';

interface DaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DayAppSettings;
  onUpdateSettings: (newSettings: DayAppSettings) => void;
  records: DayRecord[];
  onClearAll?: () => void;
  onImportBackup: (records: DayRecord[], newSettings: DayAppSettings) => void;
}

export const DaySettingsModal: React.FC<DaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  records,
  onClearAll,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local state for instant feedback
  const [localSettings, setLocalSettings] = useState<DayAppSettings>({ ...settings });
  const [saveToast, setSaveToast] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSettingChange = <K extends keyof DayAppSettings>(
    key: K,
    value: DayAppSettings[K]
  ) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Helper to trigger direct file download
  const triggerDownload = (blob: Blob, filename: string) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 300);
    } catch (e) {
      console.error('Download failed, using fallback:', e);
    }
  };

  // Safe multi-channel exporter (Native Android FileProvider -> Web Share -> Blob Download)
  const exportFileSafely = (
    content: string,
    filename: string,
    mimeType: string,
    label: string
  ) => {
    // 1. Android Native Bridge (Android WebView)
    if ((window as any).AndroidApp?.exportAndShare) {
      try {
        (window as any).AndroidApp.exportAndShare(filename, content, mimeType);
        setCopyStatus(`${label}: Save/Share sheet opened!`);
        setTimeout(() => setCopyStatus(null), 3000);
        return;
      } catch (e) {
        console.error('AndroidApp bridge failed, falling back:', e);
      }
    }

    // 2. Web Share with File (if supported by modern mobile browser)
    try {
      const file = new File([content], filename, { type: mimeType });
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        navigator
          .share({
            files: [file],
            title: filename,
            text: 'Attendance Data Export',
          })
          .then(() => {
            setCopyStatus(`${label} shared successfully!`);
            setTimeout(() => setCopyStatus(null), 3000);
          })
          .catch(() => {
            // User cancelled or share failed, fallback to blob download
            const blob = new Blob([content], { type: mimeType });
            triggerDownload(blob, filename);
            setCopyStatus(`${label} Downloaded!`);
            setTimeout(() => setCopyStatus(null), 3000);
          });
        return;
      }
    } catch {
      // Ignore and fallback
    }

    // 3. Standard Desktop Browser Blob Download
    const blob = new Blob([content], { type: mimeType });
    triggerDownload(blob, filename);
    setCopyStatus(`${label} Downloaded!`);
    setTimeout(() => setCopyStatus(null), 3000);
  };

  // 1. Export CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Date', 'Day', 'Status', 'SpecialClass', 'Note'];
      const rows = records.map((r) => {
        const d = new Date(r.date + 'T00:00:00');
        const day = d.toLocaleDateString('en-US', { weekday: 'long' });
        return [
          r.date,
          day,
          r.status,
          r.isSpecialClass ? 'Yes' : 'No',
          `"${(r.note || '').replace(/"/g, '""')}"`,
        ];
      });

      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
      const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;

      exportFileSafely(csvContent, filename, 'text/csv;charset=utf-8;', 'CSV Report');
    } catch (err) {
      console.error('CSV export error:', err);
      handleCopyJsonToClipboard();
    }
  };

  // 2. Export JSON Backup Data Object
  const getBackupDataObject = () => {
    return {
      version: 2,
      type: 'SAT_DAYWISE_BACKUP',
      exportedAt: new Date().toISOString(),
      settings: localSettings,
      records,
    };
  };

  // Export JSON File Download
  const handleExportJSON = () => {
    try {
      const backupData = getBackupDataObject();
      const jsonString = JSON.stringify(backupData, null, 2);
      const filename = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;

      exportFileSafely(
        jsonString,
        filename,
        'application/json;charset=utf-8;',
        'JSON Backup'
      );
    } catch (err) {
      console.error('JSON export error:', err);
      handleCopyJsonToClipboard();
    }
  };

  // Share Backup (Native Web Share API)
  const handleShareBackup = async () => {
    const backupData = getBackupDataObject();
    const jsonString = JSON.stringify(backupData, null, 2);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Student Attendance Tracker Backup',
          text: jsonString,
        });
        setCopyStatus('Shared successfully!');
        setTimeout(() => setCopyStatus(null), 2500);
        return;
      } catch (e) {
        // User cancelled or share failed, fallback to copy
      }
    }
    handleCopyJsonToClipboard();
  };

  // 3. Copy JSON Backup to Clipboard (100% Reliable everywhere)
  const handleCopyJsonToClipboard = () => {
    const backupData = getBackupDataObject();
    const jsonString = JSON.stringify(backupData, null, 2);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonString).then(() => {
        setCopyStatus('Backup JSON copied to clipboard!');
        setTimeout(() => setCopyStatus(null), 3000);
      }).catch(() => {
        fallbackCopyText(jsonString);
      });
    } else {
      fallbackCopyText(jsonString);
    }
  };

  const fallbackCopyText = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      setCopyStatus('Backup JSON copied to clipboard!');
    } catch {
      setCopyStatus('Failed to copy. Please use Download.');
    }
    setTimeout(() => setCopyStatus(null), 3000);
    document.body.removeChild(ta);
  };

  // 4. Import / Restore Parser (handles object or raw array)
  const parseAndRestoreData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);

      let importedRecords: DayRecord[] = [];
      let importedSettings: DayAppSettings = {
        targetPercentage: 75,
        saturdayOff: true,
        sundayOff: true,
        warningMargin: 5,
      };

      if (Array.isArray(parsed)) {
        // Direct array of records
        importedRecords = parsed;
      } else if (Array.isArray(parsed.records)) {
        // Standard backup object
        importedRecords = parsed.records;
        if (parsed.settings) {
          importedSettings = {
            ...importedSettings,
            ...parsed.settings,
          };
        }
      } else if (Array.isArray(parsed.attendanceRecords)) {
        // Legacy system format conversion
        importedRecords = parsed.attendanceRecords.map((r: any) => ({
          date: r.date || r.dateStr || new Date().toISOString().split('T')[0],
          status: r.status === 'ABSENT' ? 'ABSENT' : r.status === 'HOLIDAY' ? 'HOLIDAY' : 'PRESENT',
          note: r.note,
          updatedAt: new Date().toISOString(),
        }));
      } else {
        throw new Error('Unsupported format. Backup must contain attendance records.');
      }

      onImportBackup(importedRecords, importedSettings);
      setCopyStatus(`Successfully restored ${importedRecords.length} records!`);
      setTimeout(() => {
        setCopyStatus(null);
        setShowPasteModal(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Invalid JSON format. Please verify the copied text.');
    }
  };

  // File Picker change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        parseAndRestoreData(text);
      } catch (err: any) {
        alert(err?.message || 'Could not parse the backup file.');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handlePasteSubmit = () => {
    setPasteError(null);
    if (!pastedJson.trim()) {
      setPasteError('Please paste your backup JSON code first.');
      return;
    }
    try {
      parseAndRestoreData(pastedJson.trim());
    } catch (err: any) {
      setPasteError(err?.message || 'Invalid JSON syntax.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-pink-100 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-black text-base sm:text-lg text-zinc-900">
            <div className="flex h-8 w-8 rounded-xl bg-pink-100/70 text-[#FF4F81] items-center justify-center shadow-2xs">
              <Sliders className="h-4 w-4" />
            </div>
            <span>App Settings &amp; Backup</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* Status toast banner */}
          {copyStatus && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs animate-in slide-in-from-top-2 duration-150">
              <ClipboardCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{copyStatus}</span>
            </div>
          )}

          {/* 1. Student Profile Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#FF4F81]">
              <User className="h-3.5 w-3.5" />
              <span>Student Profile</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={localSettings.studentName || ''}
                  onChange={(e) => handleSettingChange('studentName', e.target.value)}
                  placeholder="e.g. Adarsh"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-[#FF4F81] focus:bg-white focus:outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={localSettings.collegeName || ''}
                    onChange={(e) => handleSettingChange('collegeName', e.target.value)}
                    placeholder="e.g. NIT / IIT"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-[#FF4F81] focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    value={localSettings.courseName || ''}
                    onChange={(e) => handleSettingChange('courseName', e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-[#FF4F81] focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Target Percentage */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF4F81]">
                Default Attendance Goal
              </span>
              <span className="text-xs font-black text-[#FF4F81] font-['JetBrains_Mono'] bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
                {localSettings.targetPercentage}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={localSettings.targetPercentage}
              onChange={(e) => handleSettingChange('targetPercentage', Number(e.target.value))}
              className="w-full accent-[#FF4F81] h-2 bg-pink-100 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between gap-1 pt-1">
              {[70, 75, 80, 85].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSettingChange('targetPercentage', preset)}
                  className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    localSettings.targetPercentage === preset
                      ? 'bg-gradient-to-r from-[#FF4F81] to-[#FB7185] text-white shadow-2xs'
                      : 'bg-slate-100 text-zinc-700 hover:bg-pink-50'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* 3. Weekend Off Days */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF4F81] block">
              Default Off Days
            </span>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <span className="text-xs font-bold text-zinc-800">Saturday Off</span>
                <input
                  type="checkbox"
                  checked={localSettings.saturdayOff}
                  onChange={(e) => handleSettingChange('saturdayOff', e.target.checked)}
                  className="rounded accent-[#FF4F81] h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <span className="text-xs font-bold text-zinc-800">Sunday Off</span>
                <input
                  type="checkbox"
                  checked={localSettings.sundayOff}
                  onChange={(e) => handleSettingChange('sundayOff', e.target.checked)}
                  className="rounded accent-[#FF4F81] h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* 4. Complete Backup, Export & Import Hub (Rock Solid & Fail-Safe) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FF4F81] block">
                  Data Backup &amp; Portability
                </span>
                <p className="text-[11px] text-zinc-500">
                  Export reports or transfer records safely ({records.length} days recorded)
                </p>
              </div>
            </div>

            {/* Export Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-800 transition-all shadow-xs cursor-pointer group"
                title="Download CSV attendance spreadsheet"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-800 transition-all shadow-xs cursor-pointer group"
                title="Download full JSON backup file"
              >
                <Download className="h-4 w-4 text-[#FF4F81] mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Download JSON</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJsonToClipboard}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-800 transition-all shadow-xs cursor-pointer group"
                title="Copy entire backup string to clipboard"
              >
                <Copy className="h-4 w-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Copy Backup</span>
              </button>
            </div>

            {/* Restore Options: File Upload & Direct Paste Box */}
            <div className="space-y-2 pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-pink-200 bg-pink-50/50 hover:bg-pink-100/60 text-xs font-bold text-[#FF4F81] transition-colors cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload .JSON File</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasteModal(!showPasteModal);
                    setPasteError(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{showPasteModal ? 'Hide Paste Box' : 'Paste Backup Code'}</span>
                </button>
              </div>

              {/* Paste JSON Drawer */}
              {showPasteModal && (
                <div className="rounded-2xl border border-pink-200 bg-pink-50/30 p-3 space-y-2 animate-in fade-in duration-150">
                  <div className="text-[11px] font-bold text-zinc-700">
                    Paste your copied backup code here:
                  </div>
                  <textarea
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    placeholder='Paste JSON here (e.g. {"records": [...]})'
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-[11px] font-mono text-zinc-900 placeholder-zinc-400 focus:border-[#FF4F81] focus:outline-hidden"
                  />
                  {pasteError && (
                    <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{pasteError}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteSubmit}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#FF4F81] to-[#FB7185] text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
                  >
                    Restore Attendance Now
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* 6. Factory Reset / Clear Data */}
          {onClearAll && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all attendance records? This cannot be undone unless you have a backup.')) {
                    onClearAll();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset All Records (Clear Data)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {saveToast && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Settings saved!
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#FF4F81] to-[#FB7185] text-white text-xs font-bold hover:opacity-95 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
