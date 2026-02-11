'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useFeedbackScreen } from '@/context/FeedbackScreenContext';

const SCREEN_NAMES: Record<string, string> = {
  '/': 'Home',
  '/blueprint': 'Blueprint',
  '/ballot': 'Ballot',
  '/login': 'Login',
  '/register': 'Register',
};

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
}

function getScreenName(pathname: string, screenLabel: string): string {
  return screenLabel || SCREEN_NAMES[pathname] || pathname;
}

export function useAnalytics() {
  const pathname = usePathname();
  const { screenLabel } = useFeedbackScreen();

  const prevPathnameRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(Date.now());
  const hasSentLeaveRef = useRef(false);
  const sessionIdRef = useRef<string>('');

  // Lazily initialize session ID on client
  if (typeof window !== 'undefined' && !sessionIdRef.current) {
    sessionIdRef.current = getSessionId();
  }

  const track = useCallback(
    (eventType: string, properties?: Record<string, unknown>) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const screenName = getScreenName(pathname, screenLabel);

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType,
          screen: pathname,
          screenName,
          properties: properties ?? {},
          referrer: prevPathnameRef.current,
        }),
      }).catch(() => {
        // Silently fail — fire-and-forget
      });
    },
    [pathname, screenLabel],
  );

  const sendLeave = useCallback(() => {
    if (hasSentLeaveRef.current) return;
    hasSentLeaveRef.current = true;

    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const duration = Date.now() - enterTimeRef.current;
    const leavePath = prevPathnameRef.current ?? pathname;
    const screenName = getScreenName(leavePath, screenLabel);

    const payload = JSON.stringify({
      sessionId,
      eventType: 'page_leave',
      screen: leavePath,
      screenName,
      properties: {},
      referrer: null,
      duration,
    });

    // Use sendBeacon for reliability during unload, fall back to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', payload);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, screenLabel]);

  // Track page_view on pathname change
  useEffect(() => {
    // Send page_leave for previous page
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      const sessionId = sessionIdRef.current;
      if (sessionId && !hasSentLeaveRef.current) {
        const duration = Date.now() - enterTimeRef.current;
        const prevScreenName = getScreenName(prevPathnameRef.current, '');

        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            eventType: 'page_leave',
            screen: prevPathnameRef.current,
            screenName: prevScreenName,
            properties: {},
            referrer: null,
            duration,
          }),
        }).catch(() => {});
      }
    }

    // Reset for new page
    hasSentLeaveRef.current = false;
    enterTimeRef.current = Date.now();

    // Send page_view
    const sessionId = sessionIdRef.current;
    if (sessionId) {
      const screenName = getScreenName(pathname, screenLabel);

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: 'page_view',
          screen: pathname,
          screenName,
          properties: {},
          referrer: prevPathnameRef.current,
        }),
      }).catch(() => {});
    }

    prevPathnameRef.current = pathname;
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle tab hide and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendLeave();
      }
    };

    const handleBeforeUnload = () => {
      sendLeave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sendLeave]);

  return { track };
}
