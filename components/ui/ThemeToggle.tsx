"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore, type MouseEvent } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** 첫 페인트 전에 저장된 테마를 적용해 깜빡임을 막는 인라인 스크립트 (layout <head>에서 사용) */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // 시크릿 모드 등 저장소를 못 쓰면 이번 방문 동안만 유지한다
  }
}

export function ThemeToggle() {
  // 서버에서는 테마를 알 수 없으므로 null → 마운트 후 실제 값으로 그린다
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      return;
    }
    // 버튼 위치에서 화면 끝까지 원이 퍼지며 새 테마가 드러난다
    const x = e.clientX || window.innerWidth;
    const y = e.clientY || 0;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 550,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  const isDark = theme === "dark";

  // 아이콘만 있으면 무엇인지 알기 어려워, 글자 라벨 + 켜고 끄는 스위치 모양으로 보여준다
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="다크 모드"
      onClick={toggle}
      className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-1 text-sm font-semibold text-strong transition-colors hover:border-blue-500 sm:pl-3.5"
    >
      <span className="hidden whitespace-nowrap sm:inline">
        {theme ? (isDark ? "다크 모드" : "라이트 모드") : "테마"}
      </span>
      <span
        className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ${
          isDark ? "bg-blue-500" : "bg-bg-sub"
        }`}
      >
        <motion.span
          className="absolute left-0.5 grid h-6 w-6 place-items-center rounded-full bg-white text-blue-500 shadow-sm"
          initial={false}
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme && (
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <MoonIcon /> : <SunIcon />}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" fill="currentColor" />
    </svg>
  );
}
