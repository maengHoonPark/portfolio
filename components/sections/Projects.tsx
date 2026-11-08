import { projects, isTodo } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { DraftBadge } from "@/components/ui/DraftBadge";
import { Reveal } from "@/components/motion/Reveal";
import { Pressable } from "@/components/motion/Pressable";

export function Projects() {
  return (
    <Section id="projects" eyebrow="Projects" title="문제를 풀어낸 프로젝트들">
      <ul className="grid gap-5 sm:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Reveal delay={i * 0.1} className="h-full">
              <Pressable className="h-full">
                <Card className="flex h-full flex-col transition-shadow duration-200 hover:shadow-xl hover:shadow-black/5">
                  <p className="text-sm font-medium text-weak">{p.period}</p>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-strong">{p.title}</h3>
                    {p.draft && <DraftBadge />}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-blue-500">{p.role}</p>
                  <p className="mt-4 flex-1 text-body">
                    {isTodo(p.summary) ? "프로젝트 요약이 곧 채워질 예정이에요." : p.summary}
                  </p>
                  {p.stack.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {p.stack.map((s) => (
                        <li
                          key={s}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-500"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.links.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                      {p.links.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-500 hover:underline"
                        >
                          {l.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              </Pressable>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
