'use client';

import { useState } from 'react';
import { Lock, Check, Ban, ChevronLeft, Users, Copy, Mail, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { useSquadStore } from '@/stores/squadStore';

interface SquadDemoModalProps {
  open: boolean;
  onClose: () => void;
}

function CheckDot() {
  return (
    <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center shrink-0">
      <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
    </span>
  );
}

function GrayDot() {
  return (
    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
    </span>
  );
}

function BanIcon() {
  return (
    <span className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center shrink-0">
      <Ban className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="w-5 h-5 rounded bg-success/15 flex items-center justify-center shrink-0">
      <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
    </span>
  );
}

/* ── Slide: Privacy ── */
function SlidePrivacy() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-brand-primary" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-text-primary text-center mb-4">Your ballot stays private</h3>

      <div className="rounded-xl border border-border-default overflow-hidden">
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

        <div className="border-t border-border-default" />

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

/* ── Slide: Name your squad ── */
function SlideNameSquad({ squadName, setSquadName }: { squadName: string; setSquadName: (v: string) => void }) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-brand-primary" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-text-primary text-center mb-2">Name your squad</h3>
      <p className="text-sm text-text-secondary text-center mb-5">Pick something fun your group will recognize.</p>

      <input
        type="text"
        value={squadName}
        onChange={(e) => setSquadName(e.target.value)}
        placeholder="e.g., Smith Family"
        maxLength={40}
        className="w-full px-4 py-3 rounded-xl border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
        autoFocus
      />
    </div>
  );
}

/* ── Slide: Share invite ── */
function SlideShare({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Join my Voting Squad on Ballot Builder! Track who's ballot-ready — no one sees your votes: ${inviteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleText = () => {
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent('Join my Voting Squad!')}&body=${encodeURIComponent(shareMessage)}`,
      '_blank'
    );
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
          <Check className="w-7 h-7 text-success" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-text-primary text-center mb-2">You&apos;re all set!</h3>
      <p className="text-sm text-text-secondary text-center mb-5">Share the link to invite your squad.</p>

      {/* Invite URL display */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-2">
        <span className="flex-1 text-xs text-text-secondary truncate font-mono">{inviteUrl}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-border-default text-xs font-medium text-text-primary hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleText}
          className="flex flex-col items-center gap-2 py-3 rounded-xl border border-border-default hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-success" />
          <span className="text-xs font-medium text-text-primary">Text</span>
        </button>
        <button
          onClick={handleEmail}
          className="flex flex-col items-center gap-2 py-3 rounded-xl border border-border-default hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-medium text-text-primary">Email</span>
        </button>
        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-2 py-3 rounded-xl border border-border-default hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-5 h-5 text-brand-primary" />
          <span className="text-xs font-medium text-text-primary">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard view (Mode B) ── */
const CHECKPOINT_LABELS = ['Account', 'Registered', 'Ballot Done', 'Voted'] as const;
type CheckpointKey = 'account' | 'registration' | 'ballot' | 'voted';
const CHECKPOINT_KEYS: CheckpointKey[] = ['account', 'registration', 'ballot', 'voted'];

function SquadDashboard({ onClose }: { onClose: () => void }) {
  const { squadName, members, getInviteUrl, leaveSquad } = useSquadStore();
  const { track } = useAnalyticsContext();
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = getInviteUrl();
  const shareMessage = `Join my Voting Squad on Ballot Builder! Track who's ballot-ready — no one sees your votes: ${inviteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const input = document.createElement('input');
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    track('squad_leave');
    leaveSquad();
    onClose();
  };

  if (showShare) {
    return (
      <div className="animate-fade-in-up">
        <h3 className="text-lg font-bold text-text-primary text-center mb-4">Invite more people</h3>

        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="flex-1 text-xs text-text-secondary truncate font-mono">{inviteUrl}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-border-default text-xs font-medium text-text-primary hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank')}
            className="flex flex-col items-center gap-2 py-3 rounded-xl border border-border-default hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-success" />
            <span className="text-xs font-medium text-text-primary">Text</span>
          </button>
          <button
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Join my Voting Squad!')}&body=${encodeURIComponent(shareMessage)}`, '_blank')}
            className="flex flex-col items-center gap-2 py-3 rounded-xl border border-border-default hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-text-primary">Email</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 py-3 rounded-xl border border-border-default hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-5 h-5 text-brand-primary" />
            <span className="text-xs font-medium text-text-primary">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        <button
          onClick={() => setShowShare(false)}
          className="w-full py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
        >
          Back to Squad
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Squad name header */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <Users className="w-5 h-5 text-brand-primary" />
        <h3 className="text-lg font-bold text-text-primary">{squadName}</h3>
      </div>

      {/* Checkpoint column labels */}
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="flex-1" />
        {CHECKPOINT_LABELS.map((label) => (
          <span key={label} className="w-[52px] text-center text-[10px] text-text-muted font-medium leading-tight">
            {label}
          </span>
        ))}
      </div>

      {/* Member rows */}
      <div className="rounded-xl border border-border-default overflow-hidden mb-4">
        {members.map((member, idx) => {
          const completedCount = CHECKPOINT_KEYS.filter((k) => member.checkpoints[k]).length;
          return (
            <div
              key={member.id}
              className={`px-3 py-3 flex items-center gap-3 ${idx < members.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {member.name}
                  {member.isCreator && <span className="text-xs text-text-muted font-normal ml-1">(you)</span>}
                </p>
              </div>
              {CHECKPOINT_KEYS.map((key) => (
                <div key={key} className="w-[52px] flex justify-center">
                  {member.checkpoints[key] ? <CheckDot /> : <GrayDot />}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Invite button */}
      <button
        onClick={() => {
          track('squad_invite_more');
          setShowShare(true);
        }}
        className="w-full py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Users className="w-4 h-4" />
        Invite More People
      </button>

      {/* Leave squad */}
      <button
        onClick={handleLeave}
        className="w-full mt-3 text-xs text-text-muted hover:text-red-500 transition-colors text-center py-1"
      >
        Leave Squad
      </button>
    </div>
  );
}

/* ── Main Component ── */
const CREATION_SLIDES = 3;

export default function SquadDemoModal({ open, onClose }: SquadDemoModalProps) {
  const [slide, setSlide] = useState(0);
  const [squadNameInput, setSquadNameInput] = useState('');
  const { track } = useAnalyticsContext();
  const { hasSquad, createSquad, getInviteUrl } = useSquadStore();

  const handleClose = () => {
    setSlide(0);
    setSquadNameInput('');
    onClose();
  };

  // Mode B: squad exists — show dashboard
  if (hasSquad()) {
    return (
      <Modal open={open} onClose={handleClose}>
        <div className="max-h-[80vh] overflow-y-auto -mx-6 -mt-6 px-6 pt-5 pb-6">
          <SquadDashboard onClose={handleClose} />
        </div>
      </Modal>
    );
  }

  // Mode A: creation wizard
  const handleNext = () => {
    if (slide === 0) {
      // Privacy slide -> Name slide
      setSlide(1);
    } else if (slide === 1) {
      // Name slide -> Create squad and show share slide
      const name = squadNameInput.trim() || 'My Voting Squad';
      track('squad_created', { squadName: name });
      createSquad(name, 'You');
      setSlide(2);
    } else if (slide === 2) {
      // Share slide -> Done
      track('squad_setup_complete');
      handleClose();
    }
  };

  const ctaLabel = slide === 0 ? 'Next' : slide === 1 ? 'Create Squad' : 'Done';
  const ctaDisabled = slide === 1 && squadNameInput.trim().length === 0;

  const inviteUrl = getInviteUrl();

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto -mx-6 -mt-6 px-6 pt-5 pb-6">
        {/* Top row: back arrow + dot indicators */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSlide((s) => s - 1)}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${slide === 0 ? 'invisible' : ''}`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>

          <div className="flex-1 flex justify-center gap-1.5">
            {Array.from({ length: CREATION_SLIDES }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-brand-primary' : 'w-1.5 bg-gray-300'}`}
              />
            ))}
          </div>

          <div className="w-8" />
        </div>

        {/* Slide content */}
        {slide === 0 && <SlidePrivacy />}
        {slide === 1 && <SlideNameSquad squadName={squadNameInput} setSquadName={setSquadNameInput} />}
        {slide === 2 && <SlideShare inviteUrl={inviteUrl} />}

        {/* Action button */}
        <button
          onClick={handleNext}
          disabled={ctaDisabled}
          className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm transition-colors ${
            ctaDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-brand-primary text-white hover:bg-brand-primary/90'
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </Modal>
  );
}
