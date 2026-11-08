"use client";

import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/Button";
import { OPEN_CHAT_EVENT } from "@/lib/chat-client";

export function OpenChatButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
      className={buttonClass("secondary")}
    >
      {children}
    </button>
  );
}
