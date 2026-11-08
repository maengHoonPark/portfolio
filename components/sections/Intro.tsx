import { profile } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { ParallaxPhoto } from "@/components/story/ParallaxPhoto";

/** 사진과 함께 "안녕하세요"로 시작하는 자기소개 */
export function Intro() {
  return (
    <section id="about" className="scroll-mt-16 py-28 sm:py-40">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <Reveal>
          <ParallaxPhoto src={profile.photo.src} alt={profile.photo.alt} />
        </Reveal>

        <div>
          <Reveal>
            <p className="text-sm font-semibold text-blue-500">About</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-strong sm:text-6xl">
              안녕하세요,
              <br />
              {profile.name}입니다.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-body">{profile.summary}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 rounded-card border-l-4 border-blue-500 bg-bg-sub p-6">
              <h3 className="font-bold text-strong">{profile.story.title}</h3>
              <p className="mt-2 leading-relaxed text-body">{profile.story.body}</p>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-weak">주력 언어</span>
              <span className="rounded-full bg-blue-500 px-3 py-1 font-bold text-white">Java</span>
              <span className="ml-3 font-semibold text-weak">취미</span>
              {profile.hobbies.map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-bg-sub px-3 py-1 font-semibold text-strong"
                >
                  {h}
                </span>
              ))}
            </div>
          </Reveal>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {profile.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.2 + i * 0.06}>
                <dt className="text-sm font-medium text-weak">{s.label}</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-strong tabular-nums">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>

      <ul className="mx-auto mt-24 grid w-full max-w-6xl gap-4 px-6 sm:grid-cols-3">
        {profile.values.map((v, i) => (
          <li key={v.title}>
            <Reveal delay={i * 0.08} className="h-full">
              <div className="h-full rounded-card bg-bg-sub p-7">
                <p className="text-sm font-bold text-blue-500">0{i + 1}</p>
                <h3 className="mt-3 text-xl font-bold text-strong">{v.title}</h3>
                <p className="mt-2 leading-relaxed text-body">{v.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
