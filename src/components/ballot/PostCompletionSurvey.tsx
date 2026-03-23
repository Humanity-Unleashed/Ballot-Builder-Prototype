'use client';

import { useState } from 'react';
import { Send, Mic, MicOff, Loader2, ChevronRight } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

// ── Survey questions ──

interface ChoiceQuestion {
  id: string;
  type: 'choice';
  text: string;
  options: { value: string; label: string }[];
}

interface OpenQuestion {
  id: string;
  type: 'open';
  text: string;
  placeholder: string;
  optional: true;
}

type SurveyQuestion = ChoiceQuestion | OpenQuestion;

const QUESTIONS: SurveyQuestion[] = [
  {
    id: 'would_use',
    type: 'choice',
    text: 'If this app were free and had your real ballot, would you use it before voting?',
    options: [
      { value: 'definitely_yes', label: 'Definitely yes' },
      { value: 'probably_yes', label: 'Probably yes' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'probably_not', label: 'Probably not' },
      { value: 'definitely_not', label: 'Definitely not' },
    ],
  },
  {
    id: 'time_comparison',
    type: 'choice',
    text: 'Compared to how you normally prepare to vote, this felt:',
    options: [
      { value: 'much_faster', label: 'Much faster' },
      { value: 'somewhat_faster', label: 'Somewhat faster' },
      { value: 'about_same', label: 'About the same' },
      { value: 'slower', label: 'Slower' },
      { value: 'dont_prepare', label: "I don't usually prepare" },
    ],
  },
  {
    id: 'would_share',
    type: 'choice',
    text: 'Would you share this with a friend or family member?',
    options: [
      { value: 'yes_direct', label: "Yes, I'd text or email it to someone" },
      { value: 'yes_social', label: "Yes, I'd post it on social media" },
      { value: 'maybe', label: 'Maybe, if someone asked' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'trust',
    type: 'choice',
    text: 'How much do you trust the match scores and recommendations?',
    options: [
      { value: 'a_lot', label: 'A lot — they felt accurate' },
      { value: 'somewhat', label: "Somewhat — I'd want to verify a few" },
      { value: 'not_much', label: 'Not much — some felt off' },
      { value: 'not_at_all', label: 'Not at all' },
    ],
  },
  {
    id: 'improvement',
    type: 'open',
    text: 'What would make you more likely to use this?',
    placeholder: 'Type or tap the mic to speak...',
    optional: true,
  },
];

// ── Component ──

interface PostCompletionSurveyProps {
  /** Called when the survey is submitted or skipped */
  onComplete: (responses: Record<string, string>) => void;
  /** A/B test variant for analytics */
  archetypeVariant?: string;
}

export default function PostCompletionSurvey({
  onComplete,
  archetypeVariant,
}: PostCompletionSurveyProps) {
  const { track } = useAnalyticsContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [openText, setOpenText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const voice = useVoiceInput();

  // Combine typed text with voice transcript for display and submission
  const combinedText = [openText, voice.transcript].filter(Boolean).join(' ');

  const question = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleChoice = (value: string) => {
    const updated = { ...responses, [question.id]: value };
    setResponses(updated);
    track('survey_answer', {
      questionId: question.id,
      answer: value,
      archetypeVariant,
    });

    if (isLastStep) {
      handleSubmit(updated);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleOpenSubmit = () => {
    const finalText = combinedText.trim();
    const updated = finalText
      ? { ...responses, [question.id]: finalText }
      : responses;
    handleSubmit(updated);
  };

  const handleSubmit = (finalResponses: Record<string, string>) => {
    setSubmitted(true);
    track('survey_complete', {
      ...finalResponses,
      archetypeVariant,
    });
    // Short delay so user sees the thank-you state
    setTimeout(() => onComplete(finalResponses), 1500);
  };

  const handleSkip = () => {
    track('survey_skip', { step: currentStep, archetypeVariant });
    onComplete(responses);
  };

  // Thank-you state
  if (submitted) {
    return (
      <div className="mx-4 rounded-2xl border border-border-default bg-white px-5 py-8 text-center">
        <p className="text-2xl mb-2">🙏</p>
        <p className="text-[15px] font-bold text-gray-900">Thank you!</p>
        <p className="text-[13px] text-gray-500 mt-1">Your feedback helps us make this better.</p>
      </div>
    );
  }

  return (
    <div className="mx-4 rounded-2xl border border-border-default bg-white overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-brand-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-5 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Quick feedback · {currentStep + 1} of {QUESTIONS.length}
          </p>
          <button
            onClick={handleSkip}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip survey
          </button>
        </div>

        {/* Question */}
        <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-4">
          {question.text}
        </h3>

        {/* Choice options */}
        {question.type === 'choice' && (
          <div className="space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChoice(opt.value)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-border-default bg-white hover:border-brand-primary hover:bg-brand-primary/[0.03] transition-all text-[14px] text-gray-700 font-medium flex items-center justify-between group"
              >
                <span>{opt.label}</span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-primary transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Open-ended with voice */}
        {question.type === 'open' && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={combinedText}
                onChange={(e) => {
                  // If voice transcript exists, commit it into openText on edit
                  if (voice.transcript) {
                    setOpenText(e.target.value);
                    voice.reset();
                  } else {
                    setOpenText(e.target.value);
                  }
                }}
                placeholder={question.placeholder}
                rows={3}
                className="w-full rounded-xl border-2 border-border-default px-4 py-3 pr-12 text-[14px] text-gray-700 placeholder-gray-400 focus:border-brand-primary focus:outline-none resize-none"
              />
              {/* Mic button */}
              <button
                onClick={() => {
                  if (voice.isRecording) {
                    voice.stopRecording();
                  } else {
                    voice.startRecording();
                  }
                }}
                disabled={voice.isTranscribing}
                className={`absolute right-3 bottom-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  voice.isRecording
                    ? 'bg-red-500 text-white'
                    : voice.isTranscribing
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-gray-100 text-gray-500 hover:bg-brand-primary/10 hover:text-brand-primary'
                }`}
              >
                {voice.isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : voice.isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>

            {voice.isRecording && (
              <p className="text-[12px] text-red-500 font-medium animate-pulse">
                Recording... tap mic to stop
              </p>
            )}

            {voice.error && (
              <p className="text-[12px] text-red-500">{voice.error}</p>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={handleOpenSubmit}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
              >
                <Send className="h-4 w-4" />
                {combinedText.trim() ? 'Submit' : 'Skip & finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
