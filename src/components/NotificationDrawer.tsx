import React from 'react';
import { X, Bell, Trash2, CheckCircle2, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#23211E]/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E6E1D8] flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E6E1D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#D95D29]" />
            <h3 className="text-base font-bold text-[#23211E]">Notifications & Alerts</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3EFE9] font-mono font-bold text-[#7A746E]">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-[#7A746E] hover:text-[#C53030] font-medium"
              >
                Clear All
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F3EFE9] text-[#7A746E]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#7A746E]">
              <Bell className="w-8 h-8 text-[#D4CEBF] mx-auto mb-2" />
              <span>No notifications at this time.</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-[#FAF8F5] border-[#EBE6DE] opacity-75'
                    : 'bg-white border-[#D95D29]/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 mt-0.5">
                    {n.channel === 'LOW_ATTENDANCE' && (
                      <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                    )}
                    {n.channel === 'LOCATION' && (
                      <MapPin className="w-4 h-4 text-[#D95D29]" />
                    )}
                    {n.channel === 'ATTENDANCE' && (
                      <Clock className="w-4 h-4 text-[#1E7F4D]" />
                    )}
                    {n.channel === 'SYSTEM' && (
                      <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-[#23211E]">{n.title}</h5>
                      <span className="text-[10px] text-[#8C847B]">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A453F] mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
