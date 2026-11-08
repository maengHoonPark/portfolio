"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { easeOut } from "./Reveal";

type CountUpProps = { to: number; suffix?: string };

/** 화면에 보이면 0부터 목표 숫자까지 올라가는 카운터 */
export function CountUp({ to, suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    if (reduce) {
      el.textContent = to.toLocaleString();
      return;
    }
    // 매 프레임 리렌더를 피하려고 state 대신 DOM 텍스트를 직접 갱신한다
    const controls = animate(0, to, {
      duration: 1.2,
      ease: easeOut,
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <>
      <span aria-hidden>
        <span ref={ref}>0</span>
        {suffix}
      </span>
      <span className="sr-only">
        {to.toLocaleString()}
        {suffix}
      </span>
    </>
  );
}
