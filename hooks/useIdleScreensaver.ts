'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ScreensaverSettings {
  enabled: boolean;
  idleMinutes: number;
}

const STORAGE_KEY = 'time-twist-screensaver';
const DEFAULT_SETTINGS: ScreensaverSettings = { enabled: true, idleMinutes: 3 };

function loadSettings(): ScreensaverSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ScreensaverSettings>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled,
      idleMinutes:
        typeof parsed.idleMinutes === 'number' &&
        parsed.idleMinutes >= 1 &&
        parsed.idleMinutes <= 10
          ? parsed.idleMinutes
          : DEFAULT_SETTINGS.idleMinutes,
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

export function useIdleScreensaver() {
  const [settings, setSettingsState] = useState<ScreensaverSettings>(DEFAULT_SETTINGS);
  const [isIdle, setIsIdle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted settings on mount
  useEffect(() => {
    setSettingsState(loadSettings());
    setMounted(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsIdle(false);

    // Re-read latest settings inside the callback so closure isn't stale
    const current = loadSettings();
    if (!current.enabled) return;

    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, current.idleMinutes * 60 * 1000);
  }, []);

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

    const handle = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handle, { passive: true }));
    // Kick off the initial timer
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handle));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, resetTimer]);

  // When settings change, restart timer with new values
  useEffect(() => {
    if (!mounted) return;
    saveSettings(settings);
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mounted]);

  const setSettings = useCallback((next: Partial<ScreensaverSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...next };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const dismiss = useCallback(() => {
    setIsIdle(false);
    resetTimer();
  }, [resetTimer]);

  return { isIdle, settings, setSettings, dismiss, mounted };
}
