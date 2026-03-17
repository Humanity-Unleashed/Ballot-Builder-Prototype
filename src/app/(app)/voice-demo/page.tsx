'use client';

import { useState, useRef, useCallback } from 'react';

export default function VoiceDemoPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<string>('Tap the mic and say something');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks so the browser mic indicator goes away
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size === 0) {
          setError('No audio captured');
          setStatus('Tap the mic and say something');
          return;
        }

        setStatus('Transcribing...');

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const res = await fetch('/api/speech', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || 'Transcription failed');
            setStatus('Tap the mic to try again');
            return;
          }

          setTranscript(data.text);
          setStatus('Done! Tap the mic to record again');
        } catch (err) {
          setError('Network error — is the server running?');
          setStatus('Tap the mic to try again');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Listening... tap to stop');
    } catch (err) {
      setError('Microphone access denied. Please allow mic permissions.');
      setStatus('Tap the mic to try again');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="text-2xl font-bold">Voice Demo</h1>
      <p className="text-sm text-gray-500">{status}</p>

      {/* Mic button */}
      <button
        onClick={toggleRecording}
        className={`flex h-24 w-24 items-center justify-center rounded-full transition-all ${
          isRecording
            ? 'bg-red-500 shadow-lg shadow-red-500/30 animate-pulse'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
        }`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="h-10 w-10"
        >
          {isRecording ? (
            // Stop icon (square)
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            // Mic icon
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3ZM7 12a1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V22h-2a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.07A7 7 0 0 0 19 12a1 1 0 1 0-2 0 5 5 0 0 1-10 0Z" />
          )}
        </svg>
      </button>

      {/* Transcript display */}
      {transcript && (
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">Transcript</p>
          <p className="text-lg text-gray-900">{transcript}</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
