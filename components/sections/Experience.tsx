import { experiences, isTodo } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { DraftBadge } from "@/components/ui/DraftBadge";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollLine } from "@/components/motion/ScrollLine";

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="걸어온 길">
      <ScrollLine>
        <ol className="border-l-2 border-line">
          {experiences.map((e, i) => (
            <li key={i} className="relative pb-10 pl-8 last:pb-0">
              <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-blue-500" />
              <Reveal>
                <p className="text-sm font-semibold text-blue-500">
                  {isTodo(e.period) ? "기간 미정" : e.period} · {e.type}
                </p>
                <h3 className="mt-1 flex items-center gap-3 text-xl font-bold text-strong">
                  {isTodo(e.title) ? "내용이 곧 채워질 예정이에요" : e.title}
                  {e.draft && <DraftBadge />}
                </h3>
                {!isTodo(e.org) && <p className="mt-1 text-body">{e.org}</p>}
                <p className="mt-2 text-body">{e.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </ScrollLine>
    </Section>
  );
}
