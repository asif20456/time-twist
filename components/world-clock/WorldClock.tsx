'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, Globe, MapPin } from 'lucide-react';
import { POPULAR_TIMEZONES, ALL_TIMEZONES, CityTimezone, getTimezoneOffsetFormatted } from '@/lib/timezones';
import { getFormattedClock } from '@/lib/time';
import { getItem, setItem } from '@/lib/storage';

interface WorldClockProps {
  is24Hour: boolean;
}

export const WorldClock: React.FC<WorldClockProps> = ({ is24Hour }) => {
  const [now, setNow] = useState<Date>(new Date());
  const [savedCities, setSavedCities] = useState<CityTimezone[]>(POPULAR_TIMEZONES);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const loaded = getItem<CityTimezone[]>('time-twist-world-clocks', POPULAR_TIMEZONES);
    setSavedCities(loaded);
    setMounted(true);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveCities = (cities: CityTimezone[]) => {
    setSavedCities(cities);
    setItem('time-twist-world-clocks', cities);
  };

  const handleAddCity = (city: CityTimezone) => {
    if (savedCities.some((c) => c.timezone === city.timezone)) return;
    const updated = [...savedCities, city];
    saveCities(updated);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleRemoveCity = (id: string) => {
    const updated = savedCities.filter((c) => c.id !== id);
    saveCities(updated);
  };

  const filteredCities = ALL_TIMEZONES.filter(
    (c) =>
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span>World Clock</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Track real-time hours across global time zones</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Add City</span>
        </button>
      </div>

      {/* Grid of Saved Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {savedCities.map((city) => {
          const clock = getFormattedClock(now, is24Hour, city.timezone);
          const diff = getTimezoneOffsetFormatted(city.timezone, now);

          return (
            <div key={city.id} className="card-glass p-5 sm:p-6 relative group flex flex-col justify-between">
              
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={city.country}>{city.flag}</span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{city.city}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{city.country}</p>
                </div>

                <button
                  onClick={() => handleRemoveCity(city.id)}
                  className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                  title="Remove city"
                  aria-label={`Remove ${city.city}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Time Display */}
              <div className="my-4 sm:my-6">
                <div className="flex items-baseline gap-1 font-mono font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
                  <span>{clock.hours}:{clock.minutes}</span>
                  <span className="text-sm text-blue-400">:{clock.seconds}</span>
                  {!is24Hour && clock.dayPeriod && (
                    <span className="text-xs font-sans font-bold text-indigo-400 ml-1">{clock.dayPeriod}</span>
                  )}
                </div>
              </div>

              {/* Card Footer: Date & Time Diff */}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-3 sm:pt-4 border-t border-[var(--border-color)]">
                <span className="truncate max-w-[60%]">{clock.fullDateStr}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold text-[11px] flex-shrink-0">
                  {diff}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add City Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card-glass w-full max-w-md p-6 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Select City</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search city or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-glow)]"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {filteredCities.length === 0 ? (
                <p className="text-center py-6 text-sm text-[var(--text-muted)]">No cities match your search.</p>
              ) : (
                filteredCities.map((city) => {
                  const isSaved = savedCities.some((c) => c.timezone === city.timezone);
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleAddCity(city)}
                      disabled={isSaved}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isSaved
                          ? 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)]'
                          : 'hover:bg-blue-600/10 hover:border-blue-500/30 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl" role="img" aria-label={city.country}>{city.flag}</span>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{city.city}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{city.country}</p>
                        </div>
                      </div>
                      {isSaved && <span className="text-xs text-blue-400 font-semibold">Added</span>}
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
