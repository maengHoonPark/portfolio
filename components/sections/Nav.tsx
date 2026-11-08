"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Tech" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export function Nav({ name }: { name: string }) {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // 화면 중앙에 걸친 섹션을 현재 위치로 표시한다 (scroll spy)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { id } of links) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

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
          <a href="#top" className="font-bold text-strong">
            {name}
          </a>

          <div className="flex items-center gap-1">
            <ul className="hidden items-center gap-1 text-sm font-medium sm:flex">
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      aria-current={isActive ? "location" : undefined}
                      className={`relative block rounded-full px-3.5 py-2 transition-colors ${
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
              className="-mr-2 rounded-button p-2 text-strong sm:hidden"
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
      </BottomSheet>
    </>
  );
}
