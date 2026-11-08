"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { easeOut } from "@/components/motion/Reveal";
import { RotatingText } from "@/components/motion/RotatingText";
import { openChat } from "@/lib/chat-client";

type HeroScrollProps = { name: string; roles: string[]; lines: string[] };

/**
 * 토스 메인처럼 둥근 카드가 스크롤에 따라 화면 가득 커지고, 문구는 위로 사라지는 히어로.
 * 섹션을 화면보다 길게 두고 안쪽을 sticky로 고정해 스크롤 진행도로 연출한다.
 */
export function HeroScroll({ name, roles, lines }: HeroScrollProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const inset = useTransform(scrollYProgress, [0, 0.6], [20, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.6], [32, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.75], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.75], [0, -80]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);

  return (
    <section id="top" ref={ref} className="relative h-[190svh]">
      <div className="sticky top-16 h-[calc(100svh-4rem)]">
        <motion.div
          className="absolute overflow-hidden"
          style={
            reduce
              ? { inset: 0 }
              : { top: inset, right: inset, bottom: inset, left: inset, borderRadius: radius }
          }
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 120% at 15% 10%, var(--hero-a) 0%, var(--hero-b) 45%, var(--hero-c) 100%)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-blue-500/30 blur-3xl"
            style={{ scale: reduce ? 1 : glowScale }}
            animate={reduce ? undefined : { x: [0, -60, 20, 0], y: [0, 40, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white"
            style={reduce ? undefined : { opacity: textOpacity, y: textY }}
          >
            <motion.p
              className="text-base font-semibold text-white/70 sm:text-xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <RotatingText items={roles} /> {name}
            </motion.p>

            <h1 className="mt-5 text-[2.5rem] font-bold leading-[1.2] tracking-tight sm:text-6xl lg:text-7xl">
              {lines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-2">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: easeOut, delay: 0.15 + i * 0.14 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.6 }}
            >
              <a
                href="#projects"
                className="rounded-button bg-white px-6 py-3.5 font-semibold text-[#191f28] transition-transform active:scale-[0.97]"
              >
                프로젝트 보기
              </a>
              <button
                type="button"
                onClick={() => openChat()}
                className="rounded-button bg-white/15 px-6 py-3.5 font-semibold text-white backdrop-blur transition-[transform,background-color] hover:bg-white/25 active:scale-[0.97]"
              >
                AI에게 물어보기
              </button>
            </motion.div>
          </motion.div>

          <motion.a
            href="#ask"
            aria-label="아래로 내려가기"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white"
            style={reduce ? undefined : { opacity: textOpacity }}
          >
            <motion.svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              animate={reduce ? undefined : { y: [0, 6, 0] }}
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
        </motion.div>
      </div>
    </section>
  );
}
