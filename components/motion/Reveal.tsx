"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export const easeOut = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** 화면에 들어올 때 아래에서 부드럽게 떠오르는 등장 효과 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}
