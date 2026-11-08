import { profile } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroHeading } from "@/components/motion/HeroHeading";
import { HeroBackground } from "@/components/motion/HeroBackground";
import { ScrollCue } from "@/components/motion/ScrollCue";
import { OpenChatButton } from "@/components/chat/OpenChatButton";

export function Hero() {
  return (
    <section id="top" className="relative isolate">
      <HeroBackground />
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl flex-col justify-center px-6 py-24">
        <HeroHeading greeting="안녕하세요," roles={profile.roles} name={profile.name} />
        <Reveal delay={0.5}>
          <p className="mt-6 max-w-xl text-lg text-body sm:text-xl">{profile.tagline}</p>
        </Reveal>
        <Reveal delay={0.65}>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="#projects">프로젝트 보기</ButtonLink>
            <OpenChatButton>챗봇에게 물어보기</OpenChatButton>
            <ButtonLink href="#contact" variant="secondary">
              연락하기
            </ButtonLink>
          </div>
        </Reveal>
      </div>
      <ScrollCue href="#about" label="소개로 내려가기" />
    </section>
  );
}
