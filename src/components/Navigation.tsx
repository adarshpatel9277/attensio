import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  Target,
  Palmtree,
  MapPin,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'attendance'
  | 'calendar'
  | 'goal'
  | 'leaves'
  | 'location'
  | 'backup'
  | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasLowAttendance: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  hasLowAttendance,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance' as TabType, label: 'Attendance', icon: ClipboardCheck },
    { id: 'calendar' as TabType, label: 'Calendar', icon: CalendarDays },
    {
      id: 'goal' as TabType,
      label: 'Goal Calc',
      icon: Target,
      badge: hasLowAttendance ? 'Alert' : undefined,
    },
    { id: 'leaves' as TabType, label: 'Leaves', icon: Palmtree },
    { id: 'location' as TabType, label: 'Location', icon: MapPin },
    { id: 'backup' as TabType, label: 'Export & Data', icon: FileSpreadsheet },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop/Tablet Horizontal Tabs Bar */}
      <nav className="hidden md:block bg-[#FAF8F5] border-b border-[#E6E1D8] px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#EAE4DC] text-[#23211E] shadow-xs'
                    : 'text-[#6A635B] hover:text-[#23211E] hover:bg-[#F3EFE9]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D95D29]' : 'text-[#8C847B]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#B45309] text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E6E1D8] px-2 py-1 flex items-center justify-around shadow-lg">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors ${
                isActive ? 'text-[#D95D29]' : 'text-[#7A746E]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors ${
            currentTab === 'settings' || currentTab === 'backup' || currentTab === 'location'
              ? 'text-[#D95D29]'
              : 'text-[#7A746E]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">More</span>
        </button>
      </nav>
    </>
  );
};
