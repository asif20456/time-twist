'use client';

import { useState, useEffect } from 'react';
import { getItem, setItem } from '@/lib/storage';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeAccent = 'ocean' | 'emerald' | 'sunset' | 'royal' | 'rose' | 'cyan';

export const ACCENT_PRESETS: { id: ThemeAccent; label: string; gradient: string }[] = [
  { id: 'ocean', label: 'Ocean Blue', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'emerald', label: 'Emerald Forest', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'sunset', label: 'Sunset Blaze', gradient: 'from-orange-500 to-amber-500' },
  { id: 'royal', label: 'Royal Purple', gradient: 'from-violet-500 to-purple-600' },
  { id: 'rose', label: 'Rose Gold', gradient: 'from-rose-500 to-pink-500' },
  { id: 'cyan', label: 'Cyan Wave', gradient: 'from-cyan-500 to-teal-500' },
];

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<ThemeAccent>('ocean');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getItem<ThemeMode>('time-twist-theme', 'dark');
    const savedAccent = getItem<ThemeAccent>('time-twist-accent', 'ocean');
    setThemeState(saved);
    setAccentState(savedAccent);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const applyTheme = (mode: ThemeMode) => {
      let isDark = mode === 'dark';
      if (mode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    setItem('time-twist-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme, mounted]);

  // Apply accent class
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    // Remove all accent classes
    ACCENT_PRESETS.forEach((a) => root.classList.remove(`accent-${a.id}`));
    // Add selected accent (skip ocean since it's the default :root)
    if (accent !== 'ocean') {
      root.classList.add(`accent-${accent}`);
    }
    setItem('time-twist-accent', accent);
  }, [accent, mounted]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setAccent = (newAccent: ThemeAccent) => {
    setAccentState(newAccent);
  };

  return { theme, setTheme, accent, setAccent, mounted };
}
