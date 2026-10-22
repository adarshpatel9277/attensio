import React from 'react';
import { LayoutDashboard, CalendarCheck2, Calculator, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'log' | 'forecast' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'log' as TabType, label: 'Log', Icon: CalendarCheck2 },
    { id: 'forecast' as TabType, label: 'Forecast', Icon: Calculator },
    { id: 'settings' as TabType, label: 'Settings', Icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-50 px-4 max-w-md mx-auto pointer-events-none pb-safe">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto w-full bg-surface-card/95 backdrop-blur-2xl border border-surface-container-high/80 rounded-full px-2 py-1 shadow-[0_8px_32px_rgba(15,23,42,0.12)] flex items-center justify-between h-16"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-rose-subtle text-primary font-bold shadow-xs scale-[1.02]'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-recessed/40'
              }`}
              type="button"
            >
              <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[11px] leading-none mt-1 font-semibold tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

