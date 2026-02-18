'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#6C2BD9', '#2DA562', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const PIECE_COUNT = 40;
const CLEANUP_MS = 5000;

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < PIECE_COUNT; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'fixed';
      piece.style.top = '0';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.width = `${Math.random() * 8 + 6}px`;
      piece.style.height = `${Math.random() * 8 + 6}px`;
      piece.style.borderRadius = '2px';
      piece.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      piece.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear ${Math.random()}s forwards`;
      piece.style.pointerEvents = 'none';
      piece.style.zIndex = '9999';
      container.appendChild(piece);
      pieces.push(piece);
    }

    const timer = setTimeout(() => {
      pieces.forEach((p) => p.remove());
    }, CLEANUP_MS);

    return () => {
      clearTimeout(timer);
      pieces.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" />;
}
