import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import DonateSection from "@/components/DonateSection";
import ActionSection from "@/components/ActionSection";

const Donate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Heart className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground text-lg font-display">Donate</h1>
        </div>
      </header>

      <main className="pb-16">
        <DonateSection />
        <ActionSection />
      </main>
    </div>
  );
};

export default Donate;
