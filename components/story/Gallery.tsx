"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import type { Screenshot } from "@/lib/content";

type GalleryProps = {
  images: (Screenshot & { label: string })[];
  /** true: 넓은 화면의 고정 박스를 꽉 채운다. false: 모바일 목록에서 일정한 비율의 박스를 쓴다. */
  fill: boolean;
};

/**
 * 화면 캡처 슬라이드.
 * JS 캐러셀 대신 가로 scroll-snap을 써서 모바일 스와이프·트랙패드·키보드 스크롤이 브라우저 기본 동작으로 된다.
 * 아래 탭은 어느 화면인지 이름으로 보여주고, 누르면 그 슬라이드로 이동한다.
 */
export function Gallery({ images, fill }: GalleryProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const syncActive = () => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={`flex w-full flex-col bg-bg-sub ${fill ? "h-full" : ""}`}>
      <div
        ref={scroller}
        onScroll={syncActive}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="프로젝트 화면 캡처"
        className={`flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 [&::-webkit-scrollbar]:hidden ${
          fill ? "min-h-0 flex-1" : "aspect-[4/5]"
        }`}
      >
        {images.map((img, i) => (
          <figure
            key={img.src}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${images.length} · ${img.label}`}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center px-6 pt-6 sm:px-10 sm:pt-8"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 1024px) 30vw, 80vw"
              className="h-auto max-h-full w-auto max-w-full rounded-card border border-line shadow-2xl"
            />
          </figure>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 px-4 py-4">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === active}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              i === active ? "bg-blue-500 text-white" : "text-weak hover:text-strong"
            }`}
          >
            {img.label}
          </button>
        ))}
      </div>
    </div>
  );
}
