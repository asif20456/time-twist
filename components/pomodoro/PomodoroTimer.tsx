'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Settings, BarChart3, Timer, CheckCircle } from 'lucide-react';
import { usePomodoro, PomodoroSettings } from '@/hooks/usePomodoro';
import { formatTimerTime } from '@/lib/time';

export const PomodoroTimer: React.FC = () => {
  const {
    settings,
    stats,
    phase,
    remainingSeconds,
    isRunning,
    completedSessions,
    progressPercent,
    startWork,
    startBreak,
    pause,
    resume,
    reset,
    skipPhase,
    updateSettings,
    resetStats,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [editSettings, setEditSettings] = useState<PomodoroSettings>(settings);
  const formatted = formatTimerTime(remainingSeconds);

  const phaseConfig = {
    work: { label: 'Focus Time', icon: Brain, color: 'text-red-400', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/30' },
    shortBreak: { label: 'Short Break', icon: Coffee, color: 'text-emerald-400', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/30' },
    longBreak: { label: 'Long Break', icon: Coffee, color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/30' },
    idle: { label: 'Ready to Focus', icon: Timer, color: 'text-[var(--text-muted)]', bgColor: 'bg-[var(--bg-secondary)]', borderColor: 'border-[var(--border-color)]' },
  };

  const currentPhase = phaseConfig[phase];
  const PhaseIcon = currentPhase.icon;

  const handleSaveSettings = () => {
    updateSettings(editSettings);
    setShowSettings(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col items-center">

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 text-[var(--text-primary)]">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          <span>Pomodoro Timer</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Stay focused with timed work and break intervals</p>
      </div>

      {/* Phase Indicator & Session Counter */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 sm:mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentPhase.bgColor} border ${currentPhase.borderColor} ${currentPhase.color} font-semibold text-sm`}>
          <PhaseIcon className="w-4 h-4" />
          <span>{currentPhase.label}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span>Session {completedSessions % settings.sessionsBeforeLongBreak + 1} of {settings.sessionsBeforeLongBreak}</span>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="card-glass w-full p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden my-2 sm:my-4">

        {/* Circular Progress Ring */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border-8 border-[var(--border-color)] relative flex items-center justify-center shadow-inner my-2 sm:my-4">
          <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#pomodoroGradient)"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={phase === 'work' ? '#ef4444' : '#10b981'} />
                <stop offset="100%" stopColor={phase === 'work' ? '#f97316' : '#06b6d4'} />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display */}
          <div className="font-mono text-3xl sm:text-5xl font-black text-[var(--text-primary)] z-10">
            {remainingSeconds > 0 ? formatted.formatted : `${settings.workMinutes}:00`}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          {phase === 'idle' ? (
            <button
              onClick={startWork}
              className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base shadow-lg shadow-red-500/30 bg-gradient-to-r from-red-600 to-orange-600"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Start Focus</span>
            </button>
          ) : isRunning ? (
            <>
              <button
                onClick={pause}
                className="btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
              >
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Pause</span>
              </button>
              <button
                onClick={skipPhase}
                className="btn-secondary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-[var(--text-secondary)]"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Skip</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={resume}
                className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base shadow-lg shadow-blue-500/30"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Resume</span>
              </button>
              <button
                onClick={reset}
                className="btn-danger px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Session Progress Dots */}
      <div className="flex items-center gap-2 mt-4 sm:mt-6">
        {Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < (completedSessions % settings.sessionsBeforeLongBreak)
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
            }`}
          />
        ))}
      </div>

      {/* Quick Settings & Stats Toggle */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-secondary text-xs py-2 px-4"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card-glass w-full max-w-md p-5 sm:p-6 mt-4 space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Settings className="w-4 h-4 text-blue-400" />
            Pomodoro Settings
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Work (min)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={editSettings.workMinutes}
                onChange={(e) => setEditSettings({ ...editSettings, workMinutes: Math.max(1, parseInt(e.target.value) || 25) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Short Break (min)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={editSettings.shortBreakMinutes}
                onChange={(e) => setEditSettings({ ...editSettings, shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 5) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Long Break (min)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={editSettings.longBreakMinutes}
                onChange={(e) => setEditSettings({ ...editSettings, longBreakMinutes: Math.max(1, parseInt(e.target.value) || 15) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Sessions Before Long Break
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={editSettings.sessionsBeforeLongBreak}
                onChange={(e) => setEditSettings({ ...editSettings, sessionsBeforeLongBreak: Math.max(1, parseInt(e.target.value) || 4) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono text-center"
              />
            </div>
          </div>

          <button onClick={handleSaveSettings} className="btn-primary w-full py-2.5 text-sm">
            Save Settings
          </button>
        </div>
      )}

      {/* Stats Card */}
      <div className="card-glass w-full p-5 sm:p-6 mt-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Session Statistics</span>
          </h3>
          <button onClick={resetStats} className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors">
            Reset Stats
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center">
            <p className="text-2xl font-black font-mono text-blue-400">{stats.todaySessions}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase">Today</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center">
            <p className="text-2xl font-black font-mono text-emerald-400">{stats.todayWorkMinutes}m</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase">Today Focus</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center">
            <p className="text-2xl font-black font-mono text-indigo-400">{stats.totalSessions}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase">All Time</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center">
            <p className="text-2xl font-black font-mono text-purple-400">{Math.floor(stats.totalWorkMinutes / 60)}h {stats.totalWorkMinutes % 60}m</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase">Total Focus</p>
          </div>
        </div>
      </div>

    </div>
  );
};
