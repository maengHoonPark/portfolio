"use client";

import { motion } from "motion/react";

/** 히어로 하단의 '아래로 스크롤' 안내 */
export function ScrollCue({ href, label }: { href: string; label: string }) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-weak hover:text-strong"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.a>
  );
}
