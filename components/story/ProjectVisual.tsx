import Image from "next/image";
import type { ProjectVisual as Visual, Screenshot as Shot } from "@/lib/content";
import { Gallery } from "./Gallery";
import { YouTubeEmbed } from "./YouTubeEmbed";

/**
 * 프로젝트 비주얼.
 * - fill: 넓은 화면의 고정 스토리. 정해진 박스(6:5)를 꽉 채운다.
 * - flow: 모바일 목록. 박스 높이를 강제하지 않고 내용 높이만큼 늘어나 잘리지 않는다.
 */
export function ProjectVisual({
  visual,
  layout = "fill",
}: {
  visual?: Visual;
  layout?: "fill" | "flow";
}) {
  if (!visual) return <div className="h-full w-full bg-bg-sub" />;
  const pad =
    layout === "fill"
      ? "flex h-full w-full items-center justify-center p-6 sm:p-10"
      : "flex w-full items-center justify-center p-4 sm:p-8";

  switch (visual.type) {
    case "image":
      return (
        <div className={`bg-bg-sub ${pad}`}>
          <ShotFrame shot={visual} sizes="(min-width: 1024px) 45vw, 100vw" />
        </div>
      );
    case "video":
      return (
        <div className={`bg-bg-sub ${pad}`}>
          <YouTubeEmbed youtubeId={visual.youtubeId} title={visual.title} poster={visual.poster} />
        </div>
      );
    case "duo":
      return layout === "fill" ? (
        <DuoOverlap images={visual.images} />
      ) : (
        <div className={`flex-col gap-4 bg-bg-sub ${pad}`}>
          {visual.images.map((img) => (
            <ShotFrame key={img.src} shot={img} label={img.label} sizes="100vw" />
          ))}
        </div>
      );
    case "gallery":
      return <Gallery images={visual.images} fill={layout === "fill"} />;
    case "architecture":
      return <ArchitectureDiagram fill={layout === "fill"} />;
  }
}

function BrowserFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-line" />
        {label && <span className="ml-3 truncate text-xs font-medium text-weak">{label}</span>}
      </div>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}

/** 이미지 원본 비율에 맞춘 브라우저 프레임 (이미지가 잘리지 않는다) */
function ShotFrame({ shot, label, sizes }: { shot: Shot; label?: string; sizes: string }) {
  return (
    <div className="w-full">
      <BrowserFrame label={label}>
        <div className="relative w-full" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
          <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className="object-cover" />
        </div>
      </BrowserFrame>
    </div>
  );
}

/** 넓은 화면: 실제 서비스 화면 두 장을 겹쳐 놓은 모습 */
function DuoOverlap({ images }: { images: (Shot & { label: string })[] }) {
  const [back, front] = images;
  return (
    <div className="relative h-full w-full bg-bg-sub">
      <div className="absolute left-[6%] top-[8%] w-[68%]">
        <ShotFrame shot={back} label={back.label} sizes="(min-width: 1024px) 32vw, 70vw" />
      </div>
      {front && (
        <div className="absolute bottom-[8%] right-[6%] w-[68%]">
          <ShotFrame shot={front} label={front.label} sizes="(min-width: 1024px) 32vw, 70vw" />
        </div>
      )}
    </div>
  );
}

/** 우편물류시스템 3-Tier 구조도 (폐쇄망이라 실제 화면 대신) */
function ArchitectureDiagram({ fill }: { fill: boolean }) {
  const box =
    "min-w-0 rounded-button border border-white/15 bg-white/10 px-3 py-2.5 text-left backdrop-blur sm:px-4 sm:py-3";
  return (
    <div
      className={`flex w-full flex-col justify-center gap-2.5 p-5 text-white sm:gap-3 sm:p-10 ${
        fill ? "h-full" : ""
      }`}
      style={{
        background:
          "radial-gradient(120% 120% at 80% 0%, var(--hero-a) 0%, var(--hero-b) 50%, var(--hero-c) 100%)",
      }}
      role="img"
      aria-label="화면(PostNet 웹·PDA 앱), 서버(공통 인터페이스), Oracle 공통 DB로 이어지는 3-Tier 구조도"
    >
      <TierLabel n={1} text="화면" />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
      <p className="mt-1 text-xs text-white/50">레거시 → G-클라우드 전환</p>
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
