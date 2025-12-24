
import React from 'react';
import type { ChatMessage } from '../types';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-sm whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-lg'
            : 'bg-white text-slate-700 rounded-bl-lg'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};
