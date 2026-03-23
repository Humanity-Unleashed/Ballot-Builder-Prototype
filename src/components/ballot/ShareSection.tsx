'use client';

import { useState } from 'react';
import { MessageCircle, Copy, Check, Mail } from 'lucide-react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

const SHARE_URL = 'https://ballotbuilder.org';

interface ShareSectionProps {
  racesCount?: number;
  sessionMinutes?: number;
  archetypeName?: string;
  archetypeEmoji?: string;
}

function buildShareMessage(props: ShareSectionProps): string {
  const { racesCount, sessionMinutes, archetypeName, archetypeEmoji } = props;
  const parts: string[] = [];

  if (racesCount && sessionMinutes) {
    parts.push(`I just prepped ${racesCount} races in ${sessionMinutes} minutes on Ballot Builder.`);
  } else {
    parts.push('I just finished my sample ballot on Ballot Builder.');
  }

  if (archetypeName && archetypeEmoji) {
    parts.push(`My civic style: ${archetypeEmoji} ${archetypeName}.`);
  }

  parts.push(`It walks you through every race and measure on your ballot. Try it: ${SHARE_URL}`);
  return parts.join(' ');
}

export default function ShareSection({
  racesCount,
  sessionMinutes,
  archetypeName,
  archetypeEmoji,
}: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const { track } = useAnalyticsContext();
  const shareMessage = buildShareMessage({ racesCount, sessionMinutes, archetypeName, archetypeEmoji });

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
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_self');
  };

  const handleEmail = () => {
    track('click', { element: 'email_a_friend' });
    const subject = 'Check out Ballot Builder';
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`,
      '_self',
    );
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
        &ldquo;{shareMessage}&rdquo;
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5">
        <button
          onClick={handleText}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
        >
          <MessageCircle className="h-4 w-4" />
          Text
        </button>
        <button
          onClick={handleEmail}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl border-2 border-border-default bg-white hover:bg-gray-50 transition-colors text-text-primary text-sm font-semibold"
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
