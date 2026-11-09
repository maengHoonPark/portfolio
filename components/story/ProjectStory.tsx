"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useRef, useState } from "react";
import type { Project, ProjectLink } from "@/lib/content";
import { easeOut, Reveal } from "@/components/motion/Reveal";
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

function ProjectText({
  project: p,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    <>
      <p className="text-sm font-semibold text-weak tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {p.period}
      </p>
      <h3 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-strong sm:text-4xl">
        {p.title}
      </h3>
      <p className="mt-2 font-semibold text-blue-500">{p.role}</p>
      <p className="mt-5 leading-relaxed text-body">{p.summary}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {p.stack.map((s) => (
          <li key={s} className="rounded-full bg-bg-sub px-3 py-1 text-sm font-medium text-body">
            {s}
          </li>
        ))}
      </ul>
      {p.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {p.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-button px-4 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97] ${
                l.kind === "live" ? "bg-blue-500 text-white" : "bg-strong text-bg"
              }`}
            >
              <LinkIcon kind={l.kind} />
              {l.label}
            </a>
          ))}
        </div>
      )}
      {p.note && <p className="mt-6 text-sm text-weak">{p.note}</p>}
      {p.featured && (
        <a
          href="#deep-dive"
          className="mt-6 inline-block text-sm font-semibold text-blue-500 hover:underline"
        >
          구조와 회고 자세히 보기 →
        </a>
      )}
    </>
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

function LinkIcon({ kind }: { kind: ProjectLink["kind"] }) {
  if (kind === "live") {
    // 새 창으로 열리는 실제 서비스
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "video") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.4-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
      </svg>
    );
  }
  return <GitHubIcon />;
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
