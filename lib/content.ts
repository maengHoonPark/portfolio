import profileData from "@/content/profile.json";
import projectsData from "@/content/projects.json";
import skillsData from "@/content/skills.json";
import experienceData from "@/content/experience.json";

export type Profile = {
  name: string;
  role: string;
  roles: string[];
  tagline: string;
  hero: { lines: string[] };
  statement: string;
  photo: { src: string; alt: string };
  summary: string;
  story: { title: string; body: string };
  strength: string;
  hobbies: string[];
  prosCons: { strengths: string[]; weaknesses: string[] };
  stats: { label: string; value: number; suffix: string }[];
  values: { title: string; body: string }[];
  links: { github: string; email: string; linkedin: string };
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  links: ProjectLink[];
  /** 링크가 없는 이유 등 짧은 안내 */
  note?: string;
  /** 핵심 내용 목록 (대표 프로젝트용) */
  highlights?: string[];
  /** 회고: 배운 점, 기억에 남는 이유 */
  reflection?: string;
  /** 프로젝트 스토리 섹션 오른쪽에 보여줄 비주얼 */
  visual?: ProjectVisual;
  /** 그리드에서 넓게 보여줄 대표 프로젝트 */
  featured?: boolean;
  /** 아직 개발 중인 프로젝트 ("진행 중" 배지 표시) */
  inProgress?: boolean;
  draft?: boolean;
};

/** github: 소스 코드, live: 실제 운영 중인 서비스, video: 시연 영상 */
export type ProjectLink = { label: string; url: string; kind: "github" | "live" | "video" };

/** width·height는 원본 이미지 크기. 프레임 비율을 맞춰 이미지가 잘리지 않게 한다. */
export type Screenshot = { src: string; alt: string; width: number; height: number };

export type ProjectVisual =
  | { type: "architecture" }
  | ({ type: "image" } & Screenshot)
  | { type: "duo"; images: (Screenshot & { label: string })[] }
  | { type: "video"; youtubeId: string; title: string; poster: string }
  | { type: "gallery"; images: (Screenshot & { label: string })[] };

/** main: 가장 자신 있는 항목 (주력 표시) */
export type SkillGroup = { name: string; items: string[]; main?: string };

export type Experience = {
  type: string;
  title: string;
  org: string;
  period: string;
  description: string;
  draft?: boolean;
};

export const profile: Profile = profileData;
// JSON import는 visual.type 같은 리터럴을 string으로 넓히므로 타입을 명시한다
export const projects = projectsData as Project[];
export const skills: SkillGroup[] = skillsData;
export const experiences: Experience[] = experienceData;

/** 아직 채워지지 않은 콘텐츠인지 판별 */
export const isTodo = (text: string) => text.startsWith("TODO");
