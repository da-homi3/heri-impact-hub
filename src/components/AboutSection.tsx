import { motion } from "framer-motion";
import { Eye, Target, Heart } from "lucide-react";

const values = [
  { icon: Heart, title: "Compassion", desc: "We lead with empathy, putting people and communities at the heart of everything we do." },
  { icon: Target, title: "Integrity", desc: "Every donation, every action — fully transparent and accountable to those we serve." },
  { icon: Eye, title: "Inclusion", desc: "We believe in equal opportunity and dignity for all, regardless of background." },
];

const AboutSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">About Herizon</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Building brighter futures through community-driven humanitarian action.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border border-primary/15 rounded-2xl p-6"
          >
            <Target className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-bold font-display text-foreground mb-2">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To empower underserved communities in Kenya by mobilising resources, volunteers and donations — ensuring every person has access to essentials, education and opportunity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-secondary border border-border/50 rounded-2xl p-6"
          >
            <Eye className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-bold font-display text-foreground mb-2">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A world where no community is left behind — where compassion, transparency and collective action create lasting, meaningful change for generations to come.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-bold font-display text-foreground text-center mb-6"
        >
          Our Core Values
        </motion.h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 text-center border border-border/50 shadow-sm"
            >
              <v.icon className="w-7 h-7 text-primary mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-1">{v.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
