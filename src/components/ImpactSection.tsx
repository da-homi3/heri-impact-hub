import { motion } from "framer-motion";
import { TrendingUp, Users, ShieldCheck, Camera } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const causes = [
  { name: "School Supplies Drive", progress: 72, goal: "KES 500,000", raised: "KES 360,000" },
  { name: "Winter Clothing Campaign", progress: 45, goal: "2,000 items", raised: "900 items" },
  { name: "Community Food Bank", progress: 88, goal: "KES 250,000", raised: "KES 220,000" },
];

const stats = [
  { icon: Users, value: "12,400+", label: "Lives Touched" },
  { icon: TrendingUp, value: "KES 3.2M", label: "Raised So Far" },
  { icon: ShieldCheck, value: "100%", label: "Verified Campaigns" },
  { icon: Camera, value: "850+", label: "Photo Updates" },
];

const ImpactSection = () => {
  return (
    <section id="impact" className="py-16 px-4 bg-secondary/40">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            Real-Time Impact
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Transparent updates so you always know where your donation goes.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border/50">
              <s.icon className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Active causes */}
        <div className="space-y-4">
          {causes.map((cause, i) => (
            <motion.div
              key={cause.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-foreground">{cause.name}</h3>
                <span className="text-sm font-bold text-primary">{cause.progress}%</span>
              </div>
              <Progress value={cause.progress} className="h-3 mb-2 rounded-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{cause.raised} raised</span>
                <span>Goal: {cause.goal}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
