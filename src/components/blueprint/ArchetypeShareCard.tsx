'use client';

import { useState } from 'react';
import { MessageCircle, Mail, Copy, Check, Share2 } from 'lucide-react';
import { ARCHETYPES, type ArchetypeResult } from '@/lib/archetypes';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

interface ArchetypeShareCardProps {
  archetype: ArchetypeResult;
  onClose?: () => void;
}

const SHARE_URL = 'https://ballotbuilder.org';

export default function ArchetypeShareCard({ archetype, onClose }: ArchetypeShareCardProps) {
  const [copied, setCopied] = useState(false);
  const { track } = useAnalyticsContext();

  const { primary } = archetype;
  const shareMessage = `My civic style is ${primary.emoji} ${primary.name}! What's yours? Take the 5-minute quiz: ${SHARE_URL}`;

  const handleText = () => {
    track('click', { element: 'share_archetype_text', archetype: primary.id });
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_self');
  };

  const handleEmail = () => {
    track('click', { element: 'share_archetype_email', archetype: primary.id });
    window.open(
      `mailto:?subject=${encodeURIComponent("What's your civic style?")}&body=${encodeURIComponent(shareMessage)}`,
      '_self',
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}`);
      setCopied(true);
      track('click', { element: 'share_archetype_copy', archetype: primary.id });
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-4">
      {/* Share card — gradient background */}
      <div
        className="rounded-2xl px-6 py-8 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2B5797 0%, #1E3F6F 50%, #2B5797 100%)' }}
      >
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
          Your Civic Style
        </p>
        <div className="text-5xl mb-3">{primary.emoji}</div>
        <h2 className="text-xl font-extrabold mb-2">{primary.name}</h2>
        <p className="text-white/80 text-sm leading-relaxed max-w-[260px] mx-auto">
          {primary.summary}
        </p>
        <div className="mt-5 pt-4 border-t border-white/20">
          <p className="text-white/50 text-[11px] font-semibold">ballotbuilder.org</p>
        </div>
      </div>

      {/* All archetypes grid */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
          All 9 Civic Styles
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ARCHETYPES.map((a) => (
            <span
              key={a.id}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                a.id === primary.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {a.emoji} {a.name}
            </span>
          ))}
        </div>
      </div>

      {/* Share buttons */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
          Share your result
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={handleText}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            Text
          </button>
          <button
            onClick={handleEmail}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-900 text-sm font-semibold"
          >
            {copied ? (
              <><Check className="h-4 w-4 text-green-500" /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy</>
            )}
          </button>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back to Blueprint
        </button>
      )}
    </div>
  );
}
