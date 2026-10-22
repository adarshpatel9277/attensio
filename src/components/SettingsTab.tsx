import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Sliders,
  AlertOctagon,
  Plus,
  CheckCircle2,
  Lock,
  Archive,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { AppSettings, Semester, UserProfile } from '../types';

interface SettingsTabProps {
  profile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  semesters: Semester[];
  activeSemester: Semester | null;
  onSelectActiveSemester: (id: string) => void;
  onSaveSemester: (semester: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDeleteSemester: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profile,
  onUpdateProfile,
  semesters,
  activeSemester,
  onSelectActiveSemester,
  onSaveSemester,
  onDeleteSemester,
  settings,
  onUpdateSettings,
  onResetToDemoData,
  onClearAllData,
}) => {
  // Profile state
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [collegeName, setCollegeName] = useState(profile.collegeName || '');
  const [courseName, setCourseName] = useState(profile.courseName || '');
  const [rollNumber, setRollNumber] = useState(profile.rollNumber || '');

  // Add Semester Modal/Form state
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [newSemYear, setNewSemYear] = useState('2024-2025');
  const [newSemStart, setNewSemStart] = useState(new Date().toISOString().split('T')[0]);
  const [newSemEnd, setNewSemEnd] = useState('');

  // Pin state
  const [pinInput, setPinInput] = useState(settings.appPin || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: displayName.trim(),
      collegeName: collegeName.trim(),
      courseName: courseName.trim(),
      rollNumber: rollNumber.trim(),
    });
  };

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemName.trim()) return;

    onSaveSemester({
      name: newSemName.trim(),
      academicYear: newSemYear.trim() || undefined,
      startDate: newSemStart,
      endDate: newSemEnd || undefined,
      isActive: true,
      isArchived: false,
    });

    setNewSemName('');
    setShowAddSemester(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-[#E6E1D8]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#23211E] tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#D95D29]" />
          Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#7A746E]">
          Configure student profile, semesters, biometric security, rules, and notifications
        </p>
      </div>

      {/* SECTION 1: STUDENT PROFILE */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#D95D29]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
            Student Profile Details
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1">
                College / University Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1">
                Course / Major
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A453F] mb-1">
                Roll / Student ID Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. CS2024-042"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#23211E] hover:bg-[#3A3530] text-white text-xs font-bold transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SEMESTER MANAGEMENT */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-[#D95D29]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
              Semesters ({semesters.length})
            </h3>
          </div>
          <button
            onClick={() => setShowAddSemester(!showAddSemester)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#23211E] text-xs font-semibold border border-[#E0DBD2]"
          >
            <Plus className="w-3.5 h-3.5 text-[#D95D29]" />
            <span>Create Semester</span>
          </button>
        </div>

        {showAddSemester && (
          <form onSubmit={handleCreateSemester} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0DBD2] space-y-3">
            <h4 className="text-xs font-bold text-[#23211E]">Add New Semester</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#4A453F] block mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Semester 6 (Spring)"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D4CEBF] bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#4A453F] block mb-1">Year</label>
                <input
                  type="text"
                  placeholder="2024-2025"
                  value={newSemYear}
                  onChange={(e) => setNewSemYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D4CEBF] bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#4A453F] block mb-1">Start Date</label>
                <input
                  type="date"
                  value={newSemStart}
                  onChange={(e) => setNewSemStart(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D4CEBF] bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#4A453F] block mb-1">End Date</label>
                <input
                  type="date"
                  value={newSemEnd}
                  onChange={(e) => setNewSemEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D4CEBF] bg-white font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSemester(false)}
                className="px-3 py-1.5 text-xs text-[#7A746E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#D95D29] text-white text-xs font-bold"
              >
                Save Semester
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#F0EBE3]">
          {semesters.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#23211E]">{s.name}</span>
                  {s.academicYear && (
                    <span className="text-xs text-[#7A746E]">({s.academicYear})</span>
                  )}
                  {s.isActive && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#1E7F4D]/10 text-[#1E7F4D]">
                      Active
                    </span>
                  )}
                  {s.isArchived && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-[#F3EFE9] text-[#7A746E]">
                      Archived
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#7A746E] font-mono mt-0.5">
                  {s.startDate} {s.endDate ? `to ${s.endDate}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!s.isActive && (
                  <button
                    onClick={() => onSelectActiveSemester(s.id)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF8F5] border border-[#D4CEBF] text-[#23211E] hover:bg-[#F3EFE9]"
                  >
                    Set Active
                  </button>
                )}
                {semesters.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete semester "${s.name}"? This removes all subjects in it.`)) {
                        onDeleteSemester(s.id);
                      }
                    }}
                    className="p-1.5 text-[#7A746E] hover:text-[#C53030]"
                    title="Delete semester"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: BIOMETRIC LOCK & PRIVACY */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D95D29]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
            Biometric Security & App Lock
          </h3>
        </div>

        {/* Lock Switch */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
          <div>
            <span className="text-xs sm:text-sm font-bold text-[#23211E] block">
              Biometric / PIN Screen Lock
            </span>
            <span className="text-xs text-[#7A746E]">
              Requires fingerprint or device PIN whenever app resumes
            </span>
          </div>
          <button
            onClick={() => onUpdateSettings({ biometricLockEnabled: !settings.biometricLockEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.biometricLockEnabled ? 'bg-[#D95D29]' : 'bg-[#D4CEBF]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.biometricLockEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Lock Timeout & PIN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#4A453F] block mb-1">Lock Timeout</label>
            <select
              value={settings.lockTimeoutMinutes}
              onChange={(e) => onUpdateSettings({ lockTimeoutMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4CEBF] bg-[#FAF8F5]"
            >
              <option value="0">Immediately upon exit</option>
              <option value="1">After 1 minute in background</option>
              <option value="5">After 5 minutes in background</option>
              <option value="15">After 15 minutes in background</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#4A453F] block mb-1">Fallback PIN (4 digits)</label>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                setPinInput(v);
                if (v.length === 4) onUpdateSettings({ appPin: v });
              }}
              placeholder="e.g. 1234"
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4CEBF] bg-[#FAF8F5] font-mono text-center tracking-widest text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-[#4A453F] block mb-1">Widget Privacy Mode</label>
            <button
              onClick={() => onUpdateSettings({ widgetPrivacyMode: !settings.widgetPrivacyMode })}
              className={`w-full py-1.5 px-3 rounded-lg border font-semibold transition-all ${
                settings.widgetPrivacyMode
                  ? 'bg-[#23211E] text-white border-[#23211E]'
                  : 'bg-[#FAF8F5] text-[#7A746E] border-[#D4CEBF]'
              }`}
            >
              {settings.widgetPrivacyMode ? 'Privacy Active (Hides %)' : 'Show Full Stats'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: ATTENDANCE RULES & MARGINS */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#D95D29]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
            Attendance Calculation Rules
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#4A453F] block mb-1">
              Default Target Percentage: <strong className="font-mono text-[#D95D29]">{settings.defaultTargetPercent}%</strong>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={settings.defaultTargetPercent}
              onChange={(e) => onUpdateSettings({ defaultTargetPercent: parseInt(e.target.value) || 75 })}
              className="w-full accent-[#D95D29] h-2 bg-[#EBE6DE] rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="font-semibold text-[#4A453F] block mb-1">
              Warning Margin: <strong className="font-mono text-[#B45309]">{settings.warningMarginPercent}%</strong>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.warningMarginPercent}
              onChange={(e) => onUpdateSettings({ warningMarginPercent: parseInt(e.target.value) || 5 })}
              className="w-full accent-[#B45309] h-2 bg-[#EBE6DE] rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#8C847B]">
              Triggers 'At Risk' state if within {settings.warningMarginPercent}% of target
            </span>
          </div>

          <div>
            <label className="font-semibold text-[#4A453F] block mb-1">Approved Leaves Rule</label>
            <button
              onClick={() => onUpdateSettings({ countLeaveInDenominator: !settings.countLeaveInDenominator })}
              className={`w-full py-2 px-3 rounded-lg border font-semibold transition-all ${
                settings.countLeaveInDenominator
                  ? 'bg-[#B45309] text-white border-[#B45309]'
                  : 'bg-[#FAF8F5] text-[#23211E] border-[#D4CEBF]'
              }`}
            >
              {settings.countLeaveInDenominator
                ? 'Counted in Denominator'
                : 'Excluded from Denominator (Standard)'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: NOTIFICATION CHANNELS */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#D95D29]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C847B]">
            Notification Channels
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-[#F0EBE3]">
            <div>
              <strong className="text-[#23211E] block">Daily Evening Review Reminder</strong>
              <span className="text-[#7A746E]">Reminds you to confirm unmarked classes for today</span>
            </div>
            <input
              type="time"
              value={settings.dailyReminderTime || '17:00'}
              onChange={(e) => onUpdateSettings({ dailyReminderTime: e.target.value })}
              className="px-2 py-1 border border-[#D4CEBF] rounded-lg font-mono"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F0EBE3]">
            <div>
              <strong className="text-[#23211E] block">Low Attendance Warning Alert</strong>
              <span className="text-[#7A746E]">Alerts when any subject enters critical threshold</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ channelLowAttendanceAlerts: !settings.channelLowAttendanceAlerts })}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                settings.channelLowAttendanceAlerts ? 'bg-[#D95D29]' : 'bg-[#D4CEBF]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.channelLowAttendanceAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 6: DANGER ZONE */}
      <div className="rounded-2xl bg-white border border-[#FECACA] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#991B1B]">
          <AlertOctagon className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Reset & Danger Zone
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <strong className="text-[#23211E] block">Load Standard Demonstration Data</strong>
            <span className="text-[#7A746E]">
              Populates realistic sample courses, classes, and logs for quick evaluation
            </span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Reset app data to default demonstration courses and records?')) {
                onResetToDemoData();
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] hover:bg-[#ECE6DE] text-[#23211E] font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#FEE2E2] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <strong className="text-[#991B1B] block">Clear All Application Storage</strong>
            <span className="text-[#7A746E]">
              Irreversibly clears all semesters, subjects, logs, and settings
            </span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you absolutely sure you want to erase all data? This cannot be undone!')) {
                onClearAllData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold"
          >
            Erase Everything
          </button>
        </div>
      </div>
    </div>
  );
};
