"use client";

import { motion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

/** 호버 시 살짝 떠오르고 마우스를 따라 빛이 비치며, 누르면 쏙 들어가는 터치 피드백 */
export function Pressable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  // 매 움직임마다 리렌더하지 않도록 CSS 변수로 마우스 위치만 넘긴다
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      className={`group relative ${className}`}
      onMouseMove={onMouseMove}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--blue-500) 12%, transparent), transparent 70%)",
        }}
      />
    </motion.div>
  );
}
