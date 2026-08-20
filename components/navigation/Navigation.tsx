'use client';

import React from 'react';
import { Clock, Globe, Timer, AlarmClock, Hourglass, Settings } from 'lucide-react';

export type NavTab = 'clock' | 'world' | 'stopwatch' | 'timer' | 'alarm' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: NavTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'clock', label: 'Clock', shortLabel: 'Clock', icon: Clock },
    { id: 'world', label: 'World Clock', shortLabel: 'World', icon: Globe },
    { id: 'stopwatch', label: 'Stopwatch', shortLabel: 'Stopwatch', icon: Timer },
    { id: 'timer', label: 'Timer', shortLabel: 'Timer', icon: Hourglass },
    { id: 'alarm', label: 'Alarm', shortLabel: 'Alarm', icon: AlarmClock },
    { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav aria-label="Main Navigation" className="hidden md:flex justify-center my-6">
        <div className="inline-flex p-1.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-inner flex-wrap justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-primary)] border-t border-[var(--border-color)] backdrop-blur-lg bg-opacity-95 px-1 py-1">
        <div className="flex justify-around items-center h-14 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 h-full text-xs font-medium transition-all ${
                  isActive
                    ? 'text-blue-400 scale-105 font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-[9px] sm:text-[10px] truncate max-w-full px-0.5">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
