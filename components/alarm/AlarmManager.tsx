'use client';

import React, { useState } from 'react';
import { Plus, Trash2, AlarmClock, Bell, BellOff, X, Info, RotateCcw } from 'lucide-react';
import { useAlarm, AlarmItem } from '@/hooks/useAlarm';

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmManager: React.FC = () => {
  const {
    alarms,
    activeRingingAlarm,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
    dismissActiveAlarm,
    snoozeActiveAlarm,
    mounted
  } = useAlarm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTime, setNewTime] = useState('07:00');
  const [newLabel, setNewLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAlarm(newTime, newLabel, selectedDays);
    setIsModalOpen(false);
    setNewTime('07:00');
    setNewLabel('');
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <AlarmClock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span>Alarms</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Manage your daily alarms and reminders</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Set Alarm</span>
        </button>
      </div>

      {/* Browser Limitations Notice Banner */}
      <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 mb-6 sm:mb-8">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Browser Limitation Note:</strong> Web applications trigger audio alarms while Time Twist is open in an active browser tab or standalone PWA window. Keep the application open for reliable alarms.
        </p>
      </div>

      {/* Alarms List */}
      <div className="space-y-4">
        {alarms.length === 0 ? (
          <div className="card-glass p-8 text-center text-[var(--text-muted)]">
            <BellOff className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
            <p className="text-base font-medium">No alarms set yet.</p>
            <p className="text-xs mt-1">Click &quot;Set Alarm&quot; to create your first alarm.</p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`card-glass p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                alarm.enabled ? 'border-blue-500/30' : 'opacity-60'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-baseline gap-2 font-mono font-bold text-2xl sm:text-4xl text-[var(--text-primary)]">
                  <span>{alarm.time}</span>
                  <span className="text-xs sm:text-sm font-sans font-semibold text-blue-400">{alarm.label}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {DAYS_MAP.map((dayName, idx) => {
                    const isSelected = alarm.repeatDays.includes(idx);
                    return (
                      <span
                        key={dayName}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isSelected
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-[var(--text-muted)] bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {dayName}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                {/* Toggle Switch */}
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                    alarm.enabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                  title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                  aria-label={`Toggle alarm for ${alarm.time}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                  title="Delete alarm"
                  aria-label={`Delete alarm ${alarm.label}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Set Alarm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="card-glass w-full max-w-md p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span>New Alarm</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Time Picker */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Alarm Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="w-full px-4 py-3 text-2xl font-mono font-bold rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Label Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Alarm Label
              </label>
              <input
                type="text"
                placeholder="e.g. Work Standup, Workout..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Repeat Days */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Repeat Days
              </label>
              <div className="flex justify-between gap-1">
                {DAYS_MAP.map((dayName, idx) => {
                  const isSelected = selectedDays.includes(idx);
                  return (
                    <button
                      key={dayName}
                      type="button"
                      onClick={() => toggleDaySelection(idx)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {dayName[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Alarm
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Ringing Alarm Overlay */}
      {activeRingingAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-glass w-full max-w-md p-8 text-center alarm-ringing-pulse flex flex-col items-center">
            
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-bounce">
              <Bell className="w-12 h-12" />
            </div>

            <h3 className="text-3xl font-black font-mono text-[var(--text-primary)]">{activeRingingAlarm.time}</h3>
            <p className="text-lg font-bold text-blue-400 mt-1">{activeRingingAlarm.label}</p>

            <div className="flex items-center gap-3 w-full mt-8">
              <button
                onClick={() => snoozeActiveAlarm(5)}
                className="btn-secondary flex-1 py-3 justify-center"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Snooze (5m)</span>
              </button>
              <button
                onClick={dismissActiveAlarm}
                className="btn-primary flex-1 py-3 justify-center bg-red-600 hover:bg-red-500 shadow-red-500/30"
              >
                <BellOff className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
