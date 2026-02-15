import { motion } from "framer-motion";
import { Gamepad2, Rocket, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProjectsSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            Projects & Innovation
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Building the future of community empowerment, one project at a time.
          </p>
        </motion.div>

        {/* HeriArcade Featured */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 animate-float">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div className="relative z-10">
            <Gamepad2 className="w-12 h-12 mx-auto text-primary-foreground mb-4" />
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-none mb-4">
              Coming Soon
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-primary-foreground mb-3">
              HeriArcade
            </h3>
            <p className="text-primary-foreground/85 max-w-md mx-auto mb-4">
              An interactive gaming platform where play meets purpose — raising awareness and funds for humanitarian causes through engaging mini-games and community challenges.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Play for Impact", "Community Challenges", "Educational Games"].map((g) => (
                <span key={g} className="bg-primary-foreground/15 text-primary-foreground text-xs px-3 py-1 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-muted rounded-2xl p-8 text-center border border-border/50"
        >
          <Rocket className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-xl font-bold font-display text-foreground mb-2">More Coming Soon</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            We're working on more innovative projects to expand Herizon's mission. Stay tuned for exciting announcements!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
