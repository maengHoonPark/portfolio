"use client";

import Image from "next/image";
import { useState } from "react";

type YouTubeEmbedProps = { youtubeId: string; title: string; poster: string };

/**
 * 가벼운 유튜브 플레이어.
 * 처음에는 썸네일과 재생 버튼만 보여주고, 누를 때 iframe을 불러온다.
 * 유튜브 iframe은 무거워서(스크립트 수백 KB) 페이지를 열자마자 넣으면 첫 로딩이 느려지기 때문이다.
 */
export function YouTubeEmbed({ youtubeId, title, poster }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card bg-black shadow-2xl">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          // 쿠키를 남기지 않는 도메인 사용
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${title} 재생`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-top opacity-80 transition-opacity group-hover:opacity-60"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#191f28] shadow-xl transition-transform group-hover:scale-110 group-active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.4-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          <span className="absolute bottom-4 left-4 text-left text-sm font-semibold text-white">
            ▶ {title}
          </span>
        </button>
      )}
    </div>
  );
}
