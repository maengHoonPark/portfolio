"use client";

import type { ReactNode } from "react";
import { buttonClass } from "./Button";
import { useToast } from "./Toast";

type CopyButtonProps = { text: string; toastMessage: string; children: ReactNode };

export function CopyButton({ text, toastMessage, children }: CopyButtonProps) {
  const { show } = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      show(toastMessage);
    } catch {
      show("복사하지 못했어요. 직접 선택해서 복사해 주세요.");
    }
  };
  return (
    <button type="button" onClick={copy} className={buttonClass("secondary")}>
      {children}
    </button>
  );
}
