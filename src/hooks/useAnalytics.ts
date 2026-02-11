'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useFeedbackScreen } from '@/context/FeedbackScreenContext';
import { getScreenName } from '@/lib/screenNames';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
}

/** Send a JSON payload via sendBeacon (with correct Content-Type) or fetch fallback. */
function beacon(url: string, payload: object): void {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function useAnalytics() {
  const pathname = usePathname();
  const { screenLabel } = useFeedbackScreen();

  const prevPathnameRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(Date.now());
  const enterScreenNameRef = useRef<string>('');
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

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType,
          screen: pathname,
          screenName: getScreenName(pathname, screenLabel),
          properties: properties ?? {},
          referrer: prevPathnameRef.current,
        }),
      }).catch(() => {});
    },
    [pathname, screenLabel],
  );

  /** Send page_leave for the current page. Guard prevents duplicate sends. */
  const sendLeave = useCallback(() => {
    if (hasSentLeaveRef.current) return;
    hasSentLeaveRef.current = true;

    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    beacon('/api/analytics', {
      sessionId,
      eventType: 'page_leave',
      screen: pathname,
      screenName: enterScreenNameRef.current || getScreenName(pathname, screenLabel),
      properties: {},
      referrer: null,
      duration: Date.now() - enterTimeRef.current,
    });
  }, [pathname, screenLabel]);

  // Track page_view on pathname change
  useEffect(() => {
    // Send page_leave for previous page before entering new one
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      sendLeave();
    }

    // Reset for new page
    hasSentLeaveRef.current = false;
    enterTimeRef.current = Date.now();

    const screenName = getScreenName(pathname, screenLabel);
    enterScreenNameRef.current = screenName;

    // Send page_view
    const sessionId = sessionIdRef.current;
    if (sessionId) {
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

  // Handle tab hide / restore and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendLeave();
      } else if (document.visibilityState === 'visible') {
        // User returned to tab — reset guard so next leave fires correctly
        hasSentLeaveRef.current = false;
        enterTimeRef.current = Date.now();
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
