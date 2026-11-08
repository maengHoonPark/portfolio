"use client";

import { useEffect, useState } from "react";

/** 화면 가운데에 걸친 섹션의 id를 돌려준다 (scroll spy). 네비와 왼쪽 진행 표시줄이 함께 쓴다. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("");
  const key = ids.join(",");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of key.split(",")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
