'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Clock, Wifi, WifiOff, MonitorPlay } from 'lucide-react';
import { ThemeMode } from '@/hooks/useTheme';

interface HeaderProps {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  is24Hour: boolean;
  toggle24Hour: () => void;
  /** Optional callback to immediately launch the screen saver. */
  onActivateScreensaver?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, is24Hour, toggle24Hour, onActivateScreensaver }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Identity & Online/Offline Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-bold">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Time Twist ⏱️
              </h1>
              
              {/* Online / Offline Status Badge */}
              {isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold" title="App is connected online">
                  <Wifi className="w-2.5 h-2.5" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold" title="App is working offline">
                  <WifiOff className="w-2.5 h-2.5" /> Offline
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block">Smart Clock & Time Tools</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Screen Saver quick-launch */}
          {onActivateScreensaver && (
            <button
              onClick={onActivateScreensaver}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-indigo-500/50 text-[var(--text-primary)] transition-all shadow-sm"
              title="Activate Screen Saver"
              aria-label="Activate Screen Saver"
            >
              <MonitorPlay className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          {/* 12h / 24h Toggle Button */}
          <button
            onClick={toggle24Hour}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 text-[var(--text-primary)] transition-all shadow-sm"
            title="Toggle 12h / 24h format (or press T)"
          >
            {is24Hour ? '24H' : '12H'}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 text-[var(--text-primary)] transition-all shadow-sm"
            title={`Current theme: ${theme}. Click to cycle.`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-indigo-400" />}
          </button>

        </div>
      </div>
    </header>
  );
};
