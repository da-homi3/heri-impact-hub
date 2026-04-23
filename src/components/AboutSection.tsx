import { motion } from "framer-motion";
import { Eye, Target, Heart } from "lucide-react";

const values = [
  { icon: Heart, title: "Compassion", desc: "We lead with empathy, putting people and communities at the heart of everything we do." },
  { icon: Target, title: "Integrity", desc: "Every donation, every action — fully transparent and accountable to those we serve." },
  { icon: Eye, title: "Inclusion", desc: "We believe in equal opportunity and dignity for all, regardless of background." },
];

const AboutSection = () => {
  return (
    <section className="relative py-16 px-4 bg-background overflow-hidden">
      {/* Floating decorative shapes for depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-pink-soft/40 blur-3xl float-slow" />
        <div className="absolute bottom-0 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl float-slower" />
      </div>

      <div className="container max-w-5xl mx-auto relative">
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

        {/* Image strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-3 mb-10 perspective-1000"
        >
          {[
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=70&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=70&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=70&auto=format&fit=crop",
          ].map((src, i) => (
            <div
              key={src}
              className={`tilt-card rounded-2xl overflow-hidden shadow-depth aspect-[4/5] ${i === 1 ? "translate-y-4" : ""}`}
            >
              <img src={src} alt="Herizon community moments" loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 perspective-1000">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="tilt-card bg-primary/5 border border-primary/15 rounded-2xl p-6 shadow-depth"
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
            className="tilt-card bg-secondary border border-border/50 rounded-2xl p-6 shadow-depth"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 perspective-1000">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="tilt-card bg-card rounded-2xl p-5 text-center border border-border/50 shadow-depth-sm"
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
