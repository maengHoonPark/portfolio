"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatError, streamChat, type ChatMessage } from "@/lib/chat-client";

export type ChatStatus = "idle" | "waiting" | "streaming";

/** 콜드스타트로 첫 토큰이 늦으면 "서버 깨우는 중"을 띄우는 기준 */
const WAKING_THRESHOLD_MS = 3000;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  /** 질문을 보낸다. 답을 하나도 못 받고 실패하면 입력창에 되돌릴 질문을 반환한다. */
  const send = useCallback(
    async (text: string): Promise<string | null> => {
      const question = text.trim();
      if (!question || status !== "idle") return null;

      const history: ChatMessage[] = [...messages, { role: "user", content: question }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setStatus("waiting");
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;
      const wakeTimer = setTimeout(() => setWaking(true), WAKING_THRESHOLD_MS);
      let received = false;

      try {
        await streamChat({
          messages: history,
          signal: controller.signal,
          onToken: (token) => {
            if (!received) {
              received = true;
              clearTimeout(wakeTimer);
              setWaking(false);
              setStatus("streaming");
            }
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, content: last.content + token };
              return next;
            });
          },
        });
        return null;
      } catch (e) {
        // 답을 하나도 못 받았으면 질문과 빈 답변을 지워 대화 순서(user→assistant)를 유지한다
        if (!received) setMessages((prev) => prev.slice(0, -2));
        if (controller.signal.aborted) return received ? null : question;
        setError(e instanceof ChatError ? e.message : "알 수 없는 오류가 발생했어요.");
        return received ? null : question;
      } finally {
        clearTimeout(wakeTimer);
        setWaking(false);
        setStatus("idle");
        abortRef.current = null;
      }
    },
    [messages, status],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { messages, status, waking, error, send, stop };
}
