'use client';

import React from 'react';

interface AnalogClockProps {
  date: Date;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ date }) => {
  const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;

  const secDegrees = seconds * 6;
  const minDegrees = minutes * 6;
  const hourDegrees = hours * 30;

  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="clock-face relative">

        {/* Ambient Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

        {/* Hour Ticks */}
        {ticks.map((deg, idx) => (
          <div
            key={deg}
            className="absolute w-full h-full flex justify-center items-start pt-2.5 pointer-events-none"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div
              className={`rounded-full ${
                idx % 3 === 0
                  ? 'w-1.5 h-4 bg-blue-400 shadow-sm shadow-blue-400/50'
                  : 'w-0.5 h-2.5 bg-[var(--text-muted)] opacity-60'
              }`}
            />
          </div>
        ))}

        {/* Key Numerals (12, 3, 6, 9) */}
        <span className="absolute top-7 text-xs font-bold font-mono text-[var(--text-secondary)] select-none">12</span>
        <span className="absolute right-7 text-xs font-bold font-mono text-[var(--text-secondary)] select-none">3</span>
        <span className="absolute bottom-7 text-xs font-bold font-mono text-[var(--text-secondary)] select-none">6</span>
        <span className="absolute left-7 text-xs font-bold font-mono text-[var(--text-secondary)] select-none">9</span>

        {/* Hour Hand */}
        <div
          className="absolute w-full h-full flex justify-center items-center pointer-events-none"
          style={{ transform: `rotate(${hourDegrees}deg)` }}
        >
          <div className="w-1.5 h-16 bg-slate-100 rounded-full -mt-16 origin-bottom shadow-lg" />
        </div>

        {/* Minute Hand */}
        <div
          className="absolute w-full h-full flex justify-center items-center pointer-events-none"
          style={{ transform: `rotate(${minDegrees}deg)` }}
        >
          <div className="w-1 h-24 bg-blue-400 rounded-full -mt-24 origin-bottom shadow-md shadow-blue-400/40" />
        </div>

        {/* Second Hand */}
        <div
          className="absolute w-full h-full flex justify-center items-center pointer-events-none"
          style={{ transform: `rotate(${secDegrees}deg)` }}
        >
          <div className="w-0.5 h-28 bg-red-500 rounded-full -mt-24 origin-bottom shadow-lg shadow-red-500/60" />
          <div className="w-1 h-6 bg-red-500 rounded-full mt-6 opacity-80" />
        </div>

        {/* Center Pin Cap */}
        <div className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md z-10" />

      </div>
    </div>
  );
};
