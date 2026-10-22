import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  Navigation,
  CheckCircle2,
  Clock,
  Settings,
  BellRing,
  Info,
} from 'lucide-react';
import { DayOfWeek, LocationReminder } from '../types';

interface LocationReminderTabProps {
  reminder: LocationReminder;
  onSaveReminder: (reminder: Partial<LocationReminder>) => void;
  onTriggerTestReminder: () => void;
}

const DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const LocationReminderTab: React.FC<LocationReminderTabProps> = ({
  reminder,
  onSaveReminder,
  onTriggerTestReminder,
}) => {
  const [name, setName] = useState(reminder.name);
  const [lat, setLat] = useState(reminder.latitude);
  const [lng, setLng] = useState(reminder.longitude);
  const [radius, setRadius] = useState(reminder.radiusMeters);
  const [isEnabled, setIsEnabled] = useState(reminder.isEnabled);
  const [startTime, setStartTime] = useState(reminder.startTime || '08:30');
  const [endTime, setEndTime] = useState(reminder.endTime || '17:00');
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>(reminder.activeDays);
  const [cooldown, setCooldown] = useState(reminder.cooldownMinutes || 180);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser environment.');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Math.round(pos.coords.latitude * 10000) / 10000);
        setLng(Math.round(pos.coords.longitude * 10000) / 10000);
        setLocating(false);
      },
      (err) => {
        setLocError(`Could not obtain location: ${err.message}. You can enter coordinates manually.`);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    onSaveReminder({
      name,
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      isEnabled,
      startTime,
      endTime,
      activeDays,
      cooldownMinutes: cooldown,
    });
  };

  const toggleDay = (day: DayOfWeek) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter((d) => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Core Privacy Principle Box */}
      <div className="pb-3 border-b border-[#E6E1D8]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#23211E] tracking-tight flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#D95D29]" />
          College Proximity Reminder
        </h2>
        <p className="text-xs sm:text-sm text-[#7A746E]">
          Receive an automated reminder to review and log attendance when arriving at your campus
        </p>
      </div>

      {/* Non-Negotiable Core Principle Alert */}
      <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#1E7F4D]/10 text-[#1E7F4D] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-[#14532D] space-y-1">
            <h4 className="font-bold text-[#166534]">
              Core Principle: Manual Confirmation Required
            </h4>
            <p>
              The app <strong>never claims GPS proves you attended a class</strong>, and will never
              silently mark your attendance. This proximity feature is strictly an optional reminder
              so you don't forget to mark routine lectures.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="rounded-2xl bg-white border border-[#E6E1D8] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Enable / Disable Switch */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D8]">
          <div>
            <span className="text-sm font-bold text-[#23211E] block">
              Enable Location Reminders
            </span>
            <span className="text-xs text-[#7A746E]">
              Optional convenience alert triggered upon entering college boundaries
            </span>
          </div>
          <button
            onClick={() => {
              const next = !isEnabled;
              setIsEnabled(next);
              onSaveReminder({ isEnabled: next });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isEnabled ? 'bg-[#D95D29]' : 'bg-[#D4CEBF]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Location Coordinates & Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#4A453F]">
            College Campus Location & Geofence
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] text-[#7A746E] block mb-1">Campus Label</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5]"
                placeholder="e.g. Academic Block & Labs"
              />
            </div>

            <div>
              <span className="text-[11px] text-[#7A746E] block mb-1">Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D4CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <span className="text-[11px] text-[#7A746E] block mb-1">Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D4CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleGetCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#23211E] text-xs font-semibold border border-[#E0DBD2] transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Detecting...' : 'Use Current Device Location'}</span>
            </button>

            {/* Quick Presets */}
            <span className="text-[11px] text-[#8C847B] ml-2">Presets:</span>
            <button
              onClick={() => {
                setLat(12.9716);
                setLng(77.5946);
                setName('Campus Main Quad');
              }}
              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E0DBD2] text-[11px] text-[#4A453F] hover:bg-[#F3EFE9]"
            >
              Campus Quad
            </button>
            <button
              onClick={() => {
                setLat(28.6139);
                setLng(77.209);
                setName('North Campus Block');
              }}
              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E0DBD2] text-[11px] text-[#4A453F] hover:bg-[#F3EFE9]"
            >
              North Campus
            </button>
          </div>

          {locError && (
            <p className="text-xs text-[#C53030] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{locError}</span>
            </p>
          )}
        </div>

        {/* Geofence Radius Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
            Geofence Detection Radius: <strong className="text-[#D95D29] font-mono">{radius}m</strong>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 250, 500, 1000].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  radius === r
                    ? 'bg-[#D95D29] text-white border-[#D95D29]'
                    : 'bg-[#FAF8F5] text-[#4A453F] border-[#D4CEBF] hover:bg-[#F3EFE9]'
                }`}
              >
                {r} meters
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#8C847B] mt-1 block">
            250m is recommended for standard university academic blocks and lecture halls.
          </span>
        </div>

        {/* Active Days */}
        <div>
          <label className="block text-xs font-semibold text-[#4A453F] mb-1.5">
            Active Reminder Days
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const active = activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold border transition-all ${
                    active
                      ? 'bg-[#23211E] text-white border-[#23211E]'
                      : 'bg-[#FAF8F5] text-[#7A746E] border-[#D4CEBF]'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Window & Cooldown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1">
              Active From
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1">
              Active To
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A453F] mb-1">
              Reminder Cooldown
            </label>
            <select
              value={cooldown}
              onChange={(e) => setCooldown(parseInt(e.target.value) || 180)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#D4CEBF] bg-[#FAF8F5]"
            >
              <option value="60">60 minutes</option>
              <option value="120">120 minutes</option>
              <option value="180">180 minutes (Recommended)</option>
              <option value="360">360 minutes</option>
            </select>
          </div>
        </div>

        {/* Save & Test Buttons */}
        <div className="pt-3 border-t border-[#E6E1D8] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onTriggerTestReminder}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F3EFE9] hover:bg-[#ECE6DE] text-[#23211E] text-xs font-semibold border border-[#E0DBD2] transition-colors"
          >
            <BellRing className="w-4 h-4 text-[#D95D29]" />
            <span>Test Location Alert Now</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#D95D29] hover:bg-[#C84E1C] text-white text-xs font-bold shadow-sm transition-colors"
          >
            Save Location Settings
          </button>
        </div>
      </div>

      {/* Diagnostics and Battery Optimization info */}
      <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] p-4 text-xs text-[#6A635B] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#23211E]">
          <Info className="w-4 h-4 text-[#D95D29]" />
          <span>Android Geofencing & Battery Diagnostics</span>
        </div>
        <p>
          Android devices put background geofences into periodic sleep to save battery. The reminder
          may take a few moments upon arriving at campus to trigger. If your device aggressively kills
          background apps, consider exempting this app from battery optimization in your phone settings.
        </p>
      </div>
    </div>
  );
};
