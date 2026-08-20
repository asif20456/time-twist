'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Flag, Timer as TimerIcon, Zap } from 'lucide-react';
import { useStopwatch } from '@/hooks/useStopwatch';
import { formatStopwatchTime } from '@/lib/time';

export const Stopwatch: React.FC = () => {
  const {
    isRunning,
    elapsedMs,
    laps,
    fastestLapId,
    slowestLapId,
    start,
    pause,
    resume,
    reset,
    lap
  } = useStopwatch();

  const formatted = formatStopwatchTime(elapsedMs);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 text-[var(--text-primary)]">
          <TimerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          <span>Stopwatch</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Millisecond-accurate time tracking using performance timers</p>
      </div>

      {/* Main Display Card */}
      <div className="card-glass w-full p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center my-2 sm:my-4 relative overflow-hidden">
        
        <div className="flex items-baseline justify-center font-mono font-black select-none text-[var(--text-primary)]">
          <span className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-[var(--text-primary)]">
            {formatted.hours !== '00' && `${formatted.hours}:`}{formatted.minutes}:{formatted.seconds}
          </span>
          <span className="text-xl sm:text-3xl md:text-5xl text-blue-500 font-bold ml-1 sm:ml-2">
            .{formatted.milliseconds}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          {!isRunning ? (
            <button
              onClick={elapsedMs === 0 ? start : resume}
              className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base shadow-lg shadow-blue-500/30"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>{elapsedMs === 0 ? 'Start' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={pause}
              className="btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={lap}
              className="btn-secondary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-indigo-500 border-indigo-500/40 hover:bg-indigo-500/10"
            >
              <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Lap</span>
            </button>
          )}

          {elapsedMs > 0 && !isRunning && (
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

      {/* Lap History */}
      {laps.length > 0 && (
        <div className="card-glass w-full p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--border-color)] mb-4">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              <span>Lap History ({laps.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[280px]">
              <thead>
                <tr className="text-[11px] sm:text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-color)]">
                  <th className="py-2 px-3 sm:px-4">Lap</th>
                  <th className="py-2 px-3 sm:px-4">Lap Time</th>
                  <th className="py-2 px-3 sm:px-4 text-right">Total Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] font-mono text-xs sm:text-sm">
                {laps.map((l) => {
                  const isFastest = l.id === fastestLapId;
                  const isSlowest = l.id === slowestLapId;
                  const lapFormatted = formatStopwatchTime(l.lapTimeMs);
                  const totalFormatted = formatStopwatchTime(l.totalTimeMs);

                  return (
                    <tr
                      key={l.id}
                      className={`transition-colors ${
                        isFastest
                          ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                          : isSlowest
                          ? 'bg-red-500/10 text-red-500'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <td className="py-2.5 px-3 sm:px-4 font-sans font-medium flex items-center gap-1.5 flex-wrap">
                        <span>Lap {l.id}</span>
                        {isFastest && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold uppercase tracking-wider">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 font-bold uppercase tracking-wider">
                            Slowest
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">{lapFormatted.formatted}</td>
                      <td className="py-2.5 px-3 sm:px-4 text-right">{totalFormatted.formatted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
