'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Clock, Download, Wifi, WifiOff, X, Smartphone, Globe } from 'lucide-react';
import { ThemeMode } from '@/hooks/useTheme';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface HeaderProps {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  is24Hour: boolean;
  toggle24Hour: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, is24Hour, toggle24Hour }) => {
  const isOnline = useOnlineStatus();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Identity & Online/Offline Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-bold">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                  Time Twist ⏱️
                </h1>
                
                {/* Online / Offline Status Badge */}
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold" title="App is connected online">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold" title="App is working offline">
                    <WifiOff className="w-2.5 h-2.5" /> Offline Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block">Smart Clock & Time Tools</p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Install / Download App Button */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="btn-primary py-1.5 px-3 text-xs rounded-xl shadow-md"
                title="Install / Download Time Twist App"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* 12h / 24h Toggle Button */}
            <button
              onClick={toggle24Hour}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 text-[var(--text-primary)] transition-all shadow-sm"
              title="Toggle 12h / 24h format"
            >
              {is24Hour ? '24H' : '12H'}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 text-[var(--text-primary)] transition-all shadow-sm"
              title={`Current theme: ${theme}. Click to cycle.`}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'system' && <Monitor className="w-4 h-4 text-indigo-400" />}
            </button>

          </div>
        </div>
      </header>

      {/* PWA Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="card-glass w-full max-w-md p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span>Install Time Twist App</span>
              </h3>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Install Time Twist as a standalone Progressive Web App (PWA) for 100% offline capability:
              </p>
              
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <p className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Chrome / Edge / Android:
                </p>
                <p>Click the <strong>Install</strong> icon in the address bar or browser menu to download.</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <p className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> iPhone / iOS Safari:
                </p>
                <p>Tap the <strong>Share</strong> button, then select <strong>&quot;Add to Home Screen&quot;</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="btn-primary w-full py-2.5 mt-6 text-sm justify-center"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
