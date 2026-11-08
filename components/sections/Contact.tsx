import { profile } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Reveal } from "@/components/motion/Reveal";

export function Contact() {
  const { github, email, linkedin } = profile.links;
  const hasAny = github || email || linkedin;
  return (
    <Section id="contact" eyebrow="Contact" title="함께 이야기해요" tone="sub">
      <Reveal>
        {hasAny ? (
          <>
            {email && <p className="text-xl font-semibold text-strong">{email}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {email && <ButtonLink href={`mailto:${email}`}>이메일 보내기</ButtonLink>}
              {email && (
                <CopyButton text={email} toastMessage="이메일 주소를 복사했어요">
                  주소 복사
                </CopyButton>
              )}
              {github && (
                <ButtonLink href={github} variant="secondary" external>
                  GitHub
                </ButtonLink>
              )}
              {linkedin && (
                <ButtonLink href={linkedin} variant="secondary" external>
                  LinkedIn
                </ButtonLink>
              )}
            </div>
          </>
        ) : (
          <p className="text-body">연락처가 곧 공개될 예정이에요.</p>
        )}
      </Reveal>
    </Section>
  );
}
