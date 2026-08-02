import React, { memo } from 'react';

interface MessageBubbleProps {
  text: string;
  isBot: boolean;
  children?: React.ReactNode;
}

export const MessageBubble = memo(function MessageBubble({ text, isBot, children }: MessageBubbleProps) {
  if (isBot) {
    return (
      <div className="flex gap-2 items-start max-w-[85%]">
        <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
          🤖
        </div>
        <div className="bg-white border border-slate-200/75 p-3 rounded-2xl rounded-bl-none shadow-3xs">
          {text || children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="bg-indigo-600 text-white px-3 py-2 rounded-2xl rounded-br-none shadow-3xs max-w-[80%] text-right font-bold">
        {text}
      </div>
    </div>
  );
});
