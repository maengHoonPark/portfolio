import chat from "@/content/chat.json";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { AskBox } from "@/components/chat/AskBox";

export function AskSection() {
  return (
    <Section id="ask" eyebrow={chat.section.eyebrow} title={chat.section.title}>
      <Reveal>
        <p className="-mt-6 mb-8 max-w-2xl text-lg text-body">{chat.section.description}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <AskBox />
      </Reveal>
    </Section>
  );
}
