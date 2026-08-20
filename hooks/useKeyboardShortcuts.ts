'use client';

import { useEffect } from 'react';
import { NavTab } from '@/components/navigation/Navigation';

interface UseKeyboardShortcutsProps {
  setActiveTab: (tab: NavTab) => void;
  toggle24Hour: () => void;
}

export function useKeyboardShortcuts({ setActiveTab, toggle24Hour }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Number keys 1-8 for tab switching
      const tabMap: Record<string, NavTab> = {
        '1': 'clock',
        '2': 'world',
        '3': 'stopwatch',
        '4': 'timer',
        '5': 'alarm',
        '6': 'pomodoro',
        '7': 'converter',
        '8': 'settings',
      };

      if (tabMap[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setActiveTab(tabMap[e.key]);
        return;
      }

      // T for toggling 12/24h
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggle24Hour();
        return;
      }

      // ? for showing shortcuts info
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        // Could show a help modal in the future
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, toggle24Hour]);
}
