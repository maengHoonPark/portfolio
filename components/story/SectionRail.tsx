"use client";

import { useActiveSection } from "@/components/hooks/useActiveSection";

type RailItem = { id: string; label: string };

/** 토스처럼 화면 왼쪽에 세로 막대로 현재 위치를 보여주는 진행 표시줄 (넓은 화면 전용) */
export function SectionRail({ items }: { items: RailItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));

  return (
    <nav
      aria-label="섹션 바로가기"
      className="fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 xl:flex"
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-label={item.label}
            aria-current={isActive ? "location" : undefined}
            className="group flex items-center gap-3 py-1"
          >
            <span
              className={`w-1 rounded-full transition-all duration-300 ${
                isActive ? "h-8 bg-blue-500" : "h-4 bg-line group-hover:bg-weak"
              }`}
            />
            <span
              className={`whitespace-nowrap text-xs font-semibold transition-opacity duration-200 ${
                isActive ? "text-strong opacity-100" : "text-weak opacity-0 group-hover:opacity-100"
              }`}
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
