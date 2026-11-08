import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  tone?: "default" | "sub";
  children: ReactNode;
};

export function Section({ id, eyebrow, title, tone = "default", children }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-16 py-24 sm:py-32 ${tone === "sub" ? "bg-bg-sub" : ""}`}>
      <div className="mx-auto w-full max-w-5xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-blue-500">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-strong sm:text-4xl">
            {title}
          </h2>
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
