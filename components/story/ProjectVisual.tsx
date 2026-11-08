import Image from "next/image";
import type { ProjectVisual as Visual } from "@/lib/content";

/** 프로젝트 스토리 오른쪽 비주얼. 스크린샷이 없는 프로젝트는 구조도·목업을 직접 그린다. */
export function ProjectVisual({ visual }: { visual?: Visual }) {
  if (!visual) return <div className="h-full w-full bg-bg-sub" />;
  if (visual.type === "image") return <Screenshot src={visual.src} alt={visual.alt} />;
  if (visual.type === "architecture") return <ArchitectureDiagram />;
  if (visual.type === "duo") return <DuoScreenshots images={visual.images} />;
  return null;
}

function BrowserFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        {label && <span className="ml-3 text-xs font-medium text-weak">{label}</span>}
      </div>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}

function Screenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-sub p-6 sm:p-10">
      <div className="aspect-[4/3] w-full">
        <BrowserFrame>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-top"
          />
        </BrowserFrame>
      </div>
    </div>
  );
}

/** 실제 서비스 화면 두 장을 겹쳐 놓은 모습 */
function DuoScreenshots({ images }: { images: { src: string; alt: string; label: string }[] }) {
  const [back, front] = images;
  return (
    <div className="relative h-full w-full bg-bg-sub">
      <div className="absolute left-[6%] top-[8%] aspect-[4/3] w-[68%]">
        <BrowserFrame label={back.label}>
          <Image
            src={back.src}
            alt={back.alt}
            fill
            sizes="(min-width: 1024px) 32vw, 70vw"
            className="object-cover object-top"
          />
        </BrowserFrame>
      </div>
      {front && (
        <div className="absolute bottom-[8%] right-[6%] aspect-[4/3] w-[68%]">
          <BrowserFrame label={front.label}>
            <Image
              src={front.src}
              alt={front.alt}
              fill
              sizes="(min-width: 1024px) 32vw, 70vw"
              className="object-cover object-top"
            />
          </BrowserFrame>
        </div>
      )}
    </div>
  );
}

/** 우편물류시스템 3-Tier 구조도 (폐쇄망이라 실제 화면 대신) */
function ArchitectureDiagram() {
  const box = "rounded-button border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur";
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-3 p-6 text-white sm:p-10"
      style={{
        background:
          "radial-gradient(120% 120% at 80% 0%, var(--hero-a) 0%, var(--hero-b) 50%, var(--hero-c) 100%)",
      }}
      role="img"
      aria-label="화면(PostNet 웹·PDA 앱), 서버(공통 인터페이스), Oracle 공통 DB로 이어지는 3-Tier 구조도"
    >
      <TierLabel n={1} text="화면" />
      <div className="grid grid-cols-2 gap-3">
        <div className={box}>
          <p className="text-sm font-bold">PostNet 웹</p>
          <p className="mt-0.5 text-xs text-white/60">eXbuilder6 · Submission</p>
        </div>
        <div className={box}>
          <p className="text-sm font-bold">집배원 PDA 앱</p>
          <p className="mt-0.5 text-xs text-white/60">eXMobile · Native WebView</p>
        </div>
      </div>
      <Arrow label="DataCollection / JSON" />
      <TierLabel n={2} text="서버" />
      <div className={box}>
        <p className="text-sm font-bold">Spring(전자정부) · 공통 인터페이스 모듈</p>
        <p className="mt-0.5 text-xs text-white/60">Strategy Pattern · Header / Body / Loop</p>
      </div>
      <Arrow label="MyBatis" />
      <TierLabel n={3} text="데이터" />
      <div className={box}>
        <p className="text-sm font-bold">Oracle 공통 DB</p>
        <p className="mt-0.5 text-xs text-white/60">테이블 6,000+ · 배치</p>
      </div>
      <p className="mt-2 text-xs text-white/50">레거시 → G-클라우드 전환</p>
    </div>
  );
}

function TierLabel({ n, text }: { n: number; text: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
      Tier {n} · {text}
    </p>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pl-4 text-xs text-white/50">
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden>
        <path d="M6 0v14M1 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {label}
    </div>
  );
}
