import { motion } from "framer-motion";
import { Gamepad2, Rocket, Sparkles, BookOpen, Heart, Users, Utensils, Baby, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingMissions = [
  {
    icon: BookOpen,
    title: "Back-to-School Drive",
    location: "Kibera, Nairobi",
    date: "April 2026",
    description: "Providing school supplies, uniforms, and books to 200+ children heading back to school.",
    tags: ["Education", "Children"],
  },
  {
    icon: Utensils,
    title: "Community Food Bank Restock",
    location: "Mombasa, Kenya",
    date: "April 2026",
    description: "Restocking food banks across three communities with essentials for 150 families.",
    tags: ["Food Security", "Families"],
  },
  {
    icon: Heart,
    title: "Warm Hearts Blanket Drive",
    location: "Nyeri, Kenya",
    date: "May 2026",
    description: "Collecting and distributing warm blankets and clothing to elderly community members before the cold season.",
    tags: ["Elderly Care", "Clothing"],
  },
  {
    icon: Baby,
    title: "Mother & Baby Care Packs",
    location: "Kisumu, Kenya",
    date: "May 2026",
    description: "Assembling and delivering care packages with baby essentials and maternal health supplies.",
    tags: ["Healthcare", "Mothers"],
  },
  {
    icon: GraduationCap,
    title: "Youth Skills Workshop",
    location: "Nakuru, Kenya",
    date: "June 2026",
    description: "Free digital literacy and vocational skills training for 100 young people aged 16–25.",
    tags: ["Youth", "Skills Training"],
  },
  {
    icon: Users,
    title: "Community Clean-Up & Build",
    location: "Thika, Kenya",
    date: "June 2026",
    description: "Volunteer-led initiative to renovate a community centre and create a safe learning space for children.",
    tags: ["Community", "Volunteering"],
  },
];

const ProjectsSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            What's next
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            Upcoming Missions
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real plans, real communities. Here's where we're heading next — join us.
          </p>
        </motion.div>

        {/* Missions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {upcomingMissions.map((mission, i) => (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <mission.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {mission.date}
                </Badge>
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-1">{mission.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{mission.location}</p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{mission.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {mission.tags.map((tag) => (
                  <span key={tag} className="bg-secondary text-secondary-foreground text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* HeriArcade Featured */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-center relative overflow-hidden"
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
              An interactive gaming platform where play meets purpose — raising awareness and funds through engaging mini-games and community challenges.
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
      </div>
    </section>
  );
};

export default ProjectsSection;
