import { motion } from "framer-motion";
import { User } from "lucide-react";

const team = [
  {
    name: "Sheryl Lyndi",
    role: "CEO & Founder",
    bio: "Passionate about creating lasting change through community-driven solutions.",
  },
  {
    name: "Kimutai Kipkosgei",
    role: "CFO",
    bio: "Ensuring every shilling is accounted for with full transparency and impact.",
  },
];

const TeamSection = () => {
  return (
    <section className="py-16 px-4 bg-secondary/40">
      <div className="container max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border/50"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary" />
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
