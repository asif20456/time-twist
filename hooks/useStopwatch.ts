'use client';

import { useState, useEffect, useRef } from 'react';

export interface LapItem {
  id: number;
  lapTimeMs: number;
  totalTimeMs: number;
}

export function useStopwatch() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [laps, setLaps] = useState<LapItem[]>([]);

  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const update = () => {
    if (startTimeRef.current > 0) {
      const now = performance.now();
      setElapsedMs(accumulatedMsRef.current + (now - startTimeRef.current));
      animationFrameRef.current = requestAnimationFrame(update);
    }
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(update);
  };

  const pause = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    accumulatedMsRef.current += performance.now() - startTimeRef.current;
    startTimeRef.current = 0;
    setElapsedMs(accumulatedMsRef.current);
  };

  const resume = () => {
    start();
  };

  const reset = () => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = 0;
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  };

  const lap = () => {
    const currentTotal = elapsedMs;
    const previousTotal = laps.length > 0 ? laps[0].totalTimeMs : 0;
    const lapTime = currentTotal - previousTotal;

    const newLap: LapItem = {
      id: laps.length + 1,
      lapTimeMs: lapTime,
      totalTimeMs: currentTotal
    };

    setLaps((prev) => [newLap, ...prev]);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Compute fastest and slowest laps
  let fastestLapId: number | null = null;
  let slowestLapId: number | null = null;

  if (laps.length > 1) {
    let minTime = Infinity;
    let maxTime = -Infinity;

    laps.forEach((l) => {
      if (l.lapTimeMs < minTime) {
        minTime = l.lapTimeMs;
        fastestLapId = l.id;
      }
      if (l.lapTimeMs > maxTime) {
        maxTime = l.lapTimeMs;
        slowestLapId = l.id;
      }
    });
  }

  return {
    isRunning,
    elapsedMs,
    laps,
    fastestLapId,
    slowestLapId,
    start,
    pause,
    resume,
    reset,
    lap
  };
}
