"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";

/**
 * 스크롤할수록 단어가 흐릿한 상태에서 하나씩 또렷해지는 한 문장 섹션 (토스 "매일 하는 ..." 연출).
 * 줄바꿈(\n)으로 문장을 여러 줄로 나눌 수 있다.
 */
export function WordReveal({ id, text }: { id?: string; text: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const lines = text.split("\n").map((line) => line.split(" "));
  const total = lines.reduce((n, words) => n + words.length, 0);
  let index = 0;

  return (
    <section id={id} ref={ref} className="relative h-[220svh]">
      <div className="sticky top-0 flex h-svh items-center justify-center px-6">
        <p
          aria-label={text.replace("\n", " ")}
          className="max-w-5xl text-center text-3xl font-bold leading-snug tracking-tight text-strong sm:text-5xl lg:text-6xl"
        >
          {lines.map((words, li) => (
            <span key={li} aria-hidden className="block">
              {words.map((word) => {
                const i = index++;
                // 전체 진행도의 앞 80% 안에서 단어마다 구간을 나눠 차례로 드러낸다
                const start = (i / total) * 0.8;
                const end = start + 0.8 / total;
                return reduce ? (
                  <span key={i} className="mr-[0.25em] inline-block">
                    {word}
                  </span>
                ) : (
                  <Word key={i} progress={scrollYProgress} range={[start, end]}>
                    {word}
                  </Word>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const blur = useTransform(progress, range, [10, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span className="mr-[0.25em] inline-block" style={{ opacity, filter }}>
      {children}
    </motion.span>
  );
}
