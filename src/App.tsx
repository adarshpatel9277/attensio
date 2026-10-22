import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocalStorageManager, subscribeToDatabase } from './data/localStorageManager';
import { DayRecord, DayStatus, DayAppSettings, CourseSubject } from './types';
import { calculateDayAttendanceStats } from './utils/calculator';
import { MorningCallManager } from './utils/morningCallManager';

// Stitch UI Redesign Screens & Components
import { WelcomeScreen } from './components/stitch/WelcomeScreen';
import { Step1StudentProfile } from './components/stitch/Step1StudentProfile';
import { Step2CollegeSchedule } from './components/stitch/Step2CollegeSchedule';
import { Step3AttendanceTarget } from './components/stitch/Step3AttendanceTarget';
import { AppHeader } from './components/stitch/AppHeader';
import { BottomNav, TabType } from './components/stitch/BottomNav';
import { DashboardTab } from './components/stitch/DashboardTab';
import { DailyLogTab } from './components/stitch/DailyLogTab';
import { ForecastCalculatorTab } from './components/stitch/ForecastCalculatorTab';
import { SettingsPreferencesTab } from './components/stitch/SettingsPreferencesTab';
import { BackdateModal } from './components/stitch/BackdateModal';
import { AttendanceChatbot } from './components/AttendanceChatbot';
import { AdBanner } from './components/AdBanner';
import { CheckCircle2 } from 'lucide-react';

type ScreenState = 'welcome' | 'onboarding-1' | 'onboarding-2' | 'onboarding-3' | 'main';

export default function App() {
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      refreshData();
    });
    return unsubscribe;
  }, [refreshData]);

  // Current Screen / Route state
  const [screen, setScreen] = useState<ScreenState>(() => {
    const initialSettings = LocalStorageManager.getDayAppSettings();
    return initialSettings.onboardingCompleted ? 'main' : 'welcome';
  });

  // Active Tab for main screen
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Backdate Modal State
  const [isBackdateModalOpen, setIsBackdateModalOpen] = useState(false);
  const [backdateTargetDate, setBackdateTargetDate] = useState<string | undefined>(undefined);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{
    date: string;
    previousStatus: DayStatus | null;
    previousNote?: string;
    previousSpecial?: boolean;
    previousDetails?: {
      subjectName?: string;
      subjectCode?: string;
      timeSlot?: string;
      location?: string;
    };
    message: string;
    timeoutId: any;
  } | null>(null);

  // Synchronized Domain Records, Settings, and Subjects
  const records = useMemo(() => {
    return LocalStorageManager.getDayRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const settings = useMemo(() => {
    return LocalStorageManager.getDayAppSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const subjects = useMemo(() => {
    return LocalStorageManager.getCourseSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const stats = useMemo(() => {
    return calculateDayAttendanceStats(
      records,
      settings.targetPercentage || 75,
      settings.warningMargin || 5
    );
  }, [records, settings.targetPercentage, settings.warningMargin]);

  // Initial & Continuous Morning Call Synchronization with Native Device / Web
  useEffect(() => {
    MorningCallManager.syncSchedule(settings, records);
  }, [settings, records]);

  // Hardware Back button and Browser Popstate handling
  useEffect(() => {
    (window as any).handleAndroidBack = () => {
      // 1. If backdate modal is open, close it
      if (isBackdateModalOpen) {
        setIsBackdateModalOpen(false);
        setBackdateTargetDate(undefined);
        return true;
      }
      // 2. Onboarding back steps
      if (screen === 'onboarding-3') {
        setScreen('onboarding-2');
        return true;
      }
      if (screen === 'onboarding-2') {
        setScreen('onboarding-1');
        return true;
      }
      if (screen === 'onboarding-1') {
        setScreen('welcome');
        return true;
      }
      // 3. Tab navigation back to dashboard
      if (screen === 'main' && activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return true;
      }
      return false;
    };

    const handlePopState = () => {
      (window as any).handleAndroidBack?.();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      delete (window as any).handleAndroidBack;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isBackdateModalOpen, screen, activeTab]);

  // Handle Marking a day
  const handleMarkDay = (
    date: string,
    status: DayStatus | null,
    note?: string,
    isSpecial?: boolean,
    details?: { subjectName?: string; subjectCode?: string; timeSlot?: string; location?: string }
  ) => {
    if (status === null) {
      handleDeleteRecord(date);
      return;
    }

    const existing = records.find((r) => r.date === date);
    const previousStatus = existing ? existing.status : null;
    const previousNote = existing ? existing.note : undefined;
    const previousSpecial = existing ? existing.isSpecialClass : undefined;
    const previousDetails = existing
      ? {
          subjectName: existing.subjectName,
          subjectCode: existing.subjectCode,
          timeSlot: existing.timeSlot,
          location: existing.location,
        }
      : undefined;

    LocalStorageManager.markDay(date, status, note, isSpecial, details);
    refreshData();

    // Setup 3.5s smooth top undo toast
    if (undoToast?.timeoutId) {
      clearTimeout(undoToast.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setUndoToast(null);
    }, 3500);

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const label =
      status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Holiday / Off';

    setUndoToast({
      date,
      previousStatus,
      previousNote,
      previousSpecial,
      previousDetails,
      message: `Marked ${label} for ${formattedDate}`,
      timeoutId,
    });
  };

  // Handle Deleting / Clearing a record
  const handleDeleteRecord = (date: string) => {
    const existing = records.find((r) => r.date === date);
    if (!existing) return;

    const previousStatus = existing.status;
    const previousNote = existing.note;
    const previousSpecial = existing.isSpecialClass;
    const previousDetails = {
      subjectName: existing.subjectName,
      subjectCode: existing.subjectCode,
      timeSlot: existing.timeSlot,
      location: existing.location,
    };

    LocalStorageManager.removeDayRecord(date);
    refreshData();

    if (undoToast?.timeoutId) {
      clearTimeout(undoToast.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setUndoToast(null);
    }, 3500);

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    setUndoToast({
      date,
      previousStatus,
      previousNote,
      previousSpecial,
      previousDetails,
      message: `Removed log for ${formattedDate}`,
      timeoutId,
    });
  };

  // Undo action
  const handleUndo = () => {
    if (!undoToast) return;
    if (undoToast.previousStatus) {
      LocalStorageManager.markDay(
        undoToast.date,
        undoToast.previousStatus,
        undoToast.previousNote,
        undoToast.previousSpecial,
        undoToast.previousDetails
      );
    } else {
      LocalStorageManager.removeDayRecord(undoToast.date);
    }
    clearTimeout(undoToast.timeoutId);
    setUndoToast(null);
    refreshData();
  };

  // Save Settings
  const handleSaveSettings = (newSettings: DayAppSettings) => {
    LocalStorageManager.setDayAppSettings(newSettings);
    MorningCallManager.syncSchedule(newSettings, records);
    refreshData();
  };

  // Reset Demo Data
  const handleResetData = () => {
    LocalStorageManager.resetToDemoDayRecords();
    LocalStorageManager.setCourseSubjects([
      {
        id: 'sub_1',
        name: 'Data Structures & Algo',
        code: 'CS-302',
        schedule: 'Mon, Wed, Fri',
        present: 14,
        total: 18,
        percentage: 78.0,
        status: 'SAFE',
        bunkStatus: 'Safe +1 bunk',
      },
      {
        id: 'sub_2',
        name: 'Operating Systems',
        code: 'CS-304',
        schedule: 'Tue, Thu',
        present: 7,
        total: 12,
        percentage: 58.3,
        status: 'AT_RISK',
        bunkStatus: 'Need 4 classes',
      },
      {
        id: 'sub_3',
        name: 'Database Systems',
        code: 'CS-308',
        schedule: 'Mon, Thu',
        present: 23,
        total: 31,
        percentage: 74.2,
        status: 'CAUTION',
        bunkStatus: 'Need 1 class',
      },
      {
        id: 'sub_4',
        name: 'Web Engineering',
        code: 'IT-312',
        schedule: 'Tue, Fri',
        present: 31,
        total: 39,
        percentage: 79.5,
        status: 'SAFE',
        bunkStatus: 'Safe +2 bunks',
      },
    ]);
    LocalStorageManager.setDayAppSettings({
      ...settings,
      targetPercentage: 75,
      studentName: 'Adarsh Sharma',
      collegeName: 'National Institute of Technology',
      courseName: 'B.Tech Computer Science',
      semester: 5,
      saturdayPolicy: 'FULL_OFF',
      saturdayOff: true,
      sundayOff: true,
      trackCourses: true,
      onboardingCompleted: true,
    });
    refreshData();
  };

  // Restart Onboarding Tour
  const handleRestartOnboarding = () => {
    LocalStorageManager.setDayAppSettings({
      ...settings,
      onboardingCompleted: false,
    });
    setScreen('welcome');
    refreshData();
  };

  // ==========================================
  // RENDER FLOWS
  // ==========================================

  // Screen 1: Welcome Screen
  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => {
          window.history.pushState({ screen: 'onboarding-1' }, '');
          setScreen('onboarding-1');
        }}
      />
    );
  }

  // Screen 2: Onboarding Step 1 - Student Profile
  if (screen === 'onboarding-1') {
    return (
      <Step1StudentProfile
        initialSettings={settings}
        onNext={(stepData) => {
          const updated = { ...settings, ...stepData };
          LocalStorageManager.setDayAppSettings(updated);
          refreshData();
          window.history.pushState({ screen: 'onboarding-2' }, '');
          setScreen('onboarding-2');
        }}
        onBack={() => setScreen('welcome')}
        onSkip={() => {
          window.history.pushState({ screen: 'onboarding-2' }, '');
          setScreen('onboarding-2');
        }}
      />
    );
  }

  // Screen 3: Onboarding Step 2 - College Schedule & Off Days
  if (screen === 'onboarding-2') {
    return (
      <Step2CollegeSchedule
        initialSettings={settings}
        onNext={(stepData) => {
          const updated = { ...settings, ...stepData };
          LocalStorageManager.setDayAppSettings(updated);
          refreshData();
          window.history.pushState({ screen: 'onboarding-3' }, '');
          setScreen('onboarding-3');
        }}
        onBack={() => setScreen('onboarding-1')}
        onSkip={() => {
          window.history.pushState({ screen: 'onboarding-3' }, '');
          setScreen('onboarding-3');
        }}
      />
    );
  }

  // Screen 4: Onboarding Step 3 - Attendance Target & Finish
  if (screen === 'onboarding-3') {
    return (
      <Step3AttendanceTarget
        initialSettings={settings}
        onFinish={(stepData) => {
          const updated = {
            ...settings,
            ...stepData,
            onboardingCompleted: true,
          };
          LocalStorageManager.setDayAppSettings(updated);
          refreshData();
          window.history.pushState({ screen: 'main' }, '');
          setScreen('main');
          setActiveTab('dashboard');
        }}
        onBack={() => setScreen('onboarding-2')}
        onSkip={() => {
          const updated = {
            ...settings,
            onboardingCompleted: true,
          };
          LocalStorageManager.setDayAppSettings(updated);
          refreshData();
          window.history.pushState({ screen: 'main' }, '');
          setScreen('main');
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Screen 5-8: Main Application Experience (Dashboard, Log, Forecast, Settings)
  return (
    <div className="bg-surface min-h-screen font-body-md text-on-surface flex flex-col antialiased selection:bg-rose-tint selection:text-primary">
      {/* Top App Header with Live Attendance Badge */}
      <AppHeader
        studentName={settings.studentName}
        subtitle={
          settings.collegeName
            ? `${settings.collegeName}`
            : 'Smart Attendance Goal & Bunk Forecaster'
        }
        percentage={stats.percentage}
        avatarUrl={settings.avatarUrl}
        onAvatarClick={() => {
          window.history.pushState({ tab: 'settings' }, '');
          setActiveTab('settings');
        }}
      />

      {/* Main Tab Container - max-w-md centered container with top padding for fixed AppHeader */}
      <main className="flex-1 w-full max-w-md mx-auto pt-18 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardTab
            records={records}
            settings={settings}
            onMarkDay={handleMarkDay}
            onDeleteRecord={handleDeleteRecord}
            onSelectDateToLog={(date) => {
              setBackdateTargetDate(date);
              setIsBackdateModalOpen(true);
            }}
            onNavigateTab={(tab) => {
              window.history.pushState({ tab }, '');
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'log' && (
          <DailyLogTab
            records={records}
            settings={settings}
            onMarkDay={handleMarkDay}
            onDeleteRecord={handleDeleteRecord}
            onOpenBackdate={() => {
              setBackdateTargetDate(undefined);
              setIsBackdateModalOpen(true);
            }}
            onMarkToday={() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              const todayStr = `${year}-${month}-${day}`;
              handleMarkDay(todayStr, 'PRESENT');
            }}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastCalculatorTab
            records={records}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPreferencesTab
            settings={settings}
            records={records}
            onSaveSettings={handleSaveSettings}
            onRestartOnboarding={handleRestartOnboarding}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          window.history.pushState({ tab }, '');
          setActiveTab(tab);
        }}
      />

      {/* Backdate Entry Modal */}
      {isBackdateModalOpen && (
        <BackdateModal
          initialDate={backdateTargetDate}
          records={records}
          subjects={subjects}
          onClose={() => {
            setIsBackdateModalOpen(false);
            setBackdateTargetDate(undefined);
          }}
          onSave={(date, status, note, details) => {
            handleMarkDay(date, status, note, false, details);
            setIsBackdateModalOpen(false);
            setBackdateTargetDate(undefined);
          }}
          onDelete={(date) => {
            handleDeleteRecord(date);
            setIsBackdateModalOpen(false);
            setBackdateTargetDate(undefined);
          }}
        />
      )}

      {/* Top Floating Undo Toast Notification */}
      {undoToast && (
        <div
          id="undo-toast"
          role="status"
          aria-live="polite"
          className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 text-white shadow-xl border border-slate-700/60 backdrop-blur-md text-xs font-semibold animate-in slide-in-from-top-3 fade-in duration-300 max-w-[92vw]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{undoToast.message}</span>
          <button
            onClick={handleUndo}
            className="ml-1.5 px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
          >
            Undo
          </button>
        </div>
      )}

      {/* Floating Local AI Attendance Assistant (100% on-device, rule-based) */}
      <AttendanceChatbot
        records={records}
        settings={settings}
        subjects={subjects}
        stats={stats}
        onNavigateTab={(tab) => {
          window.history.pushState({ tab }, '');
          setActiveTab(tab);
        }}
      />
    </div>
  );
}
