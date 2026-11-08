"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import chat from "@/content/chat.json";
import {
  MAX_QUESTION_LENGTH,
  OPEN_CHAT_EVENT,
  wakeServer,
  type OpenChatDetail,
} from "@/lib/chat-client";
import { useChat } from "./useChat";
import { MessageList } from "./MessageList";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, status, waking, error, send, stop } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const warmed = useRef(false);
  const busy = status !== "idle";

  const openChat = useCallback(() => {
    setOpen(true);
    if (!warmed.current) {
      warmed.current = true;
      wakeServer();
    }
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    stop();
  }, [stop]);

  // 이벤트 리스너가 항상 최신 submit을 부르도록 ref에 담아 둔다
  const submitRef = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => {
    const onOpen = (e: Event) => {
      openChat();
      const question = (e as CustomEvent<OpenChatDetail>).detail?.question;
      if (question) void submitRef.current(question);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, [openChat]);

  // 처음 들어오면 버튼 옆에 "물어보세요" 말풍선을 띄워 챗봇이 있다는 걸 알린다
  const [teaser, setTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTeaser(true), 1500);
    return () => clearTimeout(id);
  }, []);
  const showTeaser = teaser && !teaserDismissed && !open;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && closeChat();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  const submit = async (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    const restore = await send(text);
    if (restore) setInput(restore);
    inputRef.current?.focus();
  };

  useEffect(() => {
    submitRef.current = submit;
  });

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중 Enter는 글자 확정이므로 전송하지 않는다
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit(input);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showTeaser && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 flex max-w-[260px] items-start gap-2 rounded-card rounded-br-md border border-line bg-surface p-4 text-sm text-strong shadow-xl"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <button type="button" onClick={openChat} className="text-left">
              <span className="block font-bold">{chat.teaser.title}</span>
              <span className="mt-1 block text-body">{chat.teaser.body}</span>
            </button>
            <button
              type="button"
              onClick={() => setTeaserDismissed(true)}
              aria-label="안내 닫기"
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-weak hover:text-strong"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={openChat}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChatIcon />
            {chat.fab}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={chat.title}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[85svh] flex-col overflow-hidden rounded-t-card border border-line bg-surface shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100svh-3rem)] sm:w-[400px] sm:rounded-card"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="font-bold text-strong">{chat.title}</h2>
                <p className="mt-0.5 text-xs text-weak">{chat.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label="챗봇 닫기"
                className="-mr-1 rounded-button p-1.5 text-weak hover:bg-bg-sub hover:text-strong"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <MessageList
              greeting={chat.greeting}
              notice={chat.coldStartNotice}
              suggestions={chat.suggestions}
              messages={messages}
              status={status}
              wakingMessage={waking ? chat.wakingMessage : null}
              error={error}
              onSuggestion={(q) => void submit(q)}
            />

            <form
              className="border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void submit(input);
              }}
            >
              <div className="flex items-end gap-2 rounded-button bg-bg-sub px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={chat.placeholder}
                  aria-label={chat.placeholder}
                  maxLength={MAX_QUESTION_LENGTH}
                  rows={1}
                  className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-strong outline-none placeholder:text-weak"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="shrink-0 rounded-button bg-strong px-3.5 py-2 text-sm font-semibold text-bg"
                  >
                    중지
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="shrink-0 rounded-button bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  >
                    보내기
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-right text-xs text-weak tabular-nums">
                {input.length}/{MAX_QUESTION_LENGTH}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z"
        fill="currentColor"
      />
    </svg>
  );
}
