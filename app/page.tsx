import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { profile } from "@/lib/content";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <>
      <Nav name={profile.name} />
      <main>
        <Hero />
        <About />
        <Projects />
        <TechStack />
        <Experience />
        <Contact />
      </main>
      <footer className="py-10 text-center text-sm text-weak">© {profile.name}</footer>
      <ChatWidget />
    </>
  );
}
