import { motion } from "framer-motion";
import { Package, Smartphone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const donateOptions = [
  {
    icon: Package,
    title: "Donate Items",
    description: "Clothes, shoes, toys, food & essential supplies. Book a home pick-up or find a drop-off point near you.",
    action: "Book Donation",
    color: "text-primary",
    bg: "bg-secondary",
  },
  {
    icon: Smartphone,
    title: "Donate Money",
    description: "Quick M-Pesa Paybill or Till donation. One-tap giving with instant digital receipts and full transparency.",
    action: "Send via M-Pesa",
    color: "text-warm-gold",
    bg: "bg-warm-gold/10",
  },
  {
    icon: MapPin,
    title: "Drop-off Locator",
    description: "Find verified collection points, partner centres and scheduled pick-ups on our smart map.",
    action: "Find Locations",
    color: "text-trust-green",
    bg: "bg-trust-green/10",
  },
  {
    icon: Calendar,
    title: "Schedule Pick-up",
    description: "Book a convenient time and our team will collect your physical donations right from your doorstep.",
    action: "Schedule Now",
    color: "text-primary",
    bg: "bg-pink-soft",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DonateSection = () => {
  return (
    <section id="donate" className="py-16 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            Ways to Give
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose how you'd like to make a difference today. Every contribution, big or small, transforms lives.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {donateOptions.map((opt) => (
            <motion.div key={opt.title} variants={item}>
              <Card className="h-full border-border/60 hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center mb-2`}>
                    <opt.icon className={`w-6 h-6 ${opt.color}`} />
                  </div>
                  <CardTitle className="text-xl font-display">{opt.title}</CardTitle>
                  <CardDescription className="text-sm">{opt.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="soft" size="sm" className="w-full">
                    {opt.action}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DonateSection;
