'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Monitor, Clock, Volume2, Trash2, CheckCircle, ShieldCheck, Sparkles, Calendar, RotateCcw, Sliders, Download, Wifi, WifiOff, Smartphone, Globe, Search, Timer, Minus, Plus } from 'lucide-react';
import { ThemeMode } from '@/hooks/useTheme';
import { soundManager } from '@/lib/audio';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ALL_TIMEZONES, POPULAR_TIMEZONES, getTimezoneOffsetFormatted } from '@/lib/timezones';
import { ScreensaverSettings } from '@/hooks/useIdleScreensaver';

interface SettingsProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  is24Hour: boolean;
  toggle24Hour: () => void;
  isManualTime?: boolean;
  setManualTimeAndDate?: (dateStr: string, timeStr: string) => boolean;
  resetToDeviceTime?: () => void;
  userTimezone?: string;
  setTimezone?: (tz: string) => void;
  resetTimezone?: () => void;
  screensaverSettings?: ScreensaverSettings;
  setScreensaverSettings?: (s: Partial<ScreensaverSettings>) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  theme,
  setTheme,
  is24Hour,
  toggle24Hour,
  isManualTime = false,
  setManualTimeAndDate,
  resetToDeviceTime,
  userTimezone,
  setTimezone,
  resetTimezone,
  screensaverSettings,
  setScreensaverSettings,
}) => {
  const isOnline = useOnlineStatus();
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  const [manualDate, setManualDate] = useState(todayStr);
  const [manualTime, setManualTime] = useState(nowTimeStr);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tzSearch, setTzSearch] = useState('');
  const [tzSuccess, setTzSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install Time Twist:\n\n• On Chrome/Edge: Click the Install icon in the address bar.\n• On iOS Safari: Tap Share -> Add to Home Screen.');
    }
  };

  const handleTestSound = () => {
    soundManager.playChime();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all saved Time Twist preferences and data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleApplyManualTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (setManualTimeAndDate) {
      const ok = setManualTimeAndDate(manualDate, manualTime);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  const handleResetTime = () => {
    if (resetToDeviceTime) {
      resetToDeviceTime();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          <span>Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Customize your Time Twist experience</p>
      </div>

      <div className="space-y-4 sm:space-y-6">

        {/* Online / Offline & App Download Card */}
        <div className="card-glass p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">App Installation & Connectivity</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Time Twist works 100% offline as a Progressive Web App (PWA)
              </p>
            </div>

            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs flex-shrink-0">
                <Wifi className="w-3.5 h-3.5" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-xs flex-shrink-0">
                <WifiOff className="w-3.5 h-3.5" /> Offline Mode
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p className="font-semibold text-[var(--text-primary)]">
                {isStandalone ? '✓ App is currently running in Standalone PWA mode.' : 'Install Time Twist on your Desktop or Phone home screen.'}
              </p>
              <p>Clocks, Stopwatch, Countdown Timers, and Alarms run natively offline without internet.</p>
            </div>

            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install / Download PWA</span>
              </button>
            )}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card-glass p-5 sm:p-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Appearance Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System Theme', icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeMode)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold shadow-md shadow-blue-500/10'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{t.label}</span>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timezone & Region Settings */}
        <div className="card-glass p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Primary Time Zone</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Set your primary time zone for the main clock and dashboard displays
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold text-xs flex-shrink-0 font-mono">
                {userTimezone || 'Local Device Time'}
              </span>
              {resetTimezone && (
                <button
                  type="button"
                  onClick={() => {
                    resetTimezone();
                    setTzSuccess(true);
                    setTimeout(() => setTzSuccess(false), 3000);
                  }}
                  className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Reset to local device timezone"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Use Device Time</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={tzSearch}
                onChange={(e) => setTzSearch(e.target.value)}
                placeholder="Search city, country or time zone (e.g. New York, Tokyo, London, Paris, Karachi)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>

            {/* Popular Timezone Quick Selection Chips */}
            <div>
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Popular Cities & Timezones
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TIMEZONES.map((city) => {
                  const isSelected = userTimezone === city.timezone;
                  return (
                    <button
                      key={city.id}
                      onClick={() => {
                        if (setTimezone) {
                          setTimezone(city.timezone);
                          setTzSuccess(true);
                          setTimeout(() => setTzSuccess(false), 3000);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold shadow-sm'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40'
                      }`}
                    >
                      <span>{city.flag}</span>
                      <span>{city.city}</span>
                      <span className="opacity-60 text-[10px]">({getTimezoneOffsetFormatted(city.timezone)})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Search Results Dropdown List */}
            {tzSearch.trim().length > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] divide-y divide-[var(--border-color)]">
                {ALL_TIMEZONES.filter(
                  (c) =>
                    c.city.toLowerCase().includes(tzSearch.toLowerCase()) ||
                    c.country.toLowerCase().includes(tzSearch.toLowerCase()) ||
                    c.timezone.toLowerCase().includes(tzSearch.toLowerCase())
                ).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      if (setTimezone) {
                        setTimezone(city.timezone);
                        setTzSearch('');
                        setTzSuccess(true);
                        setTimeout(() => setTzSuccess(false), 3000);
                      }
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-blue-500/10 transition-colors ${
                      userTimezone === city.timezone ? 'bg-blue-500/10 font-bold text-blue-400' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{city.flag}</span>
                      <div>
                        <p className="font-semibold">{city.city}, {city.country}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">{city.timezone}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {getTimezoneOffsetFormatted(city.timezone)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tzSuccess && (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>Primary time zone updated successfully! Clocks are now displayed in selected timezone.</span>
              </p>
            )}
          </div>
        </div>

        {/* Time Format Settings */}
        <div className="card-glass p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Clock Format</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Switch between 12-hour (AM/PM) and 24-hour time format</p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <button
              onClick={() => is24Hour && toggle24Hour()}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !is24Hour ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              12-Hour
            </button>
            <button
              onClick={() => !is24Hour && toggle24Hour()}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                is24Hour ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              24-Hour
            </button>
          </div>
        </div>

        {/* Manual Date & Time Override Section */}
        <div className="card-glass p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Manual Date & Time Override</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Manually set application date and time, or sync back to real device time
              </p>
            </div>

            {isManualTime ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs flex-shrink-0">
                Manual Override Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex-shrink-0">
                Synced with Device Time
              </span>
            )}
          </div>

          <form onSubmit={handleApplyManualTime} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Set Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Set Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Apply Manual Date & Time</span>
              </button>

              {isManualTime && (
                <button
                  type="button"
                  onClick={handleResetTime}
                  className="btn-secondary py-2.5 px-4 text-xs sm:text-sm text-indigo-400 hover:border-indigo-500/40"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Real Device Time</span>
                </button>
              )}
            </div>

            {saveSuccess && (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>Manual time and date applied successfully! Clocks are ticking from set time.</span>
              </p>
            )}
          </form>
        </div>

        {/* Screensaver Settings */}
        {screensaverSettings && setScreensaverSettings && (
          <div className="card-glass p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)] mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Idle Screensaver</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Show a fullscreen clock when you haven't interacted for a while
                </p>
              </div>

              {/* Enable / Disable toggle */}
              <button
                onClick={() => setScreensaverSettings({ enabled: !screensaverSettings.enabled })}
                className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors flex-shrink-0 ${
                  screensaverSettings.enabled ? 'bg-indigo-600' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                }`}
                style={{ width: '52px' }}
                aria-label="Toggle screensaver"
                role="switch"
                aria-checked={screensaverSettings.enabled}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    screensaverSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {screensaverSettings.enabled && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Idle Time</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Screensaver activates after{' '}
                    <span className="text-indigo-400 font-bold">{screensaverSettings.idleMinutes} minute{screensaverSettings.idleMinutes !== 1 ? 's' : ''}</span>{' '}
                    of inactivity
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      setScreensaverSettings({ idleMinutes: Math.max(1, screensaverSettings.idleMinutes - 1) })
                    }
                    disabled={screensaverSettings.idleMinutes <= 1}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:border-indigo-500/40 disabled:opacity-30 transition-all"
                    aria-label="Decrease idle time"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 5, 10].map((min) => (
                      <button
                        key={min}
                        onClick={() => setScreensaverSettings({ idleMinutes: min })}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                          screensaverSettings.idleMinutes === min
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-sm shadow-indigo-500/20'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/30'
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setScreensaverSettings({ idleMinutes: Math.min(10, screensaverSettings.idleMinutes + 1) })
                    }
                    disabled={screensaverSettings.idleMinutes >= 10}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:border-indigo-500/40 disabled:opacity-30 transition-all"
                    aria-label="Increase idle time"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!screensaverSettings.enabled && (
              <p className="text-xs text-[var(--text-muted)] italic">
                Screensaver is currently disabled. Enable it to activate the fullscreen clock on idle.
              </p>
            )}
          </div>
        )}

        {/* Sound Test */}
        <div className="card-glass p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Alarm & Timer Audio</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Test the synthesized Web Audio synthesizer chime</p>
          </div>

          <button
            onClick={handleTestSound}
            className="btn-secondary"
          >
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>Test Sound</span>
          </button>
        </div>

        {/* Data Reset */}
        <div className="card-glass p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-400">Reset Local Storage</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Clear all saved world clocks, alarms, and user settings</p>
          </div>

          <button
            onClick={handleResetData}
            className="btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All Data</span>
          </button>
        </div>

        {/* App Info Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 border border-blue-500/20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
            Time Twist ⏱️
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Version 1.0.0 — Production Ready PWA</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Offline Capable
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" /> Hallmark Audited
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
