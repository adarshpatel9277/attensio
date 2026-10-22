import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Plus,
  Smartphone,
  FolderGit2,
  Lock,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Semester, AppSettings } from '../types';

interface HeaderProps {
  semesters: Semester[];
  activeSemester: Semester | null;
  onSelectSemester: (id: string) => void;
  onOpenQuickMark: () => void;
  onOpenWidgetSimulator: () => void;
  onOpenAndroidProject: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  settings: AppSettings;
  onLockApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  semesters,
  activeSemester,
  onSelectSemester,
  onOpenQuickMark,
  onOpenWidgetSimulator,
  onOpenAndroidProject,
  onOpenNotifications,
  unreadNotificationsCount,
  settings,
  onLockApp,
}) => {
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8] px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & App Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D95D29] text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#23211E] tracking-tight">
                Student Attendance Tracker
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#1E7F4D]/10 text-[#1E7F4D] border border-[#1E7F4D]/20">
                <ShieldCheck className="w-3 h-3" /> Offline-First
              </span>
            </div>
            <p className="text-xs text-[#7A746E]">
              Personal student attendance & location reminder
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Active Semester Selector */}
          <div className="relative">
            <button
              onClick={() => setSemesterDropdownOpen(!semesterDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#23211E] text-xs sm:text-sm font-semibold border border-[#E0DBD2] transition-colors"
              title="Switch active semester"
            >
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {activeSemester ? activeSemester.name : 'Select Semester'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A746E]" />
            </button>

            {semesterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSemesterDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E0DBD2] shadow-lg py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8C847B] uppercase tracking-wider">
                    Semesters
                  </div>
                  {semesters.map((sem) => (
                    <button
                      key={sem.id}
                      onClick={() => {
                        onSelectSemester(sem.id);
                        setSemesterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-[#F7F4EF] transition-colors"
                    >
                      <div className="truncate">
                        <span className="font-medium text-[#23211E]">{sem.name}</span>
                        {sem.academicYear && (
                          <span className="ml-2 text-[11px] text-[#7A746E]">({sem.academicYear})</span>
                        )}
                      </div>
                      {sem.isActive && (
                        <CheckCircle2 className="w-4 h-4 text-[#1E7F4D] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Android Home-screen Widget Preview */}
          <button
            onClick={onOpenWidgetSimulator}
            className="p-2 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#4A453F] border border-[#E0DBD2] transition-colors"
            title="Preview Android Glance Home-screen Widget"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Android Project & APK Info */}
          <button
            onClick={onOpenAndroidProject}
            className="p-2 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#4A453F] border border-[#E0DBD2] transition-colors"
            title="View Android Studio Source & Build APK"
          >
            <FolderGit2 className="w-4 h-4" />
          </button>

          {/* Biometric Lock button (if enabled) */}
          {settings.biometricLockEnabled && (
            <button
              onClick={onLockApp}
              className="p-2 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#4A453F] border border-[#E0DBD2] transition-colors"
              title="Lock app with Biometrics/PIN"
            >
              <Lock className="w-4 h-4 text-[#D95D29]" />
            </button>
          )}

          {/* Notifications Center */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#4A453F] border border-[#E0DBD2] transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D95D29] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Quick Mark Attendance Action */}
          <button
            onClick={onOpenQuickMark}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D95D29] hover:bg-[#C84E1C] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Mark Class</span>
          </button>
        </div>
      </div>
    </header>
  );
};
