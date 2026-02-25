'use client';

import { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

const SHARE_MESSAGE =
  'I just finished my sample ballot on Ballot Builder. It walks you through every race and measure on your actual ballot. Try it: ballotbuilder.org';

const SHARE_URL = 'https://ballotbuilder.org';

export default function ShareSection() {
  const [copied, setCopied] = useState(false);
  const { track } = useAnalyticsContext();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      track('click', { element: 'copy_share_link' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silent fail
    }
  };

  const handleText = () => {
    track('click', { element: 'text_a_friend' });
    window.open(`sms:?body=${encodeURIComponent(SHARE_MESSAGE)}`, '_self');
  };

  return (
    <div className="px-4 animate-fade-in-up">
      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border-default" />
        <span className="text-xs text-text-muted">Help someone else get ready</span>
        <div className="flex-1 h-px bg-border-default" />
      </div>

      {/* Message preview */}
      <div className="bg-brand-primary-surface rounded-xl p-4 mb-4 text-sm text-text-secondary leading-relaxed border border-border-default">
        &ldquo;{SHARE_MESSAGE}&rdquo;
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleText}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
        >
          <MessageCircle className="h-4 w-4" />
          Text a Friend
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-border-default bg-white hover:bg-gray-50 transition-colors text-text-primary text-sm font-semibold"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
