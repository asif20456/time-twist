'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { Navigation, NavTab } from '@/components/navigation/Navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { WorldClock } from '@/components/world-clock/WorldClock';
import { Stopwatch } from '@/components/stopwatch/Stopwatch';
import { CountdownTimer } from '@/components/timer/CountdownTimer';
import { AlarmManager } from '@/components/alarm/AlarmManager';
import { Settings } from '@/components/settings/Settings';
import { useClock } from '@/hooks/useClock';
import { useTheme } from '@/hooks/useTheme';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff, Hourglass } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('clock');
  const isOnline = useOnlineStatus();
  const {
    now,
    is24Hour,
    toggle24Hour,
    isManualTime,
    setManualTimeAndDate,
    resetToDeviceTime,
    userTimezone,
    mounted: clockMounted
  } = useClock();
  const { theme, setTheme, mounted: themeMounted } = useTheme();

  if (!clockMounted || !themeMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading Time Twist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors overflow-x-hidden">
      
      {/* Sticky Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        is24Hour={is24Hour}
        toggle24Hour={toggle24Hour}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 pb-20 md:pb-12">
        
        {/* Navigation Bar */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Views */}
        <div className="mt-2 transition-all duration-300">
          {activeTab === 'clock' && (
            <Dashboard
              now={now}
              is24Hour={is24Hour}
              isManualTime={isManualTime}
              userTimezone={userTimezone}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'world' && <WorldClock is24Hour={is24Hour} />}

          {activeTab === 'stopwatch' && <Stopwatch />}

          {activeTab === 'timer' && <CountdownTimer />}

          {activeTab === 'alarm' && <AlarmManager />}

          {activeTab === 'settings' && (
            <Settings
              theme={theme}
              setTheme={setTheme}
              is24Hour={is24Hour}
              toggle24Hour={toggle24Hour}
              isManualTime={isManualTime}
              setManualTimeAndDate={setManualTimeAndDate}
              resetToDeviceTime={resetToDeviceTime}
            />
          )}
        </div>

      </main>

      {/* Prominent Footer */}
      <footer className="py-8 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          
          {/* TIME IS PRECIOUS Quote Banner */}
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 uppercase">
            <Hourglass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>TIME IS PRECIOUS, DO NOT WASTE IT</span>
            <Hourglass className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span>© {new Date().getFullYear()} Time Twist ⏱️. All rights reserved.</span>
            
            {/* Live Online / Offline Status Badge */}
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-[11px]">
                <WifiOff className="w-3 h-3" /> Offline Mode (Cached PWA)
              </span>
            )}
          </div>

        </div>
      </footer>

    </div>
  );
}
