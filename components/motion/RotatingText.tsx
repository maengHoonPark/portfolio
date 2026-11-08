"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { easeOut } from "./Reveal";

type RotatingTextProps = { items: string[]; interval?: number };

/** 문구가 위로 굴러가며 바뀌는 텍스트 */
export function RotatingText({ items, interval = 2600 }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || items.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval, reduce]);

  return (
    <>
      <span aria-hidden className="relative inline-flex overflow-hidden align-bottom">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {items[index]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only">{items.join(", ")}</span>
    </>
  );
}
