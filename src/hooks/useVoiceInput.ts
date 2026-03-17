'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseVoiceInputReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string | null;
  error: string | null;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopAudioLevel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => stopAudioLevel, [stopAudioLevel]);

  const startAudioLevel = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      // Average the frequency bins and normalize to 0-1
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length / 255;
      setAudioLevel(avg);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const reset = useCallback(() => {
    setTranscript(null);
    setError(null);
    setIsRecording(false);
    setIsTranscribing(false);
    stopAudioLevel();
  }, [stopAudioLevel]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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
        streamRef.current = null;

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size === 0) {
          setError('No audio captured');
          return;
        }

        setIsTranscribing(true);

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
            return;
          }

          setTranscript(data.text || '');
        } catch {
          setError('Network error — is the server running?');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      startAudioLevel(stream);
      setIsRecording(true);
    } catch {
      setError('Microphone access denied. Please allow mic permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopAudioLevel();
    }
  }, [stopAudioLevel]);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    reset,
  };
}
