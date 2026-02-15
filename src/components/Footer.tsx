import { Heart } from "lucide-react";
import doodlePattern from "@/assets/doodle-pattern.png";

const Footer = () => {
  return (
    <footer className="relative py-12 px-4 bg-primary overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img src={doodlePattern} alt="" className="w-full h-full object-cover" aria-hidden="true" />
      </div>
      <div className="relative z-10 container max-w-4xl mx-auto text-center">
        <Heart className="w-8 h-8 mx-auto text-pink-glow mb-4" fill="currentColor" />
        <h3 className="text-xl font-bold font-display text-primary-foreground mb-2">
          Herizon Impact
        </h3>
        <p className="text-primary-foreground/70 text-sm mb-6 max-w-md mx-auto italic">
          "Restoring dignity, building community, and empowering lives — one act of kindness at a time."
        </p>
        <div className="flex flex-wrap gap-6 justify-center text-primary-foreground/60 text-xs">
          <span>Dignity</span>
          <span>•</span>
          <span>Community</span>
          <span>•</span>
          <span>Transparency</span>
          <span>•</span>
          <span>Empowerment</span>
        </div>
        <p className="text-primary-foreground/40 text-xs mt-6">
          © 2026 Herizon Impact. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
