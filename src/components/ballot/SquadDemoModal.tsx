'use client';

import { useState } from 'react';
import { Lock, Check, Ban, ChevronLeft, Bell, MessageCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { getNextElectionDay, daysUntil } from '@/lib/electionDate';

interface SquadDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const CHECKPOINTS = ['Account', 'Registration', 'Ballot', 'Voted'] as const;

const MEMBERS = [
  { name: 'Maria', initials: 'MS', bg: 'bg-brand-primary/15', text: 'text-brand-primary', completed: 4 },
  { name: 'Jake', initials: 'JK', bg: 'bg-green-100', text: 'text-green-700', completed: 2 },
  { name: 'Dad', initials: 'D', bg: 'bg-orange-100', text: 'text-orange-700', completed: 1 },
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <span className={`w-5 h-5 rounded bg-green-500/15 flex items-center justify-center shrink-0 ${className ?? ''}`}>
      <Check className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} />
    </span>
  );
}

function BanIcon({ className }: { className?: string }) {
  return (
    <span className={`w-5 h-5 rounded bg-red-500/10 flex items-center justify-center shrink-0 ${className ?? ''}`}>
      <Ban className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
    </span>
  );
}

/* ── Slide 1: Privacy ── */
function SlidePrivacy() {
  return (
    <div className="animate-fade-in-up">
      {/* Lock icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-brand-primary" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-text-primary text-center mb-4">Your ballot stays private</h3>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {/* What they CAN see */}
        <div className="p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">What squad members can see:</p>
          <div className="space-y-2.5">
            {['Whether you\'ve created an account', 'Whether you\'ve checked registration', 'Whether you\'ve completed your sample ballot', 'Whether you\'ve voted'].map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <CheckIcon />
                <span className="text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* What they CANNOT see */}
        <div className="p-4 bg-red-50/30">
          <p className="text-sm font-semibold text-text-primary mb-3">What they can NEVER see:</p>
          <div className="space-y-2.5">
            {['Your assessment answers', 'Your values or policy positions', 'Who you\'re voting for'].map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <BanIcon />
                <span className="text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted text-center mt-4">You can leave anytime. No one is notified.</p>
    </div>
  );
}

/* ── Slide 2: Dashboard ── */
function SlideDashboard() {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-lg font-bold text-text-primary text-center mb-4">Track progress together</h3>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        {MEMBERS.map((member, idx) => (
          <div
            key={member.name}
            className={`px-4 py-3.5 flex items-center gap-3 ${idx < MEMBERS.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full ${member.bg} flex items-center justify-center ${member.text} font-bold text-sm shrink-0`}>
              {member.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{member.name}</p>
              <div className="flex gap-1.5 mt-1.5">
                {CHECKPOINTS.map((_, ci) => (
                  ci < member.completed ? (
                    <span key={ci} className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span key={ci} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-sm bg-gray-300" />
                    </span>
                  )
                ))}
              </div>
            </div>
            {member.completed === 4 && (
              <span className="text-xs text-green-600 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">All done</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 px-1">
        {CHECKPOINTS.map((label) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-500/15 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-green-500" strokeWidth={3} />
            </span>
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Slide 3: Countdown Nudge ── */
function SlideNudge() {
  const days = daysUntil(getNextElectionDay());

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-lg font-bold text-text-primary text-center mb-4">Keep everyone on track</h3>

      {/* Mock notification */}
      <div className="bg-gray-800 rounded-2xl p-3 pb-5 mb-5">
        {/* Status bar */}
        <div className="flex justify-between items-center px-3 py-1.5 text-white/70 text-[10px] mb-2">
          <span className="font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/40" />
            <div className="w-4 h-2 rounded-sm border border-white/40" />
          </div>
        </div>

        <div className="bg-white/95 rounded-xl p-3.5 mx-0.5">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-semibold text-text-primary uppercase tracking-wide">Ballot Builder</span>
                <span className="text-[10px] text-text-muted">now</span>
              </div>
              <p className="text-xs font-semibold text-text-primary mb-0.5">{days} days until Election Day</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                2 squad members haven&apos;t finished their sample ballot. Send a friendly nudge?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nudge concept */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-brand-primary" />
          <p className="text-sm font-semibold text-text-primary">Send a friendly nudge</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-xs text-text-secondary leading-relaxed">
          &quot;Hey! Election Day is {days} days away. Have you had a chance to finish your ballot prep on Ballot Builder?&quot;
        </div>
        <p className="text-[11px] text-text-muted text-center mt-3 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 shrink-0" />
          Sent from your phone, not Ballot Builder
        </p>
      </div>
    </div>
  );
}

/* ── Main Component ── */
const SLIDES = [SlidePrivacy, SlideDashboard, SlideNudge] as const;

export default function SquadDemoModal({ open, onClose }: SquadDemoModalProps) {
  const [slide, setSlide] = useState(0);
  const { track } = useAnalyticsContext();
  const isLast = slide === SLIDES.length - 1;
  const SlideComponent = SLIDES[slide];

  const handleClose = () => {
    setSlide(0);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      track('squad_demo_notify_interest');
      handleClose();
    } else {
      setSlide((s) => s + 1);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto -mx-6 -mt-6 px-6 pt-5 pb-6">
        {/* Top row: back arrow + dot indicators */}
        <div className="flex items-center mb-4">
          {/* Back arrow — invisible spacer on slide 0 */}
          <button
            onClick={() => setSlide((s) => s - 1)}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${slide === 0 ? 'invisible' : ''}`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Dots */}
          <div className="flex-1 flex justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-brand-primary' : 'w-1.5 bg-gray-300'}`}
              />
            ))}
          </div>

          {/* Spacer to balance the back arrow */}
          <div className="w-8" />
        </div>

        {/* Coming Soon pill */}
        <div className="flex justify-center mb-1">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary">
            Coming Soon
          </span>
        </div>
        <p className="text-xs text-text-muted text-center mb-5">
          Here&apos;s what Voting Squads will look like
        </p>

        {/* Slide content */}
        <SlideComponent />

        {/* Action button */}
        <button
          onClick={handleNext}
          className="w-full mt-5 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
        >
          {isLast ? "I'm Interested — Notify Me" : 'Next'}
        </button>

        {isLast && (
          <p className="text-xs text-text-muted text-center mt-2">
            We&apos;ll let you know when Voting Squads launch
          </p>
        )}
      </div>
    </Modal>
  );
}
