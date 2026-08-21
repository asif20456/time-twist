'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/** How the screensaver starts: never, always (on idle), scheduled (during time window), or idle (legacy minutes). */
export type StartMode = 'never' | 'always' | 'scheduled' | 'idle';

/** Idle-minute options when startMode is 'idle' */
export type IdleMinutesOption = 1 | 2 | 3 | 5 | 10 | 15 | 30;

export interface ScreensaverSettings {
  enabled: boolean;
  /** How the screensaver is triggered. */
  startMode: StartMode;
  /** Minutes of inactivity before activation (only used when startMode === 'idle'). */
  idleMinutes: IdleMinutesOption;
  /** Schedule start time in HH:MM 24h format (only used when startMode === 'scheduled'). */
  scheduleStart: string;
  /** Schedule end time in HH:MM 24h format (only used when startMode === 'scheduled'). */
  scheduleEnd: string;
  /** Request fullscreen when the screensaver activates. */
  fullscreen: boolean;
  /** Show the seconds in the screensaver clock. */
  showSeconds: boolean;
  /** Show the date below the clock. */
  showDate: boolean;
  /** Attempt to use the Screen Wake Lock API to keep the display on. */
  keepAwake: boolean;
}

const STORAGE_KEY = 'time-twist-screensaver-v3';

const DEFAULT_SETTINGS: ScreensaverSettings = {
  enabled: true,
  startMode: 'idle',
  idleMinutes: 5,
  scheduleStart: '22:00',
  scheduleEnd: '07:00',
  fullscreen: false,
  showSeconds: true,
  showDate: true,
  keepAwake: false,
};

const VALID_IDLE_MINUTES: number[] = [1, 2, 3, 5, 10, 15, 30];
const VALID_START_MODES: StartMode[] = ['never', 'always', 'scheduled', 'idle'];

function isValidHHMM(s: unknown): boolean {
  return typeof s === 'string' && /^\d{2}:\d{2}$/.test(s);
}

function loadSettings(): ScreensaverSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    // Migrate from old v2 key
    if (!raw) {
      const oldRaw = localStorage.getItem('time-twist-screensaver-v2');
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw) as Record<string, any>;
        // Map old autoStart to new startMode
        let startMode: StartMode = 'idle';
        let idleMinutes: IdleMinutesOption = 5;
        if (oldParsed.autoStart === 'never') {
          startMode = 'never';
        } else if (typeof oldParsed.autoStart === 'number' && VALID_IDLE_MINUTES.includes(oldParsed.autoStart)) {
          startMode = 'idle';
          idleMinutes = oldParsed.autoStart as IdleMinutesOption;
        }
        return {
          ...DEFAULT_SETTINGS,
          enabled: typeof oldParsed.enabled === 'boolean' ? oldParsed.enabled : DEFAULT_SETTINGS.enabled,
          startMode,
          idleMinutes,
          fullscreen: typeof oldParsed.fullscreen === 'boolean' ? oldParsed.fullscreen : DEFAULT_SETTINGS.fullscreen,
          showSeconds: typeof oldParsed.showSeconds === 'boolean' ? oldParsed.showSeconds : DEFAULT_SETTINGS.showSeconds,
          showDate: typeof oldParsed.showDate === 'boolean' ? oldParsed.showDate : DEFAULT_SETTINGS.showDate,
          keepAwake: typeof oldParsed.keepAwake === 'boolean' ? oldParsed.keepAwake : DEFAULT_SETTINGS.keepAwake,
        };
      }

      // Migrate from old v1 key
      const v1Raw = localStorage.getItem('time-twist-screensaver');
      if (v1Raw) {
        const v1Parsed = JSON.parse(v1Raw) as { enabled?: boolean; idleMinutes?: number };
        return {
          ...DEFAULT_SETTINGS,
          enabled: typeof v1Parsed.enabled === 'boolean' ? v1Parsed.enabled : DEFAULT_SETTINGS.enabled,
          startMode: 'idle',
          idleMinutes:
            typeof v1Parsed.idleMinutes === 'number' && VALID_IDLE_MINUTES.includes(v1Parsed.idleMinutes)
              ? (v1Parsed.idleMinutes as IdleMinutesOption)
              : DEFAULT_SETTINGS.idleMinutes,
        };
      }

      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<ScreensaverSettings>;

    // Also migrate v2 format
    if ('autoStart' in parsed && !('startMode' in parsed)) {
      const oldAutoStart = (parsed as any).autoStart;
      let startMode: StartMode = 'idle';
      let idleMinutes: IdleMinutesOption = DEFAULT_SETTINGS.idleMinutes;
      if (oldAutoStart === 'never') {
        startMode = 'never';
      } else if (typeof oldAutoStart === 'number' && VALID_IDLE_MINUTES.includes(oldAutoStart)) {
        idleMinutes = oldAutoStart as IdleMinutesOption;
      }
      return {
        ...DEFAULT_SETTINGS,
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled,
        startMode,
        idleMinutes,
        fullscreen: typeof parsed.fullscreen === 'boolean' ? parsed.fullscreen : DEFAULT_SETTINGS.fullscreen,
        showSeconds: typeof parsed.showSeconds === 'boolean' ? parsed.showSeconds : DEFAULT_SETTINGS.showSeconds,
        showDate: typeof parsed.showDate === 'boolean' ? parsed.showDate : DEFAULT_SETTINGS.showDate,
        keepAwake: typeof parsed.keepAwake === 'boolean' ? parsed.keepAwake : DEFAULT_SETTINGS.keepAwake,
      };
    }

    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled,
      startMode: VALID_START_MODES.includes(parsed.startMode as StartMode)
        ? (parsed.startMode as StartMode)
        : DEFAULT_SETTINGS.startMode,
      idleMinutes:
        typeof parsed.idleMinutes === 'number' && VALID_IDLE_MINUTES.includes(parsed.idleMinutes)
          ? (parsed.idleMinutes as IdleMinutesOption)
          : DEFAULT_SETTINGS.idleMinutes,
      scheduleStart: isValidHHMM(parsed.scheduleStart) ? parsed.scheduleStart! : DEFAULT_SETTINGS.scheduleStart,
      scheduleEnd: isValidHHMM(parsed.scheduleEnd) ? parsed.scheduleEnd! : DEFAULT_SETTINGS.scheduleEnd,
      fullscreen: typeof parsed.fullscreen === 'boolean' ? parsed.fullscreen : DEFAULT_SETTINGS.fullscreen,
      showSeconds: typeof parsed.showSeconds === 'boolean' ? parsed.showSeconds : DEFAULT_SETTINGS.showSeconds,
      showDate: typeof parsed.showDate === 'boolean' ? parsed.showDate : DEFAULT_SETTINGS.showDate,
      keepAwake: typeof parsed.keepAwake === 'boolean' ? parsed.keepAwake : DEFAULT_SETTINGS.keepAwake,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: ScreensaverSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

/** Check if the current time falls within the scheduled window (handles overnight ranges). */
function isWithinSchedule(startHHMM: string, endHHMM: string): boolean {
  const now = new Date();
  const [sh, sm] = startHHMM.split(':').map(Number);
  const [eh, em] = endHHMM.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes <= endMinutes) {
    // Same-day range (e.g. 09:00 – 17:00)
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  } else {
    // Overnight range (e.g. 22:00 – 07:00)
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }
}

export function useIdleScreensaver() {
  const [settings, setSettingsState] = useState<ScreensaverSettings>(DEFAULT_SETTINGS);
  const [isIdle, setIsIdle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted settings on mount
  useEffect(() => {
    setSettingsState(loadSettings());
    setMounted(true);
  }, []);

  const shouldActivate = useCallback((s: ScreensaverSettings): boolean => {
    if (!s.enabled) return false;
    switch (s.startMode) {
      case 'never':
        return false;
      case 'always':
        return true;
      case 'scheduled':
        return isWithinSchedule(s.scheduleStart, s.scheduleEnd);
      case 'idle':
        return true; // idle timer controls when it actually fires
      default:
        return false;
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const current = loadSettings();
    if (!shouldActivate(current)) return;

    if (current.startMode === 'idle') {
      timerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, current.idleMinutes * 60 * 1000);
    } else if (current.startMode === 'always') {
      // Activate immediately after idle detection (short delay to avoid instant activation)
      timerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    } else if (current.startMode === 'scheduled') {
      if (isWithinSchedule(current.scheduleStart, current.scheduleEnd)) {
        timerRef.current = setTimeout(() => {
          setIsIdle(true);
        }, 5000);
      }
    }
  }, [shouldActivate]);

  // Wire up activity listeners
  useEffect(() => {
    if (!mounted) return;

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
      'pointerdown',
    ];

    const handle = () => {
      // Only reset if screensaver is not active
      if (!document.fullscreenElement) {
        resetTimer();
      }
    };

    events.forEach((e) => window.addEventListener(e, handle, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handle));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, resetTimer]);

  // For 'scheduled' mode, check every 30s if we should enter/exit screensaver
  useEffect(() => {
    if (!mounted) return;

    if (scheduleIntervalRef.current) clearInterval(scheduleIntervalRef.current);

    const current = loadSettings();
    if (current.startMode !== 'scheduled' || !current.enabled) return;

    scheduleIntervalRef.current = setInterval(() => {
      const s = loadSettings();
      if (s.startMode !== 'scheduled') return;

      if (isWithinSchedule(s.scheduleStart, s.scheduleEnd)) {
        // In schedule window — activate if not already active
        setIsIdle((prev) => {
          if (!prev) {
            setTimeout(() => setIsIdle(true), 1000);
          }
          return prev;
        });
      } else {
        // Outside schedule window — deactivate
        setIsIdle(false);
      }
    }, 30000);

    return () => {
      if (scheduleIntervalRef.current) clearInterval(scheduleIntervalRef.current);
    };
  }, [mounted]);

  // When settings change, persist and restart timer
  useEffect(() => {
    if (!mounted) return;
    saveSettings(settings);
    if (!settings.enabled || settings.startMode === 'never') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsIdle(false);
    } else {
      resetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mounted]);

  const setSettings = useCallback((next: Partial<ScreensaverSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...next };
      saveSettings(updated);
      return updated;
    });
  }, []);

  /** Manually activate the screensaver immediately (e.g. from a button). */
  const activateManually = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsIdle(true);
  }, []);

  const dismiss = useCallback(() => {
    setIsIdle(false);
    resetTimer();
  }, [resetTimer]);

  return { isIdle, settings, setSettings, dismiss, mounted, activateManually };
}
