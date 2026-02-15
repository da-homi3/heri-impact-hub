import { motion } from "framer-motion";
import { Heart, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCommunity from "@/assets/hero-community.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroCommunity}
          alt="Community members sharing and supporting each other"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />
      </div>

      <div className="relative z-10 container px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Heart className="w-4 h-4 text-pink-glow" fill="currentColor" />
            <span className="text-primary-foreground text-sm font-semibold tracking-wide">
              Dignity • Community • Transparency
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-4 leading-tight font-display">
            Herizon Impact
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-3 font-medium">
            Empowering communities through giving.
          </p>
          <p className="text-base text-primary-foreground/75 mb-8 max-w-lg mx-auto">
            Donate items, send mobile money, volunteer your time, or request help — every act of kindness creates a ripple of change.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <a href="#donate">
                <Heart className="w-5 h-5" />
                Donate Now
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <a href="#help">Request Help</a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12"
        >
          <a href="#impact" className="inline-flex flex-col items-center text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors" aria-label="Scroll to impact section">
            <span className="text-xs mb-1">See Our Impact</span>
            <ArrowDown className="w-5 h-5 animate-float" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
