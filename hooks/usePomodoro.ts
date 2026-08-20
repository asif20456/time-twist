'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getItem, setItem } from '@/lib/storage';
import { soundManager } from '@/lib/audio';

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak' | 'idle';

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface PomodoroStats {
  totalSessions: number;
  totalWorkMinutes: number;
  todaySessions: number;
  todayWorkMinutes: number;
  lastSessionDate: string;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

const DEFAULT_STATS: PomodoroStats = {
  totalSessions: 0,
  totalWorkMinutes: 0,
  todaySessions: 0,
  todayWorkMinutes: 0,
  lastSessionDate: '',
};

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<PomodoroStats>(DEFAULT_STATS);
  const [phase, setPhase] = useState<PomodoroPhase>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [totalInitialSeconds, setTotalInitialSeconds] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedSettings = getItem<PomodoroSettings>('time-twist-pomodoro-settings', DEFAULT_SETTINGS);
    const savedStats = getItem<PomodoroStats>('time-twist-pomodoro-stats', DEFAULT_STATS);
    const savedPhase = getItem<PomodoroPhase>('time-twist-pomodoro-phase', 'idle');
    const savedRemaining = getItem<number>('time-twist-pomodoro-remaining', 0);
    const savedRunning = getItem<boolean>('time-twist-pomodoro-running', false);
    const savedSessions = getItem<number>('time-twist-pomodoro-sessions', 0);

    // Reset daily stats if date changed
    const today = getTodayStr();
    if (savedStats.lastSessionDate !== today) {
      savedStats.todaySessions = 0;
      savedStats.todayWorkMinutes = 0;
      savedStats.lastSessionDate = today;
    }

    setSettings(savedSettings);
    setStats(savedStats);
    setCompletedSessions(savedSessions);

    if (savedPhase !== 'idle' && savedRemaining > 0) {
      setPhase(savedPhase);
      setRemainingSeconds(savedRemaining);
      setTotalInitialSeconds(savedPhase === 'work' ? savedSettings.workMinutes * 60 :
        savedPhase === 'shortBreak' ? savedSettings.shortBreakMinutes * 60 :
        savedSettings.longBreakMinutes * 60);
      // Don't auto-resume running state, let user decide
    }
  }, []);

  const saveStats = useCallback((newStats: PomodoroStats) => {
    setStats(newStats);
    setItem('time-twist-pomodoro-stats', newStats);
  }, []);

  const saveState = useCallback((newPhase: PomodoroPhase, newRemaining: number, newRunning: boolean, newSessions: number) => {
    setItem('time-twist-pomodoro-phase', newPhase);
    setItem('time-twist-pomodoro-remaining', newRemaining);
    setItem('time-twist-pomodoro-running', newRunning);
    setItem('time-twist-pomodoro-sessions', newSessions);
  }, []);

  const completePhase = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);

    if (phase === 'work') {
      // Update stats
      const today = getTodayStr();
      const newSessions = completedSessions + 1;
      setCompletedSessions(newSessions);
      saveState('idle', 0, false, newSessions);

      const newStats: PomodoroStats = {
        totalSessions: stats.totalSessions + 1,
        totalWorkMinutes: stats.totalWorkMinutes + settings.workMinutes,
        todaySessions: (stats.lastSessionDate === today ? stats.todaySessions : 0) + 1,
        todayWorkMinutes: (stats.lastSessionDate === today ? stats.todayWorkMinutes : 0) + settings.workMinutes,
        lastSessionDate: today,
      };
      saveStats(newStats);

      // Determine next break
      if (newSessions % settings.sessionsBeforeLongBreak === 0) {
        setPhase('longBreak');
        setRemainingSeconds(settings.longBreakMinutes * 60);
        setTotalInitialSeconds(settings.longBreakMinutes * 60);
      } else {
        setPhase('shortBreak');
        setRemainingSeconds(settings.shortBreakMinutes * 60);
        setTotalInitialSeconds(settings.shortBreakMinutes * 60);
      }
      soundManager.playChime();
    } else {
      // Break completed, go to idle
      setPhase('idle');
      setRemainingSeconds(0);
      setTotalInitialSeconds(0);
      saveState('idle', 0, false, completedSessions);
      soundManager.playChime();
    }
  }, [phase, completedSessions, settings, stats, saveStats, saveState]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            completePhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, completePhase]);

  const startWork = useCallback(() => {
    soundManager.unlockAudio();
    const total = settings.workMinutes * 60;
    setPhase('work');
    setRemainingSeconds(total);
    setTotalInitialSeconds(total);
    setIsRunning(true);
    saveState('work', total, true, completedSessions);
  }, [settings, completedSessions, saveState]);

  const startBreak = useCallback(() => {
    soundManager.unlockAudio();
    const isLong = (completedSessions + 1) % settings.sessionsBeforeLongBreak === 0;
    const total = isLong ? settings.longBreakMinutes * 60 : settings.shortBreakMinutes * 60;
    const newPhase: PomodoroPhase = isLong ? 'longBreak' : 'shortBreak';
    setPhase(newPhase);
    setRemainingSeconds(total);
    setTotalInitialSeconds(total);
    setIsRunning(true);
    saveState(newPhase, total, true, completedSessions);
  }, [settings, completedSessions, saveState]);

  const pause = useCallback(() => {
    setIsRunning(false);
    saveState(phase, remainingSeconds, false, completedSessions);
  }, [phase, remainingSeconds, completedSessions, saveState]);

  const resume = useCallback(() => {
    soundManager.unlockAudio();
    setIsRunning(true);
    saveState(phase, remainingSeconds, true, completedSessions);
  }, [phase, remainingSeconds, completedSessions, saveState]);

  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('idle');
    setRemainingSeconds(0);
    setTotalInitialSeconds(0);
    setIsRunning(false);
    saveState('idle', 0, false, completedSessions);
    soundManager.stopAlarmLoop();
  }, [completedSessions, saveState]);

  const skipPhase = useCallback(() => {
    completePhase();
  }, [completePhase]);

  const updateSettings = useCallback((newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    setItem('time-twist-pomodoro-settings', newSettings);
  }, []);

  const resetStats = useCallback(() => {
    const freshStats: PomodoroStats = {
      totalSessions: 0,
      totalWorkMinutes: 0,
      todaySessions: 0,
      todayWorkMinutes: 0,
      lastSessionDate: getTodayStr(),
    };
    setStats(freshStats);
    setCompletedSessions(0);
    setItem('time-twist-pomodoro-stats', freshStats);
    setItem('time-twist-pomodoro-sessions', 0);
  }, []);

  const progressPercent = totalInitialSeconds > 0
    ? Math.max(0, Math.min(100, ((totalInitialSeconds - remainingSeconds) / totalInitialSeconds) * 100))
    : 0;

  return {
    settings,
    stats,
    phase,
    remainingSeconds,
    isRunning,
    completedSessions,
    totalInitialSeconds,
    progressPercent,
    startWork,
    startBreak,
    pause,
    resume,
    reset,
    skipPhase,
    updateSettings,
    resetStats,
  };
}
