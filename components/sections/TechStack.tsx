import { skills } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { DraftBadge } from "@/components/ui/DraftBadge";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";

export function TechStack() {
  return (
    <Section id="skills" eyebrow="Tech Stack" title="사용하는 기술" tone="sub">
      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((g, i) => (
          <Reveal key={g.name} delay={i * 0.08}>
            <Card className="h-full">
              <h3 className="text-sm font-semibold text-weak">{g.name}</h3>
              {g.items.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((item) =>
                    item === g.main ? (
                      <li
                        key={item}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3.5 py-1.5 text-sm font-bold text-white"
                      >
                        {item}
                        <span className="rounded-full bg-white/25 px-1.5 text-[11px]">주력</span>
                      </li>
                    ) : (
                      <li
                        key={item}
                        className="rounded-full bg-bg-sub px-3.5 py-1.5 text-sm font-semibold text-strong"
                      >
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="mt-4">
                  <DraftBadge />
                </p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10">
        <Marquee items={skills.filter((g) => g.name !== "Certificate").flatMap((g) => g.items)} />
      </Reveal>
    </Section>
  );
}
