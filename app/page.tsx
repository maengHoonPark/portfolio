import { Nav } from "@/components/sections/Nav";
import { AskSection } from "@/components/sections/AskSection";
import { Intro } from "@/components/sections/Intro";
import { DeepDive } from "@/components/sections/DeepDive";
import { TechStack } from "@/components/sections/TechStack";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { HeroScroll } from "@/components/story/HeroScroll";
import { WordReveal } from "@/components/story/WordReveal";
import { ProjectStory } from "@/components/story/ProjectStory";
import { SectionRail } from "@/components/story/SectionRail";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { profile, projects } from "@/lib/content";

const railItems = [
  { id: "top", label: "시작" },
  { id: "ask", label: "AI Chat" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "deep-dive", label: "Deep Dive" },
  { id: "skills", label: "Tech" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      <Nav name={profile.name} />
      <SectionRail items={railItems} />
      <main>
        <HeroScroll name={profile.name} roles={profile.roles} lines={profile.hero.lines} />
        <AskSection />
        <Intro />
        <WordReveal text={profile.statement} />
        <ProjectStory projects={projects} />
        <DeepDive />
        <TechStack />
        <Experience />
        <Contact />
      </main>
      <footer className="py-10 text-center text-sm text-weak">© {profile.name}</footer>
      <ChatWidget />
    </>
  );
}
