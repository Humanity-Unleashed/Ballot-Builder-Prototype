'use client';

import { useEffect, useRef } from 'react';
import { useBallotStore } from '@/stores/ballotStore';

const TICK_INTERVAL_MS = 5000; // tick every 5 seconds

/**
 * Tracks active session time. Only counts time when:
 * - The document is visible (tab is in foreground)
 * - The session hasn't finished (not on summary)
 *
 * Ticks in 5-second increments to reduce store updates.
 */
export function useActiveTimer() {
  const tickActiveTime = useBallotStore((s) => s.tickActiveTime);
  const sessionFinished = useBallotStore((s) => s.sessionFinished);
  const tickRef = useRef(tickActiveTime);
  useEffect(() => { tickRef.current = tickActiveTime; }, [tickActiveTime]);

  useEffect(() => {
    if (sessionFinished) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startTicking = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        tickRef.current(TICK_INTERVAL_MS / 1000);
      }, TICK_INTERVAL_MS);
    };

    const stopTicking = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopTicking();
      } else {
        startTicking();
      }
    };

    // Start immediately if visible
    if (!document.hidden) {
      startTicking();
    }

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopTicking();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sessionFinished]);
}
