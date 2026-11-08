/** 끝없이 흐르는 칩 띠. 마우스를 올리면 멈춘다. (CSS 애니메이션이라 JS 비용 없음) */
export function Marquee({ items }: { items: string[] }) {
  // 같은 목록을 두 번 이어 붙이고 절반만큼 이동시키면 끊김 없이 반복된다
  const doubled = [...items, ...items];
  return (
    <div
      className="group relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <ul className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <li
            key={i}
            aria-hidden={i >= items.length}
            className="whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-strong"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
