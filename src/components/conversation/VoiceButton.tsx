'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface VoiceButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  audioLevel?: number;
  onPress: () => void;
  disabled?: boolean;
}

export default function VoiceButton({
  isRecording,
  isTranscribing,
  audioLevel = 0,
  onPress,
  disabled,
}: VoiceButtonProps) {
  if (isTranscribing) {
    return (
      <button
        disabled
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-300"
        aria-label="Transcribing"
      >
        <Loader2 className="h-6 w-6 text-white animate-spin" />
      </button>
    );
  }

  // Scale rings from 1.0 to ~1.8 based on audio level
  const ring1 = 1 + audioLevel * 0.5;
  const ring2 = 1 + audioLevel * 0.8;

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated rings — only visible while recording */}
      {isRecording && (
        <>
          <span
            className="absolute h-14 w-14 rounded-full bg-red-400/20 transition-transform duration-100"
            style={{ transform: `scale(${ring2})` }}
          />
          <span
            className="absolute h-14 w-14 rounded-full bg-red-400/30 transition-transform duration-75"
            style={{ transform: `scale(${ring1})` }}
          />
        </>
      )}
      <button
        onClick={onPress}
        disabled={disabled}
        className={[
          'relative flex h-14 w-14 items-center justify-center rounded-full transition-all shrink-0',
          isRecording
            ? 'bg-red-500 shadow-lg shadow-red-500/30'
            : 'bg-brand-primary hover:bg-brand-primary/90 shadow-md',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="h-6 w-6"
        >
          {isRecording ? (
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3ZM7 12a1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V22h-2a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.07A7 7 0 0 0 19 12a1 1 0 1 0-2 0 5 5 0 0 1-10 0Z" />
          )}
        </svg>
      </button>
    </div>
  );
}
