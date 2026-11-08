"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

/** 스크롤한 만큼 왼쪽 세로선이 파랗게 채워지는 타임라인 래퍼 */
export function ScrollLine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative">
      {children}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 h-full w-0.5 origin-top bg-blue-500"
        style={{ scaleY }}
      />
    </div>
  );
}
