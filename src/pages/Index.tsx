import MobileNav from "@/components/MobileNav";
import Hero from "@/components/Hero";
import DonateSection from "@/components/DonateSection";
import ImpactSection from "@/components/ImpactSection";
import ActionSection from "@/components/ActionSection";
import TeamSection from "@/components/TeamSection";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <main className="pt-14 pb-16 sm:pb-0">
        <Hero />
        <div id="impact">
          <ImpactSection />
        </div>
        <DonateSection />
        <ActionSection />
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
