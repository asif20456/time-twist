'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { ScreensaverSettings } from '@/hooks/useIdleScreensaver';

interface IdleScreensaverProps {
  hours: string;
  minutes: string;
  seconds: string;
  dayPeriod: string;
  fullDateStr: string;
  timezoneName: string;
  is24Hour: boolean;
  settings: ScreensaverSettings;
  onDismiss: () => void;
}

export const IdleScreensaver: React.FC<IdleScreensaverProps> = ({
  hours,
  minutes,
  seconds,
  dayPeriod,
  fullDateStr,
  timezoneName,
  is24Hour,
  settings,
  onDismiss,
}) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Wake Lock ────────────────────────────────────────────────────────────────
  const requestWakeLock = useCallback(async () => {
    if (!settings.keepAwake) return;
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current?.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      }
    } catch {
      // Wake Lock not available or denied — fail silently
    }
  }, [settings.keepAwake]);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
    } catch {}
  }, []);

  // Re-acquire wake lock when the page becomes visible again
  useEffect(() => {
    if (!settings.keepAwake) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.keepAwake, requestWakeLock]);

  // ── Fullscreen ───────────────────────────────────────────────────────────────
  const enterFullscreen = useCallback(async () => {
    if (!settings.fullscreen) return;
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }
    } catch {
      // Fullscreen blocked by browser — silently ignore
    }
  }, [settings.fullscreen]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  }, []);

  // ── Mount / Unmount lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    requestWakeLock();
    enterFullscreen();

    return () => {
      releaseWakeLock();
      exitFullscreen();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard exit ────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Click/Tap exit ───────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #0a1628 0%, #04080f 100%)' }}
      onClick={handleDismiss}
      role="button"
      aria-label="Screensaver — tap or press any key to exit"
      tabIndex={0}
    >
      {/* Animated ambient glow blobs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'ss-pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
          bottom: '15%',
          right: '20%',
          animation: 'ss-pulse 11s ease-in-out infinite reverse',
        }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${2 + (i % 4)}px`,
            height: `${2 + (i % 4)}px`,
            background: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#818cf8' : '#a78bfa',
            opacity: 0.2 + (i % 5) * 0.06,
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${10 + (i * 13) % 80}%`,
            animation: `ss-float-${i % 3} ${8 + i * 1.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      {/* Main clock */}
      <div className="relative flex flex-col items-center gap-6 px-8">
        {/* Time display */}
        <div
          className="font-mono font-black tracking-tight leading-none text-center"
          style={{
            fontSize: 'clamp(4rem, 16vw, 14rem)',
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #93c5fd 45%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 40px rgba(96,165,250,0.35))',
          }}
        >
          {hours}:{minutes}
          {settings.showSeconds && (
            <span
              style={{
                fontSize: 'clamp(2rem, 8vw, 6rem)',
                background: 'linear-gradient(135deg, #93c5fd 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              :{seconds}
            </span>
          )}
          {!is24Hour && dayPeriod && (
            <span
              className="ml-4 font-sans"
              style={{
                fontSize: 'clamp(1.25rem, 4vw, 4rem)',
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {dayPeriod}
            </span>
          )}
        </div>

        {/* Date + timezone */}
        {settings.showDate && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <div
              className="px-5 py-2 rounded-full border text-sm font-semibold tracking-wide"
              style={{
                background: 'rgba(59,130,246,0.08)',
                borderColor: 'rgba(96,165,250,0.2)',
                color: '#93c5fd',
                backdropFilter: 'blur(8px)',
              }}
            >
              {fullDateStr}
            </div>
            <div
              className="px-5 py-2 rounded-full border text-sm font-semibold tracking-wide"
              style={{
                background: 'rgba(129,140,248,0.08)',
                borderColor: 'rgba(165,180,252,0.2)',
                color: '#a5b4fc',
                backdropFilter: 'blur(8px)',
              }}
            >
              {timezoneName || 'Local Time'}
            </div>
          </div>
        )}
      </div>

      {/* Dismiss hint */}
      <div
        className="absolute bottom-8 flex flex-col items-center gap-2"
        style={{ color: 'rgba(148,163,184,0.4)' }}
      >
        <p
          className="text-xs font-medium tracking-widest uppercase"
          style={{ animation: 'ss-blink 3s ease-in-out infinite' }}
        >
          Tap · Click · Press any key to exit
        </p>
        <p className="text-[10px] font-mono" style={{ color: 'rgba(148,163,184,0.25)' }}>
          ESC to exit · Screen Saver Mode
        </p>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes ss-pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.10; }
          50% { transform: translateX(-50%) scale(1.15); opacity: 0.18; }
        }
        @keyframes ss-float-0 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-22px); }
        }
        @keyframes ss-float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes ss-float-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes ss-blink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
};
