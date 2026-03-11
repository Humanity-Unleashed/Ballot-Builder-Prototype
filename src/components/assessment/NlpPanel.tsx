'use client';

import React, { useState, useEffect } from 'react';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import VoiceButton from '@/components/conversation/VoiceButton';
import type { AxisSliderConfig } from '@/data/sliderPositions';

interface NlpPanelProps {
  axisConfig: AxisSliderConfig;
  /** Called when user submits text/voice input */
  onSubmit: (text: string) => void;
  /** Called when user wants to go back to cards (T5) */
  onShowCards: () => void;
  /** Whether extraction is in progress */
  isExtracting: boolean;
  disabled?: boolean;
}

export default function NlpPanel({
  axisConfig,
  onSubmit,
  onShowCards,
  isExtracting,
  disabled = false,
}: NlpPanelProps) {
  const [inputText, setInputText] = useState('');
  const voice = useVoiceInput();

  // Handle voice transcript
  useEffect(() => {
    if (voice.transcript) {
      onSubmit(voice.transcript);
      voice.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isExtracting && !disabled) {
      onSubmit(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceToggle = () => {
    if (voice.isRecording) {
      voice.stopRecording();
    } else {
      voice.startRecording();
    }
  };

  const topicName = axisConfig.question.replace(/\?$/, '').toLowerCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header with back-to-cards option */}
      <div className="px-5 pt-4 pb-3">
        <button
          onClick={onShowCards}
          disabled={isExtracting || disabled}
          className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Show card options
        </button>

        <h2 className="text-lg font-bold text-gray-900 leading-snug">
          {axisConfig.question}
        </h2>
      </div>

      {/* Prompt area */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="bg-gray-50 rounded-2xl p-5">
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Tell us what you think about {topicName} in your own words.
            A sentence or two is plenty, but say as much as you&apos;d like.
          </p>

          {/* Pole labels as context */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200">
            <div className="flex-1">
              <span className="text-[10px] font-semibold text-[#8B7AAF] uppercase tracking-wide">
                {axisConfig.poleALabel.replace(/\n/g, ' ')}
              </span>
            </div>
            <span className="text-[10px] text-gray-300">vs</span>
            <div className="flex-1 text-right">
              <span className="text-[10px] font-semibold text-[#5B9E94] uppercase tracking-wide">
                {axisConfig.poleBLabel.replace(/\n/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Extracting indicator */}
        {isExtracting && (
          <div className="flex items-center justify-center gap-2 mt-4 py-3">
            <Loader2 className="h-4 w-4 text-brand-primary animate-spin" />
            <span className="text-[13px] text-gray-500">Processing your response...</span>
          </div>
        )}
      </div>

      {/* Input area — same layout as WarmupView */}
      <div className="border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                voice.isRecording
                  ? 'Listening...'
                  : voice.isTranscribing
                    ? 'Transcribing...'
                    : 'Share your thoughts...'
              }
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
              disabled={isExtracting || disabled || voice.isRecording}
            />
            {inputText.trim() && (
              <button
                type="submit"
                disabled={isExtracting || disabled}
                className="text-brand-primary disabled:text-gray-300 transition-colors shrink-0"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>

          <VoiceButton
            isRecording={voice.isRecording}
            isTranscribing={voice.isTranscribing}
            audioLevel={voice.audioLevel}
            onPress={handleVoiceToggle}
            disabled={isExtracting || disabled}
          />
        </form>

        {voice.error && (
          <p className="text-xs text-red-500 mt-1 px-2">{voice.error}</p>
        )}
      </div>
    </div>
  );
}
