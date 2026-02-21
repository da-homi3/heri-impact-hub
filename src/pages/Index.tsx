import MobileNav from "@/components/MobileNav";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <main className="pt-14 pb-16 sm:pb-0">
        <Hero />
        <div id="about">
          <AboutSection />
        </div>
        <div id="team">
          <TeamSection />
        </div>
        <div id="projects">
          <ProjectsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
