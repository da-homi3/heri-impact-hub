import { motion } from "framer-motion";

const team = [
  {
    name: "Sheryl Lyndi",
    role: "CEO & Founder",
    bio: "Passionate about creating lasting change through community-driven solutions.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=75&auto=format&fit=crop&crop=faces",
  },
  {
    name: "Kimutai Kipkosgei",
    role: "CFO",
    bio: "Ensuring every shilling is accounted for with full transparency and impact.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=75&auto=format&fit=crop&crop=faces",
  },
  {
    name: "Emmanuel Kyallo",
    role: "Director of Transportation",
    bio: "Coordinating logistics to ensure donations and resources reach every community.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=75&auto=format&fit=crop&crop=faces",
  },
];

const TeamSection = () => {
  return (
    <section className="relative py-16 px-4 bg-secondary/40 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-pink-glow/30 blur-3xl float-slow" />
        <div className="absolute -bottom-10 left-1/4 w-56 h-56 rounded-full bg-primary/10 blur-3xl float-slower" />
      </div>
      <div className="container max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">Our Leadership</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Guided by integrity, driven by purpose.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto perspective-1000">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="tilt-card bg-card rounded-2xl p-6 text-center shadow-depth border border-border/50"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/15 shadow-depth-sm">
                <img src={member.photo} alt={member.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
              <p className="text-sm font-semibold text-primary mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
