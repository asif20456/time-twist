'use client';

import React from 'react';
import { Calendar, Globe, Sliders } from 'lucide-react';

interface DigitalClockProps {
  hours: string;
  minutes: string;
  seconds: string;
  dayPeriod: string;
  fullDateStr: string;
  timezoneName: string;
  is24Hour: boolean;
  isManualTime?: boolean;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({
  hours,
  minutes,
  seconds,
  dayPeriod,
  fullDateStr,
  timezoneName,
  is24Hour,
  isManualTime,
}) => {
  return (
    <div className="w-full flex flex-col items-center lg:items-start justify-center p-2 sm:p-4 text-center lg:text-left">
      
      {/* Main Time Display */}
      <div className="flex items-baseline justify-center lg:justify-start font-mono font-extrabold tracking-tight select-none my-2 text-[var(--text-primary)]">
        <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[var(--text-primary)]">
          {hours}:{minutes}
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-500 font-bold ml-1.5 sm:ml-2">
          :{seconds}
        </span>
        {!is24Hour && dayPeriod && (
          <span className="ml-2 sm:ml-3 text-base sm:text-2xl font-sans font-extrabold text-indigo-500 tracking-wider">
            {dayPeriod}
          </span>
        )}
      </div>

      {/* Date & Timezone Badges */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mt-4 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm">
          <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>{fullDateStr}</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm">
          <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>{timezoneName || 'Local Time'}</span>
        </div>

        {isManualTime && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-semibold text-xs shadow-sm">
            <Sliders className="w-3.5 h-3.5" />
            <span>Manual Time Active</span>
          </div>
        )}
      </div>

    </div>
  );
};
