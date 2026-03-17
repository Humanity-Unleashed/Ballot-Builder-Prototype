'use client';

import React from 'react';
import type { ConversationMessage } from '@/types/conversation';

interface ChatBubbleProps {
  message: ConversationMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // Split on double newlines for paragraph breaks
  const paragraphs = message.content.split(/\n\n+/);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-[21px]',
          isUser
            ? 'bg-brand-primary text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md',
        ].join(' ')}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
