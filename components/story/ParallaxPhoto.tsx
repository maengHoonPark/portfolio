"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * 스크롤에 맞춰 살짝 확대된 상태에서 제자리로 돌아오는 큰 사진 카드.
 * 인물 사진이라 위아래로 움직이면 정수리가 잘리므로, 아래쪽을 기준으로 확대만 한다.
 */
export function ParallaxPhoto({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <div ref={ref} className="relative aspect-[3/4] overflow-hidden rounded-hero bg-bg-sub">
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { scale, transformOrigin: "50% 100%" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover object-top"
        />
      </motion.div>
    </div>
  );
}
