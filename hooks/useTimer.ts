'use client';

import { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/lib/audio';

export function useTimer() {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(0);

  const [totalInitialSeconds, setTotalInitialSeconds] = useState<number>(300);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  const start = () => {
    soundManager.unlockAudio();

    if (!isPaused) {
      const calculatedTotal = hours * 3600 + minutes * 60 + seconds;
      if (calculatedTotal <= 0) return;
      setTotalInitialSeconds(calculatedTotal);
      setRemainingSeconds(calculatedTotal);
    }

    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
  };

  const pause = () => {
    setIsRunning(false);
    setIsPaused(true);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resume = () => {
    start();
  };

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const calculatedTotal = hours * 3600 + minutes * 60 + seconds;
    setRemainingSeconds(calculatedTotal || 300);
    soundManager.stopAlarmLoop();
  };

  const setPreset = (hrs: number, mins: number, secs: number) => {
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
    const total = hrs * 3600 + mins * 60 + secs;
    setTotalInitialSeconds(total);
    setRemainingSeconds(total);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
  };

  const dismissAlarm = () => {
    setIsCompleted(false);
    soundManager.stopAlarmLoop();
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setIsRunning(false);
            setIsPaused(false);
            setIsCompleted(true);
            soundManager.startAlarmLoop();
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
  }, [isRunning]);

  const progressPercent = totalInitialSeconds > 0
    ? Math.max(0, Math.min(100, ((totalInitialSeconds - remainingSeconds) / totalInitialSeconds) * 100))
    : 0;

  return {
    hours,
    minutes,
    seconds,
    setHours,
    setMinutes,
    setSeconds,
    remainingSeconds,
    totalInitialSeconds,
    isRunning,
    isPaused,
    isCompleted,
    progressPercent,
    start,
    pause,
    resume,
    reset,
    setPreset,
    dismissAlarm
  };
}
