'use client';

import { useState, useEffect } from 'react';
import { getItem, setItem } from '@/lib/storage';
import { getFormattedClock } from '@/lib/time';

export function useClock() {
  const [now, setNow] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(false);
  const [isManualTime, setIsManualTime] = useState<boolean>(false);
  const [manualOffsetMs, setManualOffsetMs] = useState<number>(0);
  const [userTimezone, setUserTimezoneState] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  const defaultTimezone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  useEffect(() => {
    const saved24 = getItem<boolean>('time-twist-24h', false);
    const savedManualMode = getItem<boolean>('time-twist-manual-mode', false);
    const savedOffset = getItem<number>('time-twist-manual-offset', 0);
    const savedTz = getItem<string>('time-twist-user-timezone', '');

    setIs24Hour(saved24);
    setIsManualTime(savedManualMode);
    setManualOffsetMs(savedOffset);
    setUserTimezoneState(savedTz || defaultTimezone);
    setMounted(true);

    const calcNow = () => {
      const realMs = Date.now();
      const currentOffset = getItem<number>('time-twist-manual-offset', savedOffset);
      const isManual = getItem<boolean>('time-twist-manual-mode', savedManualMode);
      
      if (isManual) {
        return new Date(realMs + currentOffset);
      }
      return new Date(realMs);
    };

    setNow(calcNow());

    const interval = setInterval(() => {
      setNow(calcNow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggle24Hour = () => {
    setIs24Hour((prev) => {
      const next = !prev;
      setItem('time-twist-24h', next);
      return next;
    });
  };

  const setTimezone = (tz: string) => {
    setUserTimezoneState(tz);
    setItem('time-twist-user-timezone', tz);
  };

  const resetTimezone = () => {
    setUserTimezoneState(defaultTimezone);
    setItem('time-twist-user-timezone', defaultTimezone);
  };

  const setManualTimeAndDate = (dateStr: string, timeStr: string) => {
    try {
      const targetDate = new Date(`${dateStr}T${timeStr}:00`);
      if (isNaN(targetDate.getTime())) return false;

      const offset = targetDate.getTime() - Date.now();
      setIsManualTime(true);
      setManualOffsetMs(offset);
      setItem('time-twist-manual-mode', true);
      setItem('time-twist-manual-offset', offset);
      setNow(new Date(Date.now() + offset));
      return true;
    } catch (e) {
      console.warn('Error setting manual time:', e);
      return false;
    }
  };

  const resetToDeviceTime = () => {
    setIsManualTime(false);
    setManualOffsetMs(0);
    setItem('time-twist-manual-mode', false);
    setItem('time-twist-manual-offset', 0);
    setNow(new Date());
  };

  const activeTz = userTimezone || defaultTimezone;
  const formatted = getFormattedClock(now, is24Hour, activeTz);

  return {
    now,
    is24Hour,
    toggle24Hour,
    isManualTime,
    manualOffsetMs,
    setManualTimeAndDate,
    resetToDeviceTime,
    formatted,
    userTimezone: activeTz,
    setTimezone,
    resetTimezone,
    mounted
  };
}
