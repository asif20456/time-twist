/* Hallmark · component: analog-clock · genre: atmospheric · theme: Cobalt
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */

'use client';

import React from 'react';

interface AnalogClockProps {
  date: Date;
  timezone?: string;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ date, timezone }) => {
  let seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  let minutes = date.getMinutes() + seconds / 60;
  let hours = (date.getHours() % 12) + minutes / 60;

  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        fractionalSecondDigits: 3,
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      let h = 0, m = 0, s = 0, ms = 0;
      parts.forEach((p) => {
        if (p.type === 'hour') h = parseInt(p.value, 10);
        if (p.type === 'minute') m = parseInt(p.value, 10);
        if (p.type === 'second') s = parseInt(p.value, 10);
        if (p.type === 'fractionalSecond') ms = parseInt(p.value, 10);
      });
      seconds = s + ms / 1000;
      minutes = m + seconds / 60;
      hours = (h % 12) + minutes / 60;
    } catch (e) {
      // fallback to device time if invalid timezone
    }
  }

  const secDegrees = seconds * 6;
  const minDegrees = minutes * 6;
  const hourDegrees = hours * 30;

  // 60 Tick marks around perimeter (12 major, 48 minor)
  const ticks = Array.from({ length: 60 }, (_, i) => i * 6);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="clock-face relative group">

        {/* Ambient Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 via-cyan-500/10 to-purple-600/10 blur-2xl pointer-events-none group-hover:scale-105 transition-transform duration-500" />

        {/* Outer Metallic Bezel Ring */}
        <div className="absolute inset-1 rounded-full border border-white/10 shadow-inner pointer-events-none" />

        {/* Inner Concentric Track Ring (Chronograph Detail) */}
        <div className="absolute inset-8 rounded-full border border-dashed border-blue-500/15 pointer-events-none" />
        <div className="absolute inset-14 rounded-full border border-white/5 pointer-events-none" />

        {/* 60 Precision Tick Marks */}
        {ticks.map((deg, idx) => {
          const isMajor = idx % 5 === 0;
          return (
            <div
              key={deg}
              className="absolute w-full h-full flex justify-center items-start pt-2 pointer-events-none"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  isMajor
                    ? idx % 15 === 0
                      ? 'w-1.5 h-4 bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                      : 'w-1 h-3 bg-blue-300/80 shadow-[0_0_4px_rgba(59,130,246,0.4)]'
                    : 'w-0.5 h-1.5 bg-slate-500/40'
                }`}
              />
            </div>
          );
        })}

        {/* Key Numerals (12, 3, 6, 9) */}
        <span className="absolute top-7 text-xs sm:text-sm font-extrabold font-mono text-slate-200 tracking-tight select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">12</span>
        <span className="absolute right-7 text-xs sm:text-sm font-extrabold font-mono text-slate-200 tracking-tight select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">3</span>
        <span className="absolute bottom-7 text-xs sm:text-sm font-extrabold font-mono text-slate-200 tracking-tight select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">6</span>
        <span className="absolute left-7 text-xs sm:text-sm font-extrabold font-mono text-slate-200 tracking-tight select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">9</span>

        {/* Black Wolf Logo Emblem */}
        <div className="absolute top-[21%] flex flex-col items-center justify-center pointer-events-none select-none z-0">
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              <linearGradient id="blackWolfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="wolfCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="wolfShieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Shield / Outer Crest Frame */}
            <circle cx="50" cy="50" r="46" fill="#060a12" fillOpacity="0.8" stroke="url(#wolfShieldRim)" strokeWidth="1.5" strokeDasharray="5 2" />

            {/* Base Wolf Head Contour */}
            <path
              d="M50 84 L32 62 L18 46 L24 26 L14 8 L34 20 L50 26 L66 20 L86 8 L76 26 L82 46 L68 62 Z"
              fill="url(#blackWolfGradient)"
              stroke="#475569"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Ears Internal Shadows */}
            <polygon points="24,26 17,11 31,21" fill="#020617" />
            <polygon points="76,26 83,11 69,21" fill="#020617" />

            {/* Crown / Forehead Shading */}
            <polygon points="50,26 34,20 38,36 50,44" fill="#334155" fillOpacity="0.4" />
            <polygon points="50,26 66,20 62,36 50,44" fill="#1e293b" fillOpacity="0.6" />

            {/* Cheek & Jaw Angles */}
            <polygon points="38,36 18,46 32,62 44,52" fill="#0f172a" />
            <polygon points="62,36 82,46 68,62 56,52" fill="#1e293b" />

            {/* Snout Bridge & Nose */}
            <polygon points="50,44 38,36 44,52 50,65" fill="#1e293b" />
            <polygon points="50,44 62,36 56,52 50,65" fill="#334155" fillOpacity="0.5" />
            <polygon points="50,65 32,62 50,84 68,62" fill="#020617" />

            {/* Nose Tip */}
            <polygon points="45,64 55,64 50,70" fill="#38bdf8" fillOpacity="0.9" />

            {/* Piercing Wolf Eyes */}
            <polygon points="31,41 42,44 36,46" fill="url(#wolfCyanGlow)" />
            <polygon points="69,41 58,44 64,46" fill="url(#wolfCyanGlow)" />
          </svg>
          <span className="text-[8px] font-extrabold tracking-[0.3em] text-slate-300 uppercase opacity-90 mt-0.5 font-mono drop-shadow-sm">WOLF</span>
        </div>

        {/* Hour Hand (Luxury Tapered Sword Hand) */}
        <div
          className="absolute w-full h-full flex justify-center items-center pointer-events-none z-10"
          style={{ transform: `rotate(${hourDegrees}deg)` }}
        >
          <div className="relative -mt-16 origin-bottom flex flex-col items-center">
            <div className="w-2 h-16 bg-gradient-to-t from-slate-200 via-white to-slate-300 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.8)] border border-slate-400/30">
              <div className="w-0.5 h-12 bg-blue-500/80 mx-auto mt-1 rounded-full" />
            </div>
          </div>
        </div>

        {/* Minute Hand (Precision Tapered Blue Illuminated Hand) */}
        <div
          className="absolute w-full h-full flex justify-center items-center pointer-events-none z-20"
          style={{ transform: `rotate(${minDegrees}deg)` }}
        >
          <div className="relative -mt-24 origin-bottom flex flex-col items-center">
            <div className="w-1.5 h-24 bg-gradient-to-t from-blue-600 via-cyan-400 to-blue-200 rounded-full shadow-[0_4px_14px_rgba(6,182,212,0.6)] border border-cyan-300/40">
              <div className="w-0.5 h-18 bg-white mx-auto mt-1 rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        {/* Second Hand (Sweeping Crimson Needle) */}
        <div
          className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
          style={{ transform: `rotate(${secDegrees}deg)` }}
        >
          <div className="relative -mt-24 origin-bottom flex flex-col items-center">
            <div className="w-0.5 h-28 bg-gradient-to-t from-red-600 to-red-400 rounded-full shadow-[0_2px_10px_rgba(239,68,68,0.8)]" />
            <div className="w-2 h-2 rounded-full border-2 border-red-500 bg-red-600 mt-6 shadow-sm opacity-90" />
          </div>
        </div>

        {/* Center Pin Multi-layer Jewel Cap */}
        <div className="absolute z-40 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-full border-2 border-slate-300 shadow-xl flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full border border-white shadow-inner" />
          </div>
        </div>

        {/* Subtle Glass Lens Reflection Overlayer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

      </div>
    </div>
  );
};
