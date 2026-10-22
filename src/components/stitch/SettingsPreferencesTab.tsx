import React, { useState, useRef } from 'react';
import { DayAppSettings, DayRecord, CourseSubject, DayStatus } from '../../types';
import { LocalStorageManager } from '../../data/localStorageManager';
import { exportDayRecordsCsv, exportDayRecordsJson, escapeCsvCell } from '../../utils/exporter';
import { getLocalTodayString } from '../../utils/dateUtils';
import { AdBanner } from '../AdBanner';
import { InFeedAdCard } from '../InFeedAdCard';
import { MorningCallManager } from '../../utils/morningCallManager';
import {
  User,
  School,
  GraduationCap,
  Calendar,
  Flag,
  FileSpreadsheet,
  FileCode,
  FileUp,
  Save,
  CheckCircle2,
  Camera,
  Sun,
  Moon,
  Info,
  Bell,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface SettingsPreferencesTabProps {
  settings: DayAppSettings;
  records: DayRecord[];
  subjects?: CourseSubject[];
  onSaveSettings: (settings: DayAppSettings) => void;
  onAddSubject?: (subject: Omit<CourseSubject, 'id'>) => void;
  onRemoveSubject?: (id: string) => void;
  onResetData?: () => void;
  onRestartOnboarding?: () => void;
}

export const SettingsPreferencesTab: React.FC<SettingsPreferencesTabProps> = ({
  settings,
  records,
  onSaveSettings,
}) => {
  const [studentName, setStudentName] = useState(settings.studentName || '');
  const [collegeName, setCollegeName] = useState(settings.collegeName || '');
  const [courseBranch, setCourseBranch] = useState(settings.courseName || '');
  const [semester, setSemester] = useState(settings.semester || 1);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl || '');

  const [targetGoal, setTargetGoal] = useState(settings.targetPercentage || 75);
  const [sundayOff, setSundayOff] = useState(settings.sundayOff !== false);
  const [saturdayOff, setSaturdayOff] = useState(
    settings.saturdayPolicy ? settings.saturdayPolicy === 'FULL_OFF' : settings.saturdayOff !== false
  );
  const [altSaturday, setAltSaturday] = useState(settings.saturdayPolicy === 'ALTERNATE');

  // Morning Call States
  const [collegeStartTime, setCollegeStartTime] = useState(settings.collegeStartTime || '09:00');
  const [morningCallEnabled, setMorningCallEnabled] = useState(
    settings.morningCallEnabled !== false
  );
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importToastMessage, setImportToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreCollegeTimeStr = (start: string) => {
    try {
      const [h, m] = start.split(':').map(Number);
      let preH = h;
      let preM = m - 30;
      if (preM < 0) {
        preM += 60;
        preH = (preH - 1 + 24) % 24;
      }
      const period = preH >= 12 ? 'PM' : 'AM';
      const displayH = preH % 12 === 0 ? 12 : preH % 12;
      return `${String(displayH).padStart(2, '0')}:${String(preM).padStart(2, '0')} ${period}`;
    } catch {
      return '08:30 AM';
    }
  };



  const handleSave = () => {
    setIsSaving(true);
    const updated: DayAppSettings = {
      ...settings,
      studentName: studentName.trim(),
      collegeName: collegeName.trim(),
      courseName: courseBranch.trim(),
      semester,
      avatarUrl,
      targetPercentage: targetGoal,
      sundayOff,
      saturdayOff,
      saturdayPolicy: saturdayOff ? 'FULL_OFF' : altSaturday ? 'ALTERNATE' : 'FULL_WORKING',
      collegeStartTime,
      morningCallEnabled,
      morningRollCallAlarm: morningCallEnabled,
      preCollegeAlarm: morningCallEnabled,
      eveningAuditAlarm: morningCallEnabled,
      onboardingCompleted: true,
    };

    MorningCallManager.syncSchedule(updated, records);

    setTimeout(() => {
      onSaveSettings(updated);
      setIsSaving(false);
      setSaveToastVisible(true);
      setTimeout(() => setSaveToastVisible(false), 2400);
    }, 250);
  };

  // Direct File Download for CSV (Never opens Share Sheet)
  const handleExportCsv = async () => {
    try {
      const ok = await exportDayRecordsCsv(records);
      if (ok) {
        setImportToastMessage(`Downloaded attendance-export-${getLocalTodayString()}.csv`);
        setTimeout(() => setImportToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Unable to export CSV file. Please check device permissions.');
    }
  };

  // Direct File Download for JSON (Never opens Share Sheet)
  const handleExportJson = async () => {
    try {
      const ok = await exportDayRecordsJson(records, {
        ...settings,
        studentName,
        collegeName,
        courseName: courseBranch,
        semester,
        targetPercentage: targetGoal,
        collegeStartTime,
        morningCallEnabled,
        sundayOff,
        saturdayOff,
        saturdayPolicy: saturdayOff ? 'FULL_OFF' : altSaturday ? 'ALTERNATE' : 'FULL_WORKING',
      });
      if (ok) {
        setImportToastMessage(`Downloaded attendance-backup-${getLocalTodayString()}.json`);
        setTimeout(() => setImportToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to export JSON:', err);
      alert('Unable to download backup JSON. Please check device permissions.');
    }
  };

  // Import CSV Function: Reads CSV file, updates database, and immediately populates logs
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('The CSV file does not contain enough records.');
          return;
        }

        const headerLine = lines[0].toLowerCase();
        let dateColIdx = 0;
        let statusColIdx = 1;
        let noteColIdx = 2;

        const headers = headerLine.split(',').map((h) => h.replace(/^["'\s]+|["'\s]+$/g, ''));
        headers.forEach((h, idx) => {
          if (h.includes('date')) dateColIdx = idx;
          if (h.includes('status')) statusColIdx = idx;
          if (h.includes('note') || h.includes('remark') || h.includes('comment')) noteColIdx = idx;
        });

        let importedCount = 0;
        const currentMap = new Map<string, DayRecord>();
        records.forEach((r) => currentMap.set(r.date, r));

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cols: string[] = [];
          let inQuotes = false;
          let currentCol = '';
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(currentCol.trim());
              currentCol = '';
            } else {
              currentCol += char;
            }
          }
          cols.push(currentCol.trim());

          const rawDate = cols[dateColIdx]?.replace(/^["']|["']$/g, '').trim();
          const rawStatus = cols[statusColIdx]?.replace(/^["']|["']$/g, '').trim().toUpperCase();
          const rawNote = cols[noteColIdx]?.replace(/^["']|["']$/g, '').trim();

          if (!rawDate) continue;

          let validDate = rawDate;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) {
              const y = parsed.getFullYear();
              const m = String(parsed.getMonth() + 1).padStart(2, '0');
              const d = String(parsed.getDate()).padStart(2, '0');
              validDate = `${y}-${m}-${d}`;
            } else {
              continue;
            }
          }

          let status: DayStatus = 'PRESENT';
          if (rawStatus.includes('ABS') || rawStatus === 'A') {
            status = 'ABSENT';
          } else if (rawStatus.includes('OFF') || rawStatus.includes('HOLIDAY') || rawStatus === 'H') {
            status = 'HOLIDAY';
          } else {
            status = 'PRESENT';
          }

          currentMap.set(validDate, {
            date: validDate,
            status,
            note: rawNote || undefined,
            updatedAt: new Date().toISOString(),
          });
          importedCount++;
        }

        const mergedList = Array.from(currentMap.values());
        LocalStorageManager.setDayRecords(mergedList);
        LocalStorageManager.notifySubscribers();

        setImportToastMessage(`Imported ${importedCount} attendance logs from CSV!`);
        setTimeout(() => setImportToastMessage(null), 3500);
      } catch (err) {
        console.error('CSV import parsing error:', err);
        alert('Could not parse the CSV file. Please verify formatting.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col w-full pb-24 pt-2 px-4 sm:px-6 max-w-md mx-auto space-y-4">
      {/* 1. Student Profile Section with Clean Responsive Layout & Zero Font Clipping */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-headline-sm text-base font-bold text-on-surface">Student Profile</h2>
        </div>

        {/* Profile Avatar Upload */}
        <div className="flex flex-col items-center justify-center pt-1 pb-1">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-recessed flex items-center justify-center shadow-inner relative ring-2 ring-primary/20">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover aspect-square"
                />
              ) : (
                <User className="w-9 h-9 text-primary/60" />
              )}
            </div>
            <button
              aria-label="Upload photo"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handlePhotoUpload}
            />
          </div>
          <span className="text-xs text-secondary font-semibold mt-2">Tap to update photo</span>
        </div>

        {/* Form Inputs with Clean Layout without absolute icon collisions */}
        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="studentName"
              className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5"
            >
              <User className="w-3.5 h-3.5 text-secondary" />
              <span>Full Student Name</span>
            </label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Adarsh"
              className="w-full px-3.5 py-2.5 bg-surface-recessed rounded-2xl text-xs sm:text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container-high/40"
            />
          </div>

          <div>
            <label
              htmlFor="collegeName"
              className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5"
            >
              <School className="w-3.5 h-3.5 text-secondary" />
              <span>College / University</span>
            </label>
            <input
              id="collegeName"
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. National Institute of Technology"
              className="w-full px-3.5 py-2.5 bg-surface-recessed rounded-2xl text-xs sm:text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container-high/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="courseBranch"
                className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-secondary" />
                <span>Course / Branch</span>
              </label>
              <input
                id="courseBranch"
                type="text"
                value={courseBranch}
                onChange={(e) => setCourseBranch(e.target.value)}
                placeholder="B.Tech CS"
                className="w-full px-3.5 py-2.5 bg-surface-recessed rounded-2xl text-xs sm:text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container-high/40"
              />
            </div>

            <div>
              <label
                htmlFor="semesterSelect"
                className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>Current Semester</span>
              </label>
              <select
                id="semesterSelect"
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-surface-recessed rounded-2xl text-xs sm:text-sm text-on-surface font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer border border-surface-container-high/40"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sponsored Top Placement Header Ad */}
      <div className="w-full">
        <AdBanner unitId="mobile_320x50" className="w-full shadow-2xs" />
      </div>

      {/* 3. Attendance Goal Section */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Attendance Goal
              </h2>
              <p className="text-[11px] text-secondary font-medium">
                Minimum requirement for exam eligibility
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-subtle text-primary font-black text-xs">
            {targetGoal}% Goal
          </span>
        </div>

        {/* Preset Selector Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { goal: 70, label: 'Lenient' },
            { goal: 75, label: 'Standard' },
            { goal: 80, label: 'Strict' },
            { goal: 85, label: 'Honor' },
          ].map((item) => {
            const isActive = targetGoal === item.goal;
            return (
              <button
                key={item.goal}
                type="button"
                onClick={() => setTargetGoal(item.goal)}
                className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs font-bold scale-[1.02]'
                    : 'bg-surface-recessed text-secondary hover:bg-surface-container-high'
                }`}
              >
                <span className="text-base font-black leading-none">{item.goal}%</span>
                <span
                  className={`text-[10px] font-semibold mt-1 truncate max-w-full px-1 ${
                    isActive ? 'text-rose-tint' : 'text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full p-3 rounded-2xl bg-amber-subtle text-on-surface flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-warning shrink-0" />
          <p className="text-xs text-secondary leading-snug font-medium">
            Most university councils mandate{' '}
            <strong className="text-on-surface font-bold">75% attendance</strong> to remain
            eligible for end-semester examinations.
          </p>
        </div>
      </section>

      {/* 4. Morning Call Settings */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Morning Call
              </h2>
              <p className="text-[11px] text-secondary font-medium">
                Smart attendance reminders tailored to your college schedule
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
              {morningCallEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              aria-checked={morningCallEnabled}
              onClick={() => setMorningCallEnabled(!morningCallEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                morningCallEnabled ? 'bg-primary' : 'bg-surface-container-high'
              }`}
              role="switch"
              type="button"
            >
              <span className="sr-only">Toggle Morning Call</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  morningCallEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {morningCallEnabled ? (
          <div className="space-y-3 pt-1">
            {/* College Start Time Setting */}
            <div className="p-3.5 bg-surface-recessed rounded-2xl space-y-2.5 border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <label htmlFor="collegeStartTime" className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>College Start Time</span>
                </label>
                <input
                  id="collegeStartTime"
                  type="time"
                  value={collegeStartTime}
                  onChange={(e) => setCollegeStartTime(e.target.value)}
                  className="px-2.5 py-1 bg-surface-card rounded-xl text-xs font-bold text-on-surface border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Quick preset chips */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-secondary font-semibold">Quick Set:</span>
                {['08:30', '09:00', '09:30', '10:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setCollegeStartTime(time)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      collegeStartTime === time
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-card text-secondary hover:text-on-surface'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-surface-recessed rounded-2xl text-xs text-secondary text-center">
            Morning Call reminders are disabled.
          </div>
        )}
      </section>

      {/* 5. In-Feed Mid Page Sponsored Perk Ad */}
      <div className="w-full">
        <InFeedAdCard />
      </div>

      {/* 6. Weekend Routine & Off Days */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Weekend Routine &amp; Off Days
            </h2>
            <p className="text-[11px] text-secondary font-medium">
              Prevents absent marks on non-instructional days
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {/* Sunday Off Toggle */}
          <label className="flex items-center justify-between p-3 bg-surface-recessed rounded-2xl cursor-pointer hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-rose-subtle text-primary flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface leading-tight">Sunday Off</span>
                <span className="text-[11px] text-secondary font-medium leading-tight mt-0.5">
                  Universal scheduled recess
                </span>
              </div>
            </div>

            <div className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={sundayOff}
                onChange={(e) => setSundayOff(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </div>
          </label>

          {/* Saturday Full Off Toggle */}
          <label className="flex items-center justify-between p-3 bg-surface-recessed rounded-2xl cursor-pointer hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-container text-secondary flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  Saturday Full Off
                </span>
                <span className="text-[11px] text-secondary font-medium leading-tight mt-0.5">
                  Saturdays free from lectures
                </span>
              </div>
            </div>

            <div className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={saturdayOff}
                onChange={(e) => {
                  setSaturdayOff(e.target.checked);
                  if (e.target.checked) setAltSaturday(false);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </div>
          </label>
        </div>
      </section>

      {/* 7. Data Vault, Export & Import CSV Section */}
      <section className="w-full rounded-3xl bg-surface-card p-5 shadow-sm border border-surface-container-high/60 space-y-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-tertiary" />
          <div>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Data Vault &amp; Export
            </h2>
            <p className="text-[11px] text-secondary font-medium">
              Save your complete records directly to your device
            </p>
          </div>
        </div>

        {/* Working Export & Import Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            type="button"
            className="flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-surface-recessed hover:bg-surface-container text-on-surface font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
            <div className="text-left">
              <span className="block leading-none">Export CSV</span>
              <span className="text-[10px] text-secondary font-medium">Excel / Sheets</span>
            </div>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleExportJson}
            type="button"
            className="flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-surface-recessed hover:bg-surface-container text-on-surface font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-tertiary shrink-0" />
            <div className="text-left">
              <span className="block leading-none">Download JSON</span>
              <span className="text-[10px] text-secondary font-medium">Full Backup</span>
            </div>
          </button>
        </div>

        {/* Import CSV Option */}
        <div className="pt-1">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportCsv}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="w-full py-3 px-3 rounded-2xl bg-surface-recessed hover:bg-surface-container text-on-surface text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-dashed border-primary/30"
          >
            <FileUp className="w-4 h-4 text-primary" />
            <span>Import CSV Attendance Records</span>
          </button>
        </div>
      </section>



      {/* 9. Save Preferences Button (Comfortably spaced at bottom) */}
      <div className="mt-4 mb-8 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          type="button"
          className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(185,5,56,0.38)] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Save Success Toast */}
      {saveToastVisible && (
        <div className="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-on-surface text-surface-card flex items-center gap-2 shadow-lg text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Preferences saved successfully!</span>
        </div>
      )}



      {/* Import Toast */}
      {importToastMessage && (
        <div className="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-emerald-600 text-white flex items-center gap-2 shadow-lg text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{importToastMessage}</span>
        </div>
      )}
    </div>
  );
};
