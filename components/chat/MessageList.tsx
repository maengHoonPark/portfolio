"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat-client";
import type { ChatStatus } from "./useChat";

type MessageListProps = {
  greeting: string;
  notice: string;
  suggestions: string[];
  messages: ChatMessage[];
  status: ChatStatus;
  wakingMessage: string | null;
  error: string | null;
  onSuggestion: (question: string) => void;
};

export function MessageList({
  greeting,
  notice,
  suggestions,
  messages,
  status,
  wakingMessage,
  error,
  onSuggestion,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // 새 메시지나 토큰이 오면 맨 아래로 따라간다
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, wakingMessage, error]);

  return (
    <div
      ref={listRef}
      aria-live="polite"
      aria-busy={status !== "idle"}
      className="flex-1 space-y-3 overflow-y-auto px-4 py-5"
    >
      <p className="flex items-start gap-2 rounded-button bg-blue-50 px-3.5 py-2.5 text-xs leading-relaxed text-blue-500">
        <span aria-hidden className="mt-px font-bold">
          i
        </span>
        {notice}
      </p>

      <Bubble role="assistant">{greeting}</Bubble>

      {messages.length === 0 && (
        <ul className="flex flex-wrap gap-2 pt-1" aria-label="추천 질문">
          {suggestions.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => onSuggestion(q)}
                className="rounded-full border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:border-blue-500 hover:text-blue-500 active:scale-[0.97]"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      )}

      {messages.map((m, i) =>
        m.role === "assistant" && m.content === "" ? (
          <TypingIndicator key={i} />
        ) : (
          <Bubble key={i} role={m.role}>
            {m.content}
          </Bubble>
        ),
      )}

      {wakingMessage && <p className="text-center text-xs text-weak">{wakingMessage}</p>}
      {error && (
        <p role="alert" className="text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Bubble({ role, children }: { role: ChatMessage["role"]; children: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-card px-4 py-2.5 text-[15px] leading-relaxed ${
          isUser ? "rounded-br-md bg-blue-500 text-white" : "rounded-bl-md bg-bg-sub text-strong"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-label="답변 작성 중">
      <span className="flex gap-1 rounded-card rounded-bl-md bg-bg-sub px-4 py-3.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-weak"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
