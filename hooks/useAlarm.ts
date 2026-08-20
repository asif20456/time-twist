'use client';

import { useState, useEffect, useRef } from 'react';
import { getItem, setItem } from '@/lib/storage';
import { soundManager } from '@/lib/audio';

export interface AlarmItem {
  id: string;
  time: string; // "HH:MM" in 24h
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

const DEFAULT_ALARMS: AlarmItem[] = [
  { id: '1', time: '07:00', label: 'Morning Wakeup', enabled: true, repeatDays: [1, 2, 3, 4, 5] },
  { id: '2', time: '08:30', label: 'Work Standup', enabled: false, repeatDays: [1, 2, 3, 4, 5] }
];

export function useAlarm() {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);
  const [mounted, setMounted] = useState(false);

  const lastCheckedMinuteRef = useRef<string>('');

  useEffect(() => {
    const saved = getItem<AlarmItem[]>('time-twist-alarms', DEFAULT_ALARMS);
    setAlarms(saved);
    setMounted(true);
  }, []);

  const saveAlarms = (newAlarms: AlarmItem[]) => {
    setAlarms(newAlarms);
    setItem('time-twist-alarms', newAlarms);
  };

  const addAlarm = (time: string, label: string, repeatDays: number[] = []) => {
    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time,
      label: label || 'Alarm',
      enabled: true,
      repeatDays
    };
    saveAlarms([...alarms, newAlarm]);
  };

  const toggleAlarm = (id: string) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    saveAlarms(updated);
  };

  const deleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    saveAlarms(updated);
  };

  const dismissActiveAlarm = () => {
    setActiveRingingAlarm(null);
    soundManager.stopAlarmLoop();
  };

  const snoozeActiveAlarm = (minutes: number = 5) => {
    if (!activeRingingAlarm) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    
    // Add temporary snooze alarm
    addAlarm(`${h}:${m}`, `Snoozed (${activeRingingAlarm.label})`, []);
    dismissActiveAlarm();
  };

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const currentMinuteStr = `${h}:${m}`;
      const currentDay = now.getDay();

      if (currentMinuteStr === lastCheckedMinuteRef.current) return;
      lastCheckedMinuteRef.current = currentMinuteStr;

      // Check matching alarm
      const triggered = alarms.find((a) => {
        if (!a.enabled) return false;
        if (a.time !== currentMinuteStr) return false;
        if (a.repeatDays.length > 0 && !a.repeatDays.includes(currentDay)) return false;
        return true;
      });

      if (triggered && !activeRingingAlarm) {
        setActiveRingingAlarm(triggered);
        soundManager.startAlarmLoop();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, mounted, activeRingingAlarm]);

  return {
    alarms,
    activeRingingAlarm,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
    dismissActiveAlarm,
    snoozeActiveAlarm,
    mounted
  };
}
