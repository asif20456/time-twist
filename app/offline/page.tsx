'use client';

import React from 'react';
import { WifiOff, Clock, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-6 animate-pulse">
          <WifiOff className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          You&apos;re Offline
        </h1>

        <p className="text-sm text-gray-400 mb-2">
          Time Twist works offline, but this page hasn&apos;t been cached yet.
        </p>
        <p className="text-xs text-gray-500 mb-8">
          Your clocks, alarms, and timers are still available — just navigate back to the app.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:translate-y-[-2px] transition-all"
          >
            <Clock className="w-4 h-4" />
            Open Time Twist
          </a>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
