"use client";

import { motion } from "motion/react";
import { easeOut } from "./Reveal";
import { RotatingText } from "./RotatingText";

type HeroHeadingProps = { greeting: string; roles: string[]; name: string };

/** 헤드라인이 한 줄씩 마스크 아래에서 올라오는 등장 효과 */
export function HeroHeading({ greeting, roles, name }: HeroHeadingProps) {
  const lines = [
    <>{greeting}</>,
    <span key="roles" className="text-blue-500">
      <RotatingText items={roles} />
    </span>,
    <>{name}입니다.</>,
  ];

  return (
    <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-strong sm:text-6xl">
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.1 + i * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
