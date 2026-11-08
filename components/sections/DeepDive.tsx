import { projects } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";

/** 대표(현업) 프로젝트의 구조 설명과 회고를 길게 보여주는 섹션 */
export function DeepDive() {
  const p = projects.find((x) => x.featured);
  if (!p?.highlights) return null;

  // "PostNet(웹): 설명" 형식이면 앞부분을 제목으로 쓴다
  const items = p.highlights.map((h) => {
    const idx = h.indexOf(":");
    return idx > 0 && idx < 20
      ? { title: h.slice(0, idx), body: h.slice(idx + 1).trim() }
      : { title: "", body: h };
  });

  return (
    <section id="deep-dive" className="scroll-mt-16 bg-bg-sub py-28 sm:py-40">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-blue-500">Deep Dive</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-strong sm:text-6xl">
            개발자 수십 명이 함께 만드는
            <br />
            우체국 시스템 안에서
          </h2>
        </Reveal>

        <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.body}>
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <div className="h-full rounded-card bg-surface p-7">
                  {item.title && <p className="text-sm font-bold text-blue-500">{item.title}</p>}
                  <p className="mt-2 leading-relaxed text-body">{item.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {p.reflection && (
          <Reveal className="mt-16">
            <figure className="rounded-hero bg-surface p-8 sm:p-12">
              <p className="text-sm font-bold text-blue-500">회고 · 가장 기억에 남는 이유</p>
              <blockquote className="mt-5 text-xl font-semibold leading-relaxed text-strong sm:text-2xl">
                {p.reflection}
              </blockquote>
            </figure>
          </Reveal>
        )}
      </div>
    </section>
  );
}
