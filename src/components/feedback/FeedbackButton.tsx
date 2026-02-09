'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, X } from 'lucide-react';
import { useFeedbackStore, type FeedbackEntry } from '@/stores/feedbackStore';

const SCREEN_NAMES: Record<string, string> = {
  '/': 'Home',
  '/blueprint': 'Blueprint',
  '/ballot': 'Ballot',
  '/login': 'Login',
  '/register': 'Register',
};

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'confusing', label: 'Confusing' },
  { value: 'like', label: 'Like it' },
] as const;

function getScreenName(pathname: string): string {
  return SCREEN_NAMES[pathname] ?? pathname;
}

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const pathname = usePathname();
  const addFeedback = useFeedbackStore((s) => s.addFeedback);

  const close = useCallback(() => {
    setIsOpen(false);
    setFeedbackType(null);
    setMessage('');
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    },
    [close],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      screen: pathname,
      screenName: getScreenName(pathname),
      type: feedbackType,
      message: message.trim(),
    };

    addFeedback(entry);

    // Fire-and-forget to API
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screen: entry.screen,
        screenName: entry.screenName,
        type: entry.type,
        message: entry.message,
      }),
    }).catch(() => {
      // Silently fail — localStorage is the source of truth for now
    });

    setShowThanks(true);
    setTimeout(() => {
      setShowThanks(false);
      close();
    }, 1500);
  };

  const screenName = getScreenName(pathname);

  // Floating trigger button
  const trigger = (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95"
      aria-label="Send feedback"
    >
      <MessageSquarePlus size={24} />
    </button>
  );

  if (!isOpen) return trigger;

  const panel = (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={close}
      />

      {/* Panel */}
      <div className="relative mb-0 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:mb-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
          <button
            onClick={close}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {showThanks ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="text-2xl">Thanks!</span>
            <span className="text-sm text-gray-500">
              Your feedback has been saved.
            </span>
          </div>
        ) : (
          <>
            {/* Screen context chip */}
            <div className="mb-3">
              <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {screenName}
              </span>
            </div>

            {/* Type chips */}
            <div className="mb-3 flex flex-wrap gap-2">
              {FEEDBACK_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() =>
                    setFeedbackType(feedbackType === t.value ? null : t.value)
                  }
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    feedbackType === t.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="mb-3 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return trigger;
  return (
    <>
      {trigger}
      {createPortal(panel, document.body)}
    </>
  );
}
