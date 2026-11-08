"use client";

import { useState, type FormEvent } from "react";
import chat from "@/content/chat.json";
import { MAX_QUESTION_LENGTH, openChat } from "@/lib/chat-client";

/** 페이지 본문에 바로 보이는 챗봇 입력창. 질문하면 챗봇 창이 열리며 답이 시작된다. */
export function AskBox() {
  const [question, setQuestion] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setQuestion("");
    openChat(q);
  };

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-xl shadow-blue-500/5 sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="ask-input" className="sr-only">
          {chat.section.inputPlaceholder}
        </label>
        <input
          id="ask-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={chat.section.inputPlaceholder}
          maxLength={MAX_QUESTION_LENGTH}
          className="min-w-0 flex-1 rounded-button bg-bg-sub px-5 py-4 text-base text-strong outline-none placeholder:text-weak focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!question.trim()}
          className="rounded-button bg-blue-500 px-6 py-4 font-semibold text-white transition-[opacity,transform] active:scale-[0.97] disabled:opacity-40"
        >
          {chat.section.submit}
        </button>
      </form>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="추천 질문">
        {chat.suggestions.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => openChat(q)}
              className="rounded-full border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:border-blue-500 hover:text-blue-500 active:scale-[0.97]"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-5 flex items-start gap-2 rounded-button bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-500">
        <span aria-hidden className="font-bold">
          i
        </span>
        {chat.coldStartNotice}
      </p>
    </div>
  );
}
