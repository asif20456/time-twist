'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Clock, Download, Wifi, WifiOff, X, Smartphone, Globe, CheckCircle } from 'lucide-react';
import { ThemeMode } from '@/hooks/useTheme';

interface HeaderProps {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  is24Hour: boolean;
  toggle24Hour: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, is24Hour, toggle24Hour }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<'accepted' | 'dismissed' | null>(null);
  const [detectPlatform, setDetectPlatform] = useState<'ios' | 'android' | 'chrome' | 'other'>('other');

  useEffect(() => {
    // Online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Standalone detection
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Platform detection
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDetectPlatform('ios');
    } else if (/android/.test(ua)) {
      setDetectPlatform('android');
    } else if (/chrome/.test(ua) && !/edge/.test(ua)) {
      setDetectPlatform('chrome');
    } else {
      setDetectPlatform('other');
    }

    // Install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check for SW update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] Update available');
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setInstallOutcome(outcome);
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('[PWA] Install prompt error:', err);
        setShowInstallModal(true);
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

  const platformInstructions = {
    ios: {
      title: 'iPhone / iPad',
      steps: [
        'Tap the Share button (square with arrow) in Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top-right corner',
      ],
      icon: <Smartphone className="w-5 h-5 text-indigo-400" />,
    },
    android: {
      title: 'Android',
      steps: [
        'Tap the three-dot menu in Chrome',
        'Tap "Add to Home screen" or "Install app"',
        'Tap "Add" or "Install" to confirm',
      ],
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
    },
    chrome: {
      title: 'Chrome / Edge Desktop',
      steps: [
        'Click the install icon in the address bar (⊕ or computer icon)',
        'Or click the three-dot menu → "Install Time Twist"',
        'Click "Install" in the popup',
      ],
      icon: <Globe className="w-5 h-5 text-blue-400" />,
    },
    other: {
      title: 'Your Browser',
      steps: [
        'Look for "Install" or "Add to Home Screen" in your browser menu',
        'Some browsers show an install icon in the address bar',
        'Follow the on-screen prompts to install',
      ],
      icon: <Globe className="w-5 h-5 text-amber-400" />,
    },
  };

  const instructions = platformInstructions[detectPlatform];

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
                    <WifiOff className="w-2.5 h-2.5" /> Offline
                  </span>
                )}

                {/* Standalone indicator */}
                {isStandalone && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold" title="Running as installed PWA">
                    ✓ PWA
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
                title="Install Time Twist as a standalone app"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* 12h / 24h Toggle Button */}
            <button
              onClick={toggle24Hour}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 text-[var(--text-primary)] transition-all shadow-sm"
              title="Toggle 12h / 24h format (or press T)"
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
                <span>Install Time Twist</span>
              </h3>
              <button
                onClick={() => { setShowInstallModal(false); setInstallOutcome(null); }}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {installOutcome === 'accepted' ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-[var(--text-primary)]">App Installed!</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Time Twist is now on your home screen.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <p className="font-semibold text-[var(--text-primary)]">
                    Install Time Twist for the best experience:
                  </p>

                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex items-center gap-2 mb-2">
                      {instructions.icon}
                      <p className="font-bold text-[var(--text-primary)]">{instructions.title}</p>
                    </div>
                    <ol className="space-y-1.5 text-xs">
                      {instructions.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <p className="font-semibold text-emerald-400 mb-1">Benefits of installing:</p>
                    <ul className="space-y-1 text-emerald-300/80">
                      <li>• Works 100% offline — no internet needed</li>
                      <li>• Opens from your home screen like a native app</li>
                      <li>• No browser address bar — full screen experience</li>
                      <li>• Faster launch with cached assets</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => { setShowInstallModal(false); setInstallOutcome(null); }}
                  className="btn-primary w-full py-2.5 mt-6 text-sm justify-center"
                >
                  Got It
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
