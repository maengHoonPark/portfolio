import type { Project, ProjectLink } from "@/lib/content";

type ProjectTextProps = { project: Project; index: number; total: number };

/** 프로젝트 스토리의 글 부분 (넓은 화면 고정 연출과 모바일 목록이 함께 쓴다) */
export function ProjectText({ project: p, index, total }: ProjectTextProps) {
  return (
    <>
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-weak tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {p.period}
        {p.inProgress && <InProgressBadge />}
      </p>
      <h3 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-strong sm:text-4xl">
        {p.title}
      </h3>
      <p className="mt-2 font-semibold text-blue-500">{p.role}</p>
      <p className="mt-5 leading-relaxed text-body">{p.summary}</p>
      {p.metrics.length > 0 && (
        <dl className="mt-6 grid gap-2 sm:grid-cols-2">
          {p.metrics.map((m) => (
            <div key={m.label} className="rounded-card bg-bg-sub px-4 py-3">
              <dt className="text-xs font-medium text-weak">{m.label}</dt>
              <dd className="mt-1 font-bold text-strong tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <ul className="mt-6 flex flex-wrap gap-2">
        {p.stack.map((s) => (
          <li key={s} className="rounded-full bg-bg-sub px-3 py-1 text-sm font-medium text-body">
            {s}
          </li>
        ))}
      </ul>
      {p.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {p.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-button px-4 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97] ${
                l.kind === "live" ? "bg-blue-500 text-white" : "bg-strong text-bg"
              }`}
            >
              <LinkIcon kind={l.kind} />
              {l.label}
            </a>
          ))}
        </div>
      )}
      {p.note && <p className="mt-6 text-sm text-weak">{p.note}</p>}
      {p.featured && (
        <a
          href="#deep-dive"
          className="mt-6 inline-block text-sm font-semibold text-blue-500 hover:underline"
        >
          구조와 회고 자세히 보기 →
        </a>
      )}
    </>
  );
}

function InProgressBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-500">
      <span
        className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-pulse"
        aria-hidden
      />
      진행 중
    </span>
  );
}

function LinkIcon({ kind }: { kind: ProjectLink["kind"] }) {
  if (kind === "live") {
    // 새 창으로 열리는 실제 서비스
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "video") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.4-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
