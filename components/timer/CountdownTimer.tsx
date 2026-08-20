'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Hourglass, BellOff, CheckCircle2 } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { formatTimerTime } from '@/lib/time';

export const CountdownTimer: React.FC = () => {
  const {
    hours,
    minutes,
    seconds,
    setHours,
    setMinutes,
    setSeconds,
    remainingSeconds,
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
  } = useTimer();

  const formatted = formatTimerTime(remainingSeconds);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 text-[var(--text-primary)]">
          <Hourglass className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          <span>Countdown Timer</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Set custom countdown timers with audio alerts</p>
      </div>

      {/* Main Timer Display */}
      <div className="card-glass w-full p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden my-2 sm:my-4">
        
        {/* Circular Progress Bar Background */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border-8 border-[var(--border-color)] relative flex items-center justify-center shadow-inner my-2 sm:my-4">
          <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time text or Input Pickers */}
          {!isRunning && !isPaused ? (
            <div className="flex items-center gap-1 font-mono text-xl sm:text-3xl font-bold z-10">
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 sm:w-16 h-10 sm:h-12 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 text-sm sm:text-base font-bold"
                />
                <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-1 font-sans">HRS</span>
              </div>
              <span className="text-[var(--text-muted)]">:</span>
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-12 sm:w-16 h-10 sm:h-12 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 text-sm sm:text-base font-bold"
                />
                <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-1 font-sans">MIN</span>
              </div>
              <span className="text-[var(--text-muted)]">:</span>
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-12 sm:w-16 h-10 sm:h-12 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 text-sm sm:text-base font-bold"
                />
                <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-1 font-sans">SEC</span>
              </div>
            </div>
          ) : (
            <div className="font-mono text-3xl sm:text-5xl font-black text-[var(--text-primary)] z-10">
              {formatted.formatted}
            </div>
          )}
        </div>

        {/* Preset Buttons */}
        {!isRunning && !isPaused && (
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {[
              { label: '+1m', h: 0, m: 1, s: 0 },
              { label: '+5m', h: 0, m: 5, s: 0 },
              { label: '+10m', h: 0, m: 10, s: 0 },
              { label: '+15m', h: 0, m: 15, s: 0 },
              { label: '+30m', h: 0, m: 30, s: 0 },
              { label: '+1h', h: 1, m: 0, s: 0 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setPreset(p.h, p.m, p.s)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          {!isRunning ? (
            <button
              onClick={isPaused ? resume : start}
              className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base shadow-lg shadow-blue-500/30"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>{isPaused ? 'Resume' : 'Start'}</span>
            </button>
          ) : (
            <button
              onClick={pause}
              className="btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {(isRunning || isPaused) && (
            <button
              onClick={reset}
              className="btn-danger px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Completion Modal / Ringing Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-glass w-full max-w-md p-6 sm:p-8 text-center alarm-ringing-pulse flex flex-col items-center">
            
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-[var(--text-primary)]">Timer Complete! ⏱️</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Your countdown timer has reached zero.</p>

            <button
              onClick={dismissAlarm}
              className="btn-primary w-full py-3 mt-6 text-base justify-center shadow-xl"
            >
              <BellOff className="w-5 h-5" />
              <span>Dismiss Alarm</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
