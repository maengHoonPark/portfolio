import { profile, isTodo } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { DraftBadge } from "@/components/ui/DraftBadge";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";

export function About() {
  return (
    <Section id="about" eyebrow="About" title="어떤 개발자인지 소개할게요" tone="sub">
      <Reveal>
        <p className="max-w-2xl text-lg text-body">
          {isTodo(profile.summary) ? <DraftBadge /> : profile.summary}
        </p>
      </Reveal>

      <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {profile.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="rounded-card bg-surface p-6">
              <dt className="text-sm font-medium text-weak">{s.label}</dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-strong tabular-nums">
                <CountUp to={s.value} suffix={s.suffix} />
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>

      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {profile.values.map((v, i) => (
          <li key={v.title}>
            <Reveal delay={i * 0.08} className="h-full">
              <Card className="h-full">
                <h3 className="text-lg font-bold text-strong">{v.title}</h3>
                <p className="mt-2 text-body">{isTodo(v.body) ? <DraftBadge /> : v.body}</p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
