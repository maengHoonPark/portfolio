"use client";

import { motion } from "motion/react";

/** 히어로 뒤에서 천천히 떠다니는 흐릿한 색 덩어리 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl sm:h-[28rem] sm:w-[28rem]"
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -20, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-[-15%] h-72 w-72 rounded-full bg-blue-50 blur-3xl sm:h-96 sm:w-96"
        animate={{ x: [0, 50, -10, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
