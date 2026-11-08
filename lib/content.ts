import profileData from "@/content/profile.json";
import projectsData from "@/content/projects.json";
import skillsData from "@/content/skills.json";
import experienceData from "@/content/experience.json";

export type Profile = {
  name: string;
  role: string;
  roles: string[];
  tagline: string;
  summary: string;
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
  links: { label: string; url: string }[];
  draft?: boolean;
};

export type SkillGroup = { name: string; items: string[] };

export type Experience = {
  type: string;
  title: string;
  org: string;
  period: string;
  description: string;
  draft?: boolean;
};

export const profile: Profile = profileData;
export const projects: Project[] = projectsData;
export const skills: SkillGroup[] = skillsData;
export const experiences: Experience[] = experienceData;

/** 아직 채워지지 않은 콘텐츠인지 판별 */
export const isTodo = (text: string) => text.startsWith("TODO");
