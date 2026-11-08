"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // 사용자가 OS에서 '동작 줄이기'를 켜면 이동·확대 애니메이션을 끈다
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
