import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import SupportSection from "@/components/SupportSection";
import LiveChatWidget from "@/components/LiveChatWidget";

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <MessageCircle className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground text-lg font-display">Support</h1>
        </div>
      </header>

      <main className="pb-16">
        <SupportSection />
      </main>
      <LiveChatWidget />
    </div>
  );
};

export default Support;
