'use client';

import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Globe, Clock, Copy, Check } from 'lucide-react';
import { ALL_TIMEZONES, CityTimezone } from '@/lib/timezones';

export const DateTimeConverter: React.FC = () => {
  const [sourceDate, setSourceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sourceTime, setSourceTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [sourceTimezone, setSourceTimezone] = useState<string>(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  const [targetTimezone, setTargetTimezone] = useState<string>('America/New_York');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!sourceDate || !sourceTime) return [];

    try {
      const sourceDateTime = new Date(`${sourceDate}T${sourceTime}:00`);

      // Get source timezone offset
      const sourceParts = new Intl.DateTimeFormat('en-US', {
        timeZone: sourceTimezone,
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
      }).formatToParts(sourceDateTime);

      // Build a proper date in the source timezone
      const srcH = parseInt(sourceParts.find(p => p.type === 'hour')?.value || '0');
      const srcM = parseInt(sourceParts.find(p => p.type === 'minute')?.value || '0');

      // Use Intl to format for each timezone
      const timezones = [sourceTimezone, targetTimezone];

      // Also compute common world times
      const commonTimezones = [
        'America/New_York',
        'America/Chicago',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Dubai',
        'Asia/Kolkata',
        'Asia/Shanghai',
        'Asia/Tokyo',
        'Australia/Sydney',
        'Pacific/Auckland',
      ].filter(tz => tz !== sourceTimezone && tz !== targetTimezone);

      const allTimezones = Array.from(new Set([...timezones, ...commonTimezones]));

      return allTimezones.map((tz) => {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(sourceDateTime);

        const tzInfo = ALL_TIMEZONES.find(c => c.timezone === tz);
        const cityName = tzInfo?.city || tz.split('/').pop()?.replace(/_/g, ' ') || tz;

        return {
          timezone: tz,
          city: cityName,
          flag: tzInfo?.flag || '🌍',
          formatted,
          isSource: tz === sourceTimezone,
          isTarget: tz === targetTimezone,
        };
      });
    } catch (e) {
      return [];
    }
  }, [sourceDate, sourceTime, sourceTimezone, targetTimezone]);

  const handleSwap = () => {
    const tempTz = sourceTimezone;
    setSourceTimezone(targetTimezone);
    setTargetTimezone(tempTz);
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  };

  const sourceCity = ALL_TIMEZONES.find(c => c.timezone === sourceTimezone);
  const targetCity = ALL_TIMEZONES.find(c => c.timezone === targetTimezone);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 text-[var(--text-primary)]">
          <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          <span>Date & Time Converter</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Convert times between world timezones instantly</p>
      </div>

      {/* Source Input Card */}
      <div className="card-glass p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">From</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Date</label>
            <input
              type="date"
              value={sourceDate}
              onChange={(e) => setSourceDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Time</label>
            <input
              type="time"
              value={sourceTime}
              onChange={(e) => setSourceTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Timezone</label>
            <select
              value={sourceTimezone}
              onChange={(e) => setSourceTimezone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono appearance-none"
            >
              {ALL_TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.timezone}>
                  {tz.flag} {tz.city} ({tz.country})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <button
          onClick={handleSwap}
          className="p-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 text-blue-400 transition-all hover:scale-110 hover:rotate-180 duration-300"
          title="Swap timezones"
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Target Timezone */}
      <div className="card-glass p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">To</h3>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Target Timezone</label>
          <select
            value={targetTimezone}
            onChange={(e) => setTargetTimezone(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono appearance-none"
          >
            {ALL_TIMEZONES.map((tz) => (
              <option key={tz.id} value={tz.timezone}>
                {tz.flag} {tz.city} ({tz.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Converted Times
          </h3>

          {results.map((r, idx) => (
            <div
              key={r.timezone}
              className={`card-glass p-4 flex items-center justify-between transition-all ${
                r.isTarget ? 'border-emerald-500/40 bg-emerald-500/5' : ''
              } ${r.isSource ? 'border-blue-500/40 bg-blue-500/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{r.flag}</span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {r.city}
                    {r.isSource && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">SOURCE</span>}
                    {r.isTarget && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">TARGET</span>}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{r.timezone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm sm:text-base text-[var(--text-primary)]">{r.formatted}</span>
                <button
                  onClick={() => handleCopy(r.formatted, idx)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                  title="Copy time"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
