"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useCallback, useState } from "react";
import { useActiveSection } from "@/components/hooks/useActiveSection";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { id: "ask", label: "AI Chat" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Tech" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export function Nav({ name }: { name: string }) {
  const active = useActiveSection(links.map((l) => l.id));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-bg/80 backdrop-blur transition-[border-color] duration-200 border-b ${
          scrolled ? "border-line" : "border-transparent"
        }`}
      >
        <nav
          aria-label="주요 메뉴"
          className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
        >
          <a href="#top" className="shrink-0 whitespace-nowrap font-bold text-strong">
            {name}
          </a>

          <div className="flex items-center gap-1">
            <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      aria-current={isActive ? "location" : undefined}
                      className={`relative block whitespace-nowrap rounded-full px-3.5 py-2 transition-colors ${
                        isActive ? "text-strong" : "text-body hover:text-strong"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-bg-sub"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              className="-mr-2 rounded-button p-2 text-strong md:hidden"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </nav>

        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blue-500"
          style={{ scaleX: progress }}
        />
      </header>

      {/* header의 backdrop-filter가 fixed 자식을 가두므로 시트는 header 밖에 둔다 */}
      <BottomSheet open={menuOpen} onClose={closeMenu} title="메뉴">
        <ul className="flex flex-col">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={closeMenu}
                className={`flex items-center justify-between rounded-button px-3 py-4 text-lg font-semibold active:bg-bg-sub ${
                  active === l.id ? "text-blue-500" : "text-strong"
                }`}
              >
                {l.label}
                <span aria-hidden className="text-weak">
                  ›
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-line px-3 pt-5">
          <span className="text-lg font-semibold text-strong">화면 테마</span>
          <ThemeToggle />
        </div>
      </BottomSheet>
    </>
  );
}
