'use client';

import React from 'react';
import { DigitalClock } from '@/components/clock/DigitalClock';
import { AnalogClock } from '@/components/clock/AnalogClock';
import { NavTab } from '@/components/navigation/Navigation';
import { Globe, Timer, Hourglass, AlarmClock, ChevronRight } from 'lucide-react';
import { getFormattedClock } from '@/lib/time';

interface DashboardProps {
  now: Date;
  is24Hour: boolean;
  isManualTime?: boolean;
  userTimezone: string;
  setActiveTab: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  now,
  is24Hour,
  isManualTime,
  userTimezone,
  setActiveTab,
}) => {
  const clock = getFormattedClock(now, is24Hour);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 overflow-hidden">
      
      {/* Primary Hallmark Visual Focus: Workbench Hero Section */}
      <div className="card-glass p-5 sm:p-8 md:p-12 relative overflow-hidden bg-gradient-to-b from-[var(--bg-card)] via-[var(--bg-secondary)] to-[var(--bg-primary)]">
        
        {/* Backdrop Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
          
          {/* Digital Clock Section */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <DigitalClock
              hours={clock.hours}
              minutes={clock.minutes}
              seconds={clock.seconds}
              dayPeriod={clock.dayPeriod}
              fullDateStr={clock.fullDateStr}
              timezoneName={userTimezone}
              is24Hour={is24Hour}
              isManualTime={isManualTime}
            />
          </div>

          {/* Analog Clock Section */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <AnalogClock date={now} />
          </div>

        </div>

      </div>

      {/* Quick Action Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <button
          onClick={() => setActiveTab('world')}
          className="card-glass p-5 sm:p-6 text-left group hover:scale-[1.02] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">World Clock</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Track real-time hours across international time zones
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('stopwatch')}
          className="card-glass p-5 sm:p-6 text-left group hover:scale-[1.02] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Timer className="w-6 h-6" />
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Stopwatch</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Precision millisecond timer with lap history tracking
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className="card-glass p-5 sm:p-6 text-left group hover:scale-[1.02] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Hourglass className="w-6 h-6" />
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Countdown Timer</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Customizable countdown alarms with audio chimes
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('alarm')}
          className="card-glass p-5 sm:p-6 text-left group hover:scale-[1.02] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <AlarmClock className="w-6 h-6" />
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Alarms</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Manage daily alarms, repeat days, and snooze options
            </p>
          </div>
        </button>

      </div>

    </div>
  );
};
