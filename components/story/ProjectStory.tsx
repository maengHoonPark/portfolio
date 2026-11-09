"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { easeOut, Reveal } from "@/components/motion/Reveal";
import { ProjectText } from "./ProjectText";
import { ProjectVisual } from "./ProjectVisual";

/**
 * 토스처럼 화면을 고정한 채 스크롤하면 프로젝트가 하나씩 바뀌는 섹션.
 * 넓은 화면(lg)에서만 고정 연출을 쓰고, 좁은 화면에서는 세로로 나열한다.
 */
export function ProjectStory({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-40">
        <Reveal>
          <p className="text-sm font-semibold text-blue-500">Projects</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-strong sm:text-6xl">
            직접 만들고,
            <br />
            지금도 다루고 있는 것들
          </h2>
        </Reveal>
      </div>
      <PinnedStory projects={projects} />
      <StackedList projects={projects} />
    </section>
  );
}

function PinnedStory({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(projects.length - 1, Math.max(0, Math.floor(v * projects.length))));
  });

  const p = projects[active];
  const fade = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -24 },
      };

  return (
    <div
      ref={ref}
      className="relative hidden lg:block"
      style={{ height: `${projects.length * 100}svh` }}
    >
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[5fr_6fr] items-center gap-14 px-6">
          <div className="min-h-[420px]">
            <ProgressDots count={projects.length} active={active} />
            <AnimatePresence mode="wait">
              <motion.div key={p.slug} {...fade} transition={{ duration: 0.45, ease: easeOut }}>
                <ProjectText project={p} index={active} total={projects.length} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative aspect-[6/5] overflow-hidden rounded-hero bg-bg-sub">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={p.slug}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: easeOut }}
              >
                <ProjectVisual visual={p.visual} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="mb-8 flex gap-1.5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === active ? "w-8 bg-blue-500" : "w-1.5 bg-line"
          }`}
        />
      ))}
    </div>
  );
}

function StackedList({ projects }: { projects: Project[] }) {
  return (
    <ul className="mx-auto mt-12 flex max-w-6xl flex-col gap-16 px-6 pb-28 lg:hidden">
      {projects.map((p, i) => (
        <li key={p.slug}>
          <Reveal>
            {/* 모바일에서는 고정 비율 박스를 쓰지 않아 구조도·스크린샷이 잘리지 않는다 */}
            <div className="relative overflow-hidden rounded-hero bg-bg-sub">
              <ProjectVisual visual={p.visual} layout="flow" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="mt-6">
            <ProjectText project={p} index={i} total={projects.length} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
